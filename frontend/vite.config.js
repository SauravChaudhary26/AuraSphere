import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Legacy pages carry JSX inside .js files (a Create React App habit). The
// esbuild loader treats every src .js/.jsx as JSX across all of Vite's passes,
// and optimizeDeps handles JSX-in-.js during dependency pre-bundling.
export default defineConfig({
  plugins: [react()],
  server: { port: 3000, host: true },
  preview: { port: 3000 },
  esbuild: { loader: "jsx", include: /src\/.*\.jsx?$/, exclude: [] },
  optimizeDeps: { esbuildOptions: { loader: { ".js": "jsx" } } },
});
