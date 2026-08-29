# Demo sandbox

## CLI

Run `cargo run -- demo`. The command creates a new directory under the operating system's temporary directory. It copies the bundled `examples/parcel-lane` project there, runs the same audit engine as `audit`, and writes `handoff-report.html`. The command prints the exact report path.

The sample has two setup steps, one fixture, two named smoke requests, one supplied fake token, and one undocumented `WAREHOUSE_ID`. No real credentials or endpoints are used. A new directory is created for every run.

## Browser

Open `https://api-handoff-audit.sociobot.in/demo?demo=1`, `/demo?demo=1`, or `?demo=1` locally. It renders the CLI's recorded sample result. “Show the corrected config” reveals the exact repository edit and a clearly labelled recorded rerun; it never claims the CLI made the edit. “Reset demo” returns the finding. Reloading also resets it.

The browser demo does not use localStorage, IndexedDB, or OPFS. Its storage namespace is therefore empty.
