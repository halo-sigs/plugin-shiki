import type { BundledLanguage, BundledTheme } from "shiki";
import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { bundledLanguages } from "shiki/langs";
import { bundledThemes } from "shiki/themes";

let highlighterPromise: Promise<HighlighterCore> | undefined;
const loadingLanguages = new Map<BundledLanguage, Promise<void>>();
const loadingThemes = new Map<BundledTheme, Promise<void>>();

function loadLanguage(highlighter: HighlighterCore, language: string) {
  if (highlighter.getLoadedLanguages().includes(language)) {
    return;
  }

  const bundledLanguage = bundledLanguages[language as BundledLanguage];
  if (!bundledLanguage) {
    return;
  }

  const languageCode = language as BundledLanguage;
  let loading = loadingLanguages.get(languageCode);
  if (!loading) {
    loading = highlighter.loadLanguage(bundledLanguage).finally(() => {
      loadingLanguages.delete(languageCode);
    });
    loadingLanguages.set(languageCode, loading);
  }
  return loading;
}

function loadTheme(highlighter: HighlighterCore, theme: string) {
  if (highlighter.getLoadedThemes().includes(theme)) {
    return;
  }

  const bundledTheme = bundledThemes[theme as BundledTheme];
  if (!bundledTheme) {
    return;
  }

  const themeName = theme as BundledTheme;
  let loading = loadingThemes.get(themeName);
  if (!loading) {
    loading = highlighter.loadTheme(bundledTheme).finally(() => {
      loadingThemes.delete(themeName);
    });
    loadingThemes.set(themeName, loading);
  }
  return loading;
}

export async function getHighlighter(language: string, themes: string[]) {
  highlighterPromise ??= createHighlighterCore({
    themes: [],
    langs: [],
    engine: createJavaScriptRegexEngine(),
  });

  const highlighter = await highlighterPromise;
  await Promise.all([
    loadLanguage(highlighter, language),
    ...themes.map((theme) => loadTheme(highlighter, theme)),
  ]);
  return highlighter;
}
