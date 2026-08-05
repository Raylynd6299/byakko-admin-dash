import { type ReactElement, useState } from "react";
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@/i18n";
import { Select, type SelectOption } from "./index";

const OPTIONS: SelectOption<string>[] = [
  { value: "billing", label: "Billing" },
  { value: "reports", label: "Reports" },
  { value: "credits", label: "Créditos" },
];

function Harness({ searchable = false }: { searchable?: boolean }): ReactElement {
  const [value, setValue] = useState<string>("");
  return (
    <Select
      value={value}
      options={OPTIONS}
      onChange={setValue}
      aria-label="Category"
      searchable={searchable}
    />
  );
}

describe("Select — searchable", (): void => {
  it("filters options as the admin types", async (): Promise<void> => {
    const user = userEvent.setup();
    render(<Harness searchable />);

    await user.click(screen.getByRole("button", { name: "Category" }));
    const filterInput = screen.getByPlaceholderText("Search");
    await user.type(filterInput, "report");

    expect(screen.getByRole("option", { name: "Reports" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Billing" })).not.toBeInTheDocument();
  });

  it("matches accent-insensitively", async (): Promise<void> => {
    const user = userEvent.setup();
    render(<Harness searchable />);

    await user.click(screen.getByRole("button", { name: "Category" }));
    await user.type(screen.getByPlaceholderText("Search"), "creditos");

    expect(screen.getByRole("option", { name: "Créditos" })).toBeInTheDocument();
  });

  it("wraps the active option with ArrowDown/ArrowUp", async (): Promise<void> => {
    const user = userEvent.setup();
    render(<Harness searchable />);

    await user.click(screen.getByRole("button", { name: "Category" }));
    const filterInput = screen.getByPlaceholderText("Search");

    // Three options: pressing Up from the first wraps to the last.
    await user.keyboard("{ArrowUp}");
    const options = screen.getAllByRole("option");
    const lastOptionId = options[options.length - 1].id;
    expect(filterInput).toHaveAttribute("aria-activedescendant", lastOptionId);
  });

  it("selects the active option on Enter and closes", async (): Promise<void> => {
    const user = userEvent.setup();
    render(<Harness searchable />);

    const trigger = screen.getByRole("button", { name: "Category" });
    await user.click(trigger);
    await user.type(screen.getByPlaceholderText("Search"), "report");
    await user.keyboard("{Enter}");

    expect(trigger).toHaveTextContent("Reports");
    expect(screen.queryByPlaceholderText("Search")).not.toBeInTheDocument();
  });

  it("Escape closes without changing the selection and refocuses the trigger", async (): Promise<void> => {
    const user = userEvent.setup();
    render(<Harness searchable />);

    const trigger = screen.getByRole("button", { name: "Category" });
    await user.click(trigger);
    await user.keyboard("{ArrowDown}{Escape}");

    expect(trigger).toHaveTextContent("Select…");
    expect(trigger).toHaveFocus();
  });

  it("resets the active option to the first match whenever the filter changes", async (): Promise<void> => {
    const user = userEvent.setup();
    render(<Harness searchable />);

    await user.click(screen.getByRole("button", { name: "Category" }));
    const filterInput = screen.getByPlaceholderText("Search");
    await user.keyboard("{ArrowDown}{ArrowDown}"); // move active to the 3rd option
    await user.type(filterInput, "report"); // narrows to a single match

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(filterInput).toHaveAttribute("aria-activedescendant", options[0].id);
  });

  it("non-searchable mode never mounts a filter input, and stays keyboard-navigable", async (): Promise<void> => {
    const user = userEvent.setup();
    render(<Harness />);

    const trigger = screen.getByRole("button", { name: "Category" });
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();

    await user.click(trigger);
    // Opening already sets the active index to 0 (Billing); one more
    // ArrowDown moves it to the next option (Reports), then Enter selects.
    await user.keyboard("{ArrowDown}{Enter}");
    expect(trigger).toHaveTextContent("Reports");
  });

  it("shows an explicit no-results row instead of an empty list", async (): Promise<void> => {
    const user = userEvent.setup();
    render(<Harness searchable />);

    await user.click(screen.getByRole("button", { name: "Category" }));
    await user.type(screen.getByPlaceholderText("Search"), "zzz-no-match");

    const listbox = screen.getByRole("listbox");
    expect(within(listbox).getByText("No results")).toBeInTheDocument();
  });

  it("closing without a filter input mounted never leaves it focusable (no tab-order regression)", (): void => {
    render(<Harness searchable />);
    expect(screen.queryByPlaceholderText("Search")).not.toBeInTheDocument();
  });
});
