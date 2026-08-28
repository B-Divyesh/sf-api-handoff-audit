import { beforeEach, describe, expect, it, vi } from "vitest";
import { cachedVerdict, captureLicense, LICENSE_KEY, savePastedLicense, VERDICT_KEY, verifyLicense } from "./license";

const store = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
  },
});
Object.defineProperty(globalThis, "history", { value: { replaceState: vi.fn() } });

describe("license storage", () => {
  beforeEach(() => store.clear());

  it("captures a returned license and removes it from the URL", () => {
    expect(captureLicense(new URL("https://example.test/ci-pack?license=paid_token"))).toBe("paid_token");
    expect(store.get(LICENSE_KEY)).toBe("paid_token");
    expect(history.replaceState).toHaveBeenCalledWith({}, "", "/ci-pack");
  });

  it("stores only the license after a valid verification", async () => {
    savePastedLicense(" license_token ");
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ valid: true }) });
    await expect(verifyLicense("license_token", fetcher)).resolves.toBe(true);
    expect(fetcher.mock.calls[0][0]).toContain("license=license_token");
    expect(JSON.parse(store.get(VERDICT_KEY) ?? "{}").valid).toBe(true);
    expect(cachedVerdict()).toBe(true);
  });
});
