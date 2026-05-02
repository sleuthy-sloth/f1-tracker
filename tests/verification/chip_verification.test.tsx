import { describe, test, expect } from "bun:test";
import { readFileSync } from "fs";
import path from "path";

const chipPath = path.resolve(import.meta.dir, "../../components/ui/Chip.tsx");
const chipSource = readFileSync(chipPath, "utf8");

describe("Chip component verification", () => {
  test("Imports and Chip is a function", async () => {
    const mod = await import("../../components/ui/Chip");
    expect(typeof mod.Chip).toBe("function");
  });

  test("Variant strings exist: tyre, status, default", () => {
    expect(chipSource).toContain('"tyre"');
    expect(chipSource).toContain('"status"');
    expect(chipSource).toContain('"default"');
  });

  test("All 11 color options exist", () => {
    const colors = ["soft", "medium", "hard", "intermediate", "wet", "red", "green", "yellow", "blue", "gray", "white"];
    for (const c of colors) {
      expect(chipSource).toContain(`"${c}"`);
    }
  });

  test("Both size strings exist: sm, md", () => {
    expect(chipSource).toContain('"sm"');
    expect(chipSource).toContain('"md"');
  });

  test("Tyre soft color uses bg-[#e10600]", () => {
    expect(chipSource).toContain("bg-[#e10600]");
  });

  test("Status red uses bg-red-900/60", () => {
    expect(chipSource).toContain("bg-red-900/60");
  });

  test("Dismissible button renders X icon", () => {
    expect(chipSource).toContain("dismissible");
    expect(chipSource).toContain("M6 18L18 6");
  });

  test("Dismiss button has aria-label", () => {
    expect(chipSource).toMatch(/aria-label/);
  });

  test("cn() utility exists with filter(Boolean)", () => {
    expect(chipSource).toContain("filter(Boolean)");
  });

  test("fallback default style exists for invalid color combo", () => {
    expect(chipSource).toContain('variantStyle = "bg-white/10 text-f1-silver"');
  });
});
