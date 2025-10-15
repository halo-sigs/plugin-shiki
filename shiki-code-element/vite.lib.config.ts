import UnocssVitePlugin from "unocss/vite";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  experimental: {
    enableNativePlugin: true,
  },
  plugins: [
    UnocssVitePlugin({
      configFile: "./uno.config.ts",
      mode: "shadow-dom",
    }),
    dts({
      tsconfigPath: "./tsconfig.json",
    }),
  ],
  build: {
    lib: {
      entry: "./src/index.ts",
      name: "shiki-code-element",
      fileName: "index",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["shiki", "@shikijs/transformers"],
    },
  },
});
