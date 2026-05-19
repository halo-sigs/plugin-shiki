# AGENTS.md

## Project Overview

This repository contains the Halo Shiki code highlighting plugin.

- Java backend lives in `src/main/java/run/halo/shiki` and integrates with Halo plugin APIs.
- Plugin metadata and Halo resources live in `src/main/resources`, including `plugin.yaml`, settings, role templates, and reverse proxy resources.
- Console/editor UI lives in `ui/src` and is bundled with `@halo-dev/ui-plugin-bundler-kit`.
- The reusable web component package lives in `shiki-code-element`.
- The theme-side rendering helper lives in `theme-lib`.
- Utility scripts live in `scripts`.

Keep changes scoped to the module that owns the behavior. Avoid unrelated formatting churn across the Java backend, Console UI, web component package, and theme helper.

## Documentation Lookup

- When code or behavior depends on a library, framework, SDK, API, CLI tool, or cloud service, fetch current documentation with Context7 MCP before relying on memory.
- Start with `resolve-library-id`, pick the best `/org/project` match, then call `query-docs` with the full question.
- This is especially important for Halo plugin APIs, Vue, Lit, Shiki, Rsbuild, Vite, Gradle, and Biome.
- Do not use Context7 for ordinary refactors, business-logic debugging, code review, or writing scripts from scratch.

## Setup Commands

- Install dependencies: `pnpm install`
- Build Java and frontend bundles: `./gradlew build`
- Run Java tests: `./gradlew test`
- Build all pnpm workspace packages: `pnpm build`
- Build Console UI only: `pnpm -C ui build`
- Build web component package only: `pnpm -C shiki-code-element build`
- Build theme helper only: `pnpm -C theme-lib build`

Use Java 21. The Gradle build is configured with a Java 21 toolchain and `options.release = 21`.

## Development Commands

- Start Halo plugin dev server: `./gradlew haloServer`
- Reload plugin after backend/resource changes: `./gradlew reload`
- Watch plugin changes when developing locally: `./gradlew watch`
- Watch Console UI bundle: `pnpm -C ui dev`
- Start the `shiki-code-element` demo app: `pnpm -C shiki-code-element dev`

Do not run publish or release commands unless explicitly asked.

## Verification

Choose the smallest meaningful checks for the change:

- Backend Java changes: run `./gradlew test`; run `./gradlew build` when plugin resources or frontend integration may be affected.
- Console UI changes: run `pnpm -C ui build`; run `./gradlew build` before finishing integration work.
- `shiki-code-element` changes: run `pnpm -C shiki-code-element build`.
- `theme-lib` changes: run `pnpm -C theme-lib build`.
- Workspace TypeScript or formatting changes: run `pnpm build` or `pnpm check` as appropriate.

If a command cannot be run, report the reason and the next best verification that was performed.

## Code Style

- Follow existing code style in the touched module.
- Java code uses Spring components, Lombok where already present, Reactor types for Halo reactive APIs, and UTF-8 source encoding.
- TypeScript packages are ESM.
- Biome is configured for 2-space indentation and double quotes for JavaScript/TypeScript.
- Vue single-file components are intentionally excluded from Biome; follow nearby Vue formatting and component patterns.
- Keep comments sparse and useful. Do not add comments that restate obvious code.

## Halo Plugin Guidance

- Treat `src/main/resources/plugin.yaml` as the source of plugin metadata, Halo version requirements, settings name, config map name, and marketplace links.
- Preserve the plugin metadata name `shiki` unless the task explicitly changes plugin identity.
- When using Halo server APIs, prefer current official API shapes over remembered method names.
- Keep content rendering tolerant: failures in post/page processing should not break the original content flow.
- When changing settings or config classes, update the related YAML schema/resource and tests together.

## Frontend And Rendering Guidance

- Console UI should use Halo shared packages and existing plugin extension points.
- Editor integration lives under `ui/src/editor/code-block-shiki`; keep editor-specific behavior there.
- Theme-side rendering should remain compatible with ordinary `pre > code` markup and should respect excluded languages.
- `shiki-code-element` owns the Lit web component, variants, copy behavior, theme switching, and Shiki rendering details.
- Avoid adding large synchronous frontend work to page load paths; this plugin should keep language and theme loading lightweight.

## Security And Safety

- Code highlighting processes user-authored content. Avoid introducing unsafe HTML injection paths.
- When rendering generated HTML from Shiki, preserve the existing trust boundary and do not concatenate unescaped user input into templates.
- Keep reverse proxy, settings, and role template changes minimal and reviewable.
- Do not commit generated build output, local IDE state, caches, or dependency folders.

## Pull Request Notes

- Summarize the affected module and user-visible behavior.
- List the verification commands that were run.
- Mention any skipped checks with concrete reasons.
- Keep PRs focused; split unrelated backend, UI, and npm package changes when they can be reviewed independently.
