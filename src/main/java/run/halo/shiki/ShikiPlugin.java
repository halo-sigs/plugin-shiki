package run.halo.starter;

import org.springframework.stereotype.Component;
import run.halo.app.plugin.BasePlugin;
import run.halo.app.plugin.PluginContext;

/**
 * @author ryanwang
 * @author Takagi
 */
@Component
public class ShikiPlugin extends BasePlugin {

    public ShikiPlugin(PluginContext pluginContext) {
        super(pluginContext);
    }
}
