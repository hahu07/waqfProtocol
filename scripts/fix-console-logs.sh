#!/bin/bash

# Script to replace console.log/error/warn/debug with logger across the project
# Excludes: crypto-polyfills, crypto-global-shim, env-validation (infrastructure code)
# Excludes: node_modules, .next, documentation files

set -e

echo "🔧 Fixing console statements across the project..."

# Files to exclude (infrastructure code that runs before logger)
EXCLUDE_FILES=(
  "src/lib/crypto-global-shim.ts"
  "src/lib/crypto-polyfill.ts"
  "src/lib/env-validation.ts"
  "src/lib/logger.ts"
)

# Directories to exclude
EXCLUDE_DIRS=(
  "node_modules"
  ".next"
  "dist"
  "build"
)

# Function to check if file should be excluded
should_exclude() {
  local file=$1
  
  # Check if file is in exclude list
  for exclude in "${EXCLUDE_FILES[@]}"; do
    if [[ "$file" == *"$exclude"* ]]; then
      return 0
    fi
  done
  
  # Check if file is in exclude directories
  for dir in "${EXCLUDE_DIRS[@]}"; do
    if [[ "$file" == *"/$dir/"* ]]; then
      return 0
    fi
  done
  
  # Exclude documentation and markdown files
  if [[ "$file" == *.md || "$file" == *.txt ]]; then
    return 0
  fi
  
  return 1
}

# Find all TypeScript/JavaScript files
FILES=$(find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) 2>/dev/null)

COUNT=0
MODIFIED=0

for file in $FILES; do
  # Skip excluded files
  if should_exclude "$file"; then
    continue
  fi
  
  # Check if file contains console statements
  if grep -q "console\.\(log\|error\|warn\|debug\|info\)" "$file" 2>/dev/null; then
    COUNT=$((COUNT + 1))
    
    # Check if logger is already imported
    HAS_LOGGER_IMPORT=$(grep -c "import.*logger.*from.*@/lib/logger" "$file" 2>/dev/null || echo 0)
    
    # Add logger import if not present
    if [ "$HAS_LOGGER_IMPORT" -eq 0 ]; then
      echo "  📝 Adding logger import to: $file"
      
      # Find the last import statement
      LAST_IMPORT_LINE=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
      
      if [ -n "$LAST_IMPORT_LINE" ]; then
        # Insert logger import after last import
        sed -i "${LAST_IMPORT_LINE}a import { logger } from '@/lib/logger';" "$file"
      else
        # No imports found, add at top (after 'use client' if present)
        if head -1 "$file" | grep -q "use client"; then
          sed -i "1a import { logger } from '@/lib/logger';" "$file"
        else
          sed -i "1i import { logger } from '@/lib/logger';" "$file"
        fi
      fi
    fi
    
    echo "  🔄 Fixing console statements in: $file"
    
    # Replace console.error with logger.error
    sed -i "s/console\.error(/logger.error(/g" "$file"
    
    # Replace console.warn with logger.warn
    sed -i "s/console\.warn(/logger.warn(/g" "$file"
    
    # Replace console.debug with logger.debug
    sed -i "s/console\.debug(/logger.debug(/g" "$file"
    
    # Replace console.info with logger.info
    sed -i "s/console\.info(/logger.info(/g" "$file"
    
    # Replace console.log with logger.debug (most logs are debug-level)
    sed -i "s/console\.log(/logger.debug(/g" "$file"
    
    MODIFIED=$((MODIFIED + 1))
  fi
done

echo ""
echo "✅ Complete!"
echo "   Found $COUNT files with console statements"
echo "   Modified $MODIFIED files"
echo ""
echo "⚠️  Note: You may need to manually adjust some logger calls to:"
echo "   - Use structured metadata instead of string interpolation"
echo "   - Choose appropriate log level (debug/info/warn/error)"
echo "   - Add ESLint exceptions for infrastructure code"
echo ""
echo "Run 'npm run lint' to check for any remaining issues."
