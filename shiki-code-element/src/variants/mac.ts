import reset from "@unocss/reset/tailwind.css?inline";
import { css, html, unsafeCSS } from "lit";
import { state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { when } from "lit/directives/when.js";
import shikiStyle from "../styles/shiki.css?inline";
import { ShikiCodeBaseVariant } from "./base";

export class ShikiCodeMacVariant extends ShikiCodeBaseVariant {
  @state()
  fold = false;

  override render() {
    return html`
      <div class="shadow rounded-lg overflow-hidden relative group">
        <header
          class="flex items-center h-10 justify-between px-4.5 opacity-95"
          style="background-color: ${this.options.theme?.bg};"
        >
          <div class="flex gap-2">
            <div class="bg-[#FF5C60] size-3 rounded-full"></div>
            <div class="bg-[#FAC800] size-3 rounded-full"></div>
            <div class="bg-[#35C759] size-3 rounded-full"></div>
          </div>
          <div class="select-none font-semibold" style="color: ${this.options.theme?.fg}">
            ${this.options.languageName}
          </div>
          <div class="inline-flex items-center gap-2">
            <button
              class="mac-action-button"
              style="color: ${this.options.theme?.fg}; border-color: ${this.options.theme?.fg};"
              tabindex="0"
              title=${this.fold ? "展开代码" : "折叠代码"}
              aria-label=${this.fold ? "展开代码" : "折叠代码"}
              @click=${() => {
                this.fold = !this.fold;
              }}
            >
              ${this.fold ? "展开" : "折叠"}
            </button>
            <button
              class="mac-action-button"
              style="color: ${this.options.theme?.fg}; border-color: ${this.options.theme?.fg};"
              tabindex="0"
              title="复制代码"
              aria-label="复制代码"
              @click=${this.handleCopyCode}
            >
              ${this.copied ? "已复制" : "复制"}
            </button>
          </div>
        </header>
        ${when(
          this.fold,
          () => html``,
          () => html`${unsafeHTML(this.options.html)}`,
        )}
      </div>
    `;
  }

  static styles = [
    unsafeCSS(reset),
    unsafeCSS(shikiStyle),
    css`
      .mac-action-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 2.5rem;
        height: 1.75rem;
        padding: 0 0.625rem;
        border-width: 1px;
        border-style: solid;
        border-radius: 0.375rem;
        background: transparent;
        font-size: 0.75rem;
        line-height: 1;
        opacity: 0.88;
        cursor: pointer;
        user-select: none;
      }
      .mac-action-button:hover,
      .mac-action-button:focus-visible {
        opacity: 1;
        outline: 2px solid currentColor;
        outline-offset: 2px;
      }
      @unocss-placeholder;
    `,
  ];
}

customElements.get("shiki-code-mac-variant") ||
  customElements.define("shiki-code-mac-variant", ShikiCodeMacVariant);

declare global {
  interface HTMLElementTagNameMap {
    "shiki-code-mac-variant": ShikiCodeMacVariant;
  }
}
