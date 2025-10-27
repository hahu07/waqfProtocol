#!/bin/bash

# Add missing logger imports to files that use logger but don't import it

FILES=(
  "src/app/waqf/payment/page.tsx"
  "src/components/admin/causeFormModal.tsx"
  "src/components/admin/causeManager.tsx"
  "src/components/admin/reportManager.tsx"
  "src/components/auth/Login.tsx"
  "src/components/CryptoInitializer.tsx"
  "src/components/home/Header.tsx"
  "src/components/ui/error-boundary.tsx"
  "src/components/waqf/causesModal.tsx"
  "src/components/waqf/EnhancedWaqfDashboard.tsx"
  "src/components/waqf/WaqfForm.tsx"
  "src/hooks/useRecentActivities.ts"
  "src/hooks/useWaqfData.ts"
  "src/lib/payment/gateways/flutterwave-gateway.ts"
  "src/lib/payment/gateways/paypal-gateway.ts"
  "src/lib/payment/gateways/paystack-gateway.ts"
  "src/lib/payment/gateways/razorpay-gateway.ts"
  "src/lib/payment/gateways/stripe-gateway.ts"
)

for file in "${FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "⚠️  File not found: $file"
    continue
  fi
  
  # Check if file already has logger import
  if grep -q "import.*logger.*from.*@/lib/logger" "$file"; then
    echo "✓ Already has logger import: $file"
    continue
  fi
  
  # Find last import line
  LAST_IMPORT=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
  
  if [ -n "$LAST_IMPORT" ]; then
    sed -i "${LAST_IMPORT}a import { logger } from '@/lib/logger';" "$file"
    echo "✅ Added logger import to: $file"
  else
    echo "⚠️  No import statements found in: $file"
  fi
done

echo ""
echo "✅ Done! Run 'npm run lint' to verify."
