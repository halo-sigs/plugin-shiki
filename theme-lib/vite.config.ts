import UnocssVitePlugin from "unocss/vite";
import { defineConfig } from "vite";
export default defineConfig({
  plugins: [
    UnocssVitePlugin({
      configFile: "./uno.config.ts",
      mode: "shadow-dom",
    }),
  ],
});
