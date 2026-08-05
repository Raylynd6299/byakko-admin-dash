/**
 * Derives a URL-safe slug from a category name.
 *
 * Pipeline: NFD-normalize → strip combining marks → lowercase → collapse
 * any run of non-alphanumeric characters into a single `-` → trim leading
 * and trailing `-` → truncate to 100 chars → re-trim a trailing `-`.
 *
 * The output always satisfies `/^[a-z0-9-]+$/` or is the empty string.
 * Empty is deliberate: if nothing survives (e.g. `日本語` or `!!!`), the
 * caller's own "Slug is required" validation must surface instead of a
 * placeholder the form would reject. The generator must never emit a
 * value its own validator refuses.
 */
export function slugify(name: string): string {
  const withoutMarks = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const lowered = withoutMarks.toLowerCase();
  const dashed = lowered.replace(/[^a-z0-9]+/g, "-");
  const trimmed = dashed.replace(/^-+|-+$/g, "");
  const truncated = trimmed.slice(0, 100);
  return truncated.replace(/-+$/, "");
}
