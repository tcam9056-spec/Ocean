import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { mockupPreviewPlugin } from "./mockupPreviewPlugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// fallback port
const port = parseInt(process.env.PORT || "5173", 10);
const basePath = process.env.BASE_PATH || "/";

export default defineConfig(async () => {
  const plugins = [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    mockupPreviewPlugin(),
  ];

  // chỉ load plugin Replit khi dev
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID
  ) {
    const mod = await import(
      "@replit/vite-plugin-cartographer"
    );

    plugins.push(
      mod.cartographer({
        root: path.resolve(__dirname, ".."),
      })
    );
  }

  return {
    base: basePath,

    plugins,

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },

    root: __dirname,

    build: {
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
    },

    server: {
      host: "0.0.0.0",
      port,
      allowedHosts: true,
    },

    preview: {
      host: "0.0.0.0",
      port,
      allowedHosts: true,
    },
  };
});