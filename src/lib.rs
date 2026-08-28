use regex::Regex;
use reqwest::blocking::Client;
use reqwest::redirect::Policy;
use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, BTreeSet};
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use url::Url;
use walkdir::{DirEntry, WalkDir};

pub const CONFIG_FILE: &str = "handoff-audit.toml";

#[derive(Debug, Clone, Deserialize)]
pub struct Config {
    pub version: u8,
    pub project: String,
    #[serde(default)]
    pub setup_steps: Vec<String>,
    #[serde(default)]
    pub variables: Vec<Variable>,
    #[serde(default)]
    pub fixtures: Vec<Fixture>,
    #[serde(default)]
    pub targets: Targets,
    #[serde(default)]
    pub smoke: Vec<Smoke>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Variable {
    pub name: String,
    #[serde(default)]
    pub description: String,
    #[serde(default = "yes")]
    pub required: bool,
    #[serde(default)]
    pub secret: bool,
    pub default: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Fixture {
    pub path: String,
    #[serde(default)]
    pub description: String,
}

#[derive(Debug, Clone, Default, Deserialize)]
pub struct Targets {
    pub local: Option<Target>,
    pub staging: Option<Target>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Target {
    pub base_url: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Smoke {
    pub name: String,
    pub request: String,
    #[serde(default = "ok_status")]
    pub expect_status: Vec<u16>,
}

fn yes() -> bool {
    true
}
fn ok_status() -> Vec<u16> {
    vec![200]
}

#[derive(Debug, Clone, Serialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Severity {
    Error,
    Warning,
}

#[derive(Debug, Clone, Serialize)]
pub struct Finding {
    pub code: String,
    pub severity: Severity,
    pub message: String,
    pub next_step: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub file: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct VariableState {
    pub name: String,
    pub state: String,
    pub required: bool,
    pub secret: bool,
    pub used_by: Vec<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct SmokeResult {
    pub name: String,
    pub target: String,
    pub request_file: String,
    pub expected_status: Vec<u16>,
    pub actual_status: Option<u16>,
    pub passed: bool,
    pub detail: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct Report {
    pub schema_version: u8,
    pub project: String,
    pub scanned_files: usize,
    pub setup_steps: usize,
    pub variables: Vec<VariableState>,
    pub fixtures_checked: usize,
    pub smoke_requests: usize,
    pub findings: Vec<Finding>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub smoke_result: Option<SmokeResult>,
}

impl Report {
    pub fn passed(&self) -> bool {
        self.findings.iter().all(|f| f.severity != Severity::Error)
            && self.smoke_result.as_ref().map(|s| s.passed).unwrap_or(true)
    }
}

pub fn load_config(root: &Path) -> Result<Config, String> {
    let path = root.join(CONFIG_FILE);
    let text = fs::read_to_string(&path).map_err(|_| {
        format!(
            "{} was not found. Add it at the repository root.",
            CONFIG_FILE
        )
    })?;
    let config: Config =
        toml::from_str(&text).map_err(|e| format!("{} could not be read: {e}", path.display()))?;
    if config.version != 1 {
        return Err(format!(
            "Unsupported config version {}. Use version = 1.",
            config.version
        ));
    }
    if config.project.trim().is_empty() {
        return Err("The config project name is empty. Add project = \"Your API\".".into());
    }
    Ok(config)
}

pub fn load_values(env_file: Option<&Path>) -> Result<BTreeMap<String, String>, String> {
    let mut values: BTreeMap<String, String> = env::vars().collect();
    if let Some(path) = env_file {
        let text = fs::read_to_string(path)
            .map_err(|e| format!("Environment file {} could not be read: {e}", path.display()))?;
        for (line_no, raw) in text.lines().enumerate() {
            let line = raw.trim();
            if line.is_empty() || line.starts_with('#') {
                continue;
            }
            let Some((name, value)) = line.split_once('=') else {
                return Err(format!(
                    "Environment file line {} needs NAME=value.",
                    line_no + 1
                ));
            };
            let name = name.trim();
            if name.is_empty() {
                return Err(format!(
                    "Environment file line {} has an empty name.",
                    line_no + 1
                ));
            }
            values.insert(name.to_owned(), unquote(value.trim()).to_owned());
        }
    }
    Ok(values)
}

fn unquote(value: &str) -> &str {
    if value.len() >= 2
        && ((value.starts_with('"') && value.ends_with('"'))
            || (value.starts_with('\'') && value.ends_with('\'')))
    {
        &value[1..value.len() - 1]
    } else {
        value
    }
}

fn is_source(entry: &DirEntry) -> bool {
    if entry.file_type().is_dir() {
        let name = entry.file_name().to_string_lossy();
        return !matches!(
            name.as_ref(),
            ".git" | "node_modules" | "target" | "dist" | ".idea"
        );
    }
    matches!(
        entry.path().extension().and_then(|x| x.to_str()),
        Some("bru" | "http" | "json")
    )
}

pub fn audit(
    root: &Path,
    config: &Config,
    supplied: &BTreeMap<String, String>,
) -> Result<Report, String> {
    let root = root
        .canonicalize()
        .map_err(|e| format!("Repository {} could not be opened: {e}", root.display()))?;
    let curly = Regex::new(r"\{\{\s*([A-Za-z_][A-Za-z0-9_.-]*)\s*\}\}").unwrap();
    let shell = Regex::new(r"\$\{([A-Za-z_][A-Za-z0-9_]*)\}").unwrap();
    let dotenv = Regex::new(r"\$dotenv[.:\s]+([A-Za-z_][A-Za-z0-9_]*)").unwrap();
    let mut refs: BTreeMap<String, BTreeSet<String>> = BTreeMap::new();
    let mut scanned = 0;
    for entry in WalkDir::new(&root)
        .follow_links(false)
        .into_iter()
        .filter_entry(is_source)
    {
        let entry = entry.map_err(|e| format!("Repository scan failed: {e}"))?;
        if !entry.file_type().is_file() {
            continue;
        }
        let Ok(text) = fs::read_to_string(entry.path()) else {
            continue;
        };
        scanned += 1;
        let relative = entry
            .path()
            .strip_prefix(&root)
            .unwrap_or(entry.path())
            .to_string_lossy()
            .replace('\\', "/");
        for regex in [&curly, &shell, &dotenv] {
            for cap in regex.captures_iter(&text) {
                let name = cap[1].to_owned();
                if name != "BASE_URL" {
                    refs.entry(name).or_default().insert(relative.clone());
                }
            }
        }
    }

    let declared: BTreeMap<&str, &Variable> = config
        .variables
        .iter()
        .map(|v| (v.name.as_str(), v))
        .collect();
    let mut findings = Vec::new();
    if config.setup_steps.is_empty() {
        findings.push(finding(
            "SETUP001",
            Severity::Error,
            "No setup steps are documented.",
            "Add setup_steps to handoff-audit.toml.",
            None,
        ));
    }
    if config.smoke.is_empty() {
        findings.push(finding(
            "SMOKE001",
            Severity::Error,
            "No smoke requests are named.",
            "Add a [[smoke]] entry for the first request a teammate should run.",
            None,
        ));
    }
    for (name, files) in &refs {
        if !declared.contains_key(name.as_str()) {
            findings.push(finding(
                "VAR001",
                Severity::Error,
                &format!("{name} is used but not documented."),
                &format!("Add {name} under [[variables]] in handoff-audit.toml."),
                files.iter().next().cloned(),
            ));
        }
    }
    let mut variable_states = Vec::new();
    for variable in &config.variables {
        let available = supplied.get(&variable.name).is_some_and(|v| !v.is_empty())
            || variable.default.as_ref().is_some_and(|v| !v.is_empty());
        if variable.secret && variable.default.is_some() {
            findings.push(finding(
                "VAR003",
                Severity::Error,
                &format!("{} is secret but has a default value.", variable.name),
                "Remove the default and provide the value through the environment.",
                Some(CONFIG_FILE.into()),
            ));
        }
        if variable.required && !available {
            findings.push(finding(
                "VAR002",
                Severity::Error,
                &format!("{} is required but no value is available.", variable.name),
                &format!(
                    "Set {} in the process environment or pass --env-file.",
                    variable.name
                ),
                None,
            ));
        }
        variable_states.push(VariableState {
            name: variable.name.clone(),
            state: if available { "set" } else { "missing" }.into(),
            required: variable.required,
            secret: variable.secret,
            used_by: refs
                .get(&variable.name)
                .map(|s| s.iter().cloned().collect())
                .unwrap_or_default(),
        });
    }
    for fixture in &config.fixtures {
        if !safe_existing_child(&root, &fixture.path).is_some_and(|p| p.is_file()) {
            findings.push(finding(
                "FIX001",
                Severity::Error,
                &format!("Fixture {} is missing.", fixture.path),
                "Add the fixture or remove its config entry.",
                Some(fixture.path.clone()),
            ));
        }
    }
    for smoke in &config.smoke {
        if !safe_existing_child(&root, &smoke.request).is_some_and(|p| p.is_file()) {
            findings.push(finding(
                "SMOKE002",
                Severity::Error,
                &format!("Smoke request {} is missing.", smoke.request),
                "Add the request file or correct its [[smoke]] path.",
                Some(smoke.request.clone()),
            ));
        }
    }
    findings.sort_by(|a, b| a.code.cmp(&b.code).then(a.message.cmp(&b.message)));
    Ok(Report {
        schema_version: 1,
        project: config.project.clone(),
        scanned_files: scanned,
        setup_steps: config.setup_steps.len(),
        variables: variable_states,
        fixtures_checked: config.fixtures.len(),
        smoke_requests: config.smoke.len(),
        findings,
        smoke_result: None,
    })
}

fn safe_child(root: &Path, relative: &str) -> Option<PathBuf> {
    let path = Path::new(relative);
    if path.is_absolute()
        || path
            .components()
            .any(|c| matches!(c, std::path::Component::ParentDir))
    {
        return None;
    }
    Some(root.join(path))
}

fn safe_existing_child(root: &Path, relative: &str) -> Option<PathBuf> {
    let child = safe_child(root, relative)?;
    let canonical_root = root.canonicalize().ok()?;
    let canonical_child = child.canonicalize().ok()?;
    canonical_child
        .starts_with(&canonical_root)
        .then_some(canonical_child)
}

fn finding(
    code: &str,
    severity: Severity,
    message: &str,
    next: &str,
    file: Option<String>,
) -> Finding {
    Finding {
        code: code.into(),
        severity,
        message: message.into(),
        next_step: next.into(),
        file,
    }
}

#[derive(Debug)]
struct ParsedRequest {
    method: String,
    url: String,
    headers: Vec<(String, String)>,
    body: String,
}

fn parse_request(text: &str) -> Result<ParsedRequest, String> {
    if text.lines().any(|line| {
        matches!(
            line.trim().trim_end_matches(" {"),
            "get" | "post" | "put" | "patch" | "delete" | "head" | "options"
        )
    }) {
        return parse_bruno_request(text);
    }
    let mut lines = text.lines();
    let first = lines
        .by_ref()
        .find(|l| !l.trim().is_empty() && !l.trim().starts_with('#'))
        .ok_or("The request file is empty.")?;
    let (method, url) = first
        .trim()
        .split_once(char::is_whitespace)
        .ok_or("The first request line needs METHOD URL.")?;
    let mut headers = Vec::new();
    let mut body_lines = Vec::new();
    let mut in_body = false;
    for line in lines {
        if !in_body && line.trim().is_empty() {
            in_body = true;
            continue;
        }
        if in_body {
            body_lines.push(line);
        } else if !line.trim_start().starts_with('#') {
            let (name, value) = line
                .split_once(':')
                .ok_or_else(|| format!("Header line needs Name: value: {line}"))?;
            headers.push((name.trim().into(), value.trim().into()));
        }
    }
    Ok(ParsedRequest {
        method: method.to_uppercase(),
        url: url.trim().into(),
        headers,
        body: body_lines.join("\n"),
    })
}

fn parse_bruno_request(text: &str) -> Result<ParsedRequest, String> {
    let methods = ["get", "post", "put", "patch", "delete", "head", "options"];
    let method = text
        .lines()
        .map(str::trim)
        .map(|line| line.trim_end_matches(" {").trim())
        .find(|line| methods.contains(line))
        .ok_or("The Bruno request has no supported method block.")?;
    let url = text
        .lines()
        .map(str::trim)
        .find_map(|line| line.strip_prefix("url:").map(str::trim))
        .ok_or("The Bruno request has no url field.")?;
    let mut headers = Vec::new();
    let mut in_headers = false;
    for line in text.lines().map(str::trim) {
        if line == "headers {" || line == "headers:auth {" {
            in_headers = true;
            continue;
        }
        if in_headers && line == "}" {
            in_headers = false;
            continue;
        }
        if in_headers {
            if let Some((name, value)) = line.split_once(':') {
                headers.push((name.trim().into(), value.trim().into()));
            }
        }
    }
    Ok(ParsedRequest {
        method: method.to_uppercase(),
        url: url.into(),
        headers,
        body: String::new(),
    })
}

fn replace_values(input: &str, values: &BTreeMap<String, String>) -> Result<String, String> {
    let curly = Regex::new(r"\{\{\s*([A-Za-z_][A-Za-z0-9_.-]*)\s*\}\}").unwrap();
    let shell = Regex::new(r"\$\{([A-Za-z_][A-Za-z0-9_]*)\}").unwrap();
    let mut missing = BTreeSet::new();
    let first = curly.replace_all(input, |caps: &regex::Captures| {
        values.get(&caps[1]).cloned().unwrap_or_else(|| {
            missing.insert(caps[1].to_owned());
            caps[0].to_owned()
        })
    });
    let output = shell.replace_all(&first, |caps: &regex::Captures| {
        values.get(&caps[1]).cloned().unwrap_or_else(|| {
            missing.insert(caps[1].to_owned());
            caps[0].to_owned()
        })
    });
    if missing.is_empty() {
        Ok(output.into_owned())
    } else {
        Err(format!(
            "Values are missing for: {}.",
            missing.into_iter().collect::<Vec<_>>().join(", ")
        ))
    }
}

pub fn run_smoke(
    root: &Path,
    config: &Config,
    supplied: &BTreeMap<String, String>,
    target_name: &str,
    smoke_name: &str,
    timeout: u64,
) -> Result<SmokeResult, String> {
    let target = match target_name {
        "local" => config
            .targets
            .local
            .as_ref()
            .ok_or("The local target is not configured.")?,
        "staging" => config
            .targets
            .staging
            .as_ref()
            .ok_or("The staging target is not configured.")?,
        _ => return Err("Target must be local or staging.".into()),
    };
    let base = Url::parse(&target.base_url)
        .map_err(|_| format!("The {target_name} base_url is not a valid URL."))?;
    if !matches!(base.scheme(), "http" | "https") {
        return Err("Targets must use http or https.".into());
    }
    if target_name == "staging" && base.scheme() != "https" {
        return Err("The staging target must use https.".into());
    }
    if !base.username().is_empty() || base.password().is_some() {
        return Err("Target URLs cannot contain credentials.".into());
    }
    let smoke = config
        .smoke
        .iter()
        .find(|s| s.name == smoke_name)
        .ok_or_else(|| format!("Smoke request {smoke_name} is not configured."))?;
    let request_path = safe_existing_child(root, &smoke.request)
        .ok_or("The smoke request path must stay inside the repository.")?;
    let text = fs::read_to_string(&request_path)
        .map_err(|e| format!("Request {} could not be read: {e}", smoke.request))?;
    let parsed = parse_request(&text)?;
    let mut values = supplied.clone();
    for variable in &config.variables {
        if !values.contains_key(&variable.name) {
            if let Some(default) = &variable.default {
                values.insert(variable.name.clone(), default.clone());
            }
        }
    }
    values.insert(
        "BASE_URL".into(),
        target.base_url.trim_end_matches('/').into(),
    );
    let request_url = replace_values(&parsed.url, &values)?;
    let final_url = Url::parse(&request_url).map_err(|_| "The resolved request URL is invalid.")?;
    if final_url.scheme() != base.scheme()
        || final_url.host_str() != base.host_str()
        || final_url.port_or_known_default() != base.port_or_known_default()
    {
        return Err("The resolved request URL leaves the configured target host.".into());
    }
    let method = reqwest::Method::from_bytes(parsed.method.as_bytes())
        .map_err(|_| "The request method is invalid.")?;
    let client = Client::builder()
        .timeout(Duration::from_secs(timeout))
        .redirect(Policy::none())
        .build()
        .map_err(|e| format!("The HTTP client could not start: {e}"))?;
    let mut request = client.request(method, final_url);
    for (name, value) in parsed.headers {
        request = request.header(name, replace_values(&value, &values)?);
    }
    let body = replace_values(&parsed.body, &values)?;
    if !body.is_empty() {
        request = request.body(body);
    }
    let result = request.send();
    let (status, detail) = match result {
        Ok(response) => (
            Some(response.status().as_u16()),
            format!("Received HTTP {}.", response.status().as_u16()),
        ),
        Err(_) => (
            None,
            "The request could not reach the configured target.".into(),
        ),
    };
    let passed = status.is_some_and(|s| smoke.expect_status.contains(&s));
    Ok(SmokeResult {
        name: smoke.name.clone(),
        target: target_name.into(),
        request_file: smoke.request.clone(),
        expected_status: smoke.expect_status.clone(),
        actual_status: status,
        passed,
        detail,
    })
}

pub fn terminal(report: &Report) -> String {
    let status = if report.passed() {
        "PASS"
    } else {
        "NEEDS WORK"
    };
    let mut out = format!("API HANDOFF AUDIT  {status}\n{}\n\n", report.project);
    out.push_str(&format!(
        "{} workspace files scanned · {} setup steps · {} {} · {} smoke requests\n",
        report.scanned_files,
        report.setup_steps,
        report.fixtures_checked,
        if report.fixtures_checked == 1 {
            "fixture"
        } else {
            "fixtures"
        },
        report.smoke_requests
    ));
    if report.variables.is_empty() {
        out.push_str("Variables: none documented\n");
    } else {
        out.push_str("\nVariables\n");
        for var in &report.variables {
            out.push_str(&format!(
                "  [{}] {}{}\n",
                if var.state == "set" { "set" } else { "missing" },
                var.name,
                if var.secret { " (secret)" } else { "" }
            ));
        }
    }
    if report.findings.is_empty() {
        out.push_str("\nNo handoff gaps found.\n");
    } else {
        out.push_str("\nFindings\n");
        for f in &report.findings {
            out.push_str(&format!(
                "  {} {:?}: {}{}\n    Next: {}\n",
                f.code,
                f.severity,
                f.message,
                f.file
                    .as_ref()
                    .map(|file| format!(" [{file}]"))
                    .unwrap_or_default(),
                f.next_step
            ));
        }
    }
    if let Some(smoke) = &report.smoke_result {
        out.push_str(&format!(
            "\nSmoke {} on {}: {} — {}\n",
            smoke.name,
            smoke.target,
            if smoke.passed { "PASS" } else { "FAIL" },
            smoke.detail
        ));
    }
    out
}

pub fn json(report: &Report) -> Result<String, String> {
    serde_json::to_string_pretty(report)
        .map_err(|e| format!("The JSON report could not be written: {e}"))
}

pub fn html(report: &Report) -> String {
    let findings = if report.findings.is_empty() {
        "<p class=empty>No handoff gaps found.</p>".into()
    } else {
        report
            .findings
            .iter()
            .map(|f| {
                format!(
                    "<li><b>{}</b> <span>{}</span><p>{}</p><small>Next: {}</small></li>",
                    escape(&f.code),
                    if f.severity == Severity::Error {
                        "Error"
                    } else {
                        "Warning"
                    },
                    escape(&f.message),
                    escape(&f.next_step)
                )
            })
            .collect::<Vec<_>>()
            .join("")
    };
    let variables = report
        .variables
        .iter()
        .map(|v| {
            format!(
                "<tr><td>{}</td><td>{}</td><td>{}</td></tr>",
                escape(&v.name),
                escape(&v.state),
                if v.secret { "Yes" } else { "No" }
            )
        })
        .collect::<Vec<_>>()
        .join("");
    let smoke = report
        .smoke_result
        .as_ref()
        .map(|s| {
            format!(
                "<section><h2>Smoke result</h2><p><b>{}</b> on {}: {}. {}</p></section>",
                escape(&s.name),
                escape(&s.target),
                if s.passed { "Passed" } else { "Failed" },
                escape(&s.detail)
            )
        })
        .unwrap_or_default();
    format!(
        r#"<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Handoff report — {project}</title><style>:root{{color-scheme:dark;--ink:#07080d;--stall:#11131c;--paper:#f5f0e8;--muted:#b9bdc9;--cyan:#52f5e6;--pink:#ff5ccf;--red:#ff7b7b}}*{{box-sizing:border-box}}body{{margin:0;background:var(--ink);color:var(--paper);font:16px/1.55 ui-monospace,monospace}}main{{width:min(880px,calc(100% - 32px));margin:48px auto}}header{{border-left:5px solid var(--pink);padding:8px 20px}}h1{{font:700 clamp(2rem,6vw,4rem)/1 sans-serif;margin:.25em 0}}.status{{color:var(--cyan);font-weight:700}}.facts{{display:flex;gap:24px;flex-wrap:wrap;color:var(--muted)}}section{{margin:40px 0}}table{{width:100%;border-collapse:collapse}}th,td{{padding:12px;text-align:left;border-bottom:1px solid #303443}}ul{{padding:0;list-style:none}}li{{background:var(--stall);border-left:4px solid var(--red);padding:16px;margin:12px 0}}li span{{color:var(--red)}}li p{{margin:.5em 0}}small{{color:var(--muted)}}.privacy{{border:1px solid #303443;padding:16px;color:var(--muted)}}@media(max-width:500px){{main{{margin:24px auto}}.facts{{display:block}}}}</style><main><header><span>API HANDOFF AUDIT</span><h1>{project}</h1><p class=status>{status}</p></header><section class=facts><p>{files} files scanned</p><p>{steps} setup steps</p><p>{smokes} smoke requests</p></section><section><h2>Variables</h2><table><thead><tr><th>Name</th><th>State</th><th>Secret</th></tr></thead><tbody>{variables}</tbody></table></section><section><h2>Findings</h2><ul>{findings}</ul></section>{smoke}<p class=privacy>Variable values and response bodies are excluded from this report.</p></main></html>"#,
        project = escape(&report.project),
        status = if report.passed() {
            "PASS"
        } else {
            "NEEDS WORK"
        },
        files = report.scanned_files,
        steps = report.setup_steps,
        smokes = report.smoke_requests,
        variables = variables,
        findings = findings,
        smoke = smoke
    )
}

fn escape(input: &str) -> String {
    input
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#39;")
}

pub fn create_demo() -> Result<(PathBuf, Report), String> {
    let stamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis();
    let root = env::temp_dir().join(format!(
        "api-handoff-audit-demo-{}-{stamp}",
        std::process::id()
    ));
    fs::create_dir_all(root.join("requests"))
        .map_err(|e| format!("Demo directory could not be created: {e}"))?;
    fs::create_dir_all(root.join("fixtures"))
        .map_err(|e| format!("Demo directory could not be created: {e}"))?;
    fs::write(
        root.join(CONFIG_FILE),
        include_str!("../examples/parcel-lane/handoff-audit.toml"),
    )
    .map_err(|e| e.to_string())?;
    fs::write(
        root.join("requests/create-order.http"),
        include_str!("../examples/parcel-lane/requests/create-order.http"),
    )
    .map_err(|e| e.to_string())?;
    fs::write(
        root.join("requests/health.bru"),
        include_str!("../examples/parcel-lane/requests/health.bru"),
    )
    .map_err(|e| e.to_string())?;
    fs::write(
        root.join("fixtures/order.json"),
        include_str!("../examples/parcel-lane/fixtures/order.json"),
    )
    .map_err(|e| e.to_string())?;
    let config = load_config(&root)?;
    let values = BTreeMap::from([("API_TOKEN".into(), "sample-token-never-reported".into())]);
    let report = audit(&root, &config, &values)?;
    let report_path = root.join("handoff-report.html");
    fs::write(&report_path, html(&report))
        .map_err(|e| format!("Demo report could not be written: {e}"))?;
    Ok((report_path, report))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::{Read, Write};
    use std::net::TcpListener;
    use std::thread;
    use tempfile::tempdir;

    fn project(config: &str, request: &str) -> tempfile::TempDir {
        let dir = tempdir().unwrap();
        fs::write(dir.path().join(CONFIG_FILE), config).unwrap();
        fs::write(dir.path().join("first.http"), request).unwrap();
        dir
    }

    #[test]
    fn finds_undocumented_and_missing_variables_without_values() {
        let dir = project("version=1\nproject='Test'\nsetup_steps=['Run server']\n[[variables]]\nname='TOKEN'\nsecret=true\n[[smoke]]\nname='first'\nrequest='first.http'\n", "GET {{BASE_URL}}/v1/${TOKEN}/{{UNKNOWN}}\n");
        let config = load_config(dir.path()).unwrap();
        let report = audit(dir.path(), &config, &BTreeMap::new()).unwrap();
        assert!(report
            .findings
            .iter()
            .any(|f| f.code == "VAR001" && f.message.contains("UNKNOWN")));
        assert!(report
            .findings
            .iter()
            .any(|f| f.code == "VAR002" && f.message.contains("TOKEN")));
        assert!(!json(&report).unwrap().contains("sample-token"));
    }

    #[test]
    fn rejects_secret_defaults() {
        let dir = project("version=1\nproject='Test'\nsetup_steps=['Run']\n[[variables]]\nname='TOKEN'\nsecret=true\ndefault='bad'\n[[smoke]]\nname='first'\nrequest='first.http'\n", "GET {{BASE_URL}}/\n");
        let config = load_config(dir.path()).unwrap();
        let report = audit(dir.path(), &config, &BTreeMap::new()).unwrap();
        assert!(report.findings.iter().any(|f| f.code == "VAR003"));
        assert!(!json(&report).unwrap().contains("bad"));
    }

    #[test]
    fn reports_missing_setup_fixture_and_smoke_file() {
        let dir = project("version=1\nproject='Test'\n[[fixtures]]\npath='missing.json'\n[[smoke]]\nname='gone'\nrequest='gone.http'\n", "GET http://localhost\n");
        let config = load_config(dir.path()).unwrap();
        let report = audit(dir.path(), &config, &BTreeMap::new()).unwrap();
        for code in ["SETUP001", "FIX001", "SMOKE002"] {
            assert!(report.findings.iter().any(|f| f.code == code));
        }
    }

    #[test]
    fn html_escapes_project_names() {
        let report = Report {
            schema_version: 1,
            project: "<script>".into(),
            scanned_files: 0,
            setup_steps: 0,
            variables: vec![],
            fixtures_checked: 0,
            smoke_requests: 0,
            findings: vec![],
            smoke_result: None,
        };
        assert!(!html(&report).contains("<script>"));
    }

    #[test]
    fn safe_child_stays_in_root() {
        let root = Path::new("/tmp/project");
        assert!(safe_child(root, "requests/one.http").is_some());
        assert!(safe_child(root, "../secret").is_none());
    }

    #[cfg(unix)]
    #[test]
    fn rejects_a_symlink_to_a_request_outside_the_repository() {
        use std::os::unix::fs::symlink;
        let root = tempdir().unwrap();
        let outside = tempdir().unwrap();
        fs::write(outside.path().join("secret.http"), "GET http://localhost\n").unwrap();
        symlink(
            outside.path().join("secret.http"),
            root.path().join("linked.http"),
        )
        .unwrap();
        assert!(safe_existing_child(root.path(), "linked.http").is_none());
    }

    #[test]
    fn parses_a_bruno_request() {
        let request =
            parse_request("meta {\n name: Health\n}\nget {\n url: {{BASE_URL}}/health\n}\n")
                .unwrap();
        assert_eq!(request.method, "GET");
        assert_eq!(request.url, "{{BASE_URL}}/health");
    }

    #[test]
    fn runs_only_a_named_smoke_on_the_configured_host() {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let port = listener.local_addr().unwrap().port();
        let server = thread::spawn(move || {
            let (mut stream, _) = listener.accept().unwrap();
            let mut buffer = [0; 1024];
            let count = stream.read(&mut buffer).unwrap();
            assert!(String::from_utf8_lossy(&buffer[..count]).starts_with("GET /health"));
            stream
                .write_all(b"HTTP/1.1 204 No Content\r\nContent-Length: 0\r\n\r\n")
                .unwrap();
        });
        let dir = project(
            &format!("version=1\nproject='Test'\nsetup_steps=['Run']\n[targets.local]\nbase_url='http://127.0.0.1:{port}'\n[[smoke]]\nname='health'\nrequest='first.http'\nexpect_status=[204]\n"),
            "GET {{BASE_URL}}/health\n",
        );
        let config = load_config(dir.path()).unwrap();
        let result =
            run_smoke(dir.path(), &config, &BTreeMap::new(), "local", "health", 2).unwrap();
        server.join().unwrap();
        assert!(result.passed);
        assert_eq!(result.actual_status, Some(204));
    }
}
