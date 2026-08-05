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
