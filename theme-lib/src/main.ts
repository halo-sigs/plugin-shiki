import "./assets/style.css";
import { codeToHtml } from "shiki/bundle/full";

declare global {
  interface Window {
    shikiConfig: {
      themeLight: string;
      themeDark: string;
    };
  }
}

function highlightAllCodeBlock() {
  const codeElements = document.querySelectorAll("pre>code");

  codeElements.forEach((codeblock) => {
    const lang = extractLanguageFromCodeElement(codeblock) || "text";
    const themeLight = window.shikiConfig.themeLight;
    const themeDark = window.shikiConfig.themeDark;

    codeToHtml(codeblock.textContent || "", {
      lang,
      themes: {
        light: themeLight,
        dark: themeDark,
      },
    }).then((html) => {
      codeblock.parentElement!.outerHTML = html;
    });
  });
}

function extractLanguageFromCodeElement(codeElement: Element) {
  const classList = codeElement.classList;
  const supportedClasses = ["language-", "lang-"];
  for (let i = 0; i < classList.length; i++) {
    const className = classList[i];
    for (let j = 0; j < supportedClasses.length; j++) {
      const supportedClass = supportedClasses[j];
      if (className.startsWith(supportedClass)) {
        return className.substring(supportedClass.length);
      }
    }
  }
  return null;
}

document.addEventListener("DOMContentLoaded", () => {
  highlightAllCodeBlock();
});
