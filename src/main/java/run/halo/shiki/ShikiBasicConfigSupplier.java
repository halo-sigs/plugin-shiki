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
public class ShikiBasicConfigSupplier implements Supplier<Mono<ShikiBasicConfig>> {
    private final ReactiveSettingFetcher fetcher;

    @Override
    public Mono<ShikiBasicConfig> get() {
        return fetcher.fetch("basic", ShikiBasicConfig.class);
    }
}
