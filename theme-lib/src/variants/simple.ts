import reset from "@unocss/reset/tailwind.css?inline";
import { css, html, unsafeCSS } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { when } from "lit/directives/when.js";
import shikiStyle from "../styles/shiki.css?inline";
import { ShikiCodeBaseVariant } from "./base";

export class ShikiCodeSimpleVariant extends ShikiCodeBaseVariant {
  override render() {
    return html`
      <div class="shadow rounded-lg relative group">
        ${unsafeHTML(this.html)}
        <div
          class="absolute select-none top-1 text-xs right-2 group-hover:opacity-0 transition-opacity"
          style="color: ${this.fg}"
        >
          ${this.languageName}
        </div>
        <button
          class="opacity-0 z-2 select-none group-hover:opacity-100 transition-opacity absolute top-2 rounded right-2 size-8 inline-flex items-center justify-center"
          style="background-color: ${this.bg};"
          @click=${this.handleCopyCode}
          tabindex="-1"
        >
          ${when(
            this.copied,
            () =>
              html`<i class="i-tabler-check block" style="color: ${this.fg}"></i>`,
            () =>
              html`<i class="i-tabler-copy block" style="color: ${this.fg}"></i>`,
          )}
        </button>
      </div>
    `;
  }

  static styles = [
    unsafeCSS(reset),
    unsafeCSS(shikiStyle),
    css`
      .shiki {
        border-radius: inherit;
      }
      @unocss-placeholder;
    `,
  ];
}

customElements.get("shiki-code-simple-variant") ||
  customElements.define("shiki-code-simple-variant", ShikiCodeSimpleVariant);

declare global {
  interface HTMLElementTagNameMap {
    "shiki-code-simple-variant": ShikiCodeSimpleVariant;
  }
}
