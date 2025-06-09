import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import dts from "vite-plugin-dts";
import { visualizer } from "rollup-plugin-visualizer";
// import sizeSnapshot from "rollup-plugin-size-snapshot";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    dts({
      include: ["src"],
      outDir: "dist",
      rollupTypes: true,
      insertTypesEntry: true,
      copyDtsFiles: true,
    }),
    // sizeSnapshot(),
    mode === "analyze" &&
      visualizer({
        filename: "dist/stats.html",
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
  ].filter(Boolean),
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        devtools: resolve(__dirname, "src/devtools/index.ts"),
      },
      formats: ["es", "cjs"],
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    sourcemap: true,
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
        assetFileNames: (assetInfo) =>
          assetInfo.name === "style.css"
            ? "index.css"
            : assetInfo.name || "asset.[ext]",
      },
    },
  },
  test: {
    include: ["src/benchmarks/**/*.bench.ts", "src/**/*.test.{ts,tsx,js,jsx}"],
  },
}));
