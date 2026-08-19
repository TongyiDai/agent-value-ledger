# Runtime and source capability contract

## Required

- A readable `.xlsx` workbook or the bundled template.
- An Agent host that can inspect local session summaries, task records,
  project logs, delivery directories, and version records.
- A spreadsheet runtime capable of preserving formulas and reading back values.

Run `scripts/doctor.sh --json` first. The doctor checks the bundled template and
build script; it cannot grant spreadsheet or session-history access.

## Source adapters

Session history and task logs differ by Agent host. Treat each source as an
adapter with a name, bounded scan window, stable source ID, and read status.
When a source is unavailable, record that limitation and continue only with
available sources. Never infer “no completed work” from a missing source.

Use the user's approved workbook path. Keep the public template fictional. The
write sequence is candidate list → dedupe → review state → workbook write →
formula/error scan → readback. A successful file write without readback is not
verified.
