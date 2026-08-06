import { type ReactElement, useState } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@/i18n";
import { IconPicker } from "./index";

function Harness(): ReactElement {
  const [value, setValue] = useState<string | null>(null);
  return <IconPicker value={value} onChange={setValue} aria-label="Icon" />;
}

describe("IconPicker — filter", (): void => {
  it("filters the grid as the admin types", async (): Promise<void> => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Icon" }));
    const search = screen.getByRole("combobox");
    await user.type(search, "shield");

    const options = screen.getAllByRole("option");
    expect(options.length).toBeGreaterThan(0);
    for (const option of options) {
      expect(option.getAttribute("title")).toMatch(/shield/i);
    }
  });

  it("shows an explicit no-results state instead of an empty grid", async (): Promise<void> => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Icon" }));
    await user.type(screen.getByRole("combobox"), "zzz-not-a-real-icon-name");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("resets the visible window to the first page on every filter change", async (): Promise<void> => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Icon" }));
    const search = screen.getByRole("combobox");

    // "a" matches hundreds of names — grab the first visible option's id.
    await user.type(search, "a");
    const firstPassOptions = screen.getAllByRole("option");
    const firstId = firstPassOptions[0]?.id;

    // Narrow further — the window must restart from index 0, not keep
    // whatever page a prior, broader filter had scrolled to.
    await user.type(search, "rrow");
    const secondPassOptions = screen.getAllByRole("option");
    expect(secondPassOptions[0]?.id).toBe(firstId);
  });
});

describe("IconPicker — 2D keyboard navigation", (): void => {
  it("ArrowRight/ArrowDown move the active cell and Enter selects it", async (): Promise<void> => {
    const user = userEvent.setup();
    render(<Harness />);

    const trigger = screen.getByRole("button", { name: "Icon" });
    await user.click(trigger);
    await user.type(screen.getByRole("combobox"), "shield");

    await user.keyboard("{ArrowRight}{Enter}");

    expect(trigger).toHaveTextContent("shield");
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("Escape closes without changing the selection and refocuses the trigger", async (): Promise<void> => {
    const user = userEvent.setup();
    render(<Harness />);

    const trigger = screen.getByRole("button", { name: "Icon" });
    await user.click(trigger);
    await user.keyboard("{ArrowDown}{Escape}");

    expect(trigger).toHaveFocus();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("clamps at the grid edge instead of wrapping", async (): Promise<void> => {
    const user = userEvent.setup();
    render(<Harness />);

    const trigger = screen.getByRole("button", { name: "Icon" });
    await user.click(trigger);

    const firstOptionTitle = screen.getAllByRole("option")[0]?.getAttribute("title");

    // ArrowLeft from the first cell must stay on the first cell (clamp,
    // not wrap to the grid's last visible cell — 2-D wrapping has no
    // unambiguous meaning at an edge).
    await user.keyboard("{ArrowLeft}{ArrowLeft}{Enter}");

    expect(trigger).toHaveTextContent(firstOptionTitle ?? "");
  });
});

describe("IconPicker — clear", (): void => {
  it("clears the selection via the clear button", async (): Promise<void> => {
    const user = userEvent.setup();

    function ControlledHarness(): ReactElement {
      const [value, setValue] = useState<string | null>("shield");
      return <IconPicker value={value} onChange={setValue} aria-label="Icon" />;
    }

    render(<ControlledHarness />);

    const trigger = screen.getByRole("button", { name: "Icon" });
    expect(trigger).toHaveTextContent("shield");

    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: /clear/i }));

    expect(trigger).not.toHaveTextContent("shield");
  });
});

describe("IconPicker — windowing", (): void => {
  it("does not mount the entire 1951-icon set at once", async (): Promise<void> => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Icon" }));

    const options = screen.getAllByRole("option");
    expect(options.length).toBeLessThan(200);
  });

  it("offers a way to load more results when the filtered set exceeds one page", async (): Promise<void> => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Icon" }));

    const initialCount = screen.getAllByRole("option").length;
    const showMore = screen.getByRole("button", { name: /\d+/ });
    await user.click(showMore);

    expect(screen.getAllByRole("option").length).toBeGreaterThan(initialCount);
  });
});
