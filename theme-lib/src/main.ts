import { codeToHtml } from "shiki/bundle/full";
import * as transformers from "@shikijs/transformers";

declare global {
  interface Window {
    shikiConfig: {
      themeLight: string;
      themeDark: string;
    };
  }
}

// Check the first line of code block to see if it should use transformer
function processCodes(input: string) {
  const lines = input.split('\n');

  const firstLine = lines[0];
  const isUseTransformer = !firstLine.includes('[!no transformer]');

  const codes = isUseTransformer ? input : lines.slice(1).join('\n');

  return {
      isUseTransformer,
      codes,
  };
}

function highlightAllCodeBlock() {
  const codeElements = document.querySelectorAll("pre>code");

  codeElements.forEach((codeblock) => {
    const lang = extractLanguageFromCodeElement(codeblock) || "text";
    const themeLight = window.shikiConfig.themeLight;
    const themeDark = window.shikiConfig.themeDark;

    const { isUseTransformer, codes } = processCodes(codeblock.textContent || "");

    codeToHtml(codes || "", {
      lang,
      themes: {
        light: themeLight,
        dark: themeDark,
      },
      transformers: isUseTransformer
        ? [
            transformers.transformerNotationDiff(),
            transformers.transformerNotationHighlight(),
            transformers.transformerNotationWordHighlight(),
            transformers.transformerNotationFocus(),
            transformers.transformerNotationErrorLevel(),
            transformers.transformerRenderWhitespace(),
          ]
        : [],
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
