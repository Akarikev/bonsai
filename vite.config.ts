import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [react(), dts({ include: ["src"] })],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "Bonsai",
      fileName: (format) => `index.${format === "es" ? "mjs" : "js"}`,
      formats: ["es", "umd"],
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
});
