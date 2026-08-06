import { describe, expect, it } from "vitest";
import { buildUserGroups, filterUserPermissions } from "./helpers";
import type { UserPermission } from "@/types/user.types";

function makeRow(overrides: Partial<UserPermission> = {}): UserPermission {
  return {
    id:           "grant-1",
    clientId:     "client-1",
    userId:       "user-1",
    permissionId: "perm-1",
    grantedAt:    "2024-01-01T00:00:00Z",
    action:       "invoice:read",
    categoryId:   "cat-billing",
    categoryName: "Billing",
    categorySlug: "billing",
    categoryPath: "billing",
    ...overrides,
  };
}

describe("buildUserGroups", (): void => {
  it("groups rows by categoryId", (): void => {
    const rows = [
      makeRow({ id: "g1", categoryId: "cat-a", categoryPath: "a" }),
      makeRow({ id: "g2", categoryId: "cat-b", categoryPath: "b" }),
      makeRow({ id: "g3", categoryId: "cat-a", categoryPath: "a" }),
    ];

    const groups = buildUserGroups(rows);

    expect(groups).toHaveLength(2);
    expect(groups.find((g) => g.categoryId === "cat-a")?.rows.map((r) => r.id)).toEqual(["g1", "g3"]);
    expect(groups.find((g) => g.categoryId === "cat-b")?.rows.map((r) => r.id)).toEqual(["g2"]);
  });

  it("orders groups by categoryPath, not by first-seen order", (): void => {
    const rows = [
      makeRow({ id: "g1", categoryId: "cat-z", categoryPath: "zeta" }),
      makeRow({ id: "g2", categoryId: "cat-a", categoryPath: "alpha" }),
    ];

    const groups = buildUserGroups(rows);

    expect(groups.map((g) => g.categoryId)).toEqual(["cat-a", "cat-z"]);
  });

  it("keeps rows within a group in the server-provided order — never re-sorted", (): void => {
    // The server already sorts by (c.path, p.sort_order, p.action); this
    // deliberately puts "z:action" before "a:action" to prove grouping
    // does not alphabetize.
    const rows = [
      makeRow({ id: "r1", action: "z:action", categoryId: "cat-a" }),
      makeRow({ id: "r2", action: "a:action", categoryId: "cat-a" }),
    ];

    const groups = buildUserGroups(rows);

    expect(groups[0].rows.map((r) => r.id)).toEqual(["r1", "r2"]);
  });

  it("returns an empty array for no rows", (): void => {
    expect(buildUserGroups([])).toEqual([]);
  });
});

describe("filterUserPermissions", (): void => {
  const active = makeRow({ id: "active-1", action: "invoice:read" });
  const revoked = makeRow({ id: "revoked-1", action: "invoice:write", revokedAt: "2024-02-01T00:00:00Z" });
  const rows = [active, revoked];

  it("hides revoked rows when hideRevoked is true", (): void => {
    const result = filterUserPermissions(rows, { hideRevoked: true, query: "" });
    expect(result.map((r) => r.id)).toEqual(["active-1"]);
  });

  it("shows revoked rows when hideRevoked is false", (): void => {
    const result = filterUserPermissions(rows, { hideRevoked: false, query: "" });
    expect(result.map((r) => r.id)).toEqual(["active-1", "revoked-1"]);
  });

  it("matches on action", (): void => {
    const result = filterUserPermissions(rows, { hideRevoked: false, query: "write" });
    expect(result.map((r) => r.id)).toEqual(["revoked-1"]);
  });

  it("matches on categoryName and categoryPath", (): void => {
    const withDistinctCategory = [
      makeRow({ id: "r1", categoryName: "Billing", categoryPath: "billing" }),
      makeRow({ id: "r2", categoryName: "Users", categoryPath: "users" }),
    ];
    expect(filterUserPermissions(withDistinctCategory, { hideRevoked: false, query: "billing" }).map((r) => r.id)).toEqual([
      "r1",
    ]);
  });

  it("composes hide-revoked THEN search — search never resurrects a revoked row", (): void => {
    const revokedMatch = makeRow({ id: "revoked-match", action: "invoice:write", revokedAt: "2024-02-01T00:00:00Z" });
    const result = filterUserPermissions([active, revokedMatch], { hideRevoked: true, query: "invoice" });
    expect(result.map((r) => r.id)).toEqual(["active-1"]);
  });

  it("an empty query matches everything left after hide-revoked filtering", (): void => {
    const result = filterUserPermissions(rows, { hideRevoked: true, query: "" });
    expect(result).toHaveLength(1);
  });

  it("is accent- and case-insensitive, via the shared matchesText predicate", (): void => {
    const row = makeRow({ id: "r1", categoryName: "Créditos", categoryPath: "creditos" });
    expect(filterUserPermissions([row], { hideRevoked: false, query: "creditos" }).map((r) => r.id)).toEqual(["r1"]);
  });
});
