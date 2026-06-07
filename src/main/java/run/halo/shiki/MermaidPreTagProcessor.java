package run.halo.shiki;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class MermaidPreTagProcessor {
    private static final String MERMAID_CONTAINER_CLASS = "halo-mermaid-diagram";

    static String process(String content) {
        Document doc = Jsoup.parse(content);
        Elements preElements = doc.select("pre:has(> code)");

        for (Element preElement : preElements) {
            Element codeElement = preElement.selectFirst("code");
            if (codeElement == null || !isMermaidCodeBlock(codeElement)) {
                continue;
            }

            Element parentElement = preElement.parent();
            if (parentElement != null && parentElement.hasClass(MERMAID_CONTAINER_CLASS)) {
                continue;
            }

            Element mermaidElement = new Element("div")
                .addClass(MERMAID_CONTAINER_CLASS)
                .attr("data-mermaid-source", codeElement.text());

            preElement.replaceWith(mermaidElement);
            mermaidElement.appendChild(preElement);
        }

        doc.outputSettings(new Document.OutputSettings().prettyPrint(false));
        return doc.body().html();
    }

    private static boolean isMermaidCodeBlock(Element codeElement) {
        String languageCode = extractLanguageCode(codeElement);
        return "mermaid".equalsIgnoreCase(languageCode);
    }

    private static String extractLanguageCode(Element codeElement) {
        String[] supportedPrefixes = {"language-", "lang-"};

        for (String className : codeElement.classNames()) {
            for (String prefix : supportedPrefixes) {
                if (className.startsWith(prefix)) {
                    return className.substring(prefix.length()).toLowerCase();
                }
            }
        }

        return null;
    }
}
