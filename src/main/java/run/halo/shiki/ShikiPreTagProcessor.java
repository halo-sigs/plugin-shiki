package run.halo.shiki;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class ShikiPreTagProcessor {
    static String process(String content, ShikiBasicConfig basicConfig) {
        Document doc = Jsoup.parse(content);

        Elements codeElements = doc.select("pre > code");

        for (Element codeElement : codeElements) {
            Element preElement = codeElement.parent();
            if (preElement != null && "pre".equals(preElement.tagName())) {
                Element shikiCodeElement = doc.createElement("shiki-code")
                    .attr("variant", basicConfig.getVariant())
                    .attr("light-theme", basicConfig.getLightTheme())
                    .attr("dark-theme", basicConfig.getDarkTheme())
                    .attr("font-size", basicConfig.getFontSize());

                preElement.before(shikiCodeElement);
                var newPreElement = preElement.clone();
                shikiCodeElement.appendChild(newPreElement);
                preElement.remove();
            }
        }

        return doc.body().html();
    }
}

