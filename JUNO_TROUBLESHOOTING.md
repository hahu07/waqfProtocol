# Juno Satellite Initialization Troubleshooting

## Current Status

The application now includes comprehensive initialization checks and error logging.

## Expected Console Output

When everything works correctly, you should see:

```
✅ Crypto init script loaded
✅ Crypto initialized successfully
✅ Global crypto verified and available
✅ Crypto is ready
🔧 Initializing Juno Satellite...
📍 Satellite ID (raw): atbka-rp777-77775-aaaaq-cai
📍 Satellite ID (cleaned): atbka-rp777-77775-aaaaq-cai
✅ Juno Satellite initialized successfully
```

## Common Issues & Solutions

### Issue 1: "Satellite not initialized yet"

**Symptom**: Button shows "Initializing..." indefinitely, or error message appears.

**Check Console For**:
- ❌ Failed to initialize Juno Satellite
- Error details will show the specific problem

**Solutions**:

1. **Missing/Invalid Satellite ID**
   ```bash
   # Check your .env.local file
   cat .env.local | grep JUNO
   ```
   
   Should show:
   ```
   NEXT_PUBLIC_JUNO_SATELLITE_ID=atbka-rp777-77775-aaaaq-cai
   ```
   
   **Fix**: Remove spaces around `=`:
   ```bash
   # WRONG:
   NEXT_PUBLIC_JUNO_SATELLITE_ID =atbka-rp777-77775-aaaaq-cai
   
   # CORRECT:
   NEXT_PUBLIC_JUNO_SATELLITE_ID=atbka-rp777-77775-aaaaq-cai
   ```

2. **Crypto Not Available**
   
   If you see: `⏳ Waiting for crypto to be available...`
   
   This means the crypto shim hasn't loaded yet. The app will wait up to 5 seconds.
   
   **Fix**:
   ```bash
   # Clear cache and restart
   rm -rf .next
   npm run dev
   ```

3. **Network Issues**
   
   If initialization hangs, check:
   - Internet connection is active
   - No firewall blocking Internet Computer network
   - Try different network/disable VPN

### Issue 2: Environment Variable Not Loading

**Symptom**: Console shows `NEXT_PUBLIC_JUNO_SATELLITE_ID is not defined`

**Solutions**:

1. **Restart Dev Server**
   ```bash
   # Stop the server (Ctrl+C)
   # Then start again
   npm run dev
   ```
   
   Next.js only reads env variables on startup!

2. **Check File Name**
   ```bash
   ls -la .env*
   ```
   
   Should have `.env.local` (not `.env`)

3. **Check File Content**
   ```bash
   cat .env.local
   ```
   
   Must have:
   ```
   NEXT_PUBLIC_JUNO_SATELLITE_ID=atbka-rp777-77775-aaaaq-cai
   ```
   
   Note: `NEXT_PUBLIC_` prefix is required!

### Issue 3: Crypto Errors

**Symptom**: `_getEffectiveCrypto` or similar crypto errors

**Solutions**:

1. **Verify Crypto Init**
   
   Open browser console and run:
   ```javascript
   console.log('window.crypto:', !!window.crypto);
   console.log('globalThis.crypto:', !!globalThis.crypto);
   console.log('Can generate UUID:', typeof crypto.randomUUID);
   ```
   
   All should return `true` or `"function"`.

2. **Check Script Load**
   
   View page source (Ctrl+U) and search for:
   ```html
   <script src="/crypto-init.js"
   ```
   
   Should be present in the HTML.

3. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R (Linux/Windows) or Cmd+Shift+R (Mac)
   - Or open DevTools → Network tab → Disable cache

### Issue 4: "Workers are not supported"

**Symptom**: Error about web workers not being supported

**Solution**:

This is usually a browser compatibility issue.

1. **Update Browser**
   - Chrome 92+
   - Firefox 95+
   - Safari 15.4+
   - Edge 92+

2. **Disable Worker Option** (temporary workaround)
   
   In `AuthProvider.tsx`, change:
   ```typescript
   await initSatellite({
     satelliteId: cleanSatelliteId,
     workers: { auth: false }, // Changed from true
   });
   ```

## Debug Mode

To enable verbose logging:

1. Open browser DevTools (F12)
2. Console tab
3. Expand all log groups
4. Look for initialization sequence

## Manual Testing

### Test 1: Check Satellite ID

```bash
node -e "console.log('ID:', process.env.NEXT_PUBLIC_JUNO_SATELLITE_ID)" 
```

Should output your satellite ID.

### Test 2: Check Crypto

In browser console:
```javascript
crypto.randomUUID()
```

Should generate a UUID like: `"550e8400-e29b-41d4-a716-446655440000"`

### Test 3: Manual Initialization

In browser console (with dev server running):
```javascript
// Check if already initialized
console.log('Auth context:', window.__JUNO_AUTH_CONTEXT__);
```

## Recovery Steps

If nothing works:

```bash
# 1. Clean everything
rm -rf .next
rm -rf node_modules
rm package-lock.json

# 2. Reinstall
npm install

# 3. Verify env
cat .env.local

# 4. Start fresh
npm run dev
```

## Getting Help

When reporting an issue, include:

1. **Console Output**
   - Full console log from page load to error
   - Any red errors
   - Initialization messages

2. **Environment**
   ```bash
   node --version
   npm --version
   cat .env.local | grep JUNO  # (safe to share satellite ID)
   ```

3. **Browser Info**
   - Browser name and version
   - Operating system

4. **Network**
   - Are you behind a corporate firewall?
   - Using VPN?
   - Internet connection stable?

## Known Issues

### Issue: Slow Initialization

**Symptom**: Takes 2-3 seconds to initialize

**Status**: Normal. Juno needs to:
1. Load crypto libraries
2. Connect to Internet Computer network
3. Initialize authentication client
4. Set up event listeners

**If it takes >5 seconds**: Check network connection.

### Issue: Random Initialization Failures

**Symptom**: Sometimes works, sometimes doesn't

**Cause**: Race condition between crypto init and Juno init

**Fix**: Already implemented - app waits for crypto before initializing Juno.

## Success Indicators

✅ Button changes from "Initializing..." to "Continue with Internet Identity"
✅ No red errors in console
✅ All green checkmarks in console logs
✅ Clicking button opens Internet Identity window

---

**Last Updated**: 2025-10-11  
**Version**: 1.0.0
