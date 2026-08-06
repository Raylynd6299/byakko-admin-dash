/**
 * Computes the `after_permission_id` anchor for a PATCH position request
 * from a local reorder gesture (drag or move-up/down keyboard fallback).
 *
 * Zero dependencies by design — this ships in PR2, which does not add
 * `@dnd-kit`. PR3 wires this same pure function to dnd-kit's sensors, so
 * drag and the keyboard fallback can never disagree: both call this
 * function with `overId` set to the target position's neighbour id.
 *
 * `splice` below mutates a local copy created on the line above it, which
 * is safe — it is unrelated to the `new Set(prev)` state-update rule used
 * elsewhere in this change.
 */
export function resolveAnchor(
  orderedIds: readonly string[],
  activeId: string,
  overId: string
): { afterPermissionId: string | null } {
  const from = orderedIds.indexOf(activeId);
  const to = orderedIds.indexOf(overId);

  if (from === -1 || to === -1 || from === to) {
    return { afterPermissionId: from <= 0 ? null : orderedIds[from - 1] };
  }

  const next = orderedIds.slice();
  next.splice(to, 0, next.splice(from, 1)[0]);
  const pos = next.indexOf(activeId);
  return { afterPermissionId: pos === 0 ? null : next[pos - 1] };
}

/**
 * PR3 addition — purely additive, `resolveAnchor` above is untouched.
 *
 * Returns a NEW array with `activeId` moved to sit at `overId`'s position.
 * This mirrors the local move `resolveAnchor` computes the anchor for, so
 * a drag drop and the keyboard/touch move-up/down fallback (both of which
 * call `resolveAnchor` with the same `overId` convention) can build an
 * identical optimistic order. The input array is never mutated.
 */
export function moveToPosition<T extends string>(
  orderedIds: readonly T[],
  activeId: T,
  overId: T
): T[] {
  const from = orderedIds.indexOf(activeId);
  const to = orderedIds.indexOf(overId);

  if (from === -1 || to === -1 || from === to) {
    return orderedIds.slice();
  }

  const next = orderedIds.slice();
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}

/**
 * Rebuilds a full flat list after moving `activeId` locally within the
 * subset selected by `groupKeyOf` (a permission's category, in PR3's use).
 * Positions outside the moved subset are untouched; slots inside the
 * subset are refilled in the subset's new order. Always returns a NEW
 * array — this is what PR3's optimistic cache write uses instead of
 * splicing the cached array in place.
 */
export function moveWithinGroup<T>(
  items: readonly T[],
  groupKeyOf: (item: T) => string,
  idOf: (item: T) => string,
  activeId: string,
  overId: string
): T[] {
  const activeItem = items.find((item) => idOf(item) === activeId);
  if (!activeItem) {
    return items.slice();
  }

  const group = groupKeyOf(activeItem);
  const groupIds = items.filter((item) => groupKeyOf(item) === group).map(idOf);
  const nextGroupIds = moveToPosition(groupIds, activeId, overId);

  const byId = new Map(items.map((item) => [idOf(item), item] as const));
  let cursor = 0;
  return items.map((item) => {
    if (groupKeyOf(item) !== group) {
      return item;
    }
    const nextId = nextGroupIds[cursor];
    cursor += 1;
    return byId.get(nextId) ?? item;
  });
}
