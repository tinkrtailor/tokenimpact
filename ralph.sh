#!/bin/bash
# Ralph AFK (Away From Keyboard) - Loop with iteration cap
# Usage: ./ralph.sh [max_iterations] [prompt_file]
#
# Examples:
#   ./ralph.sh                      # 10 iterations, PROMPT.md
#   ./ralph.sh 5                    # 5 iterations, PROMPT.md
#   ./ralph.sh 1 Planning-Prompt.md # 1 iteration, planning prompt
#   ./ralph.sh 0                    # Unlimited (use with caution!)
#
# Runs in Docker sandbox for safety.
# Streams output in real-time.

set -e

MAX_ITERATIONS=${1:-10}
PROMPT_FILE=${2:-PROMPT.md}
PROMPT=$(cat "$PROMPT_FILE")

echo "=== Ralph AFK Mode ==="
echo "Prompt file: $PROMPT_FILE"
if [[ "$MAX_ITERATIONS" -eq 0 ]]; then
  echo "Max iterations: UNLIMITED (Ctrl+C to stop)"
else
  echo "Max iterations: $MAX_ITERATIONS"
fi
echo "Running in Docker sandbox..."
echo ""

i=1
while true; do
  if [[ "$MAX_ITERATIONS" -eq 0 ]]; then
    echo "=== Iteration $i (unlimited) ==="
  else
    echo "=== Iteration $i of $MAX_ITERATIONS ==="
  fi
  echo ""

  # Stream output in real-time
  result=$(docker sandbox run claude \
    -p "$PROMPT" \
    --output-format stream-json \
    --verbose \
    2>&1 | tee /dev/stderr)

  echo ""

  if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
    echo "=== COMPLETE ==="
    echo "All tasks finished at iteration $i"
    exit 0
  fi

  echo "--- End of iteration $i ---"
  echo ""

  # Check iteration limit (0 = unlimited)
  if [[ "$MAX_ITERATIONS" -ne 0 && "$i" -ge "$MAX_ITERATIONS" ]]; then
    break
  fi
  ((i++))
done

echo "=== Reached max iterations ($MAX_ITERATIONS) ==="
echo "Run again to continue, or check prd.json for status."
