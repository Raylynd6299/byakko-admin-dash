import { describe, expect, it } from "vitest";
import { matchesText, normalizeText } from "./text-search";

describe("normalizeText", (): void => {
  it("strips accents and lowercases", (): void => {
    expect(normalizeText("Créditos")).toBe("creditos");
  });
});

describe("matchesText", (): void => {
  it("matches an empty query against anything", (): void => {
    expect(matchesText("", "invoice:read")).toBe(true);
    expect(matchesText("", undefined)).toBe(true);
  });

  it("matches a permission action", (): void => {
    expect(matchesText("invoice", "invoice:read", undefined)).toBe(true);
  });

  it("matches a description", (): void => {
    expect(matchesText("invoices", "x:y", "Read invoices")).toBe(true);
  });

  it("matches a category field among several haystacks", (): void => {
    expect(matchesText("billing", "Billing", "billing.core", "invoice:read", undefined)).toBe(
      true
    );
  });

  it("is accent-insensitive", (): void => {
    expect(matchesText("creditos", "Créditos")).toBe(true);
  });

  it("is case-insensitive", (): void => {
    expect(matchesText("INVOICE", "invoice:read")).toBe(true);
  });

  it("returns false when nothing matches", (): void => {
    expect(matchesText("zzz", "invoice:read", "Billing", undefined)).toBe(false);
  });

  it("treats undefined haystacks as non-matching, not throwing", (): void => {
    expect(matchesText("x", undefined, undefined)).toBe(false);
  });
});
