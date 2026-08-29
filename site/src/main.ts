import "./style.css";
import { sampleFindings, terminalLines } from "./data";

const app = document.querySelector<HTMLDivElement>("#app")!;
const routeStatus = document.querySelector<HTMLDivElement>("#route-status")!;
const product = "API Handoff Audit";

type Route = "/" | "/demo" | "/privacy" | "/terms" | "/404";

const meta: Record<Route, { title: string; description: string; socialTitle: string; socialDescription: string }> = {
  "/": { title: "API Handoff Audit — check repository handoffs", description: "Find API handoff gaps, run named smoke requests, and write redacted reports.", socialTitle: "API Handoff Audit — check repository handoffs", socialDescription: "Find API handoff gaps, run named smoke requests, and write redacted reports." },
  "/demo": { title: "Demo — API Handoff Audit", description: "Inspect the bundled Parcel Lane API sample report.", socialTitle: "Demo — API Handoff Audit", socialDescription: "Inspect the bundled Parcel Lane API sample report." },
  "/privacy": { title: "Privacy — API Handoff Audit", description: "See how the local CLI handles repository data.", socialTitle: "Privacy — API Handoff Audit", socialDescription: "See how the local CLI handles repository data." },
  "/terms": { title: "Terms — API Handoff Audit", description: "Read the terms for using API Handoff Audit.", socialTitle: "Terms — API Handoff Audit", socialDescription: "Read the terms for using API Handoff Audit." },
  "/404": { title: "Page not found — API Handoff Audit", description: "Return to API Handoff Audit.", socialTitle: "Page not found — API Handoff Audit", socialDescription: "Return to API Handoff Audit." },
};

function shell(content: string, demo = false): string {
  return `${demo ? demoBanner() : ""}
    <header class="site-header">
      <a class="wordmark route-link" href="/" aria-label="API Handoff Audit home"><span aria-hidden="true">//</span> HANDOFF AUDIT</a>
      <nav aria-label="Main navigation">
        <a class="route-link" href="/demo">Demo</a>
        <a href="/#how">How it works</a>
        <a class="route-link" href="/privacy">Privacy</a>
      </nav>
    </header>
    <main id="main" tabindex="-1">${content}</main>
    <footer>
      <div><b>${product}</b><p>Check an API repository before a teammate inherits it.</p></div>
      <div class="footer-links"><a class="route-link" href="/privacy">Privacy</a><a class="route-link" href="/terms">Terms</a><a href="https://hello-factory.sociobot.in" rel="external">Built by Param Factory <span class="sr-only">(external)</span></a></div>
      <p class="build">v0.1.0 · build 2026.08.29</p>
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
    <div class="hero-copy"><h1>Check an API repository before handoff</h1><p class="lede">For teams giving a shared API workflow to a new contributor.</p>
      <div class="hero-action"><a class="button primary route-link" href="/demo?demo=1">Try it with sample data</a><span>See the sample report and its one finding.</span></div>
      <ul class="plain-facts"><li><span aria-hidden="true">◇</span> Free local audit.</li><li><span aria-hidden="true">◇</span> No account needed.</li><li><span aria-hidden="true">◇</span> Reports hide variable values.</li></ul>
    </div>
  </section>
  <section class="preview" aria-labelledby="preview-title"><div class="section-label"><span>Sample CLI output</span><h2 id="preview-title">Sample audit finding</h2><p>The bundled repository contains a request that uses an undocumented variable.</p></div>${terminal()}</section>
  <section id="how" class="steps" aria-labelledby="how-title"><p class="eyebrow">Three checks, one report</p><h2 id="how-title">How the handoff audit works</h2><ol>
    <li><span>01</span><div><h3>Scan the repository</h3><p>Point the CLI at Bruno, Postman, or <code>.http</code> files in Git.</p></div></li>
    <li><span>02</span><div><h3>Name one smoke request</h3><p>Choose a configured local or staging target. The CLI sends only that request.</p></div></li>
    <li><span>03</span><div><h3>Share the redacted report</h3><p>Write terminal, JSON, or HTML output without variable values or response bodies.</p></div></li>
  </ol></section>
  <section class="boundaries" aria-labelledby="boundaries-title"><div><p class="eyebrow">What the audit does not do</p><h2 id="boundaries-title">Your repository stays the workspace</h2></div><div><p>The audit reads local text files. It has no telemetry.</p><p>A smoke run contacts only the target you select. It never follows a redirect.</p></div></section>
  `);
}

