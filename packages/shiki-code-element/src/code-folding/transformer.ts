import { createCommentNotationTransformer } from "@shikijs/transformers";
import type { ShikiTransformer } from "shiki";

type CodeNode = Parameters<NonNullable<ShikiTransformer["code"]>>[0];
type CodeChild = CodeNode["children"][number];
type LineNode = Extract<CodeChild, { type: "element" }>;
type Marker = { kind: "start" | "end"; lineIndex: number };
type FoldRange = { start: number; end: number | null };

function isLineNode(child: CodeChild): child is LineNode {
  return child.type === "element";
}

function parseFoldRanges(markers: Marker[]): FoldRange[] | null {
  const ranges: FoldRange[] = [];
  let start: number | null = null;

  for (const marker of markers) {
    if (marker.kind === "start") {
      if (start !== null) {
        return null;
      }
      start = marker.lineIndex;
      continue;
    }

    if (start === null || marker.lineIndex <= start) {
      return null;
    }

    ranges.push({ start, end: marker.lineIndex });
    start = null;
  }

  if (start !== null) {
    ranges.push({ start, end: null });
  }

  return ranges;
}

function createTailControl(foldId: string, hiddenLines: number): LineNode {
  return {
    type: "element",
    tagName: "span",
    properties: {
      class: ["fold-tail-control"],
      role: "button",
      tabindex: "0",
      "aria-expanded": "false",
      "aria-label": `Show ${hiddenLines} folded lines`,
      "data-fold-id": foldId,
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
            properties: { class: ["fold-tail-text"] },
            children: [
              { type: "text", value: `Show ${hiddenLines} more lines` },
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
            properties: { class: ["fold-tail-text"] },
            children: [{ type: "text", value: "Collapse" }],
          },
        ],
      },
    ],
  };
}

export function transformerNotationFold(): ShikiTransformer {
  let markers: Marker[] = [];
  let lines: LineNode[] = [];

  const transformer = createCommentNotationTransformer(
    "@halo-dev/shiki-code-element:notation-fold",
    /#?\s*\[!code fold:(start|end)\]/gi,
    ([, marker], line, _comment, codeLines, lineIndex) => {
      lines = codeLines;
      const markerIndex = codeLines.indexOf(line);
      markers.push({
        kind: marker.toLowerCase() as Marker["kind"],
        lineIndex:
          marker.toLowerCase() === "end"
            ? lineIndex === markerIndex
              ? markerIndex + 1
              : markerIndex
            : lineIndex,
      });
      return true;
    },
    undefined,
  );

  const transformCode = transformer.code;

  return {
    ...transformer,
    code(code) {
      markers = [];
      lines = [];
      transformCode?.call(this, code);

      const ranges = parseFoldRanges(markers);
      if (!ranges) {
        return;
      }

      let foldId = 0;
      let hasFold = false;

      for (const range of ranges) {
        if (range.start >= lines.length) {
          continue;
        }

        const currentFoldId = String(foldId++);

        if (range.end === null) {
          const hiddenLines = lines.length - range.start;
          for (let index = range.start; index < lines.length; index++) {
            this.addClassToHast(lines[index], [
              "fold-line",
              "fold-hidden",
              "fold-tail-line",
            ]);
            lines[index].properties["data-fold-id"] = currentFoldId;
            lines[index].properties["aria-hidden"] = "true";
          }

          const renderedLines = code.children.filter(isLineNode);
          const lastLine = renderedLines[renderedLines.length - 1];
          if (lastLine) {
            const insertIndex = code.children.indexOf(lastLine);
            code.children.splice(
              insertIndex + 1,
              0,
              createTailControl(currentFoldId, hiddenLines),
            );
            this.addClassToHast(this.pre, ["has-fold", "has-fold-tail"]);
            hasFold = true;
          }
          continue;
        }

        const hiddenLines = Math.max(range.end - range.start - 1, 0);
        for (let index = range.start; index < range.end; index++) {
          this.addClassToHast(lines[index], [
            "fold-line",
            index === range.start ? "fold-start" : "fold-hidden",
          ]);
          lines[index].properties["data-fold-id"] = currentFoldId;

          if (index === range.start) {
            lines[index].properties.role = "button";
            lines[index].properties.tabindex = "0";
            lines[index].properties["aria-expanded"] = "false";
            lines[index].properties["aria-label"] =
              `Toggle folded code block with ${hiddenLines} hidden lines`;
            lines[index].properties["data-fold-lines"] = String(hiddenLines);
          } else {
            lines[index].properties["aria-hidden"] = "true";
          }
        }

        this.addClassToHast(this.pre, "has-fold");
        hasFold = true;
      }

      if (hasFold) {
        code.children = code.children.filter(
          (child) => !(child.type === "text" && child.value === "\n"),
        );
      }
    },
  };
}
