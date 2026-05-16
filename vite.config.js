import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [react(), basicSsl()],
  optimizeDeps: {
    include: ["face-api.js"],
  },
  server: {
    port: 5173,
    // En algunos discos externos / FS lentos, el watcher no detecta cambios en `src/`
    // y parece que “no se actualiza”. usePolling fuerza comprobaciones periódicas.
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
});
