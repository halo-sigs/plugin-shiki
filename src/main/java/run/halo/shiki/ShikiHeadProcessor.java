package run.halo.shiki;

import java.util.Properties;

import org.springframework.stereotype.Component;
import org.springframework.util.PropertyPlaceholderHelper;
import org.thymeleaf.context.ITemplateContext;
import org.thymeleaf.model.IModel;
import org.thymeleaf.model.IModelFactory;
import org.thymeleaf.processor.element.IElementModelStructureHandler;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;
import run.halo.app.plugin.PluginContext;
import run.halo.app.plugin.ReactiveSettingFetcher;
import run.halo.app.theme.dialect.TemplateHeadProcessor;

/**
 * @author ryanwang
 */
@Component
@RequiredArgsConstructor
public class ShikiHeadProcessor implements TemplateHeadProcessor {

    static final PropertyPlaceholderHelper PROPERTY_PLACEHOLDER_HELPER = new PropertyPlaceholderHelper("${", "}");

    private final PluginContext pluginContext;

    private final ReactiveSettingFetcher settingFetcher;

    @Override
    public Mono<Void> process(ITemplateContext context, IModel model, IElementModelStructureHandler structureHandler) {
        return settingFetcher.fetch(CustomSetting.GROUP, CustomSetting.class)
                .doOnNext(customSetting -> {
                    final IModelFactory modelFactory = context.getModelFactory();
                    model.add(
                            modelFactory.createText(
                                    commentWidgetScript(customSetting.themeLight(), customSetting.themeDark())));
                })
                .then();
    }

    private String commentWidgetScript(String themeLight, String themeDark) {

        final Properties properties = new Properties();
        properties.setProperty("version", pluginContext.getVersion());
        properties.setProperty("themeLight", themeLight);
        properties.setProperty("themeDark", themeDark);

        return PROPERTY_PLACEHOLDER_HELPER.replacePlaceholders("""
                <!-- plugin-shiki start -->
                <link rel="stylesheet" href="/plugins/shiki/assets/static/main.css?version=${version}" />
                <script src="/plugins/shiki/assets/static/main.js?version=${version}" defer></script>
                <script>
                    window.shikiConfig = {
                        themeLight: "${themeLight}" === "null" ? "github-light" : "${themeLight}",
                        themeDark: "${themeDark}" === "null" ? "github-dark" : "${themeDark}",
                    };
                </script>
                <!-- plugin-shiki end -->
                """, properties);
    }

    public record CustomSetting(String themeLight, String themeDark) {
        public static final String GROUP = "config";
    }
}