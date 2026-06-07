import mermaid from "mermaid";

type MermaidViewMode = "preview" | "text";

type MermaidRuntimeConfig = {
  lightTheme?: string;
  darkTheme?: string;
  securityLevel?: string;
  zoomEnabled?: boolean;
  fullscreenEnabled?: boolean;
  defaultViewMode?: MermaidViewMode;
};

type DiagramState = {
  scale: number;
  translateX: number;
  translateY: number;
  dragging: boolean;
  startX: number;
  startY: number;
  initialX: number;
  initialY: number;
};

declare global {
  interface Window {
    __HALO_SHIKI_MERMAID_CONFIG__?: MermaidRuntimeConfig;
  }
}

const diagramSelector = ".halo-mermaid-diagram";
const renderedClass = "halo-mermaid-rendered";
const styleId = "halo-mermaid-renderer-style";
let renderCounter = 0;
let currentTheme = "";
let renderQueue = Promise.resolve();
const media = window.matchMedia("(prefers-color-scheme: dark)");

function getConfig(): Required<MermaidRuntimeConfig> {
  const config = window.__HALO_SHIKI_MERMAID_CONFIG__ || {};
  return {
    lightTheme: config.lightTheme || "default",
    darkTheme: config.darkTheme || "dark",
    securityLevel: config.securityLevel || "strict",
    zoomEnabled: config.zoomEnabled ?? true,
    fullscreenEnabled: config.fullscreenEnabled ?? true,
    defaultViewMode: config.defaultViewMode || "preview",
  };
}

function isDarkMode() {
  const html = document.documentElement;
  const body = document.body;
  const hasClass = (element: HTMLElement, className: string) =>
    element.classList.contains(className);
  const hasDataAttr = (element: HTMLElement, value: string) =>
    element.getAttribute("data-color-scheme") === value;

  if (
    hasClass(html, "color-scheme-auto") ||
    hasClass(body, "color-scheme-auto") ||
    hasDataAttr(html, "auto") ||
    hasDataAttr(body, "auto")
  ) {
    return media.matches;
  }

  return (
    hasClass(html, "dark") ||
    hasClass(body, "dark") ||
    hasClass(html, "color-scheme-dark") ||
    hasClass(body, "color-scheme-dark") ||
    hasDataAttr(html, "dark") ||
    hasDataAttr(body, "dark") ||
    media.matches
  );
}

function getTheme() {
  const config = getConfig();
  return isDarkMode() ? config.darkTheme : config.lightTheme;
}

function initializeMermaid() {
  const config = getConfig();
  const theme = getTheme();
  mermaid.initialize({
    startOnLoad: false,
    theme: theme as
      | "base"
      | "default"
      | "dark"
      | "forest"
      | "neutral"
      | "neo"
      | "neo-dark"
      | "redux"
      | "redux-dark"
      | "redux-color"
      | "redux-dark-color"
      | "null",
    securityLevel: config.securityLevel as
      | "strict"
      | "loose"
      | "antiscript"
      | "sandbox",
  });
  currentTheme = theme;
}

