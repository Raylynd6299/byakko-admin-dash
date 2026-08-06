/**
 * Normalizes text for accent- and case-insensitive comparison: Unicode NFD
 * normalize, strip combining marks, lowercase.
 */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Returns true when `query` is a case-insensitive, accent-insensitive
 * substring of ANY of the given haystacks. An empty query always matches —
 * this is not a special-cased branch, it falls out of `"".includes("")`
 * always being true for every normalized haystack (including `undefined`,
 * which normalizes to the empty string and vacuously matches).
 */
export function matchesText(query: string, ...haystacks: (string | undefined)[]): boolean {
  const normalizedQuery = normalizeText(query);
  return haystacks.some((haystack) => normalizeText(haystack ?? "").includes(normalizedQuery));
}
