# Testing Guide: Cause Filtering by Waqf Type

## Quick Start

### 1. Start Development Server
```bash
cd /home/mutalab/projects/waqfProtocol
npm run dev
```

### 2. Navigate to Waqf Creation
- Open browser: `http://localhost:3000`
- Go to `/waqf` route (waqf creation page)

### 3. Test the New Features
Follow the test scenarios below

---

## Test Scenarios

### Scenario A: Permanent Waqf Filtering

**Steps:**
1. ✅ Select "🏛️ Permanent Waqf" card in WaqfForm
2. ✅ Scroll down and click "Browse Causes" button
3. ✅ Modal opens - observe the **Permanent filter is active** (green button)
4. ✅ See helper text: "💡 Showing causes that support Permanent waqf type"
5. ✅ Check cause cards - only permanent-compatible causes shown
6. ✅ Look at badges on each cause - all should have "🏛️ Permanent" badge

**Expected Result:**
- Permanent filter button: Green background, white text
- Only causes supporting permanent waqf displayed
- Helper text visible explaining the filter
- All displayed causes have green "Permanent" badge

---

### Scenario B: Consumable Waqf Filtering

**Steps:**
1. ✅ Select "⚡ Consumable Waqf" card in WaqfForm
2. ✅ Click "Browse Causes" button
3. ✅ Modal opens - observe the **Consumable filter is active** (blue button)
4. ✅ See helper text: "💡 Showing causes that support Consumable waqf type"
5. ✅ Check cause cards - only consumable-compatible causes shown
6. ✅ Look at badges - causes should have "⚡ Consumable" badge

**Expected Result:**
- Consumable filter button: Blue background, white text
- Only consumable-compatible causes displayed
- Helper text visible
- Causes display blue "Consumable" badge

---

### Scenario C: Revolving Waqf Filtering

**Steps:**
1. ✅ Select "🔄 Revolving Waqf" card in WaqfForm
2. ✅ Click "Browse Causes" button
3. ✅ Modal opens - observe the **Revolving filter is active** (purple button)
4. ✅ See helper text: "💡 Showing causes that support Revolving waqf type"
5. ✅ Check cause cards - only revolving-compatible causes shown
6. ✅ Look at badges - causes should have "🔄 Revolving" badge

**Expected Result:**
- Revolving filter button: Purple background, white text
- Only revolving-compatible causes displayed
- Helper text visible
- Causes display purple "Revolving" badge

---

### Scenario D: Hybrid Waqf (No Pre-Filter)

**Steps:**
1. ✅ Select any waqf type card (e.g., Permanent)
2. ✅ Check the "Enable Hybrid Allocation" checkbox
3. ✅ Click "Browse Causes" button
4. ✅ Modal opens - observe **"All Types" filter is active** (gradient button)
5. ✅ NO helper text shown (since no filter active)
6. ✅ ALL causes displayed regardless of waqf type
7. ✅ Each cause shows its compatibility badges (may have 1, 2, or 3 badges)

**Expected Result:**
- "All Types" filter: Blue-purple gradient background
- All causes visible
- No helper text (filter not restrictive)
- Causes show varying badge combinations

---

### Scenario E: Manual Filter Switching

**Steps:**
1. ✅ Select "Permanent" waqf, open modal (permanent filter active)
2. ✅ Click "⚡ Consumable" filter button
3. ✅ Observe immediate re-filtering
4. ✅ Helper text updates to "Consumable waqf type"
5. ✅ Cause list updates to consumable-compatible only
6. ✅ Click "🌐 All Types" button
7. ✅ All causes now visible
8. ✅ Helper text disappears
9. ✅ Click "🔄 Revolving" button
10. ✅ Filter again to revolving-compatible only

**Expected Result:**
- Filters switch instantly without page reload
- Helper text updates dynamically
- Cause list re-filters correctly each time
- Selected causes remain selected across filter changes

---

### Scenario F: Badge Visibility

**Steps:**
1. ✅ Open modal with "All Types" filter
2. ✅ Find a cause supporting all 3 types
3. ✅ Verify it shows 3 badges: 🏛️ Permanent, ⚡ Consumable, 🔄 Revolving
4. ✅ Find a cause supporting only 1 type
5. ✅ Verify it shows 1 badge
6. ✅ Check badge colors match waqf type theme

**Expected Result:**
- Causes with multiple waqf types show multiple badges
- Badge colors: Green (permanent), Blue (consumable), Purple (revolving)
- Badges are clearly visible and readable
- Badges wrap to new line if needed

---

### Scenario G: Search + Category + Waqf Type Filtering

**Steps:**
1. ✅ Open modal with "Permanent" filter active
2. ✅ Type "education" in search box
3. ✅ Observe causes filtered by BOTH search term AND waqf type
4. ✅ Select "Healthcare" from category dropdown
5. ✅ Observe causes now filtered by search + category + waqf type
6. ✅ Clear search, change filter to "All Types"
7. ✅ More results appear

**Expected Result:**
- All three filters work together (AND logic)
- Causes must match search term AND category AND waqf type
- Result count updates correctly
- No console errors

---

## Edge Cases to Test

