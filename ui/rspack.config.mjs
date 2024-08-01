import path from "path";
import { defineConfig } from "@rspack/cli";

export default defineConfig({
  entry: "./src/index.ts",
  output: {
    publicPath: "/plugins/shiki/assets/console/",
    filename: "main.js",
    chunkFilename: "[id].js",
    path: path.resolve("../src/main/resources/console"),
    library: {
      type: "var",
      export: "default",
      name: "shiki",
    },
    clean: true,
    iife: true,
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  optimization: {
    providedExports: false,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        loader: "builtin:swc-loader",
        options: {
          jsc: {
            parser: {
              syntax: "typescript",
            },
          },
        },
        type: "javascript/auto",
      },
    ],
  },
  externals: {
    vue: "Vue",
    "vue-router": "VueRouter",
    "@vueuse/core": "VueUse",
    "@vueuse/components": "VueUse",
    "@vueuse/router": "VueUse",
    "@halo-dev/console-shared": "HaloConsoleShared",
    "@halo-dev/components": "HaloComponents",
    "@halo-dev/api-client": "HaloApiClient",
    "@halo-dev/richtext-editor": "RichTextEditor",
    axios: "axios",
  },
});
