package run.halo.shiki;


import static org.springdoc.core.fn.builders.apiresponse.Builder.responseBuilder;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.webflux.core.fn.SpringdocRouteBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerRequest;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Mono;
import run.halo.app.core.extension.endpoint.CustomEndpoint;
import run.halo.app.extension.GroupVersion;

@Slf4j
@Component
@AllArgsConstructor
public class EditorEndpoint implements CustomEndpoint {

    private final ShikiEditorConfigSupplier shikiEditorConfigSupplier;

    @Override
    public RouterFunction<ServerResponse> endpoint() {
        var tag = groupVersion().toString();

        return SpringdocRouteBuilder.route()
            .GET("/editor/config", this::getEditorConfig,
                builder -> builder.operationId("getEditorConfig")
                    .description("Get shiki editor config for code block")
                    .tag(tag)
                    .response(responseBuilder()
                        .implementation(ShikiEditorConfig.class))
            )
            .build();
    }

    private Mono<ServerResponse> getEditorConfig(ServerRequest request) {
        return shikiEditorConfigSupplier.get()
            .flatMap(config -> ServerResponse.ok().bodyValue(config));
    }

    @Override
    public GroupVersion groupVersion() {
        return GroupVersion.parseAPIVersion("api.editor.shiki.halo.run/v1alpha1");
    }
}
