import "./style.css";
import { ciPresets, ciWorkflow, sampleFindings, terminalLines } from "./data";
import { cachedUnlock, cachedVerdict, captureLicense, savePastedLicense, verifyLicense } from "./license";

const app = document.querySelector<HTMLDivElement>("#app")!;
const routeStatus = document.querySelector<HTMLDivElement>("#route-status")!;
const product = "API Handoff Audit";

type Route = "/" | "/demo" | "/privacy" | "/terms" | "/ci-pack" | "/404";

const meta: Record<Route, { title: string; description: string }> = {
  "/": { title: "API Handoff Audit — check a repository handoff", description: "Find missing API variables and setup gaps, run named smoke requests, and share a redacted handoff report." },
  "/demo": { title: "Demo — API Handoff Audit", description: "Inspect the bundled Parcel Lane API handoff report." },
  "/privacy": { title: "Privacy — API Handoff Audit", description: "How API Handoff Audit handles repository data and licenses." },
  "/terms": { title: "Terms — API Handoff Audit", description: "Terms for using API Handoff Audit and its optional CI Pack." },
  "/ci-pack": { title: "CI Pack — API Handoff Audit", description: "Verify a CI Pack license and copy the audit workflow." },
  "/404": { title: "Page not found — API Handoff Audit", description: "Return to API Handoff Audit." },
};

function shell(content: string, demo = false): string {
  return `${demo ? demoBanner() : ""}
    <header class="site-header">
      <a class="wordmark route-link" href="/" aria-label="API Handoff Audit home"><span aria-hidden="true">//</span> HANDOFF AUDIT</a>
      <nav aria-label="Main navigation">
        <a class="route-link" href="/demo">Demo</a>
        <a href="/#how">How it works</a>
        <a class="route-link" href="/ci-pack">CI Pack</a>
        <a class="route-link" href="/privacy">Privacy</a>
      </nav>
    </header>
    <main id="main" tabindex="-1">${content}</main>
    <footer>
      <div><b>${product}</b><p>Check an API repository before a teammate inherits it.</p></div>
      <div class="footer-links"><a class="route-link" href="/privacy">Privacy</a><a class="route-link" href="/terms">Terms</a><a href="https://hello-factory.sociobot.in" rel="external">Built by Param Factory <span class="sr-only">(external)</span></a></div>
      <p class="build">v0.1.0 · build 2026.08.28</p>
    </footer>`;
}

function demoBanner(): string {
  return `<aside class="demo-banner" aria-label="Demo mode"><span><b>Demo</b> — sample data, nothing is saved</span><div><button data-reset-demo>Reset demo</button><a class="route-link" href="/">Start for real</a></div></aside>`;
}

function terminal(): string {
  return `<div class="terminal" role="region" aria-label="Recorded terminal output">
    <div class="terminal-bar"><span aria-hidden="true">● ● ●</span><b>parcel-lane / audit</b><button data-replay>Replay output</button></div>
    <pre tabindex="0" aria-label="API Handoff Audit demo output">${terminalLines.map(line => `<span>${escapeHtml(line) || "&nbsp;"}</span>`).join("\n")}</pre>
  </div>`;
}

