import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: resolve(projectRoot, "pages"),
  base: process.env.PAGES_BASE_PATH || "/nebook-cator/",
  publicDir: resolve(projectRoot, "public"),
  define: {
    "import.meta.env.VITE_GITHUB_PAGES_DEMO": JSON.stringify("true"),
  },
  plugins: [react()],
  build: {
    outDir: resolve(projectRoot, "dist-pages"),
    emptyOutDir: true,
  },
});
