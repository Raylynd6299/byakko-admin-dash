import { describe, expect, it } from "vitest";
import { slugify } from "./slugify";

describe("slugify", (): void => {
  it("strips accents", (): void => {
    expect(slugify("Créditos")).toBe("creditos");
  });

  it("lowercases and dashes multi-word names", (): void => {
    expect(slugify("Reportes Anuales")).toBe("reportes-anuales");
  });

  it("collapses punctuation and repeated separators without leading, trailing, or doubled dashes", (): void => {
    expect(slugify("  Facturación / Notas  de  Crédito!! ")).toBe(
      "facturacion-notas-de-credito"
    );
  });

  it("trims leading and trailing dashes", (): void => {
    expect(slugify("-x-")).toBe("x");
  });

  it("truncates to 100 chars and re-trims a trailing dash", (): void => {
    const longName = "a".repeat(105);
    const result = slugify(longName);
    expect(result.length).toBeLessThanOrEqual(100);
    expect(result.endsWith("-")).toBe(false);

    // Force a truncation that lands exactly on a separator boundary.
    const boundaryName = `${"a".repeat(99)} b`;
    expect(slugify(boundaryName)).toBe("a".repeat(99));
  });

  it("produces an empty string for unsluggable input", (): void => {
    expect(slugify("日本語")).toBe("");
    expect(slugify("!!!")).toBe("");
  });

  it("every non-empty output matches the form validator regex", (): void => {
    const cases = ["Créditos", "Reportes Anuales", "  Facturación / Notas  de  Crédito!! ", "-x-"];
    for (const input of cases) {
      const result = slugify(input);
      expect(result).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
