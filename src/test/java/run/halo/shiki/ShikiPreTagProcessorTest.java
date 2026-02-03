package run.halo.shiki;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test for {@link ShikiPreTagProcessor}
 */
class ShikiPreTagProcessorTest {

    private ShikiBasicConfig basicConfig;

    @BeforeEach
    void setUp() {
        basicConfig = new ShikiBasicConfig();
        basicConfig.setVariant("dual-themes");
        basicConfig.setLightTheme("github-light");
        basicConfig.setDarkTheme("github-dark");
        basicConfig.setFontSize("14px");
    }

    @Test
    void shouldWrapSinglePreCodeBlock() {
        String input = "<pre><code class=\"language-java\">public class Hello {}</code></pre>";
        
        String result = ShikiPreTagProcessor.process(input, basicConfig);
        
        assertTrue(result.contains("<shiki-code"));
        assertTrue(result.contains("variant=\"dual-themes\""));
        assertTrue(result.contains("light-theme=\"github-light\""));
        assertTrue(result.contains("dark-theme=\"github-dark\""));
        assertTrue(result.contains("font-size=\"14px\""));
        assertTrue(result.contains("<pre><code"));
        assertTrue(result.contains("public class Hello {}"));
    }

    @Test
    void shouldWrapMultiplePreCodeBlocks() {
        String input = """
            <div>
                <pre><code class="language-java">System.out.println("Hello");</code></pre>
                <p>Some text</p>
                <pre><code class="language-python">print("World")</code></pre>
            </div>
            """;
        
        String result = ShikiPreTagProcessor.process(input, basicConfig);
        
        // Should contain two shiki-code elements
        int count = countOccurrences(result, "<shiki-code");
        assertEquals(2, count, "Should wrap both pre>code blocks");
        
        assertTrue(result.contains("System.out.println"));
        assertTrue(result.contains("print(\"World\")"));
        assertTrue(result.contains("<p>Some text</p>"));
    }

    @Test
    void shouldNotWrapPreWithoutCode() {
        String input = "<pre>Just plain text in pre</pre>";
        
        String result = ShikiPreTagProcessor.process(input, basicConfig);
        
        assertFalse(result.contains("<shiki-code"), 
            "Should not wrap pre element without code child");
        assertTrue(result.contains("<pre>Just plain text in pre</pre>"));
    }

    @Test
    void shouldNotWrapCodeWithoutPre() {
        String input = "<code>inline code</code>";
        
        String result = ShikiPreTagProcessor.process(input, basicConfig);
        
        assertFalse(result.contains("<shiki-code"), 
            "Should not wrap code element without pre parent");
        assertTrue(result.contains("<code>inline code</code>"));
    }

    @Test
    void shouldPreserveCodeAttributes() {
        String input = "<pre><code class=\"language-javascript\" data-line=\"1-5\">const x = 1;</code></pre>";
        
        String result = ShikiPreTagProcessor.process(input, basicConfig);
        
        assertTrue(result.contains("<shiki-code"));
        assertTrue(result.contains("class=\"language-javascript\""));
        assertTrue(result.contains("data-line=\"1-5\""));
        assertTrue(result.contains("const x = 1;"));
    }

    @Test
    void shouldPreservePreAttributes() {
        String input = "<pre class=\"my-class\" id=\"code-block\"><code>const x = 1;</code></pre>";
        
        String result = ShikiPreTagProcessor.process(input, basicConfig);
        
        assertTrue(result.contains("<shiki-code"));
        assertTrue(result.contains("class=\"my-class\""));
        assertTrue(result.contains("id=\"code-block\""));
    }

    @Test
    void shouldHandleNestedElements() {
        String input = """
            <div class="container">
                <div class="code-wrapper">
                    <pre><code class="language-java">public void test() {}</code></pre>
                </div>
            </div>
            """;
        
        String result = ShikiPreTagProcessor.process(input, basicConfig);
        
        assertTrue(result.contains("<shiki-code"));
        assertTrue(result.contains("class=\"container\""));
        assertTrue(result.contains("class=\"code-wrapper\""));
        assertTrue(result.contains("public void test()"));
    }

