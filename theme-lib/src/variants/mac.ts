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
          style="background-color: ${this.bg};"
        >
          <div class="flex gap-2">
            <div class="bg-[#FF5C60] size-3.5 rounded-full"></div>
            <div class="bg-[#FAC800] size-3.5 rounded-full"></div>
            <div class="bg-[#35C759] size-3.5 rounded-full"></div>
          </div>
          <div class="select-none font-semibold" style="color: ${this.fg}">
            ${this.languageName}
          </div>
          <div class="inline-flex items-center gap-2">
            <button
              class="select-none"
              tabindex="-1"
              @click=${() => {
                this.fold = !this.fold;
              }}
            >
              ${when(
                this.fold,
                () =>
                  html`<i class="i-mingcute-left-line block" style="color: ${this.fg}"></i>`,
                () =>
                  html`<i class="i-mingcute-down-line block" style="color: ${this.fg}"></i>`,
              )}
            </button>
            <button class="select-none" tabindex="-1" @click=${this.handleCopyCode}>
              ${when(
                this.copied,
                () =>
                  html`<i class="i-tabler-check block" style="color: ${this.fg}"></i>`,
                () =>
                  html`<i class="i-tabler-copy block" style="color: ${this.fg}"></i>`,
              )}
            </button>
          </div>
        </header>
        ${when(
          this.fold,
          () => html``,
          () => html`${unsafeHTML(this.html)}`,
        )}
      </div>
    `;
  }

  static styles = [
    unsafeCSS(reset),
    unsafeCSS(shikiStyle),
    css`
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
