import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/i18n";
import { PermissionTreeView } from "./index";
import type { Permission } from "@/types/permission.types";
import type { Category } from "@/types/category.types";

// Manual verification checklist (not covered by this file — see PR
// description): actual pointer/keyboard drag gestures, dnd-kit's own
// live-region announcements during a real drag, and cross-category drop
// rejection under a real DndContext. Simulating a dnd-kit drag gesture in
// jsdom requires mocking PointerEvent geometry the library does not
// expose for testing; this file instead verifies the two things that are
// deterministic and don't require a real drag: the disabled wiring while
// filtering (§13/B9), and the move-up/down boundary conditions that
// gate the accessible fallback (§13/B7).

const CATEGORY: Category = {
  id:       "cat-1",
  clientId: "client-1",
  name:     "Billing",
  slug:     "billing",
  path:     "billing",
};

const PERMISSIONS: Permission[] = [
  { id: "p1", clientId: "client-1", categoryId: "cat-1", action: "invoice:read", sortOrder: 100 },
  { id: "p2", clientId: "client-1", categoryId: "cat-1", action: "invoice:write", sortOrder: 200 },
];

function renderTree(query: string): ReturnType<typeof render> {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <PermissionTreeView
        permissions={PERMISSIONS}
        categories={[CATEGORY]}
        isLoading={false}
        isError={false}
        onRetry={() => undefined}
        onCreateClick={() => undefined}
        query={query}
        onClearQuery={() => undefined}
        collapsedIds={new Set()}
        onToggleCollapse={() => undefined}
      />
    </QueryClientProvider>
  );
}

describe("PermissionTreeView — reorder disabled while filtering", (): void => {
  it("keeps the drag handle enabled when not filtering", (): void => {
    renderTree("");
    const handle = screen.getByRole("button", { name: "Drag to reorder invoice:read" });
    expect(handle).toHaveAttribute("aria-disabled", "false");
  });

  it("disables the drag handle while a search query is active", (): void => {
    renderTree("invoice");
    const handle = screen.getByRole("button", { name: "Drag to reorder invoice:read" });
    expect(handle).toHaveAttribute("aria-disabled", "true");
  });

  it("disables both move buttons on every row while filtering", (): void => {
    renderTree("invoice");
    expect(screen.getByRole("button", { name: "Move invoice:read down" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move invoice:write up" })).toBeDisabled();
  });

  it("shows a visible hint that reordering requires clearing the search", (): void => {
    renderTree("invoice");
    expect(screen.getByText("Clear the search to reorder")).toBeInTheDocument();
  });

  it("hides the hint when not filtering", (): void => {
    renderTree("");
    expect(screen.queryByText("Clear the search to reorder")).not.toBeInTheDocument();
  });
});

describe("PermissionTreeView — move up/down boundary conditions", (): void => {
  it("disables move-up on the first permission in its category", (): void => {
    renderTree("");
    expect(screen.getByRole("button", { name: "Move invoice:read up" })).toBeDisabled();
  });

  it("enables move-down on the first permission in its category", (): void => {
    renderTree("");
    expect(screen.getByRole("button", { name: "Move invoice:read down" })).not.toBeDisabled();
  });

  it("disables move-down on the last permission in its category", (): void => {
    renderTree("");
    expect(screen.getByRole("button", { name: "Move invoice:write down" })).toBeDisabled();
  });

  it("enables move-up on the last permission in its category", (): void => {
    renderTree("");
    expect(screen.getByRole("button", { name: "Move invoice:write up" })).not.toBeDisabled();
  });
});
