// The code comes from https://github.com/timomeh/tiptap-extension-code-block-shiki/blob/main/lib/highlighter.ts

import {
  Decoration,
  DecorationSet,
  findChildren,
  Plugin,
  PluginKey,
  type PluginView,
  type PMNode,
} from "@halo-dev/richtext-editor";
import type { BundledLanguage, BundledTheme } from "shiki";
import {
  getShiki,
  initHighlighter,
  loadLanguage,
  loadTheme,
} from "./highlighter";

interface CachedTokens {
  tokens: Array<Array<{ content: string; color: string }>>;
  themeBg: string;
}

const tokensCache = new Map<string, CachedTokens>();

function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

function generateBlockHash(
  content: string,
  language: string,
  theme: string,
): string {
  const contentHash = simpleHash(content);
  return `${language}:${theme}:${contentHash}`;
}

function createBlockDecorations(
  block: { node: PMNode; pos: number },
  language: string,
  theme: string,
  highlighter: ReturnType<typeof getShiki>,
): Decoration[] {
  if (!highlighter) return [];

  const content = block.node.textContent;
  const hash = generateBlockHash(content, language, theme);
  const decorations: Decoration[] = [];

  let cachedData = tokensCache.get(hash);

  if (!cachedData) {
    const themeResolved = highlighter.getTheme(theme);
    const rawTokens = highlighter.codeToTokensBase(content, {
      lang: language as BundledLanguage,
      theme: theme as BundledTheme,
    });

    const tokens = rawTokens.map((line) =>
      line.map((token) => ({
        content: token.content,
        color: token.color || "#000000",
      })),
    );

    cachedData = {
      tokens,
      themeBg: themeResolved.bg || "",
    };

    tokensCache.set(hash, cachedData);

    if (tokensCache.size > 100) {
      const firstKey = tokensCache.keys().next().value;
      if (firstKey) {
        tokensCache.delete(firstKey);
      }
    }
  }

  decorations.push(
    Decoration.node(block.pos, block.pos + block.node.nodeSize, {
      style: `background-color: ${cachedData.themeBg}`,
    }),
  );

  let from = block.pos + 1;
  for (const line of cachedData.tokens) {
    for (const token of line) {
      const to = from + token.content.length;

      decorations.push(
        Decoration.inline(from, to, {
          style: `color: ${token.color}`,
        }),
      );

      from = to;
    }

    from += 1;
  }

  return decorations;
}

/** Create code decorations for the current document */
function getDecorations({
  doc,
  name,
  defaultTheme,
  defaultLanguage,
}: {
  doc: PMNode;
  name: string;
  defaultLanguage: BundledLanguage | null | undefined;
  defaultTheme: BundledTheme;
}) {
  const decorations: Decoration[] = [];
  const codeBlockCodes = findChildren(doc, (node) => node.type.name === name);
  const highlighter = getShiki();

  if (!highlighter) {
    return DecorationSet.create(doc, decorations);
  }

  codeBlockCodes.forEach((block) => {
    let language = block.node.attrs.language || defaultLanguage;
    const theme = block.node.attrs.theme || defaultTheme;

    if (!highlighter.getLoadedLanguages().includes(language)) {
      language = "plaintext";
    }

    const themeToApply = highlighter.getLoadedThemes().includes(theme)
      ? theme
      : highlighter.getLoadedThemes()[0];

    const blockDecorations = createBlockDecorations(
      block,
      language,
      themeToApply,
      highlighter,
    );

    decorations.push(...blockDecorations);
  });

  return DecorationSet.create(doc, decorations);
}

export function ShikiPlugin({
  name,
  defaultLanguage,
  defaultTheme,
}: {
  name: string;
  defaultLanguage: BundledLanguage | null | undefined;
  defaultTheme: BundledTheme;
}) {
  // biome-ignore lint/suspicious/noExplicitAny: not sure
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
          defaultTheme,
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
              return (
                // @ts-expect-error
                step.from !== undefined &&
                // @ts-expect-error
                step.to !== undefined &&
                oldNodes.some((node) => {
                  return (
                    // @ts-expect-error
                    node.pos >= step.from &&
                    // @ts-expect-error
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
            defaultTheme,
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

/**
 * 清理装饰器缓存
 * 可在需要时手动调用，比如切换主题或语言包后
 */
export function clearDecorationsCache() {
  tokensCache.clear();
}
