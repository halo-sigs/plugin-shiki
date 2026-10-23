import { axiosInstance } from "@halo-dev/api-client";
import { definePlugin } from "@halo-dev/ui-shared";
import ShikiEditorPreview from "./formkit/ShikiEditorPreview.vue";
import ShikiThemePreview from "./formkit/ShikiThemePreview.vue";

export default definePlugin({
  components: {
    ShikiThemePreview,
    ShikiEditorPreview,
  },
  extensionPoints: {
    "default:editor:extension:create": async () => {
      const { ExtensionCodeBlockShiki } = await import(
        "./editor/code-block-shiki"
      );
      const { data } = await axiosInstance.get(
        "/apis/api.editor.shiki.halo.run/v1alpha1/editor/config",
      );
      return [
        ExtensionCodeBlockShiki.configure({
          defaultTheme: data.theme,
        }),
      ];
    },
  },
});