### Edge Case 1: No Matching Causes
**Steps:**
1. Select a waqf type filter with no compatible causes
2. Verify empty state message appears
3. Message suggests trying "All Types" filter

**Expected:** Helpful empty state, no crash

---

### Edge Case 2: Very Long Cause Names
**Steps:**
1. Create/find cause with very long name
2. Verify name truncates properly
3. Verify badges still display correctly

**Expected:** Text truncates, badges wrap, no layout break

---

### Edge Case 3: Cause Without supportedWaqfTypes
**Steps:**
1. Create cause without setting waqf types (or with empty array)
2. Verify cause appears in "All Types" view
3. Verify cause does NOT appear in filtered views
4. Verify no badges shown for this cause

**Expected:** Graceful handling, no errors, no badges

---

### Edge Case 4: Mobile Responsive
**Steps:**
1. Resize browser to mobile width (< 640px)
2. Open causes modal
3. Verify filter tabs scroll horizontally
4. Verify tabs are touch-friendly
5. Verify badges wrap correctly on narrow screen

**Expected:** Horizontal scroll works, no overflow issues

---

## Visual Checklist

### Filter Tabs
- [ ] "All Types" button: gradient blue-purple when active
- [ ] "Permanent" button: green when active, gray hover when inactive
- [ ] "Consumable" button: blue when active, gray hover when inactive
- [ ] "Revolving" button: purple when active, gray hover when inactive
- [ ] Active state clearly distinguishable from inactive
- [ ] Hover states provide visual feedback

### Helper Text
- [ ] Only shows when specific filter active (not "All Types")
- [ ] Text is readable and informative
- [ ] Matches active filter (Permanent/Consumable/Revolving)
- [ ] Blue background with lightbulb icon

### Cause Card Badges
- [ ] Permanent badge: Green background, green text, 🏛️ emoji
- [ ] Consumable badge: Blue background, blue text, ⚡ emoji
- [ ] Revolving badge: Purple background, purple text, 🔄 emoji
- [ ] Multiple badges wrap properly
- [ ] Badges positioned between description and stats

### Dark Mode
- [ ] Filter tabs readable in dark mode
- [ ] Helper text readable in dark mode
- [ ] Badges readable in dark mode (using dark:bg-xxx-900/30)
- [ ] Modal background appropriate for dark mode

---

## Performance Checks

### Filtering Speed
- [ ] Filtering happens instantly (< 100ms perceived)
- [ ] No lag when switching between filters
- [ ] Search + filter + category all perform well

### Re-renders
- [ ] No unnecessary re-renders (check React DevTools)
- [ ] useMemo optimizes filtered results
- [ ] Selected causes don't flash when filter changes

### Console
- [ ] No errors in browser console
- [ ] No warnings in browser console
- [ ] Logger.debug messages appear (if enabled)

---

## Integration Tests

### Form to Modal Flow
- [ ] Selected waqf type correctly passed to modal
- [ ] Modal receives and processes selectedWaqfType prop
- [ ] Auto-filter activates based on waqf selection
- [ ] Hybrid mode shows all types (no auto-filter)

### Cause Selection Persistence
- [ ] Selected causes remain selected when filter changes
- [ ] Can select causes from different filters
- [ ] Selection count updates correctly
- [ ] Confirm button works with filtered causes

### End-to-End
- [ ] Can complete full waqf creation with filtered causes
- [ ] Selected causes save correctly
- [ ] Form submission includes correct cause IDs
- [ ] No data loss during filtering

---

## Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Edge

---

## Accessibility Tests

### Keyboard Navigation
- [ ] Tab key moves between filter buttons
- [ ] Enter/Space activates filter
- [ ] Escape closes modal
- [ ] Focus indicators visible

### Screen Reader
- [ ] Filter buttons announce state
- [ ] Helper text announced when appears
- [ ] Cause count announced correctly
- [ ] Badge count announced for each cause

---

## Success Criteria

**Minimum Requirements:**
- ✅ All 7 main scenarios pass
- ✅ Filter tabs work correctly
- ✅ Badges display on all causes
- ✅ Helper text appears when filtering
- ✅ No console errors
- ✅ Dark mode functional

**Nice to Have:**
- ✅ All edge cases handled gracefully
- ✅ Mobile responsive works perfectly
- ✅ Accessibility features present
- ✅ Performance is snappy

---

## Bug Reporting Template

If you find issues, report with this format:

```
**Bug Title:** [Concise description]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots:**
[If applicable]

**Browser/Device:**
[e.g., Chrome 120 on Ubuntu]

**Console Errors:**
[Copy any errors from browser console]
```

---

## Quick Commands

```bash
# Start dev server
npm run dev

# Run linter
npm run lint

# Type check
npm run typecheck

# Check specific files
npm run lint -- src/components/waqf/causesModal.tsx
npm run lint -- src/components/waqf/WaqfForm.tsx

# Build production
npm run build
```

---

## Next Steps After Testing

1. ✅ **All tests pass** → Ready for production
2. ⚠️ **Minor issues** → Fix and retest
3. ❌ **Major bugs** → Document and address before deploy
4. 📝 **Feedback** → Consider for future enhancements

Happy testing! 🚀
