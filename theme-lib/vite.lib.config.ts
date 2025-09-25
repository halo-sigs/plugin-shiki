import UnocssVitePlugin from "unocss/vite";
import { defineConfig } from "vite";
export default defineConfig({
  plugins: [
    UnocssVitePlugin({
      configFile: "./uno.config.ts",
      mode: "shadow-dom",
    }),
  ],
  define: {
    "process.env.NODE_ENV": "production",
  },
  build: {
    lib: {
      entry: "./src/index.ts",
      name: "shiki-code",
      fileName: `shiki-code`,
      formats: ["es"],
    },
    emptyOutDir: true,
    outDir: "../src/main/resources/static",
  },
});
