import { codeToHtml } from "shiki/bundle/full";

function highlightAllCodeBlock() {
  const codeElements = document.querySelectorAll("pre>code");

  codeElements.forEach((codeblock) => {
    const lang = extractLanguageFromCodeElement(codeblock) || "text";
    const theme =
      extractThemeFromPreElement(codeblock.parentElement as HTMLPreElement) ||
      "github-light";

    codeToHtml(codeblock.textContent || "", {
      lang,
      theme,
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

function extractThemeFromPreElement(preElement: HTMLPreElement) {
  return preElement.getAttribute("theme");
}

document.addEventListener("DOMContentLoaded", () => {
  highlightAllCodeBlock();
});
