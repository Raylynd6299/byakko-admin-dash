import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { PermissionIcon } from "./index";

describe("PermissionIcon", (): void => {
  it("renders the placeholder for a null name, without throwing", (): void => {
    const { container } = render(<PermissionIcon name={null} size={16} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("width", "16");
    expect(svg).toHaveAttribute("height", "16");
  });

  it("renders the placeholder for an absent name, without throwing", (): void => {
    const { container } = render(<PermissionIcon size={16} />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders the placeholder for a malformed (well-formed-but-unresolvable) name, without throwing", (): void => {
    // Well-formed per the icon-name pattern, but not a real lucide name —
    // this is exactly the case A9's format-only server validation lets
    // through, and the render boundary (KNOWN pre-check) must catch it.
    const { container } = render(<PermissionIcon name="not-a-real-icon-xyz" size={16} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("width", "16");
    expect(svg).toHaveAttribute("height", "16");
  });

  it("keeps an identical box size across null, malformed, and a known name", (): void => {
    const cases = [null, "not-a-real-icon-xyz", "shield"] as const;
    for (const name of cases) {
      const { container } = render(<PermissionIcon name={name} size={20} />);
      const svg = container.querySelector("svg");
      expect(svg).not.toBeNull();
      expect(svg).toHaveAttribute("width", "20");
      expect(svg).toHaveAttribute("height", "20");
    }
  });

  it("renders a known name without throwing (async DynamicIcon resolution)", (): void => {
    // DynamicIcon resolves asynchronously (useState + useEffect); the
    // first render is its own fallback, which is this same placeholder —
    // asserting it does not throw synchronously is the relevant guarantee
    // here, not which frame the real glyph lands on.
    expect(() => render(<PermissionIcon name="shield" size={16} />)).not.toThrow();
  });
});
