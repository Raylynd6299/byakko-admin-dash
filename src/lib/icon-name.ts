/**
 * Server-matching validation for a lucide icon name. Mirrors the backend
 * rule exactly (design.md §15.4/A9): `^[a-z0-9]+(-[a-z0-9]+)*$`, length
 * 1-64. Trims and lower-cases first, so a valid-but-differently-cased or
 * padded name is accepted the same way on both client and server.
 *
 * A rejected name never throws — it returns `null`, which renders
 * identically to "no icon chosen" at the render boundary (§16.4). This is
 * a fourth silent-failure unit (R3): a bad icon name looks exactly like an
 * absent one, so the picker and the domain type must never disagree with
 * the server about what counts as valid.
 */
const ICON_NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ICON_NAME_MAX_LENGTH = 64;

export function normalizeIconName(raw: string): string | null {
  const candidate = raw.trim().toLowerCase();
  if (candidate.length === 0 || candidate.length > ICON_NAME_MAX_LENGTH) return null;
  if (!ICON_NAME_PATTERN.test(candidate)) return null;
  return candidate;
}
