import { rsbuildConfig } from "@halo-dev/ui-plugin-bundler-kit";
import { pluginVue } from "@rsbuild/plugin-vue";

const OUT_DIR_PROD = "../src/main/resources/console";
const OUT_DIR_DEV = "../build/resources/main/console";

/**
 * @type {import("@halo-dev/ui-plugin-bundler-kit").RsBuildUserConfig}
 */
export default rsbuildConfig({
  rsbuild: ({ envMode }) => {
    const isProduction = envMode === "production";
    const outDir = isProduction ? OUT_DIR_PROD : OUT_DIR_DEV;

    return {
      plugins: [
        pluginVue({
          vueLoaderOptions: {
            compilerOptions: {
              isCustomElement: (tag) => tag === "shiki-code",
            },
          },
        }),
      ],
      output: {
        distPath: {
          root: outDir,
        },
      },
    };
  },
});
