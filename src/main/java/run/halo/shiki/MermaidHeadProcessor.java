package run.halo.shiki;

import java.util.Properties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.PropertyPlaceholderHelper;
import org.thymeleaf.context.Contexts;
import org.thymeleaf.context.ITemplateContext;
import org.thymeleaf.model.IModel;
import org.thymeleaf.processor.element.IElementModelStructureHandler;
import reactor.core.publisher.Mono;
import run.halo.app.plugin.PluginContext;
import run.halo.app.theme.dialect.TemplateHeadProcessor;

@Component
@RequiredArgsConstructor
public class MermaidHeadProcessor implements TemplateHeadProcessor {
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

        return shikiBasicConfigSupplier.get()
            .filter(ShikiBasicConfig::isMermaidEnabled)
            .doOnNext(basicConfig -> model.add(
                context.getModelFactory().createText(mermaidScript(basicConfig))
            ))
            .then();
    }

    private String mermaidScript(ShikiBasicConfig basicConfig) {
        final Properties properties = new Properties();
        properties.setProperty("version", pluginContext.getVersion());
        properties.setProperty("lightTheme", escapeJavaScript(basicConfig.getMermaidLightTheme()));
        properties.setProperty("darkTheme", escapeJavaScript(basicConfig.getMermaidDarkTheme()));
        properties.setProperty("securityLevel", escapeJavaScript(basicConfig.getMermaidSecurityLevel()));
        properties.setProperty("defaultViewMode",
            escapeJavaScript(basicConfig.getMermaidDefaultViewMode()));
        properties.setProperty("zoomEnabled", Boolean.toString(basicConfig.isMermaidZoomEnabled()));
        properties.setProperty("fullscreenEnabled",
            Boolean.toString(basicConfig.isMermaidFullscreenEnabled()));

        return PROPERTY_PLACEHOLDER_HELPER.replacePlaceholders("""
            <!-- plugin-shiki mermaid start -->
            <script class="pjax" data-pjax>
            window.__HALO_SHIKI_MERMAID_CONFIG__ = {
                lightTheme: '${lightTheme}',
                darkTheme: '${darkTheme}',
                securityLevel: '${securityLevel}',
                defaultViewMode: '${defaultViewMode}',
                zoomEnabled: ${zoomEnabled},
                fullscreenEnabled: ${fullscreenEnabled}
            };
            </script>
            <script type="module" class="pjax" data-pjax src="/plugins/shiki/assets/static/mermaid-renderer.js?version=${version}"></script>
            <!-- plugin-shiki mermaid end -->
            """, properties);
    }

    private static String escapeJavaScript(String value) {
        if (value == null) {
            return "";
        }
        return value
            .replace("\\", "\\\\")
            .replace("'", "\\'")
            .replace("\r", "\\r")
            .replace("\n", "\\n")
            .replace("</", "<\\/");
    }
}
