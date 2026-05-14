import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/** Same path routing as production nginx: UI on Vite, everything else proxied to FastAPI. */
const apiTarget = "http://127.0.0.1:8000";

const proxy = {
  target: apiTarget,
  changeOrigin: true,
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": proxy,
      "/docs": proxy,
      "/redoc": proxy,
      "/openapi.json": proxy,
      "/metrics": proxy,
    },
  },
});
