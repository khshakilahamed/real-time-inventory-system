import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": { target: "http://localhost:3000", changeOrigin: true },
      // "/api": { target: "https://real-time-inventory-system.onrender.com", changeOrigin: true },
      "/socket.io": {
        target: "http://localhost:3000",
        // target: "https://real-time-inventory-system.onrender.com",
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
