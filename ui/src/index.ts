import { definePlugin } from "@halo-dev/console-shared";

export default definePlugin({
  extensionPoints: {
    "default:editor:extension:create": async () => {
      const { ExtensionCodeBlockShiki } = await import(
        "./editor/code-block-shiki"
      );
      return [ExtensionCodeBlockShiki];
    },
  },
});
