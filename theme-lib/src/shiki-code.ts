import reset from "@unocss/reset/tailwind.css?inline";
import { css, html, LitElement, unsafeCSS } from "lit";
import { property, state } from "lit/decorators.js";
import type { ThemeRegistrationResolved } from "shiki";
import "./variants/simple";
import "./variants/mac";
import type { ColorScheme } from "./types";

export class ShikiCode extends LitElement {
  @property({ type: String, attribute: "light-theme" })
  lightTheme: string = "github-light";

  @property({ type: String, attribute: "dark-theme" })
  darkTheme?: string = "github-dark";

  @property({ type: String })
  variant: "simple" | "mac" = "simple";

  @state()
  loading = true;

  @state()
  html = "";

  @state()
  languageCode = "";

  @state()
  languageName = "";

  @state()
  lightThemeRegistration: ThemeRegistrationResolved | null = null;

  @state()
  darkThemeRegistration: ThemeRegistrationResolved | null = null;

  @state()
  code = "";

  @state()
  copied = false;

  @state()
  error = "";

  private _observer: MutationObserver | null = null;
  private _media: MediaQueryList | null = null;

  @state()
  private _colorScheme: ColorScheme = "light";

  get _themeRegistration() {
    return this._colorScheme === "dark"
      ? this.darkThemeRegistration
      : this.lightThemeRegistration;
  }

  connectedCallback(): void {
    this._media = window.matchMedia("(prefers-color-scheme: dark)");

    this.updateTheme();

    this._observer = new MutationObserver(() => this.updateTheme());
    this._observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-color-scheme"],
    });
    this._observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "data-color-scheme"],
    });

    this._media.addEventListener("change", () => this.updateTheme());
    super.connectedCallback();
  }

  disconnectedCallback() {
    this._observer?.disconnect();
    this._media?.removeEventListener("change", () => this.updateTheme());
    super.disconnectedCallback();
  }

  isDarkMode() {
    const html = document.documentElement;
    const body = document.body;

    const hasClass = (el: HTMLElement, cls: string) =>
      el?.classList.contains(cls);
    const hasDataAttr = (el: HTMLElement, attr: string, value: string) =>
      el?.getAttribute(attr) === value;

    if (
      hasClass(html, "color-scheme-auto") ||
      hasClass(body, "color-scheme-auto") ||
      hasDataAttr(html, "data-color-scheme", "auto") ||
      hasDataAttr(body, "data-color-scheme", "auto")
    ) {
      return this._media?.matches;
    }

    if (
      hasClass(html, "color-scheme-dark") ||
      hasClass(html, "dark") ||
      hasDataAttr(html, "data-color-scheme", "dark") ||
      hasClass(body, "color-scheme-dark") ||
      hasClass(body, "dark") ||
      hasDataAttr(body, "data-color-scheme", "dark")
    ) {
      return true;
    }

    return false;
  }

  updateTheme() {
    this._colorScheme = this.isDarkMode() ? "dark" : "light";
  }

  render() {
    return html`<slot @slotchange=${this.handleSlotchange}></slot> ${this.renderCodeBlockBody()}`;
  }

  renderCodeBlockBody() {
    if (this.loading) {
      return html``;
    }

    if (this.error) {
      return html`<div class="text-sm text-red-500">错误: ${this.error}</div>`;
    }

    if (this.variant === "mac") {
      return html`<shiki-code-mac-variant
        .code=${this.code}
        .html=${this.html}
        .languageName=${this.languageName}
        .fg=${this._themeRegistration?.fg}
        .bg=${this._themeRegistration?.bg}
        .colorScheme=${this._colorScheme}
        .themeType=${this._themeRegistration?.type}
      ></shiki-code-mac-variant>`;
    }

    if (this.variant === "simple") {
      return html`<shiki-code-simple-variant
        .code=${this.code}
        .html=${this.html}
        .languageName=${this.languageName}
        .fg=${this._themeRegistration?.fg}
        .bg=${this._themeRegistration?.bg}
        .colorScheme=${this._colorScheme}
        .themeType=${this._themeRegistration?.type}
      ></shiki-code-simple-variant>`;
    }
  }

  handleSlotchange(e: Event) {
    const elements = (e.target as HTMLSlotElement).assignedElements({
      flatten: true,
    });
    if (!elements.length) return;
    const element = elements[0];
    if (element.tagName === "PRE") {
      const codeElement = element.querySelector("code");
      if (codeElement) {
        this.process(codeElement);
      }
    }
  }

  async process(codeElement: HTMLElement) {
    try {
      this.languageCode =
        this.extractLanguageCode(codeElement.classList) || "plaintext";

      // Fix plugin-highlight issue where language is set to "auto"
      if (this.languageCode === "auto") {
        this.languageCode = "plaintext";
      }

      this.code = codeElement.textContent || "";

      // Render the code to HTML using Shiki
      const html = await this.renderCodeAsHtml(
        this.code || "",
        this.languageCode,
      );
      this.html = html;

      const { getSingletonHighlighter } = await import("shiki/bundle/full");
      const highlighter = await getSingletonHighlighter();

      // Get language definition from shiki
      if (this.languageCode !== "plaintext") {
        const grammar = highlighter.getLanguage(this.languageCode);
        this.languageName = grammar.name;
      } else {
        this.languageName = "plaintext";
      }

      // Get shiki theme registration
      this.lightThemeRegistration = highlighter.getTheme(this.lightTheme);
      this.darkThemeRegistration = highlighter.getTheme(
        this.darkTheme || this.lightTheme,
      );
    } catch (error) {
      if (error instanceof Error) {
        this.error = error.message;
      }
    } finally {
      this.shadowRoot
        ?.querySelector("slot")
        ?.assignedElements()
        .forEach((el) => {
          if (el instanceof HTMLElement) {
            el.setAttribute("style", "display: none !important;");
          }
        });
      this.loading = false;
    }
  }

  extractLanguageCode(classList: DOMTokenList): string | null {
    const supportedClasses = ["language-", "lang-"];
    for (let i = 0; i < classList.length; i++) {
      const className = classList[i];
      for (let j = 0; j < supportedClasses.length; j++) {
        const supportedClass = supportedClasses[j];
        if (className.startsWith(supportedClass)) {
          return className.substring(supportedClass.length).toLowerCase();
        }
      }
    }
    return null;
  }

  async renderCodeAsHtml(code: string, language: string): Promise<string> {
    const { codeToHtml } = await import("shiki/bundle/full");
    const {
      transformerNotationDiff,
      transformerNotationHighlight,
      transformerNotationFocus,
      transformerNotationErrorLevel,
    } = await import("@shikijs/transformers");

    return await codeToHtml(code, {
      lang: language,
      themes: {
        light: this.lightTheme,
        dark: this.darkTheme || this.lightTheme,
      },
      transformers: [
        transformerNotationDiff(),
        transformerNotationHighlight(),
        transformerNotationFocus(),
        transformerNotationErrorLevel(),
      ],
    });
  }

  static styles = [
    unsafeCSS(reset),
    css`
      :host {
        display: block;
        margin: 1rem 0 !important;
      }

      @unocss-placeholder;
    `,
  ];
}

customElements.get("shiki-code") ||
  customElements.define("shiki-code", ShikiCode);

declare global {
  interface HTMLElementTagNameMap {
    "shiki-code": ShikiCode;
  }
}
