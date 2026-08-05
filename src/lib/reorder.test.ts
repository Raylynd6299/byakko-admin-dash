import { describe, expect, it } from "vitest";
import { resolveAnchor } from "./reorder";

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
