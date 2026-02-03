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
        
        // Should not contain a standalone pre:has(code) selector
        // Extract just the CSS rules part (between <style> tags)
        String cssContent = style.substring(style.indexOf(">") + 1, style.lastIndexOf("</style>"));
        
        // Count occurrences of pre:has(code) - should only appear once with shiki-code prefix
        int preHasCodeCount = 0;
        int index = 0;
        while ((index = cssContent.indexOf("pre:has(code)", index)) != -1) {
            preHasCodeCount++;
            index++;
        }
        assertEquals(1, preHasCodeCount, "Should have exactly one 'pre:has(code)' occurrence");
        
        // Verify it's prefixed with shiki-code
        assertTrue(cssContent.indexOf("shiki-code") < cssContent.indexOf("pre:has(code)"),
            "The 'pre:has(code)' should be prefixed with 'shiki-code'");
        
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
