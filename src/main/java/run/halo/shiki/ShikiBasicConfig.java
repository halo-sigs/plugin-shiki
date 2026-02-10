package run.halo.shiki;

import lombok.Data;
import java.util.List;

/**
 * @author ryanwang
 */
@Data
public class ShikiBasicConfig {
    private boolean enabled = true;

    private List<String> extraPathPatterns; // /moments/**, /docs/**

    private String variant;

    private String lightTheme;

    private String darkTheme;

    private String fontSize;

    /**
     * List of language codes to exclude from Shiki highlighting.
     * Code blocks with these languages will maintain their original pre>code structure
     * and can be processed by other plugins or JavaScript libraries.
     * Examples: mermaid, plantuml, d2, graphviz
     */
    private List<String> excludedLanguages;
}
