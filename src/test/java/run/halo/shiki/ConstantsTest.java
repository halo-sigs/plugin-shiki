package run.halo.shiki;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test for {@link Constants}
 */
class ConstantsTest {

    @Test
    void shouldGeneratePreStyleWithoutExcludedLanguages() {
        String style = Constants.generatePreStyle(null);
        
        // Should contain pre:has(code) selector that applies to all code blocks
        assertTrue(style.contains("pre:has(code)"),
            "Style should contain 'pre:has(code)' selector");
        
        // Should contain the blur filter
        assertTrue(style.contains("filter: blur(10px)"),
            "Style should contain blur filter");
        
        // Should be wrapped in style tags
        assertTrue(style.contains("<style") && style.contains("</style>"),
            "Style should be wrapped in style tags");
        
        // Should not contain any language-specific exclusions
        assertFalse(style.contains("language-mermaid"),
            "Should not contain language-specific rules when no exclusions");
    }

    @Test
    void shouldGeneratePreStyleWithExcludedLanguages() {
        List<String> excludedLanguages = List.of("mermaid", "plantuml");
        String style = Constants.generatePreStyle(excludedLanguages);
        
        // Should contain base blur rule
        assertTrue(style.contains("pre:has(code)"),
            "Style should contain base pre:has(code) selector");
        assertTrue(style.contains("filter: blur(10px)"),
            "Style should contain blur filter");
        
        // Should contain exclusion rules for mermaid
        assertTrue(style.contains("language-mermaid"),
            "Style should contain language-mermaid selector");
        assertTrue(style.contains("lang-mermaid"),
            "Style should contain lang-mermaid selector");
        
        // Should contain exclusion rules for plantuml
        assertTrue(style.contains("language-plantuml"),
            "Style should contain language-plantuml selector");
        assertTrue(style.contains("lang-plantuml"),
            "Style should contain lang-plantuml selector");
        
        // Exclusion rules should set filter to none (1 per language, not per prefix)
        int filterNoneCount = countOccurrences(style, "filter: none");
        assertEquals(2, filterNoneCount, 
            "Should have 2 'filter: none' rules (1 per language, covering both prefixes)");
    }

    @Test
    void shouldGeneratePreStyleWithSingleExcludedLanguage() {
        List<String> excludedLanguages = List.of("mermaid");
        String style = Constants.generatePreStyle(excludedLanguages);
        
        // Should contain exclusion rules for mermaid only
        assertTrue(style.contains("language-mermaid"),
            "Style should contain language-mermaid selector");
        assertTrue(style.contains("lang-mermaid"),
            "Style should contain lang-mermaid selector");
        
        // Should not contain plantuml
        assertFalse(style.contains("plantuml"),
            "Style should not contain plantuml when not excluded");
        
        // Should have 1 filter:none rule (covering both prefixes)
        int filterNoneCount = countOccurrences(style, "filter: none");
        assertEquals(1, filterNoneCount,
            "Should have 1 'filter: none' rule for single language");
    }

    @Test
    void shouldGeneratePreStyleWithEmptyExcludedList() {
        String style = Constants.generatePreStyle(List.of());
        
        // Should work same as null
        assertTrue(style.contains("pre:has(code)"));
        assertTrue(style.contains("filter: blur(10px)"));
        assertFalse(style.contains("filter: none"),
            "Should not contain filter:none when exclusion list is empty");
    }

    @Test
    void preStyleShouldHaveCorrectStructure() {
        String style = Constants.generatePreStyle(null);
        
        // Verify it's a valid style tag with pjax class
        assertTrue(style.contains("class=\"pjax\""),
            "Style should have pjax class for compatibility");
        assertTrue(style.contains("data-pjax"),
            "Style should have data-pjax attribute");
    }
    
    private int countOccurrences(String str, String substring) {
        int count = 0;
        int index = 0;
        while ((index = str.indexOf(substring, index)) != -1) {
            count++;
            index += substring.length();
        }
        return count;
    }
}
