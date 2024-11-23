// The code comes from https://github.com/timomeh/tiptap-extension-code-block-shiki/blob/main/lib/highlighter.ts

import { type BundledLanguage, type BundledTheme } from "shiki";
import {
  Decoration,
  DecorationSet,
  Plugin,
  PluginKey,
  type PMNode,
  type PluginView,
  findChildren,
} from "@halo-dev/richtext-editor";
import {
  getShiki,
  initHighlighter,
  loadLanguage,
  loadTheme,
} from "./highlighter";
import { coreApiClient } from "@halo-dev/api-client";

/** Create code decorations for the current document */
function getDecorations({
  doc,
  name,
  defaultLanguage,
}: {
  doc: PMNode;
  name: string;
  defaultLanguage: BundledLanguage | null | undefined;
}) {
  const decorations: Decoration[] = [];

  const codeBlockCodes = findChildren(doc, (node) => node.type.name === name);

  codeBlockCodes.forEach((block) => {
    let language = block.node.attrs.language || defaultLanguage;

    const highlighter = getShiki();

    if (!highlighter) return;

    if (!highlighter.getLoadedLanguages().includes(language)) {
      language = "plaintext";
    }

    const themeToApply = highlighter.getLoadedThemes()[0] as BundledTheme;

    const themeResolved = highlighter.getTheme(themeToApply);
    decorations.push(
      Decoration.node(block.pos, block.pos + block.node.nodeSize, {
        style: `background-color: ${themeResolved.bg}`,
      }),
    );

    const tokens = highlighter.codeToTokensBase(block.node.textContent, {
      lang: language,
      theme: themeToApply,
    });

    let from = block.pos + 1;
    for (const line of tokens) {
      for (const token of line) {
        const to = from + token.content.length;

        const decoration = Decoration.inline(from, to, {
          style: `color: ${token.color}`,
        });

        decorations.push(decoration);

        from = to;
      }

      from += 1;
    }
  });

  return DecorationSet.create(doc, decorations);
}

export function ShikiPlugin({
  name,
  defaultLanguage,
}: {
  name: string;
  defaultLanguage: BundledLanguage | null | undefined;
}) {
  const shikiPlugin: Plugin<any> = new Plugin({
    key: new PluginKey("shiki"),

    view(view) {
      // This small view is just for initial async handling
      class ShikiPluginView implements PluginView {
        constructor() {
          this.initDecorations();
        }

        update() {
          this.checkUndecoratedBlocks();
        }
        destroy() {
          return;
        }

        // Initialize shiki async, and then highlight initial document
        async initDecorations() {
          const doc = view.state.doc;

          let defaultTheme:BundledTheme = "github-light";
          const configmap = await coreApiClient.configMap.getConfigMap({
            name: "shiki-configmap",
          });
          if (configmap.data.data?.config) {
            // 由于 console 本身没有深色模式，所以暂时就只用浅色主题
            defaultTheme = JSON.parse(configmap.data.data.config).themeLight;
          }
          
          await initHighlighter({ doc, name, defaultLanguage, defaultTheme });
          const tr = view.state.tr.setMeta("shikiPluginForceDecoration", true);
          view.dispatch(tr);
        }

        // When new codeblocks were added and they have missing themes or
        // languages, load those and then add code decorations once again.
        async checkUndecoratedBlocks() {
          const codeBlocks = findChildren(
            view.state.doc,
            (node) => node.type.name === name,
          );

          // Load missing themes or languages when necessary.
          // loadStates is an array with booleans depending on if a theme/lang
          // got loaded.
          const loadStates = await Promise.all(
            codeBlocks.flatMap((block) => [
              loadTheme(block.node.attrs.theme),
              loadLanguage(block.node.attrs.language),
            ]),
          );
          const didLoadSomething = loadStates.includes(true);

          // The asynchronous nature of this is potentially prone to
          // race conditions. Imma just hope it's fine lol

          if (didLoadSomething) {
            const tr = view.state.tr.setMeta(
              "shikiPluginForceDecoration",
              true,
            );
            view.dispatch(tr);
          }
        }
      }

      return new ShikiPluginView();
    },

    state: {
      init: (_, { doc }) => {
        return getDecorations({
          doc,
          name,
          defaultLanguage,
        });
      },
      apply: (transaction, decorationSet, oldState, newState) => {
        const oldNodeName = oldState.selection.$head.parent.type.name;
        const newNodeName = newState.selection.$head.parent.type.name;
        const oldNodes = findChildren(
          oldState.doc,
          (node) => node.type.name === name,
        );
        const newNodes = findChildren(
          newState.doc,
          (node) => node.type.name === name,
        );

        const didChangeSomeCodeBlock =
          transaction.docChanged &&
          // Apply decorations if:
          // selection includes named node,
          ([oldNodeName, newNodeName].includes(name) ||
            // OR transaction adds/removes named node,
            newNodes.length !== oldNodes.length ||
            // OR transaction has changes that completely encapsulte a node
            // (for example, a transaction that affects the entire document).
            // Such transactions can happen during collab syncing via y-prosemirror, for example.
            transaction.steps.some((step) => {
              // @ts-ignore
              return (
                // @ts-ignore
                step.from !== undefined &&
                // @ts-ignore
                step.to !== undefined &&
                oldNodes.some((node) => {
                  // @ts-ignore
                  return (
                    // @ts-ignore
                    node.pos >= step.from &&
                    // @ts-ignore
                    node.pos + node.node.nodeSize <= step.to
                  );
                })
              );
            }));

        // only create code decoration when it's necessary to do so
        if (
          transaction.getMeta("shikiPluginForceDecoration") ||
          didChangeSomeCodeBlock
        ) {
          return getDecorations({
            doc: transaction.doc,
            name,
            defaultLanguage,
          });
        }

        return decorationSet.map(transaction.mapping, transaction.doc);
      },
    },

    props: {
      decorations(state) {
        return shikiPlugin.getState(state);
      },
    },
  });

  return shikiPlugin;
}
