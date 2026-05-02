import { describe, test, expect } from "bun:test";
import { readFileSync } from "fs";
import path from "path";
import { renderToString } from "react-dom/server";
import React from "react";

const inputPath = path.resolve(import.meta.dir, "../../components/ui/Input.tsx");

describe("Input component verification", () => {
  test("Input is exported as a named export", async () => {
    const mod = await import("../../components/ui/Input");
    expect(typeof mod.Input).toBe("function");
  });

  test("Source contains all 3 size strings: sm, md, lg", () => {
    const src = readFileSync(inputPath, "utf8");
    expect(src).toContain('"sm"');
    expect(src).toContain('"md"');
    expect(src).toContain('"lg"');
  });

  test("Source contains F1 Red focus ring (ring-f1-red/20)", () => {
    const src = readFileSync(inputPath, "utf8");
    expect(src).toContain("ring-f1-red/20");
  });

  test("Source contains error state border (border-red-500/50)", () => {
    const src = readFileSync(inputPath, "utf8");
    expect(src).toContain("border-red-500/50");
  });

  test("Source contains icon offset classes (pl-9, pr-9)", () => {
    const src = readFileSync(inputPath, "utf8");
    expect(src).toContain("pl-9");
    expect(src).toContain("pr-9");
  });

  test("Source contains fullWidth → w-full", () => {
    const src = readFileSync(inputPath, "utf8");
    expect(src).toContain("w-full");
  });

  test("Source contains aria-invalid", () => {
    const src = readFileSync(inputPath, "utf8");
    expect(src).toContain("aria-invalid");
  });

  test("Source contains aria-describedby", () => {
    const src = readFileSync(inputPath, "utf8");
    expect(src).toContain("aria-describedby");
  });

  test("Source contains useId() for unique ID generation", () => {
    const src = readFileSync(inputPath, "utf8");
    expect(src).toContain("useId(");
    expect(src).toContain("useId()");
  });

  test("Source contains htmlFor for label-input linkage", () => {
    const src = readFileSync(inputPath, "utf8");
    expect(src).toContain("htmlFor");
  });
});