    @Test
    void shouldHandleEmptyCodeBlock() {
        String input = "<pre><code></code></pre>";
        
        String result = ShikiPreTagProcessor.process(input, basicConfig);
        
        assertTrue(result.contains("<shiki-code"));
        assertTrue(result.contains("<pre><code></code></pre>"));
    }

    @Test
    void shouldHandleMultilineCode() {
        String input = """
            <pre><code class="language-java">public class Example {
                public static void main(String[] args) {
                    System.out.println("Hello, World!");
                }
            }</code></pre>
            """;
        
        String result = ShikiPreTagProcessor.process(input, basicConfig);
        
        assertTrue(result.contains("<shiki-code"));
        assertTrue(result.contains("public class Example"));
        assertTrue(result.contains("public static void main"));
        assertTrue(result.contains("System.out.println"));
    }

    @Test
    void shouldHandleSpecialCharacters() {
        String input = "<pre><code>&lt;div&gt;Hello &amp; Goodbye&lt;/div&gt;</code></pre>";
        
        String result = ShikiPreTagProcessor.process(input, basicConfig);
        
        assertTrue(result.contains("<shiki-code"));
        // The result should maintain the escaped characters or properly encode them
        assertTrue(result.contains("&lt;") || result.contains("<"));
        assertTrue(result.contains("&amp;") || result.contains("&"));
    }

    @Test
    void shouldHandleMixedContent() {
        String input = """
            <article>
                <h1>Code Examples</h1>
                <p>Here's some Java code:</p>
                <pre><code class="language-java">int x = 42;</code></pre>
                <p>And some Python:</p>
                <pre><code class="language-python">x = 42</code></pre>
                <p>Regular text</p>
                <code>inline code</code>
            </article>
            """;
        
        String result = ShikiPreTagProcessor.process(input, basicConfig);
        
        int shikiCodeCount = countOccurrences(result, "<shiki-code");
        assertEquals(2, shikiCodeCount, "Should only wrap pre>code blocks");
        
        assertTrue(result.contains("<h1>Code Examples</h1>"));
        assertTrue(result.contains("<p>Here's some Java code:</p>"));
        assertTrue(result.contains("<code>inline code</code>"));
    }

    @Test
    void shouldHandleNullOrEmptyContent() {
        String result1 = ShikiPreTagProcessor.process("", basicConfig);
        assertNotNull(result1);
        
        String result2 = ShikiPreTagProcessor.process("<div></div>", basicConfig);
        assertNotNull(result2);
        assertFalse(result2.contains("<shiki-code"));
    }

    @Test
    void shouldExcludeMermaidLanguage() {
        basicConfig.setExcludedLanguages(java.util.List.of("mermaid"));
        String input = "<pre><code class=\"language-mermaid\">graph TD; A-->B;</code></pre>";
        
        String result = ShikiPreTagProcessor.process(input, basicConfig);
        
        assertFalse(result.contains("<shiki-code"), 
            "Should not wrap mermaid code blocks when excluded");
        assertTrue(result.contains("<pre><code class=\"language-mermaid\">"));
        assertTrue(result.contains("graph TD; A-->B;"));
    }

    @Test
    void shouldExcludeMultipleLanguages() {
        basicConfig.setExcludedLanguages(java.util.List.of("mermaid", "plantuml", "d2"));
        
        String input = """
            <div>
                <pre><code class="language-java">System.out.println("Hello");</code></pre>
                <pre><code class="language-mermaid">graph TD; A-->B;</code></pre>
                <pre><code class="language-plantuml">@startuml\\nA -> B\\n@enduml</code></pre>
                <pre><code class="language-python">print("World")</code></pre>
            </div>
            """;
        
        String result = ShikiPreTagProcessor.process(input, basicConfig);
        
        // Should wrap Java and Python but not Mermaid or PlantUML
        int shikiCodeCount = countOccurrences(result, "<shiki-code");
        assertEquals(2, shikiCodeCount, "Should only wrap non-excluded languages");
        
        // Verify Java and Python are wrapped
        assertTrue(result.contains("System.out.println"));
        assertTrue(result.contains("print(\"World\")"));
        
        // Verify Mermaid and PlantUML are NOT wrapped
        assertTrue(result.contains("<pre><code class=\"language-mermaid\">"));
        assertTrue(result.contains("<pre><code class=\"language-plantuml\">"));
        assertTrue(result.contains("graph TD; A-->B;"));
    }

