import type { BundledLanguage } from "shiki";
import {
  ExtensionCodeBlock,
  type ExtensionCodeBlockOptions,
} from "@halo-dev/richtext-editor";
import { shikiLanguages } from "./shiki";
import { ShikiPlugin } from "./shiki-plugin";

export interface CodeBlockShikiOptions extends ExtensionCodeBlockOptions {
  defaultLanguage: BundledLanguage | null | undefined;
}

export default ExtensionCodeBlock.extend<CodeBlockShikiOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      languages: shikiLanguages,
      defaultLanguage: null,
    };
  },

  addProseMirrorPlugins() {
    return [
      ...(this.parent?.() || []),
      ShikiPlugin({
        name: this.name,
        defaultLanguage: this.options.defaultLanguage,
      }),
    ];
  },
});
