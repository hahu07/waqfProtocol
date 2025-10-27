#!/bin/bash

# Fix logger.error/warn/debug calls that pass unknown types
# Pattern: logger.error('message:', error) -> logger.error('message', error instanceof Error ? error : { error })

echo "🔧 Fixing logger calls with unknown error types..."

# Find all files with logger calls
FILES=$(find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "logger\.\(error\|warn\|debug\|info\)" {} \;)

for file in $FILES; do
  # Skip if already fixed or doesn't have the pattern
  if ! grep -q "logger\.\(error\|warn\)" "$file"; then
    continue
  fi
  
  echo "  📝 Fixing: $file"
  
  # Fix pattern: logger.error('message:', error)
  # Change to: logger.error('message', error instanceof Error ? error : { error })
  
  # Use perl for more complex regex replacement
  perl -i -pe 's/logger\.(error|warn)\((["\x27])([^"\x27]+):\2,\s*(\w+)\)/logger.$1($2$3$2, $4 instanceof Error ? $4 : { $4 })/g' "$file"
  
  # Also fix pattern without colon: logger.error('message', error)
  # Only if error is in a catch block (to avoid false positives)
done

echo "✅ Done! Run 'npx tsc --noEmit' to verify."
