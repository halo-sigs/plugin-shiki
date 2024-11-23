import { defineConfig } from "@rspack/cli";
import path from "path";
import fs from "fs";

/**
 * 移动静态资源文件到指定目录
 */
class MoveFilePlugin {
  constructor(options) {
    this.src = options.src;
    this.dest = options.dest;
  }

  apply(compiler) {
    compiler.hooks.done.tap("MoveFilePlugin", () => {
      const srcPath = path.resolve(this.src);
      const destPath = path.resolve(this.dest);

      if (fs.existsSync(srcPath)) {
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }

        fs.copyFileSync(srcPath, destPath);
        console.log(`Moved: ${srcPath} -> ${destPath}`);
      } else {
        console.warn(`Source file not found: ${srcPath}`);
      }
    });
  }
}

export default defineConfig({
  entry: "./src/main.ts",
  output: {
    filename: "main.js",
    chunkFilename: "[id].js",
    path: path.resolve("../src/main/resources/static"),
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
  experiments: {
    css: true,
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
  plugins: [
    /**
     * 这里手动移动 css 文件而不是在 main.ts 中导入，是因为插件配置项中可以关闭使用内置样式
     */
    new MoveFilePlugin({
      src: "./src/assets/style.css",
      dest: "../src/main/resources/static/style.css",
    }),
  ],
});