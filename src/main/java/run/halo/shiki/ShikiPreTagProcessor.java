package run.halo.shiki;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class ShikiPreTagProcessor {
    static String process(String content, ShikiBasicConfig basicConfig) {
        Document doc = Jsoup.parse(content);

        // Select all pre elements that have a direct code child
        Elements preElements = doc.select("pre:has(> code)");

        // Process each pre element
        for (Element preElement : preElements) {
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
}
