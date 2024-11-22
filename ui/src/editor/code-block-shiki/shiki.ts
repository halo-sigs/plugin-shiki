import { bundledLanguagesInfo, bundledThemesInfo } from "shiki";

export const shikiLanguages = bundledLanguagesInfo.map((lang) => {
  return {
    label: lang.name,
    value: lang.id,
  };
});

export const shikiThemes = bundledThemesInfo.map((theme) => {
  return {
    label: theme.displayName,
    value: theme.id,
  };
});
