import type { SettingsDict } from '../en/settings'

export const settings: SettingsDict = {
  title: 'Ajustes',
  appearanceTitle: 'Apariencia',
  language: 'Idioma',
  theme: 'Tema',
  themeDark: 'Oscuro',
  themeLight: 'Claro',
  predictionTitle: 'Predicciones',
  observationWeeks: 'Duración de la observación',
  observationWeeksValue: '{weeks} semanas',
  observationHint: 'Cuánto tiempo se observa una acción nueva antes de mostrar una probabilidad.',
  benchmark: 'Referencia',
  benchmarkNote:
    'Las predicciones preguntan si una acción supera este índice. Aún no hay opción de índice local (por ejemplo DAX para valores en XETRA).',
  displayCurrency: 'Moneda de visualización',
  horizon: 'Horizonte',
  horizonValue: '5 días de mercado (fijo)',
  save: 'Guardar',
  saving: 'Guardando…',
  saved: 'Guardado',
  saveError: 'No se pudo guardar. Inténtalo de nuevo.',
  dataTitle: 'Estado de los datos',
  provider: 'Proveedor',
  lastRun: 'Última actualización',
  staleWarning:
    'Aviso: los datos están desactualizados. Las predicciones pueden no reflejar los últimos precios.',
  fresh: 'Los datos están al día.',
  methodologyTitle: 'Metodología y aviso legal',
  methodologyDisclaimer:
    'Las predicciones son estimaciones probabilísticas para investigación personal. No son asesoramiento de inversión y pueden equivocarse.',
  methodologyStates:
    'Observando: una acción nueva se observa durante la duración indicada y no se muestra probabilidad. Activa: el modelo muestra una probabilidad junto a la tasa base y el tamaño de la muestra. Sin señal: el modelo no tiene ventaja útil sobre la tasa base, así que no se muestra nada.',
  methodologyBacktest:
    'Los backtests son hipotéticos: se simulan con datos pasados y siempre se muestran aparte de los resultados en vivo.',
}
