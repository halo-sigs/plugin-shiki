package run.halo.shiki;

import com.google.common.base.Throwables;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import run.halo.app.theme.ReactivePostContentHandler;

@Slf4j
@Component
@RequiredArgsConstructor
public class MermaidPostContentHandler implements ReactivePostContentHandler {

    private final ShikiBasicConfigSupplier shikiBasicConfigSupplier;

    @Override
    public Mono<PostContentContext> handle(PostContentContext contentContext) {
        return shikiBasicConfigSupplier.get().map(basicConfig -> {
            if (!basicConfig.isMermaidEnabled()) {
                return contentContext;
            }
            contentContext.setContent(MermaidPreTagProcessor.process(contentContext.getContent()));
            return contentContext;
        }).onErrorResume(e -> {
            log.error("Failed to process mermaid diagram", Throwables.getRootCause(e));
            return Mono.just(contentContext);
        });
    }
}
