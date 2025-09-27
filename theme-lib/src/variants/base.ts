import { LitElement, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import type { ColorScheme } from "../types";
import { copyText } from "../utils/copy-to-clipboard";

export class ShikiCodeBaseVariant extends LitElement {
  @property({ type: String })
  html: string = "";

  @property({ type: String })
  code: string = "";

  @property({ type: String })
  fg?: string = "#000";

  @property({ type: String })
  bg?: string = "#fff";

  @property({ type: String })
  themeType?: "light" | "dark" = "light";

  @property({ type: String })
  languageName?: string = "";

  @state()
  copied = false;

  @property({
    type: String,
  })
  colorScheme: ColorScheme = "light";

  protected updated(_changedProperties: PropertyValues): void {
    if (_changedProperties.has("colorScheme")) {
      this.setAttribute("color-scheme", this.colorScheme);
    }
    if (_changedProperties.has("themeType")) {
      this.style.setProperty("--shiki-theme-type", this.themeType || "light");
    }
  }

  handleCopyCode() {
    copyText(this.code, () => {
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    });
  }
}