function home(): string {
  return shell(`<section class="hero">
    <div class="hero-art"><picture><source media="(max-width: 640px)" srcset="/assets/hero-market-768.webp"><img src="/assets/hero-market-1280.webp" width="1280" height="853" alt="API files and checklists hang like signs in a night-market inspection lane." fetchpriority="high"></picture></div>
    <div class="hero-copy"><p class="eyebrow">A preflight check for API repositories</p><h1>Check an API handoff before it stalls</h1><p class="lede">For small teams giving a shared API workflow to a new contributor.</p>
      <div class="hero-action"><a class="button primary route-link" href="/demo">Try it with sample data</a><span>See a complete audit with one real gap.</span></div>
      <ul class="plain-facts"><li><span aria-hidden="true">◇</span> Free local audit.</li><li><span aria-hidden="true">◇</span> No account needed.</li><li><span aria-hidden="true">◇</span> Reports hide variable values.</li></ul>
    </div>
  </section>
  <section class="preview" aria-labelledby="preview-title"><div class="section-label"><span>LIVE PREVIEW / 01</span><h2 id="preview-title">See the gap before your teammate does</h2><p>The bundled repository contains a request that uses an undocumented variable.</p></div>${terminal()}</section>
  <section id="how" class="steps" aria-labelledby="how-title"><p class="eyebrow">Three checks, one report</p><h2 id="how-title">How the handoff audit works</h2><ol>
    <li><span>01</span><div><h3>Scan the repository</h3><p>Point the CLI at Bruno, Postman, or <code>.http</code> files in Git.</p></div></li>
    <li><span>02</span><div><h3>Name one smoke request</h3><p>Choose a configured local or staging target. The CLI sends only that request.</p></div></li>
    <li><span>03</span><div><h3>Share the redacted report</h3><p>Write terminal, JSON, or HTML output without variable values or response bodies.</p></div></li>
  </ol></section>
  <section class="boundaries" aria-labelledby="boundaries-title"><div><p class="eyebrow">A checker, not another client</p><h2 id="boundaries-title">Your repository stays the workspace</h2></div><div><p>The audit reads local text files. It has no telemetry and no hosted workspace.</p><p>A smoke run contacts only the target you select. It never follows a redirect.</p><p>It does not design APIs, edit requests, or store credentials.</p></div></section>
  ${paidSection()}`);
}

function paidSection(): string {
  return `<section class="paid" aria-labelledby="paid-title"><div class="price"><span>CI PACK</span><strong>$39</strong><small>one-time purchase</small></div><div><h2 id="paid-title">Add the handoff check to pull requests</h2><p>The free CLI includes every local audit and report format.</p><p>The CI Pack adds two policy presets and a GitHub Actions starter.</p><div class="button-row"><a class="button buy" href="https://api.sociobot.in/api/v1/products/api-handoff-audit/checkout">Buy the CI Pack <span class="sr-only">through Sociobot checkout</span></a><a class="text-link route-link" href="/ci-pack">Restore a license</a></div><small>Sociobot is the merchant of record. Refunds are handled there.</small></div></section>`;
}

let demoResolved = false;
function demo(): string {
  const findings = demoResolved ? [] : sampleFindings;
  return shell(`<section class="page-heading demo-heading"><p class="eyebrow">Bundled repository / Parcel Lane API</p><h1>Inspect a sample handoff report</h1><p>This is the output from <code>api-handoff-audit demo</code>.</p></section>
    <section class="audit-board ${demoResolved ? "is-pass" : ""}" aria-labelledby="audit-state">
      <div class="audit-summary"><div><span>HANDOFF STATE</span><h2 id="audit-state" tabindex="-1">${demoResolved ? "Ready to hand off" : "Needs one fix"}</h2></div><strong>${demoResolved ? "PASS" : "1 ERROR"}</strong></div>
      <dl class="audit-counts"><div><dt>Files</dt><dd>3</dd></div><div><dt>Setup steps</dt><dd>2</dd></div><div><dt>Fixtures</dt><dd>1</dd></div><div><dt>Smoke requests</dt><dd>2</dd></div></dl>
      <div class="repo-layout"><div class="repo-tree"><h3>Repository</h3><ul><li>handoff-audit.toml</li><li>requests/health.bru</li><li class="active">requests/create-order.http</li><li>fixtures/order.json</li></ul></div><div class="finding-list"><h3>Findings</h3>${findings.length ? findings.map(f => `<article class="finding"><div><span>${f.code} · ERROR</span><code>${f.file}</code></div><h4>${f.message}</h4><p>${f.next}</p><button data-resolve>Mark documented</button></article>`).join("") : `<div class="empty-state"><b>✓ No handoff gaps found</b><p>Reset the demo to inspect the original finding.</p></div>`}</div></div>
      <p class="report-note">The report contains variable names and states. It excludes values and response bodies.</p>
    </section>
    <section class="demo-terminal"><h2>Replay the real CLI output</h2>${terminal()}</section>`, true);
}

