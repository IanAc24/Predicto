import {
  CandlestickSeries,
  ColorType,
  HistogramSeries,
  createChart,
  createSeriesMarkers,
  type IChartApi,
  type ISeriesApi,
  type ISeriesMarkersPluginApi,
  type SeriesMarker,
  type Time,
} from 'lightweight-charts'
import { useEffect, useRef, useState } from 'react'
import type { Bar, LedgerEntry } from '../../api/types'

export type MarkerLabels = { hit: string; miss: string; pending: string }

type Palette = {
  up: string
  down: string
  border: string
  muted: string
  surface: string
  text: string
}

function readPalette(): Palette {
  const style = getComputedStyle(document.documentElement)
  const read = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback
  return {
    up: read('--up', '#34d399'),
    down: read('--down', '#fb7185'),
    border: read('--border', '#243239'),
    muted: read('--muted', '#94a8ad'),
    surface: read('--surface', '#121b20'),
    text: read('--text', '#e6eef0'),
  }
}

/** '#34d399' + 0.45 -> '#34d39973'. Non-hex colours are returned unchanged. */
function withAlpha(color: string, alpha: number): string {
  if (!/^#[0-9a-f]{6}$/i.test(color)) return color
  return color + Math.round(alpha * 255).toString(16).padStart(2, '0')
}

function chartOptions(palette: Palette) {
  return {
    layout: {
      background: { type: ColorType.Solid, color: palette.surface },
      textColor: palette.muted,
      fontFamily: 'inherit',
    },
    grid: {
      vertLines: { color: palette.border },
      horzLines: { color: palette.border },
    },
    rightPriceScale: { borderColor: palette.border },
    timeScale: { borderColor: palette.border },
  }
}

function candleOptions(palette: Palette) {
  return {
    upColor: palette.up,
    downColor: palette.down,
    borderUpColor: palette.up,
    borderDownColor: palette.down,
    wickUpColor: palette.up,
    wickDownColor: palette.down,
  }
}

/** Puts each prediction on the last bar at or before its issue date (markers must sit on a bar). */
function buildMarkers(
  bars: Bar[],
  entries: LedgerEntry[],
  labels: MarkerLabels,
  color: string,
): SeriesMarker<Time>[] {
  if (bars.length === 0) return []
  const first = bars[0].time
  const markers: SeriesMarker<Time>[] = []
  for (const entry of entries) {
    const day = entry.issuedAt.slice(0, 10)
    if (day < first) continue
    let barTime = first
    for (const bar of bars) {
      if (bar.time <= day) barTime = bar.time
      else break
    }
    // Shape plus text carry the outcome; the colour only reinforces it.
    const shape =
      entry.outcome === 'hit' ? 'circle' : entry.outcome === 'miss' ? 'square' : 'arrowDown'
    markers.push({
      time: barTime,
      position: 'aboveBar',
      shape,
      color,
      text: labels[entry.outcome],
    })
  }
  return markers.sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0))
}

/** TradingView Lightweight Charts candlesticks with a volume histogram and prediction markers. */
export function PriceChart({
  bars,
  entries,
  labels,
  ariaLabel,
}: {
  bars: Bar[]
  entries: LedgerEntry[]
  labels: MarkerLabels
  ariaLabel: string
}) {
  // The settings provider writes data-theme in an effect that runs after this component's effects,
  // so watch the attribute itself and re-read the CSS variables once it has changed.
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme ?? '')
  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => setTheme(root.dataset.theme ?? ''))
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candlesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const markersRef = useRef<ISeriesMarkersPluginApi<Time> | null>(null)

  // Create the chart once; autoSize follows the container width.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const palette = readPalette()
    const chart = createChart(container, { ...chartOptions(palette), autoSize: true, height: 340 })
    const candles = chart.addSeries(CandlestickSeries, candleOptions(palette))
    candles.priceScale().applyOptions({ scaleMargins: { top: 0.12, bottom: 0.28 } })
    const volume = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: '',
      lastValueVisible: false,
      priceLineVisible: false,
    })
    volume.priceScale().applyOptions({ scaleMargins: { top: 0.78, bottom: 0 } })
    chartRef.current = chart
    candlesRef.current = candles
    volumeRef.current = volume
    markersRef.current = createSeriesMarkers(candles, [])
    return () => {
      chart.remove()
      chartRef.current = null
      candlesRef.current = null
      volumeRef.current = null
      markersRef.current = null
    }
  }, [])

  // Re-apply colours when the theme changes. The CSS variables update with data-theme.
  useEffect(() => {
    const chart = chartRef.current
    const candles = candlesRef.current
    if (!chart || !candles) return
    const palette = readPalette()
    chart.applyOptions(chartOptions(palette))
    candles.applyOptions(candleOptions(palette))
  }, [theme])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return
    const palette = readPalette()
    candlesRef.current?.setData(
      bars.map(({ time, open, high, low, close }) => ({ time, open, high, low, close })),
    )
    volumeRef.current?.setData(
      bars.map((bar) => ({
        time: bar.time,
        value: bar.volume,
        color: withAlpha(bar.close >= bar.open ? palette.up : palette.down, 0.45),
      })),
    )
    markersRef.current?.setMarkers(buildMarkers(bars, entries, labels, palette.text))
    chart.timeScale().fitContent()
    // `theme` is a dependency because volume and marker colours are baked into the data.
  }, [bars, entries, labels, theme])

  return <div ref={containerRef} role="img" aria-label={ariaLabel} className="w-full" />
}
