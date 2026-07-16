import { LitElement, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import { CodeFoldingController } from "../code-folding/controller";
import type { VariantOptions } from "../types";
import { copyText } from "../utils/copy-to-clipboard";

export class ShikiCodeBaseVariant extends LitElement {
  constructor() {
    super();
    new CodeFoldingController(this);
  }

  @property({ type: Object })
  options: VariantOptions = {
    html: "",
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
      this.style.setProperty(
        "--shiki-theme-fg",
        this.options.theme?.fg || "currentColor",
      );
      this.style.setProperty(
        "--shiki-theme-bg",
        this.options.theme?.bg || "transparent",
      );
      this.style.setProperty("--font-size", this.options.fontSize || "0.875em");
    }
  }

  handleCopyCode() {
    const pre = this.shadowRoot?.querySelector("pre");
    const lines = pre?.querySelectorAll<HTMLElement>("code > .line");
    const code = lines?.length
      ? Array.from(lines)
          .map((line) => line.textContent || "")
          .join("\n")
      : pre?.textContent;

    copyText(code || "", () => {
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    });
  }
}
