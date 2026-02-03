import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

public class TestJsoupOutput {
    public static void main(String[] args) {
        String input = "<pre><code class=\"language-mermaid\">graph TD; A-->B;</code></pre>";
        Document doc = Jsoup.parse(input);
        doc.outputSettings(new Document.OutputSettings().prettyPrint(false));
        String result = doc.body().html();
        
        System.out.println("Input:");
        System.out.println(input);
        System.out.println("\nResult:");
        System.out.println(result);
        System.out.println("\nContains 'A-->B;': " + result.contains("A-->B;"));
        System.out.println("Contains 'A--&gt;B;': " + result.contains("A--&gt;B;"));
        
        // Print character by character around the arrow
        int idx = result.indexOf("A--");
        if (idx >= 0) {
            System.out.println("\nCharacters around arrow:");
            for (int i = idx; i < Math.min(idx + 10, result.length()); i++) {
                char c = result.charAt(i);
                System.out.println("  [" + i + "] = '" + c + "' (code: " + (int)c + ")");
            }
        }
    }
}
