import { describe, expect, it } from "vitest";
import { sampleFindings, terminalLines } from "./data";

describe("bundled demo data", () => {
  it("shows the documented handoff gap without including a sample secret", () => {
    expect(sampleFindings).toEqual([expect.objectContaining({ code: "VAR001", file: "requests/create-order.http" })]);
    expect(terminalLines.join("\n")).toContain("WAREHOUSE_ID is used but not documented.");
    expect(terminalLines.join("\n")).not.toContain("sample-token-never-reported");
  });
});
