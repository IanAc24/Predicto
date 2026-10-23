import type { TrackRecordDict } from '../en/trackRecord'

export const trackRecord: TrackRecordDict = {
  title: 'Historial',
  liveTitle: 'Rendimiento en vivo',
  hitRate: 'Tasa de aciertos',
  hitRateDetail: 'Intervalo del 95% de {low} a {high} · n = {n} predicciones resueltas',
  baselineLabel: 'Referencia siempre al alza',
  baselineDetail: 'Tasa de aciertos si cada semana se diera como "al alza"',
  intervalLabel: 'Intervalo de la tasa de aciertos de {low} a {high}; referencia {baseline}',
  insufficientTitle: 'Aún no hay evidencia suficiente',
  insufficientBody:
    'Con solo {n} predicciones resueltas el intervalo mide {width} puntos, demasiado amplio para distinguir habilidad de suerte. Trata estas cifras como ruido hasta que se hayan resuelto al menos {min} predicciones.',
  enoughBody:
    'El intervalo mide {width} puntos. Compáralo con la referencia antes de sacar conclusiones.',
  weeklyTitle: 'Aciertos y fallos por semana',
  weeklyHits: 'Aciertos',
  weeklyMisses: 'Fallos',
  weeklyWeek: 'Semana del {date}',
  weeklySummary: '{hits} aciertos, {misses} fallos',
  weeklyChartLabel: 'Aciertos y fallos por semana',
  calibrationTitle: 'Calibración',
  calibrationIntro:
    'Los puntos sobre la diagonal indican que las frecuencias previstas y observadas coinciden. El tamaño del punto muestra cuántas predicciones hay en el tramo.',
  calibrationChartLabel:
    'Gráfico de calibración: frecuencia prevista frente a observada por tramo de probabilidad',
  calibrationBucket: 'Tramo',
  calibrationPredicted: 'Previsto',
  calibrationObserved: 'Observado',
  calibrationN: 'n',
  ledgerTitle: 'Registro',
  filterAll: 'Todas',
  filterHits: 'Aciertos',
  filterMisses: 'Fallos',
  filterPending: 'Pendientes',
  filterOutcomeLabel: 'Filtrar por resultado',
  filterInstrumentLabel: 'Instrumento',
  filterAllInstruments: 'Todos los instrumentos',
  weekOf: 'Semana del {date}',
  issued: 'Emitida el {date}',
  probabilityMeta: 'probabilidad {probability}',
  outcomeHit: 'Acierto',
  outcomeMiss: 'Fallo',
  outcomePending: 'Pendiente',
  excessReturn: 'Rendimiento excedente',
  ledgerNoMatches: 'Ninguna predicción coincide con estos filtros.',
  hypotheticalTitle: 'Hipotético (backtest)',
  hypotheticalWarning:
    'No es un resultado en vivo. Se mantiene separado de las cifras en vivo de arriba.',
  hypotheticalHitRate: 'Tasa de aciertos del backtest',
  hypotheticalN: 'n = {n} predicciones simuladas',
  emptyText:
    'Todavía no se ha resuelto ninguna predicción. Los resultados aparecerán cuando pase la primera semana.',
}
