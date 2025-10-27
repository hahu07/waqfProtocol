# Testing Guide: Cause Creation with Three Waqf Types

This guide covers comprehensive testing scenarios for creating causes with support for Permanent, Consumable, and Revolving waqf types.

## Prerequisites

### Admin Access Setup
1. Start development server:
   ```bash
   npm run dev
   ```

2. Navigate to admin dashboard: `http://localhost:3000/admin`

3. Ensure you have admin role (check authentication state)

### Access Cause Creation Modal
- Click "Create Cause" button in admin dashboard
- Or click "Edit" on existing cause to test updates

---

## Test Scenarios

### 1. **Basic Cause Creation - Permanent Only**

**Objective**: Verify that a cause supporting only Permanent waqf type can be created successfully.

**Steps**:
1. Open cause creation modal
2. Fill in basic information:
   - **Name**: "Build Community Mosque"
   - **Description**: "Construction of a new mosque facility"
   - **Target Amount**: 100000
   - **Category**: "infrastructure"
   
3. **Waqf Type Support Section**:
   - ✅ Check "Permanent Waqf (Principal preserved forever)"
   - ❌ Uncheck "Consumable Waqf"
   - ❌ Uncheck "Revolving Waqf"

4. Verify "Permanent Configuration" section appears below
   
5. **Permanent Configuration**:
   - **Preservation Strategy**: "Real Estate Investment"
   - **Min. ROI %**: 5
   - **Distribution Frequency**: "quarterly"

6. Click "Create Cause"

**Expected Results**:
- ✅ Cause created successfully
- ✅ Toast notification: "Cause created successfully"
- ✅ New cause appears in admin causes list
- ✅ Cause card shows badge: "🏛️ Permanent"
- ✅ In WaqfForm CausesModal, cause appears when:
  - Filter: "All Types" ✅
  - Filter: "Permanent" ✅
  - Filter: "Consumable" ❌
  - Filter: "Revolving" ❌

---

### 2. **Consumable Waqf Only**

**Objective**: Test cause that only accepts Consumable waqf type.

**Steps**:
1. Open cause creation modal
2. Fill in basic information:
   - **Name**: "Emergency Relief Fund"
   - **Description**: "Immediate aid for disaster victims"
   - **Target Amount**: 50000
   - **Category**: "humanitarian"

3. **Waqf Type Support**:
   - ❌ Uncheck "Permanent Waqf"
   - ✅ Check "Consumable Waqf (Spent over time)"
   - ❌ Uncheck "Revolving Waqf"

4. Verify "Consumable Configuration" section appears

5. **Consumable Configuration**:
   - **Distribution Strategy**: "Immediate Disbursement"
   - **Max Duration Months**: 24
   - **Milestone Tracking**: Enable ✅
   - **Milestone Name**: "Initial Assessment"
   - **Target Amount**: 10000
   - **Description**: "First phase evaluation"

6. Click "Create Cause"

**Expected Results**:
- ✅ Cause created with consumable-only support
- ✅ Cause card shows badge: "⚡ Consumable"
- ✅ In WaqfForm CausesModal, cause appears when:
  - Filter: "All Types" ✅
  - Filter: "Permanent" ❌
  - Filter: "Consumable" ✅
  - Filter: "Revolving" ❌

---

### 3. **Revolving Waqf Only**

**Objective**: Test cause that only accepts Revolving waqf type.

**Steps**:
1. Open cause creation modal
2. Fill in basic information:
   - **Name**: "Educational Loan Fund"
   - **Description**: "Student loans that revolve back to fund"
   - **Target Amount**: 200000
   - **Category**: "education"

3. **Waqf Type Support**:
   - ❌ Uncheck "Permanent Waqf"
   - ❌ Uncheck "Consumable Waqf"
   - ✅ Check "Revolving Waqf (Principal returns to donor)"

4. Verify "Revolving Configuration" section appears

5. **Revolving Configuration**:
   - **Revolving Strategy**: "Micro-credit Fund"
   - **Min Lock Period Months**: 12
   - **Max Lock Period Months**: 60
   - **Return Method**: "Installments"

6. Click "Create Cause"

**Expected Results**:
- ✅ Cause created with revolving-only support
- ✅ Cause card shows badge: "🔄 Revolving"
- ✅ In WaqfForm CausesModal, cause appears when:
  - Filter: "All Types" ✅
  - Filter: "Permanent" ❌
  - Filter: "Consumable" ❌
  - Filter: "Revolving" ✅

---

### 4. **Multi-Type Support - Permanent + Consumable**

**Objective**: Test cause accepting both Permanent and Consumable waqf types.

