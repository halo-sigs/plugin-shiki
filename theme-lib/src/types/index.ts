import type { ThemeRegistration } from "shiki";

export type ColorScheme = "light" | "dark";

export interface VariantOptions {
  html: string;
  code: string;
  languageName: string;
  colorScheme: ColorScheme;
  theme: ThemeRegistration | null;
}