let demoShowsCorrectedConfig = false;
function demo(): string {
  const findings = demoShowsCorrectedConfig ? [] : sampleFindings;
  const corrected = demoShowsCorrectedConfig ? `<section class="recorded-rerun" aria-labelledby="rerun-title"><p class="eyebrow">Recorded example after a repository edit</p><h3 id="rerun-title" tabindex="-1">Corrected handoff-audit.toml</h3><pre tabindex="0" aria-label="Corrected sample configuration">[[variables]]
name = "WAREHOUSE_ID"
description = "Order warehouse identifier"
required = true</pre><p>The CLI does not make this edit. This recorded rerun shows the report after you add it.</p><div class="rerun-pass"><b>Recorded CLI rerun</b><strong>PASS</strong><span>No handoff gaps found.</span></div></section>` : "";
  return shell(`<section class="page-heading demo-heading"><p class="eyebrow">Bundled repository / Parcel Lane API</p><h1>Inspect a sample handoff report</h1><p>This is recorded output from <code>api-handoff-audit demo</code>.</p></section>
    <section class="audit-board" aria-labelledby="audit-state">
      <div class="audit-summary"><div><span>HANDOFF STATE</span><h2 id="audit-state" tabindex="-1">Needs one fix</h2></div><strong>1 ERROR</strong></div>
      <dl class="audit-counts"><div><dt>Files</dt><dd>3</dd></div><div><dt>Setup steps</dt><dd>2</dd></div><div><dt>Fixtures</dt><dd>1</dd></div><div><dt>Smoke requests</dt><dd>2</dd></div></dl>
      <div class="repo-layout"><div class="repo-tree"><h3>Repository</h3><ul><li>handoff-audit.toml</li><li>requests/health.bru</li><li class="active">requests/create-order.http</li><li>fixtures/order.json</li></ul></div><div class="finding-list"><h3>Findings</h3>${findings.length ? findings.map(f => `<article class="finding"><div><span>${f.code} · ERROR</span><code>${f.file}</code></div><h4>${f.message}</h4><p>${f.next}</p><button data-show-corrected>Show the corrected config</button></article>`).join("") : ""}${corrected}</div></div>
      <p class="report-note">The report contains variable names and states. It excludes values and response bodies.</p>
    </section>
    <section class="demo-terminal"><h2>Replay the real CLI output</h2>${terminal()}</section>`, true);
}

function privacy(): string {
  return shell(`<article class="legal"><p class="eyebrow">Effective 29 August 2026</p><h1>Your repository data stays local</h1><p class="lede">The CLI has no account, telemetry, or hosted workspace.</p><h2>What the CLI reads</h2><p>The audit reads supported text files inside the repository you name. It reads a chosen environment file when you pass <code>--env-file</code>.</p><h2>What a smoke run sends</h2><p>A smoke run sends one named request to the local or staging target you select. The CLI does not follow redirects.</p><h2>What reports contain</h2><p>Reports include variable names, file paths, status codes, and finding text. Reports exclude variable values and response bodies.</p><h2>Contact</h2><p>Email <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a> for privacy questions.</p></article>`);
}

function terms(): string {
  return shell(`<article class="legal"><p class="eyebrow">Effective 29 August 2026</p><h1>Use the audit with systems you control</h1><p class="lede">These terms cover the free API Handoff Audit CLI.</p><h2>License</h2><p>The CLI source is available under the MIT License. You remain responsible for repository and target access.</p><h2>Limits</h2><p>The software is provided without warranty. Do not use it against a target you do not control or have permission to test.</p><h2>Contact</h2><p>Email <a href="mailto:support@sociobot.in">support@sociobot.in</a> for support.</p></article>`);
}

function notFound(): string {
  return shell(`<section class="not-found"><p class="eyebrow">STALL CLOSED / 404</p><h1>This route has no request file</h1><p>The page may have moved, or the address has a typo.</p><a class="button primary route-link" href="/">Return to the audit</a></section>`);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}

function currentRoute(): Route {
  if (new URLSearchParams(window.location.search).get("demo") === "1") return "/demo";
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  return (["/", "/demo", "/privacy", "/terms", "/404"] as Route[]).includes(path as Route) ? path as Route : "/404";
}

function render(focus = false): void {
  const route = currentRoute();
  const renderers: Record<Route, () => string> = { "/": home, "/demo": demo, "/privacy": privacy, "/terms": terms, "/404": notFound };
  app.innerHTML = renderers[route]();
  document.title = meta[route].title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')!.content = meta[route].description;
  const canonical = `https://api-handoff-audit.sociobot.in${route}`;
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')!.href = canonical;
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')!.content = meta[route].socialTitle;
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')!.content = meta[route].socialDescription;
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')!.content = canonical;
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')!.content = meta[route].socialTitle;
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')!.content = meta[route].socialDescription;
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
    const target = new URL(link.href);
    navigate(`${target.pathname}${target.search}`);
  }));
  document.querySelectorAll<HTMLButtonElement>("[data-replay]").forEach(button => button.addEventListener("click", () => {
    const pre = button.closest(".terminal")?.querySelector("pre");
    pre?.classList.remove("playing");
    requestAnimationFrame(() => pre?.classList.add("playing"));
    button.textContent = "Replaying";
    window.setTimeout(() => { button.textContent = "Replay output"; }, 1900);
  }));
  document.querySelector<HTMLButtonElement>("[data-show-corrected]")?.addEventListener("click", () => { demoShowsCorrectedConfig = true; render(false); document.querySelector<HTMLElement>("#rerun-title")?.focus(); });
  document.querySelector<HTMLButtonElement>("[data-reset-demo]")?.addEventListener("click", () => { demoShowsCorrectedConfig = false; render(false); document.querySelector<HTMLElement>("#audit-state")?.focus(); });
}

window.addEventListener("popstate", () => render(true));

render(false);
