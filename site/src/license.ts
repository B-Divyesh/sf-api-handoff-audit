export const LICENSE_KEY = "sb_license:api-handoff-audit";
export const VERDICT_KEY = "sb_license_verdict:api-handoff-audit";
export const VERIFY_URL = "https://api.sociobot.in/api/v1/products/api-handoff-audit/verify";

type Verdict = { valid: boolean; checkedAt: number };

export function captureLicense(url = new URL(window.location.href)): string | null {
  const token = url.searchParams.get("license");
  if (!token) return localStorage.getItem(LICENSE_KEY);
  localStorage.setItem(LICENSE_KEY, token);
  url.searchParams.delete("license");
  history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  return token;
}

export function cachedUnlock(now = Date.now()): boolean {
  return cachedVerdict(now) === true;
}

export function cachedVerdict(now = Date.now()): boolean | null {
  const raw = localStorage.getItem(VERDICT_KEY);
  if (!raw) return null;
  try {
    const verdict = JSON.parse(raw) as Verdict;
    return now - verdict.checkedAt < 86_400_000 ? verdict.valid : null;
  } catch {
    return null;
  }
}

export async function verifyLicense(token: string, fetcher = fetch): Promise<boolean> {
  const response = await fetcher(`${VERIFY_URL}?license=${encodeURIComponent(token)}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("The license service did not answer.");
  const data = (await response.json()) as { valid?: boolean };
  const valid = data.valid === true;
  localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid, checkedAt: Date.now() }));
  return valid;
}

export function savePastedLicense(token: string): void {
  localStorage.setItem(LICENSE_KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
}