function ensureStyle() {
  if (document.getElementById(styleId)) {
    return;
  }

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
.halo-mermaid-diagram {
  position: relative;
  margin: 1rem 0;
  border: 1px solid color-mix(in srgb, currentColor 14%, transparent);
  border-radius: 0.75rem;
  background: color-mix(in srgb, Canvas 96%, currentColor 4%);
  overflow: hidden;
}
.halo-mermaid-diagram > pre:not(.halo-mermaid-source) {
  display: none !important;
}
.halo-mermaid-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid color-mix(in srgb, currentColor 10%, transparent);
  background: linear-gradient(180deg, color-mix(in srgb, Canvas 96%, currentColor 4%), color-mix(in srgb, Canvas 90%, currentColor 10%));
}
.halo-mermaid-button-group {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1875rem;
  border: 1px solid color-mix(in srgb, currentColor 12%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, Canvas 88%, currentColor 12%);
}
.halo-mermaid-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}
.halo-mermaid-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.25rem;
  height: 1.875rem;
  padding: 0 0.75rem;
  border: 1px solid color-mix(in srgb, currentColor 14%, transparent);
  border-radius: 999px;
  background: transparent;
  color: CanvasText;
  cursor: pointer;
  font: inherit;
  font-size: 0.8125rem;
  line-height: 1;
  transition: background-color 120ms ease, border-color 120ms ease, transform 120ms ease;
}
.halo-mermaid-button:hover,
.halo-mermaid-button:focus-visible {
  background: color-mix(in srgb, CanvasText 8%, Canvas);
  transform: translateY(-1px);
  outline: none;
}
.halo-mermaid-button.is-active {
  border-color: color-mix(in srgb, currentColor 36%, transparent);
  background: Canvas;
  box-shadow: 0 1px 3px color-mix(in srgb, CanvasText 16%, transparent);
  font-weight: 600;
}
.halo-mermaid-viewport {
  overflow: auto;
  cursor: grab;
  overscroll-behavior: contain;
}
.halo-mermaid-viewport.is-dragging {
  cursor: grabbing;
  user-select: none;
}
.halo-mermaid-canvas {
  display: flex;
  justify-content: center;
  min-width: 100%;
  padding: 1rem;
  transform-origin: center center;
  transition: transform 120ms ease;
}
.halo-mermaid-canvas svg {
  max-width: 100%;
  height: auto;
}
.halo-mermaid-source {
  margin: 0;
  padding: 1rem;
  overflow: auto;
  background: color-mix(in srgb, CanvasText 5%, Canvas);
  color: CanvasText;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875rem;
  line-height: 1.7;
  white-space: pre;
}
.halo-mermaid-error {
  margin: 0;
  padding: 1rem;
  overflow: auto;
  color: #b91c1c;
  white-space: pre-wrap;
}
.halo-mermaid-fullscreen-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.72);
}
.halo-mermaid-fullscreen-dialog {
  width: min(96vw, 1400px);
  height: min(92vh, 1000px);
  background: Canvas;
  color: CanvasText;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
}
.halo-mermaid-fullscreen-dialog .halo-mermaid-viewport,
.halo-mermaid-fullscreen-dialog .halo-mermaid-source {
  height: calc(100% - 3rem);
}
`;
  document.head.appendChild(style);
}

function getSource(element: HTMLElement) {
  const source =
    element.dataset.mermaidSource ||
    element.querySelector("code")?.textContent ||
    "";
  return source.trim();
}

function getViewMode(element: HTMLElement): MermaidViewMode {
  const mode = element.dataset.mermaidViewMode;
  if (mode === "preview" || mode === "text") {
    return mode;
  }
  return getConfig().defaultViewMode;
}

function setTransform(canvas: HTMLElement, state: DiagramState) {
  canvas.style.transform = `translate(${state.translateX}px, ${state.translateY}px) scale(${state.scale})`;
}

function zoom(canvas: HTMLElement, state: DiagramState, delta: number) {
  state.scale = Math.min(4, Math.max(0.2, state.scale + delta));
  setTransform(canvas, state);
}

function reset(canvas: HTMLElement, state: DiagramState) {
  state.scale = 1;
  state.translateX = 0;
  state.translateY = 0;
  setTransform(canvas, state);
}

function fitWidth(
  viewport: HTMLElement,
  canvas: HTMLElement,
  state: DiagramState,
) {
  const svg = canvas.querySelector("svg");
  if (!svg) {
    return;
  }
  const viewportWidth = viewport.clientWidth - 32;
  const svgWidth = svg.getBoundingClientRect().width / state.scale;
  if (svgWidth <= 0) {
    return;
  }
  state.scale = Math.min(4, Math.max(0.2, viewportWidth / svgWidth));
  state.translateX = 0;
  state.translateY = 0;
  setTransform(canvas, state);
}

function createButton(label: string, title: string, onClick: () => void) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "halo-mermaid-button";
  button.textContent = label;
  button.title = title;
  button.setAttribute("aria-label", title);
  button.addEventListener("click", onClick);
  return button;
}

function createModeButton(
  label: string,
  mode: MermaidViewMode,
  activeMode: MermaidViewMode,
  onClick: () => void,
) {
  const button = createButton(
    label,
    mode === "preview" ? "渲染预览" : "文本预览",
    onClick,
  );
  if (mode === activeMode) {
    button.classList.add("is-active");
  }
  return button;
}

async function copySource(source: string, button: HTMLButtonElement) {
  await navigator.clipboard?.writeText(source);
  const text = button.textContent;
  button.textContent = "已复制";
  setTimeout(() => {
    button.textContent = text;
  }, 1600);
}

function bindPan(
  viewport: HTMLElement,
  canvas: HTMLElement,
  state: DiagramState,
) {
  viewport.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) {
      return;
    }
    state.dragging = true;
    state.startX = event.clientX;
    state.startY = event.clientY;
    state.initialX = state.translateX;
    state.initialY = state.translateY;
    viewport.classList.add("is-dragging");
    viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!state.dragging) {
      return;
    }
    state.translateX = state.initialX + event.clientX - state.startX;
    state.translateY = state.initialY + event.clientY - state.startY;
    setTransform(canvas, state);
  });

  const stopDragging = (event: PointerEvent) => {
    state.dragging = false;
    viewport.classList.remove("is-dragging");
    if (viewport.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }
  };

  viewport.addEventListener("pointerup", stopDragging);
  viewport.addEventListener("pointercancel", stopDragging);
}

function openFullscreen(source: string) {
  const overlay = document.createElement("div");
  overlay.className = "halo-mermaid-fullscreen-overlay";

  const dialog = document.createElement("div");
  dialog.className = "halo-mermaid-fullscreen-dialog";
  dialog.dataset.mermaidSource = source;
  dialog.dataset.mermaidViewMode = getConfig().defaultViewMode;
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      overlay.remove();
    }
  });

  const closeHandler = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      overlay.remove();
      document.removeEventListener("keydown", closeHandler);
    }
  };
  document.addEventListener("keydown", closeHandler);
  void renderDiagram(dialog, true);
}

function createToolbar(
  element: HTMLElement,
  source: string,
  mode: MermaidViewMode,
  forceFullscreen: boolean,
) {
  const toolbar = document.createElement("div");
  toolbar.className = "halo-mermaid-toolbar";

  const modeGroup = document.createElement("div");
  modeGroup.className = "halo-mermaid-button-group";
  modeGroup.append(
    createModeButton("图表", "preview", mode, () => {
      element.dataset.mermaidViewMode = "preview";
      void renderDiagram(element, forceFullscreen);
    }),
    createModeButton("源码", "text", mode, () => {
      element.dataset.mermaidViewMode = "text";
      void renderDiagram(element, forceFullscreen);
    }),
  );

  const actions = document.createElement("div");
  actions.className = "halo-mermaid-actions";
  const copyButton = createButton("复制", "复制 Mermaid 文本", () => {
    void copySource(source, copyButton);
  });
  actions.append(copyButton);

  toolbar.append(modeGroup, actions);
  return toolbar;
}

function buildTextView(
  element: HTMLElement,
  source: string,
  mode: MermaidViewMode,
  forceFullscreen: boolean,
) {
  const toolbar = createToolbar(element, source, mode, forceFullscreen);
  const pre = document.createElement("pre");
  pre.className = "halo-mermaid-source";
  pre.textContent = source;

  if (forceFullscreen) {
    toolbar.append(
      createButton("×", "关闭", () =>
        element.closest(".halo-mermaid-fullscreen-overlay")?.remove(),
      ),
    );
  }

  element.innerHTML = "";
  element.append(toolbar, pre);
  element.classList.add(renderedClass);
}

function buildPreview(
  element: HTMLElement,
  svg: string,
  source: string,
  mode: MermaidViewMode,
  forceFullscreen = false,
) {
  const config = getConfig();
  const state: DiagramState = {
    scale: 1,
    translateX: 0,
    translateY: 0,
    dragging: false,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  };
  const toolbar = createToolbar(element, source, mode, forceFullscreen);
  const viewport = document.createElement("div");
  viewport.className = "halo-mermaid-viewport";
  const canvas = document.createElement("div");
  canvas.className = "halo-mermaid-canvas";
  canvas.innerHTML = svg;
  viewport.appendChild(canvas);

  if (config.zoomEnabled || forceFullscreen) {
    toolbar.append(
      createButton("+", "放大", () => zoom(canvas, state, 0.2)),
      createButton("−", "缩小", () => zoom(canvas, state, -0.2)),
      createButton("1:1", "重置", () => reset(canvas, state)),
      createButton("↔", "适应宽度", () => fitWidth(viewport, canvas, state)),
    );
    bindPan(viewport, canvas, state);
  }

  if (config.fullscreenEnabled && !forceFullscreen) {
    toolbar.append(createButton("⛶", "全屏查看", () => openFullscreen(source)));
  }

  if (forceFullscreen) {
    toolbar.append(
      createButton("×", "关闭", () =>
        element.closest(".halo-mermaid-fullscreen-overlay")?.remove(),
      ),
    );
  }

  element.innerHTML = "";
  element.append(toolbar, viewport);
  element.classList.add(renderedClass);
}

async function renderDiagram(element: HTMLElement, forceFullscreen = false) {
  const source = getSource(element);
  if (!source) {
    return;
  }

  element.dataset.mermaidSource = source;
  const mode = getViewMode(element);
  element.dataset.mermaidViewMode = mode;

  if (mode === "text") {
    buildTextView(element, source, mode, forceFullscreen);
    return;
  }

  const id = `halo-mermaid-${Date.now()}-${renderCounter++}`;

  try {
    const { svg } = await mermaid.render(id, source);
    buildPreview(element, svg, source, mode, forceFullscreen);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    element.innerHTML = `<pre class="halo-mermaid-error"></pre>`;
    const errorElement = element.querySelector(".halo-mermaid-error");
    if (errorElement) {
      errorElement.textContent = message;
    }
  }
}

async function renderAll() {
  ensureStyle();
  initializeMermaid();
  const diagrams = Array.from(
    document.querySelectorAll<HTMLElement>(diagramSelector),
  );
  await Promise.all(diagrams.map((element) => renderDiagram(element)));
}

function enqueueRenderAll() {
  renderQueue = renderQueue.then(renderAll).catch(() => undefined);
}

function rerenderOnThemeChange() {
  const nextTheme = getTheme();
  if (nextTheme === currentTheme) {
    return;
  }
  document.querySelectorAll<HTMLElement>(diagramSelector).forEach((element) => {
    element.classList.remove(renderedClass);
  });
  enqueueRenderAll();
}

const observer = new MutationObserver(rerenderOnThemeChange);
observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["class", "data-color-scheme"],
});
observer.observe(document.body, {
  attributes: true,
  attributeFilter: ["class", "data-color-scheme"],
});

media.addEventListener("change", rerenderOnThemeChange);
document.addEventListener("DOMContentLoaded", enqueueRenderAll);
window.addEventListener("pjax:complete", enqueueRenderAll);

if (document.readyState !== "loading") {
  enqueueRenderAll();
}

export { renderAll as renderMermaidDiagrams };
