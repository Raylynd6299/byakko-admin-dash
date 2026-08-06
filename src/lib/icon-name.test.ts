import { describe, expect, it } from "vitest";
import { normalizeIconName } from "./icon-name";

describe("normalizeIconName", (): void => {
  it("accepts a valid single-segment name", (): void => {
    expect(normalizeIconName("shield")).toBe("shield");
  });

  it("accepts a valid multi-segment name", (): void => {
    expect(normalizeIconName("a-arrow-down")).toBe("a-arrow-down");
  });

  it("lower-cases an uppercase name", (): void => {
    expect(normalizeIconName("Shield")).toBe("shield");
  });

  it("trims surrounding whitespace", (): void => {
    expect(normalizeIconName("  shield  ")).toBe("shield");
  });

  it("rejects a leading hyphen", (): void => {
    expect(normalizeIconName("-shield")).toBeNull();
  });

  it("rejects a trailing hyphen", (): void => {
    expect(normalizeIconName("shield-")).toBeNull();
  });

  it("rejects a doubled hyphen", (): void => {
    expect(normalizeIconName("a--arrow")).toBeNull();
  });

  it("rejects an empty string", (): void => {
    expect(normalizeIconName("")).toBeNull();
  });

  it("rejects whitespace-only input", (): void => {
    expect(normalizeIconName("   ")).toBeNull();
  });

  it("accepts exactly 1 character", (): void => {
    expect(normalizeIconName("a")).toBe("a");
  });

  it("accepts exactly 64 characters", (): void => {
    const name = `a${"-b".repeat(31)}a`; // 1 + 62 + 1 = 64 chars, valid kebab shape
    expect(name).toHaveLength(64);
    expect(normalizeIconName(name)).toBe(name);
  });

  it("rejects 65 characters", (): void => {
    const name = "a".repeat(65);
    expect(normalizeIconName(name)).toBeNull();
  });

  it("rejects non-ASCII input", (): void => {
    expect(normalizeIconName("scud\u00e9")).toBeNull();
    expect(normalizeIconName("\u76fe")).toBeNull();
  });
});
