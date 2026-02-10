import "@halo-dev/shiki-code-element";

/**
 * Extract language code from code element's class attribute
 */
function extractLanguageCode(codeElement: Element): string | null {
  const supportedPrefixes = ["language-", "lang-"];
  
  for (const className of codeElement.classList) {
    for (const prefix of supportedPrefixes) {
      if (className.startsWith(prefix)) {
        return className.substring(prefix.length).toLowerCase();
      }
    }
  }
  
  return null;
}

/**
 * Check if the code element's language should be excluded from processing
 */
function shouldExclude(codeElement: Element, excludedLanguages?: string[]): boolean {
  if (!excludedLanguages || excludedLanguages.length === 0) {
    return false;
  }
  
  const languageCode = extractLanguageCode(codeElement);
  if (!languageCode) {
    return false;
  }
  
  // Check if the language is in the exclusion list (case-insensitive)
  return excludedLanguages.some(
    (excluded) => excluded.toLowerCase() === languageCode
  );
}

export function renderCodeBlock(options: {
  variant: string;
  lightTheme: string;
  darkTheme: string;
  fontSize: string;
  excludedLanguages?: string[];
}) {
  document.querySelectorAll("pre > code").forEach((codeElement) => {
    // Skip if this language is excluded
    if (shouldExclude(codeElement, options.excludedLanguages)) {
      return;
    }
    
    const preElement = codeElement.parentElement;
    const shikiElement = document.createElement("shiki-code");
    shikiElement.setAttribute("light-theme", options.lightTheme);
    shikiElement.setAttribute("dark-theme", options.darkTheme);
    shikiElement.setAttribute("variant", options.variant);
    shikiElement.setAttribute("font-size", options.fontSize);
    const parent = preElement?.parentElement;
    if (!parent) {
      return;
    }
    parent.insertBefore(shikiElement, preElement);
    shikiElement.appendChild(preElement);
  });
}
