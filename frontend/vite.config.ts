import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
      watch: {
          usePolling: true,
          interval: 1000
      }
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});

