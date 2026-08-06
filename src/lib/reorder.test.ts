import { describe, expect, it } from "vitest";
import { resolveAnchor, moveToPosition, moveWithinGroup } from "./reorder";

describe("resolveAnchor", (): void => {
  const ids = ["a", "b", "c", "d"];

  it("moving to the first position anchors on null", (): void => {
    expect(resolveAnchor(ids, "c", "a")).toEqual({ afterPermissionId: null });
  });

  it("moving to a middle position anchors on the new predecessor", (): void => {
    // Move "a" to sit right after "b": order becomes b, a, c, d
    expect(resolveAnchor(ids, "a", "b")).toEqual({ afterPermissionId: "b" });
  });

  it("moving to the last position anchors on the new last predecessor", (): void => {
    // Move "a" to sit after "d": order becomes b, c, d, a
    expect(resolveAnchor(ids, "a", "d")).toEqual({ afterPermissionId: "d" });
  });

  it("dropping onto itself is a no-op anchored on its current predecessor", (): void => {
    expect(resolveAnchor(ids, "b", "b")).toEqual({ afterPermissionId: "a" });
  });

  it("a single-item category has no predecessor", (): void => {
    expect(resolveAnchor(["only"], "only", "only")).toEqual({ afterPermissionId: null });
  });

  it("an unknown activeId falls back to its own missing-index anchor", (): void => {
    expect(resolveAnchor(ids, "missing", "a")).toEqual({ afterPermissionId: null });
  });
});

describe("moveToPosition", (): void => {
  const ids = ["a", "b", "c", "d"];

  it("moves an item to the front", (): void => {
    expect(moveToPosition(ids, "c", "a")).toEqual(["c", "a", "b", "d"]);
  });

  it("moves an item to the back", (): void => {
    expect(moveToPosition(ids, "a", "d")).toEqual(["b", "c", "d", "a"]);
  });

  it("returns a copy, not the mutated input, when moving onto itself", (): void => {
    const result = moveToPosition(ids, "b", "b");
    expect(result).toEqual(ids);
    expect(result).not.toBe(ids);
  });

  it("returns a copy unchanged when either id is unknown", (): void => {
    expect(moveToPosition(ids, "missing", "a")).toEqual(ids);
    expect(moveToPosition(ids, "a", "missing")).toEqual(ids);
  });

  it("never mutates the input array", (): void => {
    const input = ["a", "b", "c"];
    moveToPosition(input, "a", "c");
    expect(input).toEqual(["a", "b", "c"]);
  });
});

describe("moveWithinGroup", (): void => {
  interface Item {
    id: string;
    group: string;
  }

  const items: Item[] = [
    { id: "a1", group: "A" },
    { id: "a2", group: "A" },
    { id: "b1", group: "B" },
    { id: "a3", group: "A" },
    { id: "b2", group: "B" },
  ];
  const groupOf = (item: Item): string => item.group;
  const idOf = (item: Item): string => item.id;

  it("moves an item within its own group, leaving other groups' slots untouched", (): void => {
    const result = moveWithinGroup(items, groupOf, idOf, "a1", "a3");
    expect(result.map(idOf)).toEqual(["a2", "a3", "b1", "a1", "b2"]);
    // The other group's items stay in their original slots.
    expect(result[2]).toBe(items[2]);
    expect(result[4]).toBe(items[4]);
  });

  it("returns a copy, not the mutated input", (): void => {
    const result = moveWithinGroup(items, groupOf, idOf, "a1", "a3");
    expect(result).not.toBe(items);
    expect(items.map(idOf)).toEqual(["a1", "a2", "b1", "a3", "b2"]);
  });

  it("returns an equivalent copy when activeId is unknown", (): void => {
    const result = moveWithinGroup(items, groupOf, idOf, "missing", "a1");
    expect(result.map(idOf)).toEqual(items.map(idOf));
  });

  it("cross-group overId is a no-op within the active item's own group", (): void => {
    // overId "b1" is not in group A, so moveToPosition can't find it inside
    // the group-A subset and returns that subset unchanged.
    const result = moveWithinGroup(items, groupOf, idOf, "a1", "b1");
    expect(result.map(idOf)).toEqual(items.map(idOf));
  });
});
