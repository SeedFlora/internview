import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

// BUG FIX: the bundle visualizer previously ran on EVERY build and wrote
// dist/stats.html, which the deploy copies to /var/www/app -- so anyone could
// open https://<site>/stats.html and read the full source-tree and dependency
// inventory. `open: true` also tried to launch a browser in CI. Gate it behind
// an explicit opt-in so normal/production builds never emit it. Analyse locally
// with:  ANALYZE=1 pnpm build
export default defineConfig(() => {
  const plugins = [react(), tailwindcss()];

  if (process.env.ANALYZE) {
    plugins.push(
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: "dist/stats.html",
      }),
    );
  }

  return {
    plugins,

    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },

    preview: {
      port: 5173,
    },
  };
});