**Steps**:
1. Open cause creation modal
2. Fill in basic information:
   - **Name**: "Healthcare Center"
   - **Description**: "Medical facility with endowment fund"
   - **Target Amount**: 500000
   - **Category**: "healthcare"

3. **Waqf Type Support**:
   - ✅ Check "Permanent Waqf"
   - ✅ Check "Consumable Waqf"
   - ❌ Uncheck "Revolving Waqf"

4. Verify both configuration sections appear

5. **Permanent Configuration**:
   - **Preservation Strategy**: "Balanced Fund"
   - **Min. ROI %**: 4
   - **Distribution Frequency**: "monthly"

6. **Consumable Configuration**:
   - **Distribution Strategy**: "Phased Spending"
   - **Max Duration Months**: 36
   - **Milestone Tracking**: Enable ✅

7. Click "Create Cause"

**Expected Results**:
- ✅ Cause created supporting 2 waqf types
- ✅ Cause card shows badges: "🏛️ Permanent, ⚡ Consumable"
- ✅ In WaqfForm CausesModal, cause appears when:
  - Filter: "All Types" ✅
  - Filter: "Permanent" ✅
  - Filter: "Consumable" ✅
  - Filter: "Revolving" ❌

---

### 5. **All Three Types Support**

**Objective**: Test cause accepting all waqf types (maximum flexibility).

**Steps**:
1. Open cause creation modal
2. Fill in basic information:
   - **Name**: "Islamic University Endowment"
   - **Description**: "Comprehensive funding for university"
   - **Target Amount**: 1000000
   - **Category**: "education"

3. **Waqf Type Support**:
   - ✅ Check "Permanent Waqf"
   - ✅ Check "Consumable Waqf"
   - ✅ Check "Revolving Waqf"

4. Verify all three configuration sections appear

5. Fill all configurations (use reasonable values)

6. Click "Create Cause"

**Expected Results**:
- ✅ Cause created supporting all 3 waqf types
- ✅ Cause card shows badges: "🏛️ Permanent, ⚡ Consumable, 🔄 Revolving"
- ✅ In WaqfForm CausesModal, cause appears in ALL filters
- ✅ Maximum flexibility for donors

---

### 6. **Validation Testing - No Type Selected**

**Objective**: Verify validation prevents creating causes with no waqf type support.

**Steps**:
1. Open cause creation modal
2. Fill in basic information
3. **Waqf Type Support**:
   - ❌ Uncheck "Permanent Waqf"
   - ❌ Uncheck "Consumable Waqf"
   - ❌ Uncheck "Revolving Waqf"

4. Click "Create Cause"

**Expected Results**:
- ❌ Form validation error
- ⚠️ Error message: "Please select at least one waqf type"
- ❌ Cause NOT created
- 📝 Focus on waqf type section

---

### 7. **Permanent Configuration - Required Fields**

**Objective**: Test validation for Permanent waqf configuration.

**Steps**:
1. Open cause creation modal
2. Fill basic information
3. Check "Permanent Waqf" only
4. **Leave Permanent Configuration empty**:
   - Preservation Strategy: (empty)
   - Min. ROI %: (empty)
   - Distribution Frequency: (empty)

5. Click "Create Cause"

**Expected Results**:
- ❌ Validation errors shown:
  - "Preservation strategy is required"
  - "Minimum ROI percentage is required"
  - "Distribution frequency is required"
- ❌ Cause NOT created

**Valid Test**:
6. Fill all required permanent fields
7. Click "Create Cause"

**Expected Results**:
- ✅ Cause created successfully
- ✅ Permanent configuration saved

---

### 8. **Consumable Configuration - Duration Validation**

**Objective**: Test validation for Consumable waqf duration limits.

**Steps**:
1. Open cause creation modal
2. Fill basic information
3. Check "Consumable Waqf" only
4. **Invalid Duration**:
   - Distribution Strategy: "Phased Spending"
   - Max Duration Months: 0 (or negative)

5. Click "Create Cause"

**Expected Results**:
- ❌ Validation error: "Duration must be between 1 and 240 months"

**Valid Test**:
6. Set Max Duration Months: 24
7. Click "Create Cause"

**Expected Results**:
- ✅ Cause created successfully

---

### 9. **Revolving Configuration - Lock Period Validation**

**Objective**: Test validation for Revolving waqf lock period.

**Steps**:
1. Open cause creation modal
2. Fill basic information
3. Check "Revolving Waqf" only
4. **Invalid Lock Period**:
   - Min Lock Period: 12
   - Max Lock Period: 6 (less than minimum!)

5. Click "Create Cause"

**Expected Results**:
- ❌ Validation error: "Max lock period must be greater than min lock period"

