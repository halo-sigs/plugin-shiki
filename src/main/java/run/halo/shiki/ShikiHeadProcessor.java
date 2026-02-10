package run.halo.shiki;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.PathContainer;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.util.PropertyPlaceholderHelper;
import org.springframework.web.util.pattern.PathPatternParser;
import org.thymeleaf.context.Contexts;
import org.thymeleaf.context.ITemplateContext;
import org.thymeleaf.model.IModel;
import org.thymeleaf.model.IModelFactory;
import org.thymeleaf.processor.element.IElementModelStructureHandler;
import reactor.core.publisher.Mono;
import run.halo.app.plugin.PluginContext;
import run.halo.app.theme.dialect.TemplateHeadProcessor;

/**
 * @author ryanwang
 */
@Component
@RequiredArgsConstructor
public class ShikiHeadProcessor implements TemplateHeadProcessor {

    static final PropertyPlaceholderHelper PROPERTY_PLACEHOLDER_HELPER =
        new PropertyPlaceholderHelper("${", "}");

    private final PluginContext pluginContext;

    private final ShikiBasicConfigSupplier shikiBasicConfigSupplier;

    @Override
    public Mono<Void> process(ITemplateContext context, IModel model,
        IElementModelStructureHandler structureHandler) {
        if (!Contexts.isWebContext(context)) {
            return Mono.empty();
        }

        var webContext = Contexts.asWebContext(context);

        return shikiBasicConfigSupplier.get()
            .filter(ShikiBasicConfig::isEnabled)
            .doOnNext(basicConfig -> {
                final IModelFactory modelFactory = context.getModelFactory();
                model.add(modelFactory.createText(shikiGlobalScript()));

                var extraPathPatterns = basicConfig.getExtraPathPatterns();

                if (CollectionUtils.isEmpty(extraPathPatterns)) {
                    return;
                }

                var requestPath =
                    webContext.getExchange().getRequest().getPathWithinApplication();

                var pathContainer = PathContainer.parsePath(requestPath);

                if (isPathMatch(extraPathPatterns, pathContainer)) {
                    model.add(modelFactory.createText(shikiExtraScript(basicConfig)));
                }
            })
            .then();
    }

    private static boolean isPathMatch(List<String> patterns,
        PathContainer pathContainer) {
        var parser = PathPatternParser.defaultInstance;
        return patterns.stream().map(parser::parse)
            .anyMatch(pattern -> pattern.matches(pathContainer));
    }

    private String shikiGlobalScript() {

        final Properties properties = new Properties();
        properties.setProperty("version", pluginContext.getVersion());

        return PROPERTY_PLACEHOLDER_HELPER.replacePlaceholders("""
            <!-- plugin-shiki start -->
            <script type="module" src="/plugins/shiki/assets/static/shiki-code.js?version=${version}"></script>
            <!-- plugin-shiki end -->
            """, properties);
    }

    private String shikiExtraScript(ShikiBasicConfig basicConfig) {
        final Properties properties = new Properties();
        properties.setProperty("lightTheme", basicConfig.getLightTheme());
        properties.setProperty("darkTheme", basicConfig.getDarkTheme());
        properties.setProperty("variant", basicConfig.getVariant());
        properties.setProperty("fontSize", basicConfig.getFontSize());
        properties.setProperty("version", pluginContext.getVersion());
        properties.setProperty("style", Constants.generatePreStyle(basicConfig.getExcludedLanguages()));
        
        // Convert excludedLanguages list to JSON array string
        String excludedLanguagesJson = "[]";
        if (basicConfig.getExcludedLanguages() != null && !basicConfig.getExcludedLanguages().isEmpty()) {
            excludedLanguagesJson = "[" + String.join(",", 
                basicConfig.getExcludedLanguages().stream()
                    .map(lang -> "'" + lang + "'")
                    .toList()
            ) + "]";
        }
        properties.setProperty("excludedLanguages", excludedLanguagesJson);

        return PROPERTY_PLACEHOLDER_HELPER.replacePlaceholders("""
            ${style}
            <script type="module" class="pjax" data-pjax>
            import { renderCodeBlock } from '/plugins/shiki/assets/static/shiki-code.js?version=${version}';
            document.addEventListener("DOMContentLoaded", () => {
                renderCodeBlock({
                    lightTheme: '${lightTheme}',
                    darkTheme: '${darkTheme}',
                    variant: '${variant}',
                    fontSize: '${fontSize}',
                    excludedLanguages: ${excludedLanguages}
                });
            })
            window.addEventListener('pjax:complete', () => {
                renderCodeBlock({
                    lightTheme: '${lightTheme}',
                    darkTheme: '${darkTheme}',
                    variant: '${variant}',
                    fontSize: '${fontSize}',
                    excludedLanguages: ${excludedLanguages}
                });
            });
            </script>
            """, properties);
    }
}