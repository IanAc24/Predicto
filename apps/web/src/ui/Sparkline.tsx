import { cx } from '../lib/cx'

/**
 * Tiny price line. Green when the last value is at or above the first, coral when below.
 * The drawing is decorative (aria-hidden); `label` is the text alternative for screen readers.
 */
export function Sparkline({
  values,
  label,
  width = 80,
  height = 28,
  className,
}: {
  values: number[]
  label: string
  width?: number
  height?: number
  className?: string
}) {
  const pad = 2
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const points = values
    .map((value, i) => {
      const x = pad + (i / Math.max(values.length - 1, 1)) * (width - 2 * pad)
      const y = height - pad - ((value - min) / span) * (height - 2 * pad)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  const rising = values.length < 2 || values[values.length - 1] >= values[0]

  return (
    <>
      <svg
        aria-hidden="true"
        focusable="false"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={cx('shrink-0', rising ? 'text-up' : 'text-down', className)}
      >
        {values.length >= 2 && (
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      <span className="sr-only">{label}</span>
    </>
  )
}
