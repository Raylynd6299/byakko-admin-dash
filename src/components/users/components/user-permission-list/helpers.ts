import { matchesText } from "@/lib/text-search";
import type { UserPermission } from "@/types/user.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GroupedUserPermissions {
  categoryId:   string;
  categoryName: string;
  categoryPath: string;
  rows:         UserPermission[];
}

// ─── Grouping ─────────────────────────────────────────────────────────────────

/**
 * Groups grant rows by categoryId, orders groups by categoryPath. Rows
 * within a group keep the server-provided sequence
 * (c.path, p.sort_order, p.action) — never re-sorted here, mirroring
 * `buildGroups` on the Permisos screen.
 */
export function buildUserGroups(rows: UserPermission[]): GroupedUserPermissions[] {
  const grouped = new Map<string, GroupedUserPermissions>();

  for (const row of rows) {
    const existing = grouped.get(row.categoryId);
    if (existing) {
      existing.rows.push(row);
    } else {
      grouped.set(row.categoryId, {
        categoryId:   row.categoryId,
        categoryName: row.categoryName,
        categoryPath: row.categoryPath,
        rows:         [row],
      });
    }
  }

  return Array.from(grouped.values()).sort((a, b) => a.categoryPath.localeCompare(b.categoryPath));
}

// ─── Filtering ────────────────────────────────────────────────────────────────

export interface UserPermissionFilter {
  hideRevoked: boolean;
  query:       string;
}

/**
 * Applies hide-revoked, then search, purely in the browser. Search matches
 * the grant's action, categoryName, and categoryPath — THREE fields, not
 * the Permisos four (a grant row carries no permission description). This
 * one function is the single source of truth for "what's visible" — the
 * page header count and every group's count badge both derive from it, so
 * they cannot disagree.
 */
export function filterUserPermissions(
  rows: UserPermission[],
  { hideRevoked, query }: UserPermissionFilter
): UserPermission[] {
  const afterRevoked = hideRevoked ? rows.filter((r) => !r.revokedAt) : rows;
  if (!query) {
    return afterRevoked;
  }
  return afterRevoked.filter((r) => matchesText(query, r.action, r.categoryName, r.categoryPath));
}
