#!/usr/bin/env bash
set -u

root="$(cd "$(dirname "$0")/.." && pwd)"
node_ok=0
template_ok=0
script_ok=0
command -v node >/dev/null 2>&1 && node_ok=1
[ -f "$root/assets/agent-value-ledger-template.xlsx" ] && template_ok=1
if [ "$node_ok" = 1 ] && node --check "$root/scripts/build_template.mjs" >/dev/null 2>&1; then
  script_ok=1
fi

if [ "${1:-}" = "--json" ]; then
  printf '{"ok":%s,"skill_root":"%s","required":{"node":%s,"template":%s,"build_script":%s},"optional":{"spreadsheet_runtime":"host-provided"},"next":"%s"}\n' \
    "$([ "$node_ok" = 1 ] && [ "$template_ok" = 1 ] && [ "$script_ok" = 1 ] && echo true || echo false)" \
    "$root" "$([ "$node_ok" = 1 ] && echo true || echo false)" \
    "$([ "$template_ok" = 1 ] && echo true || echo false)" \
    "$([ "$script_ok" = 1 ] && echo true || echo false)" \
    "$([ "$node_ok" = 1 ] && [ "$template_ok" = 1 ] && [ "$script_ok" = 1 ] && echo 'find or create a workbook in the user-approved path' || echo 'repair the missing prerequisite')"
  exit 0
fi

echo "skill_root=$root"
echo "node=$([ "$node_ok" = 1 ] && echo ready || echo missing)"
echo "template=$([ "$template_ok" = 1 ] && echo present || echo missing)"
echo "build_script=$([ "$script_ok" = 1 ] && echo valid || echo invalid)"
echo "spreadsheet_runtime=host-provided"
