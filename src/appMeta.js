/** Metadatos de la app (Vite: prefijo VITE_ en .env) */
export const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? '0.1.0';

export const API_URL =
  import.meta.env.VITE_API_URL ?? 'https://uefn-domenica-miranda-api.acertijo.dev/api';

export const APP_DESCRIPTION =
  'MoodVision AI es una aplicacion web de reconocimiento emocional en tiempo real: usa la camara ' +
  'del navegador para estimar expresiones, mostrar estadisticas y un panel interactivo. El ' +
  'frontend se comunica con una API en Node para persistir datos; la inferencia facial puede ' +
  'ejecutarse en el cliente segun la configuracion del proyecto.';

/** Texto por defecto del intervalo de reconocimiento (modal de configuracion). */
export const DEFAULT_RECOGNITION_TIME = '10 segundos';
