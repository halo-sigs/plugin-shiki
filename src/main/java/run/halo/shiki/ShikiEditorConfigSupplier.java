package run.halo.shiki;

import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import run.halo.app.plugin.ReactiveSettingFetcher;

/**
 * @author ryanwang
 */
@Component
@RequiredArgsConstructor
public class ShikiEditorConfigSupplier implements Supplier<Mono<ShikiEditorConfig>> {

    private final ReactiveSettingFetcher fetcher;

    @Override
    public Mono<ShikiEditorConfig> get() {
        return fetcher.fetch("editor", ShikiEditorConfig.class);
    }
}
