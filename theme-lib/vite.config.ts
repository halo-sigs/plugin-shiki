import { minify } from "terser";
import { defineConfig, type Plugin } from "vite";

// See https://github.com/vitejs/vite/issues/6555
const minifyBundle = (): Plugin => ({
  name: "minify-bundle",
  async generateBundle(_, bundle) {
    for (const asset of Object.values(bundle)) {
      if (asset.type === "chunk") {
        const code = (await minify(asset.code, { sourceMap: false })).code;
        if (code) {
          asset.code = code;
        }
      }
    }
  },
});

export default defineConfig({
  experimental: {
    enableNativePlugin: true,
  },
  plugins: [minifyBundle()],
  define: {
    "process.env.NODE_ENV": "production",
  },
  build: {
    lib: {
      entry: {
        "shiki-code": "./src/index.ts",
        "mermaid-renderer": "./src/mermaid-renderer.ts",
      },
      formats: ["es"],
    },
    emptyOutDir: true,
    outDir: "../src/main/resources/static",
  },
});
