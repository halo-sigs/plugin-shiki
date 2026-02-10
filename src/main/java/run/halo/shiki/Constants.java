package run.halo.shiki;

import java.util.List;

public class Constants {
    /**
     * Generate CSS style to blur code blocks before rendering, with exceptions for excluded languages.
     * 
     * @param excludedLanguages list of language codes to exclude from blur effect (e.g., mermaid, plantuml)
     * @return CSS style string wrapped in style tags
     */
    static String generatePreStyle(List<String> excludedLanguages) {
        StringBuilder style = new StringBuilder();
        style.append("<style class=\"pjax\" data-pjax>\n");
        style.append("pre:has(code) {\n");
        style.append("    filter: blur(10px) !important;\n");
        style.append("    padding: 1rem !important;\n");
        style.append("}\n");
        
        // Add CSS rules to remove blur for excluded languages
        if (excludedLanguages != null && !excludedLanguages.isEmpty()) {
            for (String lang : excludedLanguages) {
                // Support both "language-" and "lang-" prefixes
                style.append("pre:has(> code[class*=\"language-").append(lang).append("\"]),\n");
                style.append("pre:has(> code[class*=\"lang-").append(lang).append("\"]) {\n");
                style.append("    filter: none !important;\n");
                style.append("}\n");
            }
        }
        
        style.append("</style>");
        return style.toString();
    }
    
    /**
     * Deprecated: Use generatePreStyle(List<String>) instead.
     * Kept for backward compatibility.
     */
    @Deprecated
    static String PRE_STYLE = generatePreStyle(null);
}
