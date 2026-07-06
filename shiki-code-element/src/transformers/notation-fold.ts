import { createCommentNotationTransformer } from "@shikijs/transformers";
import type { ShikiTransformer } from "shiki";

type CodeNode = Parameters<NonNullable<ShikiTransformer["code"]>>[0];
type CodeChild = CodeNode["children"][number];
type LineNode = Extract<CodeChild, { type: "element" }>;

function isLineNode(child: CodeChild): child is LineNode {
  return child.type === "element";
}

export function transformerNotationFold(): ShikiTransformer {
  let start: number | null = null;
  let tailStartLine: LineNode | null = null;
  let foldId = 0;
  let hasFold = false;

  const transformer = createCommentNotationTransformer(
    "@halo-dev/shiki-code-element:notation-fold",
    /#?\s*\[!code fold:(start|end)\]/gi,
    function ([, marker], line, _comment, lines, index) {
      const markerIndex = lines.indexOf(line);

      if (marker.toLowerCase() === "start") {
        start = index;
        tailStartLine = lines[index] || null;
        return true;
      }

      if (start === null) {
        return true;
      }

      const end = index === markerIndex ? markerIndex + 1 : markerIndex;
      if (end <= start) {
        start = null;
        return true;
      }

      const currentFoldId = String(foldId++);
      const hiddenLines = Math.max(end - start - 1, 0);
      for (let i = start; i < end; i++) {
        this.addClassToHast(lines[i], [
          "fold-line",
          i === start ? "fold-start" : "fold-hidden",
        ]);
        lines[i].properties["data-fold-id"] = currentFoldId;

        if (i === start) {
          lines[i].properties.role = "button";
          lines[i].properties.tabindex = "0";
          lines[i].properties["aria-expanded"] = "false";
          lines[i].properties["aria-label"] =
            `Toggle folded code block with ${hiddenLines} hidden lines`;
          lines[i].properties["data-fold-lines"] = String(hiddenLines);
        } else {
          lines[i].properties["aria-hidden"] = "true";
        }
      }

      this.addClassToHast(this.pre, "has-fold");
      start = null;
      tailStartLine = null;
      hasFold = true;
      return true;
    },
    undefined,
  );

  const transformCode = transformer.code;

  return {
    ...transformer,
    code(code) {
      start = null;
      tailStartLine = null;
      foldId = 0;
      hasFold = false;

      transformCode?.call(this, code);

      if (tailStartLine) {
        const lines = code.children.filter(isLineNode);
        const startIndex = lines.indexOf(tailStartLine);

        if (startIndex !== -1 && startIndex < lines.length) {
          const currentFoldId = String(foldId++);
          const hiddenLines = lines.length - startIndex;
          const control = {
            type: "element",
            tagName: "span",
            properties: {
              class: ["fold-tail-control"],
              role: "button",
              tabindex: "0",
              "aria-expanded": "false",
              "aria-label": `Show ${hiddenLines} folded lines`,
              "data-fold-id": currentFoldId,
              "data-fold-lines": String(hiddenLines),
            },
            children: [
              {
                type: "element",
                tagName: "span",
                properties: {
                  class: ["fold-tail-label", "fold-tail-label-collapsed"],
                },
                children: [
                  {
                    type: "element",
                    tagName: "span",
                    properties: {
                      class: ["fold-tail-icon"],
                      "aria-hidden": "true",
                    },
                    children: [{ type: "text", value: "▾" }],
                  },
                  {
                    type: "element",
                    tagName: "span",
                    properties: {
                      class: ["fold-tail-text"],
                    },
                    children: [
                      {
                        type: "text",
                        value: `Show ${hiddenLines} more lines`,
                      },
                    ],
                  },
                ],
              },
              {
                type: "element",
                tagName: "span",
                properties: {
                  class: ["fold-tail-label", "fold-tail-label-expanded"],
                },
                children: [
                  {
                    type: "element",
                    tagName: "span",
                    properties: {
                      class: ["fold-tail-icon"],
                      "aria-hidden": "true",
                    },
                    children: [{ type: "text", value: "▴" }],
                  },
                  {
                    type: "element",
                    tagName: "span",
                    properties: {
                      class: ["fold-tail-text"],
                    },
                    children: [{ type: "text", value: "Collapse" }],
                  },
                ],
              },
            ],
          } satisfies LineNode;

          for (let i = startIndex; i < lines.length; i++) {
            this.addClassToHast(lines[i], [
              "fold-line",
              "fold-hidden",
              "fold-tail-line",
            ]);
            lines[i].properties["data-fold-id"] = currentFoldId;
            lines[i].properties["aria-hidden"] = "true";
          }

          const insertIndex = code.children.indexOf(lines[lines.length - 1]);
          code.children.splice(insertIndex + 1, 0, control);
          this.addClassToHast(this.pre, ["has-fold", "has-fold-tail"]);
          hasFold = true;
        }
      }

      if (hasFold) {
        code.children = code.children.filter(
          (child) => !(child.type === "text" && child.value === "\n"),
        );
      }
    },
  };
}
