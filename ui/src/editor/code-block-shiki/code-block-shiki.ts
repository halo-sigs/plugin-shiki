import {
  ExtensionCodeBlock,
  type ExtensionCodeBlockOptions,
} from "@halo-dev/richtext-editor";
import type { BundledLanguage, BundledTheme } from "shiki";
import { shikiLanguages } from "./shiki";
import { ShikiPlugin } from "./shiki-plugin";

export interface CodeBlockShikiOptions extends ExtensionCodeBlockOptions {
  defaultLanguage: BundledLanguage | null | undefined;
  defaultTheme: BundledTheme;
}

export default ExtensionCodeBlock.extend<CodeBlockShikiOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      languages: shikiLanguages,
      defaultLanguage: null,
      defaultTheme: "github-light",
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      theme: {
        parseHTML: null,
        renderHTML: () => {},
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      ...(this.parent?.() || []),
      ShikiPlugin({
        name: this.name,
        defaultLanguage: this.options.defaultLanguage,
        defaultTheme: this.options.defaultTheme,
      }),
    ];
  },
});
