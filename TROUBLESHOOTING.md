# Troubleshooting Guide

## Common Issues and Solutions

### 1. "Cannot find module '@stripe/stripe-js'" Error

**Problem**: Missing Stripe dependency
**Solution**:
```bash
npm install @stripe/stripe-js
```

### 2. Turbopack Cache Issues

**Problem**: Errors like "Cannot find module '../chunks/ssr/[turbopack]_runtime.js'"

**Solution**: Clear the build cache and restart
```bash
# Stop the dev server (Ctrl+C)

# Clear build artifacts
rm -rf .next

# Clear node cache
rm -rf node_modules/.cache

# Restart dev server
npm run dev
```

### 3. Port Already in Use

**Problem**: "Port 3000 is in use"

**Solution**: Next.js will automatically use an available port (e.g., 3001)
- Check the console output for the actual port
- Access at: http://localhost:3001 (or the shown port)

**Alternative**: Kill the process using port 3000
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Restart dev server
npm run dev
```

### 4. Payment Page Not Loading

**Problem**: Payment page shows errors or doesn't load

**Checklist**:
- ✅ Ensure `@stripe/stripe-js` is installed
- ✅ Check `.env.local` has `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`
- ✅ Clear browser cache and sessionStorage
- ✅ Check browser console for errors

**Quick fix**:
```bash
# Reinstall dependencies
npm install

# Clear all caches
rm -rf .next node_modules/.cache

# Restart
npm run dev
```

### 5. Form Not Redirecting to Payment

**Problem**: Clicking "Submit Waqf" doesn't redirect to payment page

**Causes**:
- Form validation failing (check console for errors)
- Missing required fields
- JavaScript errors (check browser console)

**Solution**:
1. Open browser console (F12)
2. Fill out ALL required fields
3. Check for validation error messages
4. Ensure causes are selected

### 6. Session Storage Data Lost

**Problem**: "Waqf form data not found" error on payment page

**Causes**:
- Browser closed during redirect
- Multiple tabs open
- sessionStorage cleared

**Solution**:
- Complete the flow in one session
- Don't switch tabs during payment
- Don't close browser during payment

### 7. TypeScript Errors

**Problem**: TypeScript compilation errors

**Solution**:
```bash
# Check for type errors
npx tsc --noEmit --skipLibCheck

# If errors persist, regenerate types
rm -rf .next
npm run dev
```

### 8. Build Failures (Google Fonts)

**Problem**: "Failed to fetch 'Inter' from Google Fonts"

**Solution**: This is a network issue, not code issue
- The app will still work in development mode
- For production, ensure internet connection is stable
- Alternative: Use local fonts or fallback fonts

### 9. Payment Gateway Not Initializing

**Problem**: "Payment system not initialized" message

**Checklist**:
- ✅ `@stripe/stripe-js` installed
- ✅ Environment variable set correctly
- ✅ No JavaScript errors in console
- ✅ Page fully loaded

**Debug steps**:
```javascript
// Check in browser console:
console.log(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
// Should show your Stripe key
```

### 10. Add Funds Button Not Working

**Problem**: Clicking "Add Funds" does nothing

**Solution**:
- Check browser console for errors
- Ensure waqf ID exists
- Clear cache and reload page
- Verify the code changes were applied

## Quick Fixes Checklist

When things go wrong, try these in order:

1. **Clear caches**:
```bash
rm -rf .next node_modules/.cache
```

2. **Restart dev server**:
```bash
# Stop: Ctrl+C
npm run dev
```

3. **Clear browser data**:
- Hard refresh: Ctrl+Shift+R (Linux/Windows) or Cmd+Shift+R (Mac)
- Clear sessionStorage: F12 → Console → `sessionStorage.clear()`
- Clear cookies for localhost

4. **Reinstall dependencies**:
```bash
rm -rf node_modules package-lock.json
npm install
```

5. **Check environment variables**:
```bash
cat .env.local | grep STRIPE
# Should show: NEXT_PUBLIC_STRIPE_PUBLIC_KEY=...
```

## Getting Help

If none of these solutions work:

1. **Check the logs**:
   - Browser console (F12)
   - Terminal output
   - Network tab in DevTools

2. **Verify changes applied**:
   ```bash
   # Check if files were modified
   git diff src/components/waqf/WaqfForm.tsx
   git diff src/app/waqf/page.tsx
   git diff src/app/waqf/payment/page.tsx
   ```

3. **Test payment flow manually**:
   - Navigate to: http://localhost:3001/waqf/payment?amount=100&purpose=donation
   - Should see payment page

## Development Commands

```bash
# Start dev server
npm run dev

# Stop dev server
Ctrl+C

# Clear all caches
rm -rf .next node_modules/.cache

# Reinstall everything
rm -rf node_modules package-lock.json && npm install

# Check for errors
npx tsc --noEmit --skipLibCheck

# Build for production
npm run build

# Start production server
npm start
```

## Important Notes

- **sessionStorage**: Only persists within the same browser tab
- **Stripe Keys**: Test keys start with `pk_test_` or `sk_test_`
- **Ports**: If 3000 is busy, Next.js uses 3001, 3002, etc.
- **Hot Reload**: Changes should auto-refresh; if not, manually refresh

## Success Indicators

✅ Dev server starts without errors
✅ Can access http://localhost:3001
✅ No console errors in browser
✅ Payment page loads at /waqf/payment
✅ Form submits and redirects properly
✅ Payment processing works (test mode)

---

**Last Updated**: Payment integration completed
**Status**: ✅ All systems operational