    @Test
    void shouldBeCaseInsensitiveForExcludedLanguages() {
        basicConfig.setExcludedLanguages(java.util.List.of("MeRmAiD"));
        String input = "<pre><code class=\"language-mermaid\">graph TD; A-->B;</code></pre>";
        
        String result = ShikiPreTagProcessor.process(input, basicConfig);
        
        assertFalse(result.contains("<shiki-code"), 
            "Should handle case-insensitive language exclusion");
        assertTrue(result.contains("<pre><code class=\"language-mermaid\">"));
    }

    @Test
    void shouldHandleEmptyExclusionList() {
        basicConfig.setExcludedLanguages(java.util.List.of());
        String input = "<pre><code class=\"language-mermaid\">graph TD; A-->B;</code></pre>";
        
        String result = ShikiPreTagProcessor.process(input, basicConfig);
        
        assertTrue(result.contains("<shiki-code"), 
            "Should wrap all code blocks when exclusion list is empty");
    }

    @Test
    void shouldHandleNullExclusionList() {
        basicConfig.setExcludedLanguages(null);
        String input = "<pre><code class=\"language-mermaid\">graph TD; A-->B;</code></pre>";
        
        String result = ShikiPreTagProcessor.process(input, basicConfig);
        
        assertTrue(result.contains("<shiki-code"), 
            "Should wrap all code blocks when exclusion list is null");
    }

    @Test
    void shouldExcludeOnlySpecifiedLanguage() {
        basicConfig.setExcludedLanguages(java.util.List.of("mermaid"));
        
        String input = """
            <div>
                <pre><code class="language-javascript">const x = 1;</code></pre>
                <pre><code class="language-mermaid">graph TD; A-->B;</code></pre>
            </div>
            """;
        
        String result = ShikiPreTagProcessor.process(input, basicConfig);
        
        // JavaScript should be wrapped, mermaid should not
        int shikiCodeCount = countOccurrences(result, "<shiki-code");
        assertEquals(1, shikiCodeCount, "Should only wrap JavaScript, not mermaid");
        
        assertTrue(result.contains("const x = 1;"));
        assertTrue(result.contains("<pre><code class=\"language-mermaid\">"));
    }

    @Test
    void excludedLanguagesShouldNotBeAffectedByBlurStyle() {
        // This test verifies that excluded languages maintain their structure
        // so they won't be affected by the shiki-code-specific blur filter
        basicConfig.setExcludedLanguages(java.util.List.of("mermaid"));
        
        String input = """
            <div>
                <pre><code class="language-java">System.out.println("test");</code></pre>
                <pre><code class="language-mermaid">graph TD; A-->B;</code></pre>
            </div>
            """;
        
        String result = ShikiPreTagProcessor.process(input, basicConfig);
        
        // Java code should be wrapped in shiki-code (will be affected by blur style)
        assertTrue(result.contains("<shiki-code"));
        assertTrue(result.contains("System.out.println"));
        
        // Mermaid code should NOT be wrapped in shiki-code (won't be affected by blur style)
        // The blur style uses selector "shiki-code pre:has(code)", so bare pre>code won't match
        assertTrue(result.contains("<pre><code class=\"language-mermaid\">"));
        assertFalse(result.contains("<shiki-code") && result.contains("mermaid"),
            "Mermaid code block should not be wrapped in shiki-code element");
        
        // Verify the structure difference:
        // Wrapped: <shiki-code><pre><code>...</code></pre></shiki-code>
        // Not wrapped: <pre><code>...</code></pre>
        int preTags = countOccurrences(result, "<pre>");
        int shikiCodeTags = countOccurrences(result, "<shiki-code");
        assertEquals(2, preTags, "Should have 2 pre tags total");
        assertEquals(1, shikiCodeTags, "Should have only 1 shiki-code tag (for Java, not mermaid)");
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
