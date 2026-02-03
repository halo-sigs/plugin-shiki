package run.halo.shiki;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test for {@link Constants}
 */
class ConstantsTest {

    @Test
    void preStyleShouldOnlyTargetShikiCodeElements() {
        String style = Constants.PRE_STYLE;
        
        // Should contain shiki-code selector to avoid blurring excluded languages
        assertTrue(style.contains("shiki-code pre:has(code)"),
            "Style should target 'shiki-code pre:has(code)' to avoid blurring excluded languages");
        
        // Should not use the generic selector that would affect all code blocks
        assertFalse(style.matches(".*(?<!shiki-code )pre:has\\(code\\).*"),
            "Style should not use generic 'pre:has(code)' selector without shiki-code prefix");
        
        // Should contain the blur filter
        assertTrue(style.contains("filter: blur(10px)"),
            "Style should contain blur filter");
        
        // Should be wrapped in style tags
        assertTrue(style.contains("<style") && style.contains("</style>"),
            "Style should be wrapped in style tags");
    }

    @Test
    void preStyleShouldHaveCorrectStructure() {
        String style = Constants.PRE_STYLE;
        
        // Verify it's a valid style tag with pjax class
        assertTrue(style.contains("class=\"pjax\""),
            "Style should have pjax class for compatibility");
        assertTrue(style.contains("data-pjax"),
            "Style should have data-pjax attribute");
    }
}
