import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// globals: false means Testing Library's automatic-cleanup addon (which
// relies on a global afterEach) never registers itself — wire it up
// explicitly so each test starts from an empty DOM.
afterEach(() => {
  cleanup();
});

// jsdom does not implement scrollIntoView (it has no layout engine) —
// the searchable Select calls it to keep the active option in view.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = (): void => undefined;
}
