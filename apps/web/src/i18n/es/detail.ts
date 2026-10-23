import type { DetailDict } from '../en/detail'

export const detail: DetailDict = {
  title: 'Detalle de la acción',
  back: 'Volver a la lista de seguimiento',
  meta: '{exchange} · {currency} · {timeZone}',
  lastClose: 'Último cierre',
  asOf: 'Datos al {date}',
  notFound: 'Esta acción no está en tu lista de seguimiento.',
  notFoundAction: 'Ir a la lista de seguimiento',

  predictionLabel: 'Predicción · próximos {days} días de mercado',
  observingTitle: 'En observación',
  observingProgress: 'Progreso de la observación',
  observingDay: 'Día {day} de {total}',
  observingBody:
    'Las predicciones de esta acción se registran en silencio para tener un historial honesto antes de mostrar ninguna. Todavía no se muestra ninguna predicción.',
  activeQuestion: 'Probabilidad de superar a {benchmark} en los próximos {days} días de mercado',
  activeBase: 'Tasa base {baseRate}',
  activeBaseNote: 'Con qué frecuencia ocurrió en semanas pasadas.',
  liveRecord:
    'Registro en vivo: {hits} de {n} predicciones resueltas acertadas (IC 95% {low}–{high}).',
  liveRecordNone: 'Todavía no hay predicciones en vivo resueltas para esta acción.',
  horizonDefinition:
    'Objetivo: el rendimiento de esta acción en los próximos {days} días de mercado es mayor que el de {benchmark}.',
  modelVersion: 'Modelo {version}',
  issued: 'Emitida el {date}',
  driversTitle: 'Factores principales',
  driverUp: 'Eleva la estimación',
  driverDown: 'Reduce la estimación',
  noSignalTitle: 'Sin señal',
  noSignalBody:
    'Hoy el modelo no tiene ventaja para esta acción. Su estimación no es mejor que la tasa base de {baseRate}, así que no se muestra ninguna probabilidad.',

  chartTitle: 'Precio',
  chartRange: 'Rango del gráfico',
  chartAria:
    'Gráfico de velas del precio con volumen, {range}. Los marcadores muestran predicciones pasadas.',
  chartLegend: 'Marcadores: ● acierto, ■ fallo, ▼ pendiente',
  markerHit: 'Acierto',
  markerMiss: 'Fallo',
  markerPending: 'Pendiente',

  recentTitle: 'Predicciones recientes',
  recentEmpty: 'Todavía no se han emitido predicciones para esta acción.',
  recentRow: '{probability} frente a {baseRate} base',
  recentIssued: 'Emitida el {date}',
  outcomeHit: 'Acierto',
  outcomeMiss: 'Fallo',
  outcomePending: 'Pendiente',
  excessReturn: 'frente a {benchmark}',
}
