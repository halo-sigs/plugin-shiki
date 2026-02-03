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

    private List<String> excludedLanguages; // mermaid, plantuml, etc.
}
