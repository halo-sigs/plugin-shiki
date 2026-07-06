import { LitElement, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import type { VariantOptions } from "../types";
import { copyText } from "../utils/copy-to-clipboard";

export class ShikiCodeBaseVariant extends LitElement {
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

  handleCodeBlockClick(event: Event) {
    if (!(event.target instanceof Element)) {
      return;
    }

    const foldToggle = event.target.closest<HTMLElement>(
      ".fold-start, .fold-tail-control",
    );
    if (foldToggle) {
      this.toggleFold(foldToggle);
    }
  }

  handleCodeBlockKeydown(event: KeyboardEvent) {
    if (!(event.target instanceof Element)) {
      return;
    }

    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const foldToggle = event.target.closest<HTMLElement>(
      ".fold-start, .fold-tail-control",
    );
    if (!foldToggle) {
      return;
    }

    event.preventDefault();
    this.toggleFold(foldToggle);
  }

  private toggleFold(foldToggle: HTMLElement) {
    const foldId = foldToggle.dataset.foldId;
    const pre = foldToggle.closest("pre");
    if (!foldId || !pre) {
      return;
    }

    const expanded = foldToggle.getAttribute("aria-expanded") !== "true";
    for (const line of pre.querySelectorAll<HTMLElement>(".fold-line")) {
      if (line.dataset.foldId === foldId) {
        line.classList.toggle("fold-expanded", expanded);
        if (line.classList.contains("fold-hidden")) {
          line.setAttribute("aria-hidden", String(!expanded));
        }
      }
    }

    foldToggle.classList.toggle("fold-expanded", expanded);
    foldToggle.setAttribute("aria-expanded", String(expanded));
  }
}
