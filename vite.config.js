import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Debe coincidir con uefn-backend: API_URL + API_PORT → http://localhost:3006
  const proxyTarget =
    env.VITE_BACKEND_PROXY_TARGET?.trim() || 'http://127.0.0.1:3006';

  return {
  plugins: [react(), basicSsl()],
  optimizeDeps: {
    include: ["face-api.js"],
  },
  server: {
    port: 5173,
    // El frontend va en HTTPS (cámara). El API en HTTP (API_PORT).
    // El navegador llama a https://localhost:5173/api/* y Vite reenvía a proxyTarget.
    proxy: {
      "/api": {
        target: proxyTarget,
        changeOrigin: true,
      },
      "/media": {
        target: proxyTarget,
        changeOrigin: true,
      },
      "/health": {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
    // En algunos discos externos / FS lentos, el watcher no detecta cambios en `src/`
    // y parece que “no se actualiza”. usePolling fuerza comprobaciones periódicas.
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
};
});