function privacy(): string {
  return shell(`<article class="legal"><p class="eyebrow">Effective 28 August 2026</p><h1>Your repository data stays local</h1><p class="lede">The CLI has no account, telemetry, or hosted workspace.</p><h2>What the CLI reads</h2><p>The audit reads supported text files inside the repository you name. It reads a chosen environment file when you pass <code>--env-file</code>.</p><h2>What a smoke run sends</h2><p>A smoke run sends one named request to the local or staging target you select. The CLI does not follow redirects.</p><h2>What reports contain</h2><p>Reports include variable names, file paths, status codes, and finding text. Reports exclude variable values and response bodies.</p><h2>License checks</h2><p>The site stores a CI Pack license and its last verdict in your browser. Verification sends that token to <code>api.sociobot.in</code> at most once each day.</p><h2>Contact</h2><p>Email <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a> for privacy questions.</p></article>`);
}

function terms(): string {
  return shell(`<article class="legal"><p class="eyebrow">Effective 28 August 2026</p><h1>Use the audit with systems you control</h1><p class="lede">These terms cover the free CLI and the optional CI Pack.</p><h2>License</h2><p>The CLI source is available under the MIT License. You remain responsible for repository and target access.</p><h2>CI Pack purchase</h2><p>The CI Pack costs $39 as a one-time purchase. It includes two policy presets and a GitHub Actions starter.</p><h2>Payments and refunds</h2><p>Sociobot is the merchant of record. A refund revokes the related license.</p><h2>Limits</h2><p>The software is provided without warranty. Do not use it against a target you do not control or have permission to test.</p><h2>Contact</h2><p>Email <a href="mailto:support@sociobot.in">support@sociobot.in</a> for purchase help.</p></article>`);
}

function ciPack(): string {
  const unlocked = cachedUnlock();
  return shell(`<section class="page-heading"><p class="eyebrow">Optional paid add-on</p><h1>Add handoff checks to pull requests</h1><p>The CI Pack costs $39 once. The free CLI remains complete.</p></section>
    <section class="license-panel" aria-labelledby="license-title"><div><h2 id="license-title">${unlocked ? "CI Pack is active" : "Verify your CI Pack license"}</h2><p>${unlocked ? "Copy the workflow below into your repository." : "Paste the license from your purchase email. Verification uses Sociobot."}</p></div>
      <form id="license-form"><label for="license">License token</label><div><input id="license" name="license" autocomplete="off" spellcheck="false" required><button type="submit">Verify license</button></div><p id="license-status" role="status"></p></form>
      <a class="button buy" href="https://api.sociobot.in/api/v1/products/api-handoff-audit/checkout">Buy the CI Pack</a>
    </section>
    <section class="workflow ${unlocked ? "" : "locked"}" aria-labelledby="workflow-title"><div><h2 id="workflow-title">GitHub Actions starter</h2><p>${unlocked ? "Your workflow is ready to copy." : "Verify a license to reveal this workflow and two policy presets."}</p></div>${unlocked ? `<button data-copy-workflow>Copy workflow</button><pre tabindex="0" aria-label="GitHub Actions starter workflow"><code>${escapeHtml(ciWorkflow)}</code></pre><div class="policy-presets"><h2>Policy presets</h2>${ciPresets.map((preset, index) => `<article><h3>${preset.name}</h3><button data-copy-preset="${index}">Copy preset</button><pre tabindex="0" aria-label="${escapeHtml(preset.name)} policy preset"><code>${escapeHtml(preset.text)}</code></pre></article>`).join("")}</div>` : `<div class="lock-mark" aria-hidden="true">×</div>`}</section>
    <p class="fine-print">License data stays in this browser. See <a class="route-link" href="/privacy">Privacy</a> and <a class="route-link" href="/terms">Terms</a>.</p>`);
}

