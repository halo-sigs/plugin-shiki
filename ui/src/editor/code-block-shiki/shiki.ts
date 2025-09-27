import { bundledLanguagesInfo, bundledThemesInfo } from "shiki";

export const fixedLanguages = [
  {
    label: "None",
    value: "",
  },
  {
    label: "Plain Text",
    value: "plaintext",
  },
];

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
