#!/usr/bin/env bash
# PostToolUse hook — invokes the code-reviewer subagent after Edit or Write.
# Receives a JSON object on stdin with keys: tool_name, tool_input, tool_response.
set -euo pipefail

# ── Skip patterns ─────────────────────────────────────────────────────────────
readonly SKIP_PATH_FRAGMENTS=(
  "node_modules/"
  "dist/"
  ".git/"
  "__pycache__/"
  ".next/"
  ".nuxt/"
)

readonly SKIP_EXTENSIONS=(
  ".lock" ".snap" ".map"
  ".min.js" ".min.css"
  ".env"
  ".png" ".jpg" ".jpeg" ".gif" ".svg" ".ico" ".webp"
  ".woff" ".woff2" ".ttf" ".eot"
  ".pdf" ".zip" ".tar" ".gz"
)

# Source files worth reviewing
readonly REVIEWABLE_EXTENSIONS=(
  ".js" ".jsx" ".ts" ".tsx" ".mjs" ".cjs"
  ".py" ".pyw"
  ".go"
  ".rb"
  ".java" ".kt" ".kts"
  ".c" ".cpp" ".h" ".hpp"
  ".rs"
  ".php"
  ".swift"
  ".sh" ".bash" ".zsh"
  ".cs"
  ".vue" ".svelte"
)

# ── Helpers ───────────────────────────────────────────────────────────────────
extract_json_field() {
  # Usage: extract_json_field <json_string> <field_path>
  # field_path examples: "tool_name"  or  "tool_input.file_path"
  python3 - "$1" "$2" <<'PYEOF'
import sys, json
data = json.loads(sys.argv[1])
keys = sys.argv[2].split(".")
val = data
for k in keys:
    val = val.get(k, "") if isinstance(val, dict) else ""
print(val)
PYEOF
}

has_extension() {
  local file="$1"; shift
  local ext
  ext=".${file##*.}"
  for e in "$@"; do
    [[ "$ext" == "$e" ]] && return 0
  done
  return 1
}

contains_fragment() {
  local path="$1"; shift
  for frag in "$@"; do
    [[ "$path" == *"$frag"* ]] && return 0
  done
  return 1
}

# ── Main ──────────────────────────────────────────────────────────────────────
main() {
  local raw_input
  raw_input=$(cat)

  # Only act on Edit and Write tool calls
  local tool_name
  tool_name=$(extract_json_field "$raw_input" "tool_name")
  if [[ "$tool_name" != "Edit" && "$tool_name" != "Write" ]]; then
    exit 0
  fi

  local file_path
  file_path=$(extract_json_field "$raw_input" "tool_input.file_path")
  if [[ -z "$file_path" ]]; then
    exit 0
  fi

  # Skip non-existent files (e.g., dry-run or failed writes)
  if [[ ! -f "$file_path" ]]; then
    exit 0
  fi

  # Skip paths that contain noise fragments
  if contains_fragment "$file_path" "${SKIP_PATH_FRAGMENTS[@]}"; then
    exit 0
  fi

  # Skip known non-reviewable extensions
  if has_extension "$file_path" "${SKIP_EXTENSIONS[@]}"; then
    exit 0
  fi

  # Only review known source file extensions
  if ! has_extension "$file_path" "${REVIEWABLE_EXTENSIONS[@]}"; then
    exit 0
  fi

  # Invoke the code-reviewer subagent (non-interactive)
  echo "--- code-reviewer: reviewing $file_path ---"
  claude --agent code-reviewer --print "Review the file: $file_path"
}

main
