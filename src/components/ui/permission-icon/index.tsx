import { type ReactElement } from "react";
import { DynamicIcon, iconNames } from "lucide-react/dynamic";
import type { IconName } from "lucide-react/dynamic";

// The full 1951-name index, built once at module load — never re-derived
// per render. Membership check is the render-boundary guard that makes
// A9's format-only server validation safe (design.md §16.4): an unknown
// name is a data condition handled here, never an exception.
const KNOWN = new Set<string>(iconNames);

// ─── Placeholder ──────────────────────────────────────────────────────────────

interface IconPlaceholderProps {
  size: number;
}

/**
 * Reserves EXACTLY `size`x`size`, so the slot never reflows — loading,
 * unknown, and null all occupy identical space (§16.3). Decorative only;
 * the permission's action text is the accessible name (§16 scope note).
 */
function IconPlaceholder({ size }: IconPlaceholderProps): ReactElement {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      style={{ color: "var(--text-muted)" }}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.3a2.5 2.5 0 1 1 3.4 2.32c-.72.3-1.4.9-1.4 1.88" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="0.45" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface PermissionIconProps {
  name?: string | null;
  size?: number;
}

/**
 * The one shared wrapper around `DynamicIcon` (design.md §16.3). No other
 * call site imports `DynamicIcon` directly, so no call site can forget the
 * fixed-size `fallback` — its absence is `DynamicIcon`'s default and would
 * be the exact layout shift R6 forbids.
 *
 * Three cases render the identical placeholder (§16.4): `name` is
 * null/absent, `name` is not a known lucide name in this installed
 * version, or the icon chunk for a known name is still loading.
 */
export function PermissionIcon({ name, size = 16 }: PermissionIconProps): ReactElement {
  if (!name || !KNOWN.has(name)) return <IconPlaceholder size={size} />;
  return (
    <DynamicIcon
      name={name as IconName}
      size={size}
      aria-hidden="true"
      fallback={() => <IconPlaceholder size={size} />}
    />
  );
}
