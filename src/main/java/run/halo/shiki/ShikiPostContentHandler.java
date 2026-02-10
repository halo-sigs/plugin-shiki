package run.halo.shiki;

import com.google.common.base.Throwables;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import run.halo.app.theme.ReactivePostContentHandler;

/**
 * @author ryanwang
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ShikiPostContentHandler implements ReactivePostContentHandler {

    private final ShikiBasicConfigSupplier shikiBasicConfigSupplier;

    @Override
    public Mono<PostContentContext> handle(PostContentContext contentContext) {
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


    private static void processPreTag(PostContentContext contentContext,
        ShikiBasicConfig basicConfig) {
        var processedContent =
            ShikiPreTagProcessor.process(contentContext.getContent(), basicConfig);
        var preStyle = Constants.generatePreStyle(basicConfig.getExcludedLanguages());
        contentContext.setContent(preStyle + processedContent);
    }
}
