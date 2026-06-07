package run.halo.shiki;

import java.util.List;
import lombok.Data;

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

    private boolean mermaidEnabled = true;

    private String mermaidLightTheme = "default";

    private String mermaidDarkTheme = "dark";

    private boolean mermaidZoomEnabled = true;

    private boolean mermaidFullscreenEnabled = true;

    private String mermaidSecurityLevel = "strict";

    private String mermaidDefaultViewMode = "preview";

    /**
     * List of language codes to exclude from Shiki highlighting.
     * Code blocks with these languages will maintain their original pre>code structure
     * and can be processed by other plugins or JavaScript libraries.
     * Examples: mermaid, plantuml, d2, graphviz
     */
    private List<String> excludedLanguages = List.of("mermaid");

    public List<String> getEffectiveExcludedLanguages() {
        if (!mermaidEnabled) {
            return excludedLanguages;
        }
        if (excludedLanguages == null || excludedLanguages.isEmpty()) {
            return List.of("mermaid");
        }
        boolean hasMermaid = excludedLanguages.stream()
            .anyMatch(excluded -> "mermaid".equalsIgnoreCase(excluded));
        if (hasMermaid) {
            return excludedLanguages;
        }
        var effectiveExcludedLanguages = new java.util.ArrayList<>(excludedLanguages);
        effectiveExcludedLanguages.add("mermaid");
        return effectiveExcludedLanguages;
    }
}
