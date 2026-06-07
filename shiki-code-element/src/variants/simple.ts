import reset from "@unocss/reset/tailwind.css?inline";
import { css, html, unsafeCSS } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import shikiStyle from "../styles/shiki.css?inline";
import { ShikiCodeBaseVariant } from "./base";

export class ShikiCodeSimpleVariant extends ShikiCodeBaseVariant {
  override render() {
    return html`
      <div class="shadow rounded-lg relative group">
        ${unsafeHTML(this.options.html)}
        <div
          class="absolute select-none top-1 text-xs right-14 transition-opacity"
          style="color: ${this.options.theme?.fg}"
        >
          ${this.options.languageName}
        </div>
        <button
          class="copy-button"
          style="background-color: ${this.options.theme?.bg}; color: ${this.options.theme?.fg}; border-color: ${this.options.theme?.fg};"
          @click=${this.handleCopyCode}
          title="复制代码"
          aria-label="复制代码"
          tabindex="0"
        >
          ${this.copied ? "已复制" : "复制"}
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
      .copy-button {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        z-index: 10;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 2.5rem;
        height: 1.75rem;
        padding: 0 0.625rem;
        border-width: 1px;
        border-style: solid;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        line-height: 1;
        opacity: 0.88;
        cursor: pointer;
        user-select: none;
      }
      .copy-button:hover,
      .copy-button:focus-visible {
        opacity: 1;
        outline: 2px solid currentColor;
        outline-offset: 2px;
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
