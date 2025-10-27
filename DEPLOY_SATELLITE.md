# Deploy Rust Satellite with Tranche Support

## What Changed

The donation hook has been updated to properly create contribution tranches for revolving waqfs. Each time a donation is made to a revolving waqf, a new tranche is created with:

- Unique ID
- Donation amount
- Contribution date (nanosecond timestamp)
- Maturity date (contribution date + lock period)
- Return status

## Deployment Steps

### 1. Build the Rust Satellite

```bash
cd /home/mutalab/projects/waqfProtocol

# Build the Rust WASM module
cargo build --target wasm32-unknown-unknown --release
```

### 2. Deploy to Juno

```bash
# Deploy the satellite (this will upload the new WASM module)
juno hosting deploy
```

### 3. Verify Deployment

After deployment:

1. Go to your waqf dashboard
2. Click "Add Funds" on a revolving waqf
3. Add a contribution (e.g., $100)
4. The "Contribution Tranches" section should now show:
   - The tranche with contribution amount
   - Contribution date
   - Maturity date (contribution date + lock period months)
   - Status: Locked

### 4. Check Logs (Optional)

To see the backend logs and verify tranches are being created:

```bash
# View Juno satellite logs
juno console
```

Look for log messages like:
```
DEBUG - Creating tranche: ID=tranche_waqf123_1234567890000000000, Amount=100, ContribDate=1234567890000000000, MaturityDate=1236567890000000000
Created contribution tranche for revolving waqf: 100 amount, matures in 24 months
```

## Testing the Feature

### Test Scenario 1: Add First Contribution

1. Create a new revolving waqf with $1,000 initial amount, 12-month lock
2. Add Funds: $500
3. Expected Result:
   - Balance shows $1,500
   - 2 tranches visible:
     - Tranche 1: $1,000 (initial), matures in 12 months
     - Tranche 2: $500 (new), matures in 12 months from now

### Test Scenario 2: Multiple Contributions

1. Add $200 today
2. Wait a few minutes, add $300 more
3. Expected Result:
   - Each contribution has its own tranche
   - Each tranche has different maturity dates
   - Locked balance = sum of all locked tranches

### Test Scenario 3: Return Matured Tranche

1. For testing, you can manually set a tranche's maturity date to the past
2. The tranche should show as "Matured"
3. Click "Return Funds" button
4. Tranche status changes to "Returned"
5. Balance decreases by the tranche amount

## Troubleshooting

### Issue: Tranches Still Not Showing

**Check**:
1. Did you rebuild with `cargo build`?
2. Did you deploy with `juno hosting deploy`?
3. Is the waqf type exactly "temporary_revolving"?
4. Does the waqf have `revolvingDetails` with a `lockPeriodMonths`?

**Debug**:
```bash
# Check browser console for logs
# Should see: "🔍 AddFundsModal - Waqf Type Check:"
```

### Issue: Build Fails

**Error**: "target wasm32-unknown-unknown not found"

**Fix**:
```bash
rustup target add wasm32-unknown-unknown
```

### Issue: Deployment Fails

**Check**:
1. Are you authenticated with Juno? Run `juno login`
2. Is your satellite ID correct in `juno.config.mjs`?
3. Do you have network connectivity?

## Files Modified

- `src/satellite/src/donation_hooks.rs` - Fixed timestamp handling
- `src/satellite/src/waqf_types.rs` - Added ContributionTranche type
- `src/satellite/src/tranche_hooks.rs` - New file for tranche operations
- `src/components/waqf/TranchesDisplay.tsx` - UI component
- `src/components/waqf/AddFundsModal.tsx` - Improved add funds dialog
- `src/lib/revolving-waqf-utils.ts` - Utility functions

## Next Steps After Deployment

1. Test adding funds to a revolving waqf
2. Verify tranches appear in the dashboard
3. Check that maturity dates are calculated correctly
4. Test returning a matured tranche (may need to manually adjust dates for testing)

---

**Note**: The backend changes won't take effect until you rebuild and redeploy the Rust satellite. Frontend changes are already live in your dev server.