**Valid Test**:
6. Set Min Lock Period: 12, Max Lock Period: 60
7. Click "Create Cause"

**Expected Results**:
- ✅ Cause created successfully

---

### 10. **Edit Existing Cause - Change Waqf Types**

**Objective**: Test updating waqf type support for existing cause.

**Steps**:
1. Find existing cause (e.g., "Build Community Mosque" from Test #1)
2. Click "Edit" button
3. Modal opens with existing data pre-filled
4. **Current**: Only "Permanent" checked
5. **Change to**: Add "Consumable" support
   - ✅ Keep "Permanent Waqf" checked
   - ✅ Check "Consumable Waqf"

6. Fill Consumable configuration
7. Click "Update Cause"

**Expected Results**:
- ✅ Cause updated successfully
- ✅ Toast: "Cause updated successfully"
- ✅ Cause card now shows: "🏛️ Permanent, ⚡ Consumable"
- ✅ Cause appears in both filter tabs
- ⚠️ **Important**: Existing waqfs using this cause should still work

---

### 11. **Image Upload with Cause Creation**

**Objective**: Test image handling with different waqf types.

**Steps**:
1. Open cause creation modal
2. Fill basic information
3. Select any waqf type(s)
4. **Upload Image**:
   - Click image upload area
   - Select valid image file (PNG/JPG, < 5MB)

5. Fill required configurations
6. Click "Create Cause"

**Expected Results**:
- ✅ Image preview shown in modal
- ✅ Cause created with image
- ✅ Cause card displays uploaded image
- ✅ Image persists after page reload

---

### 12. **Filter Behavior in WaqfForm**

**Objective**: Verify cause filtering works correctly in donor's waqf creation flow.

**Setup**: Ensure causes exist from previous tests:
- "Build Community Mosque" (Permanent only)
- "Emergency Relief Fund" (Consumable only)
- "Educational Loan Fund" (Revolving only)
- "Healthcare Center" (Permanent + Consumable)
- "Islamic University" (All three types)

**Steps**:
1. Navigate to `/waqf` (donor dashboard)
2. Click "Create New Waqf"
3. In WaqfForm, select "Permanent" waqf type
4. Click "Select Causes"
5. Observe causes displayed

**Expected Results**:
- ✅ Filter automatically set to "Permanent"
- ✅ Causes shown:
  - "Build Community Mosque" ✅
  - "Healthcare Center" ✅
  - "Islamic University" ✅
- ❌ Causes hidden:
  - "Emergency Relief Fund" ❌
  - "Educational Loan Fund" ❌

**Continue Test**:
6. Change waqf type to "Consumable"
7. Click "Select Causes" again

**Expected Results**:
- ✅ Filter automatically set to "Consumable"
- ✅ Causes shown:
  - "Emergency Relief Fund" ✅
  - "Healthcare Center" ✅
  - "Islamic University" ✅

**Continue Test**:
8. Enable "Hybrid Allocation"
9. Click "Select Causes"

**Expected Results**:
- ✅ Filter set to "All Types"
- ✅ ALL causes shown (no filtering)
- ✅ User can select causes for hybrid allocation

---

### 13. **Compatibility Badge Display**

**Objective**: Verify compatibility badges show correctly on cause cards.

**Steps**:
1. In WaqfForm, open CausesModal
2. Set filter to "All Types"
3. Observe all cause cards

**Expected Badge Display**:
- **"Build Community Mosque"**: 
  - Badge: "🏛️ Permanent"
  - Color: Green background

- **"Emergency Relief Fund"**: 
  - Badge: "⚡ Consumable"
  - Color: Blue background

- **"Educational Loan Fund"**: 
  - Badge: "🔄 Revolving"
  - Color: Purple background

- **"Healthcare Center"**: 
  - Badges: "🏛️ Permanent • ⚡ Consumable"
  - Color: Multi-color (green + blue)

- **"Islamic University"**: 
  - Badges: "🏛️ Permanent • ⚡ Consumable • 🔄 Revolving"
  - Color: Multi-color (green + blue + purple)

**Expected Results**:
- ✅ All badges display with correct emojis
- ✅ Color coding matches waqf type
- ✅ Multiple badges separated by " • "
- ✅ Badges are visually distinct and readable

---

## Edge Cases to Test

### Edge Case 1: Very Long Cause Names
- Create cause with 100+ character name
- Verify truncation in cards and modals

### Edge Case 2: Special Characters
- Create cause with emojis, Arabic text, special symbols
- Verify proper encoding and display

### Edge Case 3: Maximum Target Amount
- Create cause with very large target (e.g., 10000000000)
- Verify number formatting works

### Edge Case 4: Milestone Tracking
- Create cause with 10+ milestones
- Verify scrolling/pagination in milestone list

### Edge Case 5: Rapid Type Toggle
- Rapidly check/uncheck waqf types
- Verify configuration sections show/hide correctly
- No UI glitches or crashes

---

## Database Verification

After creating causes, verify data persistence:

### Check Juno Collections
```bash
# View causes in Juno admin console
# Navigate to: Datastore > Collections > causes
```

**Verify Fields**:
- `supportedWaqfTypes: ['permanent']` or `['temporary_consumable']` etc.
- `permanentConfig`: Present when Permanent checked
- `consumableConfig`: Present when Consumable checked
- `revolvingConfig`: Present when Revolving checked

---

## Performance Testing

### Test Large Cause Lists
1. Create 50+ causes with various type combinations
2. Open CausesModal in WaqfForm
3. Switch between filters rapidly

**Expected Results**:
- ✅ Fast filtering (< 100ms)
- ✅ No lag or jank
- ✅ Smooth animations
- ✅ No memory leaks

---

## Accessibility Testing

### Keyboard Navigation
1. Open cause creation modal
2. Tab through all fields
3. Use Enter/Space to toggle checkboxes
4. Tab to "Create Cause" and press Enter

**Expected Results**:
- ✅ All fields reachable via keyboard
- ✅ Focus indicators visible
- ✅ Form submits via Enter key

### Screen Reader Testing
1. Enable screen reader (e.g., NVDA, JAWS)
2. Navigate cause creation form
3. Verify all labels are announced

**Expected Results**:
- ✅ Checkbox labels announced
- ✅ Configuration section headings announced
- ✅ Error messages announced

---

## Rollback Testing

### Test Cause Creation Failure
1. Simulate network failure (disconnect internet)
2. Try to create cause
3. Verify error handling

**Expected Results**:
- ⚠️ Error toast: "Failed to create cause"
- ❌ Modal stays open
- 💾 Form data preserved
- 🔄 User can retry

---

## Success Criteria Checklist

### ✅ Basic Functionality
- [ ] Can create cause with Permanent only
- [ ] Can create cause with Consumable only
- [ ] Can create cause with Revolving only
- [ ] Can create cause with multiple types
- [ ] Can create cause with all three types
- [ ] Can edit existing cause to add/remove types
- [ ] Can delete cause

### ✅ Validation
- [ ] Cannot create cause with no waqf types
- [ ] Permanent config required when Permanent checked
- [ ] Consumable config required when Consumable checked
- [ ] Revolving config required when Revolving checked
- [ ] Duration validation works (1-240 months)
- [ ] Lock period validation works (min < max)
- [ ] ROI validation works (positive percentage)

### ✅ UI/UX
- [ ] Cause cards display correct badges
- [ ] Badge colors match waqf types
- [ ] Configuration sections show/hide correctly
- [ ] Filter tabs work in CausesModal
- [ ] Auto-filtering works based on selected waqf type
- [ ] Compatibility badges visible on cause cards
- [ ] Modal closes after successful creation
- [ ] Toast notifications appear

### ✅ Integration
- [ ] Created causes appear in admin causes list
- [ ] Created causes appear in WaqfForm CausesModal
- [ ] Filtering works correctly in donor flow
- [ ] Hybrid allocation respects cause types
- [ ] Image upload works with all types
- [ ] Data persists after page reload

### ✅ Data Integrity
- [ ] `supportedWaqfTypes` array saved correctly
- [ ] Configuration objects saved when types checked
- [ ] No extra configuration objects when types unchecked
- [ ] Updates don't corrupt existing data
- [ ] Existing waqfs still work after cause update

---

## Reporting Issues

When reporting bugs, include:
1. **Test scenario** (from this guide)
2. **Steps to reproduce**
3. **Expected vs actual behavior**
4. **Screenshots** (if UI issue)
5. **Browser console errors**
6. **Network tab** (if API issue)

---

## Conclusion

This testing guide covers:
- ✅ 13 main test scenarios
- ✅ 5 edge cases
- ✅ Validation testing
- ✅ Integration testing
- ✅ Performance testing
- ✅ Accessibility testing
- ✅ Rollback testing

**Next Steps After Testing**:
1. Fix any discovered bugs
2. Update documentation if behavior differs
3. Add automated tests for critical paths
4. Deploy to production when all tests pass

---

**Last Updated**: Phase 2 Completion  
**Related Docs**: 
- `docs/testing-guide-cause-filtering.md` - Donor-side testing
- `docs/waqf-product-structure.md` - Product specification
- `docs/implementation-checklist.md` - Implementation status
