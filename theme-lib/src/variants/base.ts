import { LitElement, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import type { VariantOptions } from "../types";
import { copyText } from "../utils/copy-to-clipboard";

export class ShikiCodeBaseVariant extends LitElement {
  @property({ type: Object })
  options: VariantOptions = {
    html: "",
    code: "",
    languageName: "Unknown",
    colorScheme: "light",
    theme: null,
    fontSize: "0.875em",
  };

  @state()
  copied = false;

  protected updated(_changedProperties: PropertyValues): void {
    if (_changedProperties.has("options")) {
      this.setAttribute("color-scheme", this.options.colorScheme);
      this.style.setProperty(
        "--shiki-theme-type",
        this.options.theme?.type || "light",
      );
      this.style.setProperty("--font-size", this.options.fontSize || "0.875em");
    }
  }

  handleCopyCode() {
    copyText(this.options.code, () => {
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    });
  }
}
