use api_handoff_audit::{
    audit, create_demo, html, json, load_config, load_values, run_smoke, terminal, Report,
};
use clap::{Parser, Subcommand, ValueEnum};
use std::fs;
use std::path::PathBuf;
use std::process::ExitCode;

#[derive(Parser)]
#[command(name = "api-handoff-audit", version, about = "Check an API repository before a teammate inherits it", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// Find missing variables, setup steps, fixtures, and smoke requests without sending network requests.
    Audit {
        /// Repository root containing handoff-audit.toml.
        #[arg(default_value = ".")]
        path: PathBuf,
        /// Optional NAME=value file. Values never appear in reports.
        #[arg(long)]
        env_file: Option<PathBuf>,
        /// Report format for stdout or --output.
        #[arg(long, value_enum, default_value = "terminal")]
        format: Format,
        /// Write the report to a file instead of stdout.
        #[arg(short, long)]
        output: Option<PathBuf>,
        /// Shorthand for --format json.
        #[arg(long)]
        json: bool,
    },
    /// Run one named smoke request against one configured target.
    Run {
        /// Repository root containing handoff-audit.toml.
        #[arg(default_value = ".")]
        path: PathBuf,
        /// Target configured under [targets.local] or [targets.staging].
        #[arg(long, value_enum)]
        target: TargetName,
        /// Exact name from a [[smoke]] entry.
        #[arg(long)]
        smoke: String,
        /// Optional NAME=value file. Values never appear in reports.
        #[arg(long)]
        env_file: Option<PathBuf>,
        /// Request timeout in seconds.
        #[arg(long, default_value_t = 10)]
        timeout_seconds: u64,
        /// Report format for stdout or --output.
        #[arg(long, value_enum, default_value = "terminal")]
        format: Format,
        /// Write the report to a file instead of stdout.
        #[arg(short, long)]
        output: Option<PathBuf>,
        /// Shorthand for --format json.
        #[arg(long)]
        json: bool,
    },
    /// Audit a bundled sample repository in a new temporary directory.
    Demo {
        /// Print the report as JSON after creating it.
        #[arg(long)]
        json: bool,
    },
}

#[derive(Clone, Copy, ValueEnum)]
enum Format {
    Terminal,
    Json,
    Html,
}

#[derive(Clone, Copy, ValueEnum)]
enum TargetName {
    Local,
    Staging,
}

impl TargetName {
    fn as_str(self) -> &'static str {
        match self {
            Self::Local => "local",
            Self::Staging => "staging",
        }
    }
}

fn main() -> ExitCode {
    match execute(Cli::parse()) {
        Ok(code) => code,
        Err(message) => {
            eprintln!("Error: {message}");
            ExitCode::from(2)
        }
    }
}

fn execute(cli: Cli) -> Result<ExitCode, String> {
    match cli.command {
        Command::Audit {
            path,
            env_file,
            format,
            output,
            json: json_flag,
        } => {
            let config = load_config(&path)?;
            let values = load_values(env_file.as_deref())?;
            let report = audit(&path, &config, &values)?;
            write_report(
                &report,
                if json_flag { Format::Json } else { format },
                output,
            )?;
            Ok(if report.passed() {
                ExitCode::SUCCESS
            } else {
                ExitCode::from(1)
            })
        }
        Command::Run {
            path,
            target,
            smoke,
            env_file,
            timeout_seconds,
            format,
            output,
            json: json_flag,
        } => {
            if timeout_seconds == 0 || timeout_seconds > 300 {
                return Err("--timeout-seconds must be between 1 and 300.".into());
            }
            let config = load_config(&path)?;
            let values = load_values(env_file.as_deref())?;
            let mut report = audit(&path, &config, &values)?;
            if !report.passed() {
                write_report(
                    &report,
                    if json_flag { Format::Json } else { format },
                    output,
                )?;
                return Ok(ExitCode::from(1));
            }
            report.smoke_result = Some(run_smoke(
                &path,
                &config,
                &values,
                target.as_str(),
                &smoke,
                timeout_seconds,
            )?);
            write_report(
                &report,
                if json_flag { Format::Json } else { format },
                output,
            )?;
            Ok(if report.passed() {
                ExitCode::SUCCESS
            } else {
                ExitCode::from(1)
            })
        }
        Command::Demo { json: json_flag } => {
            let (path, report) = create_demo()?;
            if json_flag {
                println!("{}", json(&report)?);
            } else {
                print!("{}", terminal(&report));
                println!("\nDemo — sample data, nothing was saved to your repository.");
                println!("HTML report: {}", path.display());
            }
            if json_flag {
                eprintln!("Demo — sample data, nothing was saved to your repository.");
                eprintln!("HTML report: {}", path.display());
            }
            Ok(ExitCode::SUCCESS)
        }
    }
}

fn write_report(report: &Report, format: Format, output: Option<PathBuf>) -> Result<(), String> {
    let text = match format {
        Format::Terminal => terminal(report),
        Format::Json => json(report)?,
        Format::Html => html(report),
    };
    if let Some(path) = output {
        fs::write(&path, text)
            .map_err(|e| format!("Report {} could not be written: {e}", path.display()))?;
        if matches!(format, Format::Json) {
            // JSON mode is intended for pipelines. Keep stdout parseable even
            // when the caller also asks us to persist the same report.
            println!("{}", json(report)?);
        } else {
            println!("Report written to {}", path.display());
        }
    } else {
        println!("{text}");
    }
    Ok(())
}
