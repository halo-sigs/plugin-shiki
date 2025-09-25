import "./shiki-code";

export function renderCodeBlock(options: {
  variant: string;
  lightTheme: string;
  darkTheme: string;
}) {
  document.querySelectorAll("pre > code").forEach((codeElement) => {
    const preElement = codeElement.parentElement;
    const shikiElement = document.createElement("shiki-code");
    shikiElement.setAttribute("light-theme", options.lightTheme);
    shikiElement.setAttribute("dark-theme", options.darkTheme);
    shikiElement.setAttribute("variant", options.variant);
    const parent = preElement?.parentElement;
    if (!parent) {
      return;
    }
    parent.insertBefore(shikiElement, preElement);
    shikiElement.appendChild(preElement);
  });
}
