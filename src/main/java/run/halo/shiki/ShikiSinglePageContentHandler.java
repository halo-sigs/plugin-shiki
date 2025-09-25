package run.halo.shiki;

import com.google.common.base.Throwables;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import run.halo.app.theme.ReactiveSinglePageContentHandler;

/**
 * @author ryanwang
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ShikiSinglePageContentHandler implements ReactiveSinglePageContentHandler {

    private final ShikiBasicConfigSupplier shikiBasicConfigSupplier;

    @Override
    public Mono<SinglePageContentContext> handle(SinglePageContentContext contentContext) {
        return shikiBasicConfigSupplier.get().map(basicConfig -> {
            if (!basicConfig.isEnabled()) {
                return contentContext;
            }
            processPreTag(contentContext, basicConfig);
            return contentContext;
        }).onErrorResume(e -> {
            log.error("Failed to process shiki code", Throwables.getRootCause(e));
            return Mono.just(contentContext);
        });
    }


    private static void processPreTag(SinglePageContentContext contentContext,
        ShikiBasicConfig basicConfig) {
        var processedContent =
            ShikiPreTagProcessor.process(contentContext.getContent(), basicConfig);
        contentContext.setContent(Constants.PRE_STYLE + processedContent);
    }
}
