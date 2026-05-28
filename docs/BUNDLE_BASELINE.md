# Bundle baseline — MoodVision (`uefn-frontend`)

Documento de **Fase 0**: medición inicial, herramientas y objetivos antes del code splitting (Fases 1+).

## Estado actual (referencia)

Los números canónicos viven en [`bundle-baseline.json`](./bundle-baseline.json) (generado por script). Resumen del snapshot inicial:

| Métrica | Valor aprox. | Notas |
|--------|--------------|--------|
| **JS principal (1 chunk)** | ~2.66 MB (~660 KB gzip) | Todo el dashboard + Phaser + face-api |
| **CSS** | ~222 KB (~34 KB gzip) | `@mantine/core/styles.css` en `main.jsx` |
| **Chunks JS** | **1** | Sin `React.lazy` ni rutas con `import()` efectivos |
| **Módulos transformados** | ~7 164 | Vite `build` |
| **Media del juego en `dist/`** | ~4.8 MB | GIF Bowser ~3.2 MB; empaquetado con el grafo del juego |
| **Avatares en `dist/`** | ~227 KB | 66 `.webp` copiados al build |
| **Modelos face-api** | ~7.4 MB | `public/models/` — fuera del JS, carga en runtime |
| **`dist/` total** | ~15.2 MB | JS + CSS + assets + modelos copiados |

### Top paquetes en el JS principal (gzip, `build:analyze`)

| Paquete | ~gzip |
|---------|-------|
| **phaser** | 1.19 MB |
| **@tensorflow/tfjs-core** | 124 KB |
| **@mantine/core** | 106 KB |
| **react-dom** | 96 KB |
| **face-api.js** | 69 KB |
| Código app + resto | ~75 KB |

Phaser es el mayor contribuyente dentro del único chunk JS; por eso el lazy de `GameScreen` es la prioridad #1.

### Hallazgos del grafo de imports

- Entrada: `main.jsx` → `AppRoot` → **`import` estático de `App.jsx`**.
- `App.jsx` importa en cadena: dashboard, `DashboardModals`, `GameScreen` (Phaser), `faceApi.js`.
- Único `import()` dinámico: `recentHistoryCache.js` en `SidebarMenu.jsx`, pero **no crea chunk** porque el mismo módulo se importa estáticamente desde `App.jsx` y `useRecentEmotionHistory.js`.
- `recharts` está en `package.json` pero **no** entra al bundle de producción.

---

## Objetivos (Fase 1+)

| ID | Objetivo | Criterio de éxito |
|----|----------|-------------------|
| **G1** | Reducir JS del primer paint | Chunk inicial **&lt; 500 KB gzip** (umbral de advertencia de Vite) |
| **G2** | Code splitting real | **≥ 4** chunks JS en build (`main`, `app`, `face-api`, `game`, modales…) |
| **G3** | face-api bajo demanda | Librería + TensorFlow **no** en el chunk que carga con el splash |
| **G4** | Juego aislado | Phaser + `src/game/` + media Mario solo al `activeNav === "game"` |
| **G5** | Modales bajo demanda | Cuerpos de modal en chunks separados o lazy group |
| **G6** | Arreglar `recentHistoryCache` | Un solo tipo de import (todo dynamic o todo en chunk dedicado) |
| **G7** | Mantener modelos ML fuera del JS | Seguir sirviendo `/models` con caché larga en nginx |

### No objetivos (por ahora)

- Web Worker para inferencia (Fase avanzada).
- Sustituir face-api.js por otro runtime.
- Comprimir GIF Bowser (mejora de media, no de splitting).

---

## Comandos

```bash
# Build normal de producción
npm run build

# Build + treemap HTML + JSON para desglose por paquete
npm run build:analyze
# Abre docs/bundle-stats.html en el navegador (generado, no versionado)

# Regenerar bundle-baseline.json (ejecuta build + mide dist/)
npm run bundle:baseline

# Build con analyze + baseline con topPackages
npm run bundle:baseline:full
```

Tras cada fase de optimización, ejecutar `npm run bundle:baseline:full` y comparar `docs/bundle-baseline.json` (commit del JSON si quieres historial en git).

---

## Archivos

| Archivo | Propósito |
|---------|-----------|
| [`bundle-baseline.json`](./bundle-baseline.json) | Snapshot medible (versionar en git) |
| `bundle-stats.html` | Treemap interactivo (gitignore, local) |
| `bundle-stats.json` | Datos raw del visualizer (gitignore) |
| [`../scripts/capture-bundle-baseline.mjs`](../scripts/capture-bundle-baseline.mjs) | Script de captura |
| [`../vite.config.js`](../vite.config.js) | `rollup-plugin-visualizer` si `ANALYZE=true` |

---

## Próximos pasos (Fase 1)

Orden sugerido según impacto en este baseline:

1. Lazy `GameScreen` (Phaser + media).
2. Dynamic `import("face-api.js")` en servicios.
3. Lazy modales / `DashboardModals`.
4. Corregir imports de `recentHistoryCache.js`.
5. Lazy `App` desde `AppRoot` (aprovechar splash).

Ver plan detallado en conversación / issues del repo.
