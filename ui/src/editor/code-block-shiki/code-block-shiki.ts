import type { BundledLanguage, BundledTheme } from "shiki";
import {
  ExtensionCodeBlock,
  type ExtensionCodeBlockOptions,
} from "@halo-dev/richtext-editor";
import { shikiLanguages, shikiThemes } from "./shiki";
import { ShikiPlugin } from "./shiki-plugin";

export interface CodeBlockShikiOptions extends ExtensionCodeBlockOptions {
  defaultLanguage: BundledLanguage | null | undefined;
  defaultTheme: BundledTheme;
}

export default ExtensionCodeBlock.extend<CodeBlockShikiOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      languageClassPrefix: "shiki-",
      languages: shikiLanguages,
      themes: shikiThemes,
      defaultLanguage: null,
      defaultTheme: "github-light",
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
