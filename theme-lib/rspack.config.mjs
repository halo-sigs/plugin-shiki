import { defineConfig } from "@rspack/cli";
import path from "path";

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
});
