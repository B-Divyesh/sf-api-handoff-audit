# Demo sandbox

## CLI

Run `cargo run -- demo`. The command creates a new directory under the operating system's temporary directory. It copies the bundled `examples/parcel-lane` project there, runs the same audit engine as `audit`, and writes `handoff-report.html`. The command prints the exact report path.

The sample has two setup steps, one fixture, two named smoke requests, one supplied fake token, and one undocumented `WAREHOUSE_ID`. No real credentials or endpoints are used. A new directory is created for every run.

## Browser

Open `https://api-handoff-audit.sociobot.in/demo` or `/demo` locally. It renders the CLI's recorded sample result. “Mark documented” changes only in-memory page state. “Reset demo” returns the finding. Reloading also resets it.

The browser demo does not use localStorage, IndexedDB, or OPFS. Its storage namespace is therefore empty. License storage uses separate `sb_license:api-handoff-audit` keys and is never touched by the demo.
