package run.halo.shiki;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import java.util.List;

public class ShikiPreTagProcessor {
    static String process(String content, ShikiBasicConfig basicConfig) {
        Document doc = Jsoup.parse(content);

        // Select all pre elements that have a direct code child
        Elements preElements = doc.select("pre:has(> code)");

        // Process each pre element
        for (Element preElement : preElements) {
            Element codeElement = preElement.selectFirst("code");
            if (codeElement != null && shouldExclude(codeElement, basicConfig.getExcludedLanguages())) {
                // Skip processing for excluded languages
                continue;
            }

            Element shikiCodeElement = new Element("shiki-code")
                .attr("variant", basicConfig.getVariant())
                .attr("light-theme", basicConfig.getLightTheme())
                .attr("dark-theme", basicConfig.getDarkTheme())
                .attr("font-size", basicConfig.getFontSize());

            preElement.replaceWith(shikiCodeElement);
            shikiCodeElement.appendChild(preElement);
        }

        doc.outputSettings(new Document.OutputSettings().prettyPrint(false));

        return doc.body().html();
    }

    /**
     * Check if the code element's language should be excluded from processing
     */
    private static boolean shouldExclude(Element codeElement, List<String> excludedLanguages) {
        if (excludedLanguages == null || excludedLanguages.isEmpty()) {
            return false;
        }

        String languageCode = extractLanguageCode(codeElement);
        if (languageCode == null) {
            return false;
        }

        // Check if the language is in the exclusion list (case-insensitive)
        return excludedLanguages.stream()
            .anyMatch(excluded -> excluded.equalsIgnoreCase(languageCode));
    }

    /**
     * Extract language code from code element's class attribute
     */
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
