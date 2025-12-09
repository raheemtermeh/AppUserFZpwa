import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // Use injectManifest and point to our custom service worker source
      injectManifest: {
        swSrc: "src/sw.ts",
        swDest: "sw.js",
      },
      manifest: {
        name: "Funzone",
        short_name: "Funzone",
        description: "Find events and venues — Funzone",
        start_url: "/",
        display: "standalone",
        background_color: "#0f172a",
        theme_color: "#7c3aed",
        icons: [
          { src: "/icons/icon-48.png", sizes: "48x48", type: "image/png" },
          { src: "/icons/icon-72.png", sizes: "72x72", type: "image/png" },
          { src: "/icons/icon-96.png", sizes: "96x96", type: "image/png" },
          { src: "/icons/icon-128.png", sizes: "128x128", type: "image/png" },
          { src: "/icons/icon-152.png", sizes: "152x152", type: "image/png" },
          {
            src: "/public/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          { src: "/icons/icon-384.png", sizes: "384x384", type: "image/png" },
          {
            src: "/public/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        screenshots: [
          {
            src: "/public/screenshots/screenshot-wide.png",
            sizes: "1024x512",
            type: "image/png",
            form_factor: "wide",
          },
          {
            src: "/public/screenshots/home-mobile.png",
            sizes: "640x720",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: Number(process.env.VITE_DEV_PORT || process.env.PORT || 5174),
  },
});
