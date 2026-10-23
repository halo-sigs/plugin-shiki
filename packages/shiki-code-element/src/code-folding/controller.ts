import type { LitElement, ReactiveController } from "lit";

const FOLD_TOGGLE_SELECTOR = ".fold-start, .fold-tail-control";

export class CodeFoldingController implements ReactiveController {
  private listening = false;
  private readonly host: LitElement;

  constructor(host: LitElement) {
    this.host = host;
    host.addController(this);
  }

  hostUpdated() {
    if (this.listening) {
      return;
    }

    this.host.renderRoot.addEventListener("click", this.handleClick);
    this.host.renderRoot.addEventListener("keydown", this.handleKeydown);
    this.listening = true;
  }

  hostDisconnected() {
    this.host.renderRoot.removeEventListener("click", this.handleClick);
    this.host.renderRoot.removeEventListener("keydown", this.handleKeydown);
    this.listening = false;
  }

  private readonly handleClick = (event: Event) => {
    const foldToggle = this.findFoldToggle(event);
    if (foldToggle) {
      this.toggleFold(foldToggle);
    }
  };

  private readonly handleKeydown = (event: Event) => {
    if (!(event instanceof KeyboardEvent)) {
      return;
    }

    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const foldToggle = this.findFoldToggle(event);
    if (!foldToggle) {
      return;
    }

    event.preventDefault();
    this.toggleFold(foldToggle);
  };

  private findFoldToggle(event: Event) {
    return event
      .composedPath()
      .find(
        (target): target is HTMLElement =>
          target instanceof HTMLElement && target.matches(FOLD_TOGGLE_SELECTOR),
      );
  }

  private toggleFold(foldToggle: HTMLElement) {
    const foldId = foldToggle.dataset.foldId;
    const pre = foldToggle.closest("pre");
    if (!foldId || !pre) {
      return;
    }

    const expanded = foldToggle.getAttribute("aria-expanded") !== "true";
    for (const line of pre.querySelectorAll<HTMLElement>(".fold-line")) {
      if (line.dataset.foldId !== foldId) {
        continue;
      }

      line.classList.toggle("fold-expanded", expanded);
      if (line.classList.contains("fold-hidden")) {
        line.setAttribute("aria-hidden", String(!expanded));
      }
    }

    foldToggle.classList.toggle("fold-expanded", expanded);
    foldToggle.setAttribute("aria-expanded", String(expanded));
  }
}
