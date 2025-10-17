package run.halo.shiki;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.NodeTraversor;
import org.jsoup.select.NodeVisitor;

public class ShikiPreTagProcessor {
    static String process(String content, ShikiBasicConfig basicConfig) {
        Document doc = Jsoup.parse(content);

        NodeTraversor.traverse(new NodeVisitor() {
            @Override
            public void head(org.jsoup.nodes.Node node, int depth) {
                if (node instanceof Element element 
                    && "pre".equals(element.tagName())
                    && element.selectFirst("> code") != null) {
                    
                    Element shikiCodeElement = new Element("shiki-code")
                        .attr("variant", basicConfig.getVariant())
                        .attr("light-theme", basicConfig.getLightTheme())
                        .attr("dark-theme", basicConfig.getDarkTheme())
                        .attr("font-size", basicConfig.getFontSize());

                    element.replaceWith(shikiCodeElement);
                    shikiCodeElement.appendChild(element);
                }
            }

            @Override
            public void tail(org.jsoup.nodes.Node node, int depth) {
                // No action needed on tail
            }
        }, doc);

        doc.outputSettings(new Document.OutputSettings().prettyPrint(false));

        return doc.body().html();
    }
}
