import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ShikiCode } from "./shiki-code";
import "./shiki-code";

type Variant = "simple" | "mac";

const pairedFold = `const visible = true;
// [!code fold:start]
const firstFoldLine = 1;
const secondFoldLine = 2;
// [!code fold:end]
console.log(visible);`;

function findVariant(element: ShikiCode) {
  const variant = element.shadowRoot?.querySelector<HTMLElement>(
    "shiki-code-simple-variant, shiki-code-mac-variant",
  );
  if (!variant) {
    throw new Error("Expected a rendered code variant");
  }
  return variant;
}

function foldingRoot(element: ShikiCode) {
  const root = findVariant(element).shadowRoot;
  if (!root) {
    throw new Error("Expected the code variant to have a shadow root");
  }
  return root;
}

async function renderCode(code: string, variant: Variant = "simple") {
  const element = document.createElement("shiki-code") as ShikiCode;
  element.variant = variant;

  const pre = document.createElement("pre");
  const codeElement = document.createElement("code");
  codeElement.className = "language-ts";
  codeElement.textContent = code;
  pre.append(codeElement);
  element.append(pre);
  document.body.append(element);

  await element.updateComplete;
  element.shadowRoot
    ?.querySelector("slot")
    ?.dispatchEvent(new Event("slotchange"));

  await vi.waitFor(() => expect(element.loading).toBe(false), {
    timeout: 10_000,
  });
  await element.updateComplete;
  await (
    findVariant(element) as unknown as { updateComplete: Promise<boolean> }
  ).updateComplete;

  return element;
}

function foldToggles(element: ShikiCode) {
  return Array.from(
    foldingRoot(element).querySelectorAll<HTMLElement>(
      '[role="button"][aria-expanded]',
    ),
  );
}

function activate(toggle: HTMLElement, type: "click" | "Enter" | " ") {
  if (type === "click") {
    toggle.dispatchEvent(
      new MouseEvent("click", { bubbles: true, composed: true }),
    );
    return;
  }

  toggle.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: type,
      bubbles: true,
      composed: true,
    }),
  );
}

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });
});

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe.each<Variant>(["simple", "mac"])("%s variant", (variant) => {
  it("shares the same collapsed, mouse, keyboard, and ARIA behavior", async () => {
    const element = await renderCode(pairedFold, variant);
    const [toggle] = foldToggles(element);
    const hiddenLines = foldingRoot(element).querySelectorAll(
      '[aria-hidden="true"]',
    );

    expect(toggle).toBeTruthy();
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(hiddenLines).toHaveLength(1);

    activate(toggle, "click");
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(hiddenLines[0].getAttribute("aria-hidden")).toBe("false");

    activate(toggle, "Enter");
    expect(toggle.getAttribute("aria-expanded")).toBe("false");

    activate(toggle, " ");
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
  });
});

it("keeps multiple folds independent", async () => {
  const element = await renderCode(`${pairedFold}
${pairedFold}`);
  const [first, second] = foldToggles(element);

  expect(first).toBeTruthy();
  expect(second).toBeTruthy();
  activate(first, "click");

  expect(first.getAttribute("aria-expanded")).toBe("true");
  expect(second.getAttribute("aria-expanded")).toBe("false");
});

it("preserves inline end-marker range semantics", async () => {
  const element = await renderCode(`const first = 1; // [!code fold:start]
const hidden = 2;
const last = 3; // [!code fold:end]`);
  const [toggle] = foldToggles(element);

  expect(toggle).toBeTruthy();
  expect(
    foldingRoot(element).querySelectorAll('[aria-hidden="true"]'),
  ).toHaveLength(2);
});

it("fails open for nested fold notation", async () => {
  const element = await renderCode(`// [!code fold:start]
const outer = true;
// [!code fold:start]
const inner = true;
// [!code fold:end]
// [!code fold:end]`);

  expect(foldToggles(element)).toHaveLength(0);
  expect(
    foldingRoot(element).querySelectorAll('[aria-hidden="true"]'),
  ).toHaveLength(0);
});

it("fails open for an unmatched end marker", async () => {
  const element = await renderCode(`const visible = true;
// [!code fold:end]
const stillVisible = true;`);

  expect(foldToggles(element)).toHaveLength(0);
  expect(
    foldingRoot(element).querySelectorAll('[aria-hidden="true"]'),
  ).toHaveLength(0);
});

it("supports one final tail fold", async () => {
  const element = await renderCode(`const visible = true;
// [!code fold:start]
const hiddenOne = 1;
const hiddenTwo = 2;`);
  const [toggle] = foldToggles(element);

  expect(toggle).toBeTruthy();
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  expect(
    Array.from(
      foldingRoot(element).querySelectorAll<HTMLElement>(
        '[aria-hidden="true"]',
      ),
    ).filter((line) => line.textContent?.includes("const hidden")),
  ).toHaveLength(2);
});

it.each<Variant>(["simple", "mac"])(
  "%s variant copies the complete source while lines are folded",
  async (variant) => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const element = await renderCode(pairedFold, variant);
    const copyButton = foldingRoot(element).querySelector<HTMLButtonElement>(
      'button[aria-label="Copy code"]',
    );

    expect(copyButton).toBeTruthy();
    copyButton?.click();
    await vi.waitFor(() => expect(writeText).toHaveBeenCalledOnce());

    const copied = writeText.mock.calls[0][0] as string;
    expect(copied).toContain("const firstFoldLine = 1;");
    expect(copied).toContain("const secondFoldLine = 2;");
  },
);