function notFound(): string {
  return shell(`<section class="not-found"><p class="eyebrow">STALL CLOSED / 404</p><h1>This route has no request file</h1><p>The page may have moved, or the address has a typo.</p><a class="button primary route-link" href="/">Return to the audit</a></section>`);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}

function currentRoute(): Route {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  return (["/", "/demo", "/privacy", "/terms", "/ci-pack", "/404"] as Route[]).includes(path as Route) ? path as Route : "/404";
}

function render(focus = false): void {
  const route = currentRoute();
  const renderers: Record<Route, () => string> = { "/": home, "/demo": demo, "/privacy": privacy, "/terms": terms, "/ci-pack": ciPack, "/404": notFound };
  app.innerHTML = renderers[route]();
  document.title = meta[route].title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')!.content = meta[route].description;
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')!.href = `https://api-handoff-audit.sociobot.in${route === "/404" ? "/404" : route}`;
  routeStatus.textContent = meta[route].title;
  bindActions();
  if (focus) {
    window.scrollTo(0, 0);
    const heading = document.querySelector<HTMLElement>("h1");
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }
}

function navigate(path: string): void {
  history.pushState({}, "", path);
  render(true);
}

function bindActions(): void {
  document.querySelectorAll<HTMLAnchorElement>("a.route-link").forEach(link => link.addEventListener("click", event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(new URL(link.href).pathname);
  }));
  document.querySelectorAll<HTMLButtonElement>("[data-replay]").forEach(button => button.addEventListener("click", () => {
    const pre = button.closest(".terminal")?.querySelector("pre");
    pre?.classList.remove("playing");
    requestAnimationFrame(() => pre?.classList.add("playing"));
    button.textContent = "Replaying";
    window.setTimeout(() => { button.textContent = "Replay output"; }, 1900);
  }));
  document.querySelector<HTMLButtonElement>("[data-resolve]")?.addEventListener("click", () => { demoResolved = true; render(false); document.querySelector<HTMLElement>("#audit-state")?.focus(); });
  document.querySelector<HTMLButtonElement>("[data-reset-demo]")?.addEventListener("click", () => { demoResolved = false; render(false); document.querySelector<HTMLElement>("#audit-state")?.focus(); });
  document.querySelector<HTMLButtonElement>("[data-copy-workflow]")?.addEventListener("click", async event => {
    await navigator.clipboard.writeText(ciWorkflow);
    (event.currentTarget as HTMLButtonElement).textContent = "Workflow copied";
  });
  document.querySelectorAll<HTMLButtonElement>("[data-copy-preset]").forEach(button => button.addEventListener("click", async () => {
    await navigator.clipboard.writeText(ciPresets[Number(button.dataset.copyPreset)].text);
    button.textContent = "Preset copied";
  }));
  document.querySelector<HTMLFormElement>("#license-form")?.addEventListener("submit", async event => {
    event.preventDefault();
    const input = document.querySelector<HTMLInputElement>("#license")!;
    const status = document.querySelector<HTMLParagraphElement>("#license-status")!;
    if (!input.value.trim()) { status.textContent = "Enter the license from your purchase email."; return; }
    status.textContent = "Checking the license…";
    savePastedLicense(input.value);
    try {
      const valid = await verifyLicense(input.value.trim());
      if (valid) render(false);
      else status.innerHTML = `This license is not active. <a href="https://api.sociobot.in/api/v1/products/api-handoff-audit/checkout">Buy the CI Pack</a>.`;
    } catch {
      status.textContent = "The license service did not answer. Check your connection and try again.";
    }
  });
}

window.addEventListener("popstate", () => render(true));

const returnedToken = captureLicense();
if (returnedToken && cachedVerdict() === null) {
  verifyLicense(returnedToken).then(() => { if (currentRoute() === "/ci-pack") render(false); }).catch(() => undefined);
}
render(false);
