# Implementation Checklist: Three Waqf Models with Hybrid Allocation

## Status Overview
✅ = Completed
🚧 = In Progress
⏸️ = Pending

## Phase 1: Core Type System (✅ COMPLETED)

### Backend (Rust Satellite)
- ✅ Updated `WaqfType` enum with three models + Hybrid
- ✅ Created `ConsumableWaqfDetails` struct
- ✅ Created `RevolvingWaqfDetails` struct  
- ✅ Created `InvestmentStrategy` struct
- ✅ Created `HybridCauseAllocation` struct
- ✅ Updated `WaqfData` with new fields
- ✅ Implemented validation for consumable waqf
- ✅ Implemented validation for revolving waqf
- ✅ Implemented validation for hybrid allocations

### Frontend (TypeScript)
- ✅ Updated `WaqfType` enum
- ✅ Created `SpendingSchedule` type
- ✅ Created `ConsumableWaqfDetails` interface
- ✅ Created `RevolvingWaqfDetails` interface
- ✅ Created `InvestmentStrategy` interface
- ✅ Created `HybridCauseAllocation` interface
- ✅ Updated `Cause` interface with waqf type support
- ✅ Updated `WaqfProfile` interface
- ✅ Created Zod validation schemas for all new types
- ✅ Added `matured` status to waqf status enum

---

## Phase 2: UI Components (⏸️ PENDING)

### Cause Management UI Updates

**File**: `src/components/admin/causeFormModal.tsx`

Add these new fields to the cause form:

```tsx
// Add after existing form fields (around line 43)

// Supported Waqf Types
supportedWaqfTypes: cause?.supportedWaqfTypes || ['permanent'],

// Investment Strategy (for permanent waqf)
investmentStrategy: cause?.investmentStrategy || {
  assetAllocation: '60% Sukuk, 40% Equity',
  expectedAnnualReturn: 7.0,
  distributionFrequency: 'quarterly'
},

// Consumable Options
consumableOptions: cause?.consumableOptions || {
  minDurationMonths: 6,
  maxDurationMonths: 60,
  defaultSpendingSchedule: 'phased'
},

// Revolving Options
revolvingOptions: cause?.revolvingOptions || {
  minLockPeriodMonths: 12,
  maxLockPeriodMonths: 120,
  expectedReturnDuringPeriod: 35.0
}
```

**UI Sections to Add**:

1. **Waqf Types Section** (multi-select checkboxes)
   - ☐ Permanent Waqf
   - ☐ Temporary Consumable
   - ☐ Temporary Revolving

2. **Investment Strategy Section** (conditional on Permanent selected)
   - Asset Allocation (text input)
   - Expected Annual Return (number input, %)
   - Distribution Frequency (dropdown: monthly/quarterly/annually)

3. **Consumable Options Section** (conditional on Consumable selected)
   - Min Duration (months)
   - Max Duration (months)
   - Default Spending Schedule (dropdown)

4. **Revolving Options Section** (conditional on Revolving selected)
   - Min Lock Period (months)
   - Max Lock Period (months)
   - Expected Return During Period (%)

---

### Waqf Creation Form Updates

**File**: `src/components/waqf/WaqfForm.tsx`

#### Step 1: Update Form State (line 68-81)

Replace `waqfType: 'permanent' | 'temporary'` with:

```tsx
interface WaqfFormData {
  name: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  donorAddress: string;
  description: string;
  waqfAsset: number;
  selectedCauseIds: string[];
  
  // Waqf Type Selection
  waqfType: 'permanent' | 'temporary_consumable' | 'temporary_revolving' | 'hybrid';
  isHybrid: boolean;
  
  // Hybrid Allocations (if hybrid)
  hybridAllocations: {
    [causeId: string]: {
      permanent: number;
      temporary_consumable: number;
      temporary_revolving: number;
    }
  };
  
  // Consumable Details
  consumableDetails?: {
    startDate: string;
    endDate: string;
    spendingSchedule: 'immediate' | 'phased' | 'milestone-based';
    milestones?: Array<{
      description: string;
      targetDate: string;
      targetAmount: number;
    }>;
  };
  
  // Revolving Details
  revolvingDetails?: {
    lockPeriodMonths: number;
    maturityDate: string;
    principalReturnMethod: 'lump_sum' | 'installments';
    installmentSchedule?: {
      frequency: 'monthly' | 'quarterly' | 'annually';
      numberOfInstallments: number;
    };
    earlyWithdrawalPenalty?: number;
    earlyWithdrawalAllowed: boolean;
  };
  
  // Investment Strategy
  investmentStrategy?: {
    assetAllocation: string;
    expectedAnnualReturn: number;
    distributionFrequency: 'monthly' | 'quarterly' | 'annually';
  };
}
```

#### Step 2: Add Waqf Type Selection UI (after line 296)

```tsx
{/* Waqf Type Selection */}
<div className="space-y-4">
  <Label className="text-lg font-semibold">Waqf Type</Label>
  <p className="text-sm text-gray-600 dark:text-gray-400">
    Choose how your contribution will be managed
  </p>
  
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {/* Permanent Waqf Card */}
    <div 
      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
        formData.waqfType === 'permanent' 
          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
          : 'border-gray-300 hover:border-green-300'
      }`}
      onClick={() => setFormData({...formData, waqfType: 'permanent', isHybrid: false})}
    >
      <h4 className="font-bold text-lg mb-2">🏛️ Permanent Waqf</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Principal preserved forever. Only investment returns distributed to causes.
      </p>
      <div className="mt-3 text-xs text-green-600 dark:text-green-400 font-medium">
        ✓ Lasting legacy · ✓ Continuous impact · ✓ Perpetual rewards
      </div>
    </div>
    
    {/* Consumable Waqf Card */}
    <div 
      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
        formData.waqfType === 'temporary_consumable' 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-300 hover:border-blue-300'
      }`}
      onClick={() => setFormData({...formData, waqfType: 'temporary_consumable', isHybrid: false})}
    >
      <h4 className="font-bold text-lg mb-2">⚡ Consumable Waqf</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Principal + returns spent over time. Direct and immediate impact.
      </p>
      <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 font-medium">
        ✓ Fast impact · ✓ Complete spending · ✓ Time-bound
      </div>
    </div>
    
    {/* Revolving Waqf Card */}
    <div 
      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
        formData.waqfType === 'temporary_revolving' 
          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
          : 'border-gray-300 hover:border-purple-300'
      }`}
      onClick={() => setFormData({...formData, waqfType: 'temporary_revolving', isHybrid: false})}
    >
      <h4 className="font-bold text-lg mb-2">🔄 Revolving Waqf</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Principal returned after lock period. Returns distributed to causes during term.
      </p>
      <div className="mt-3 text-xs text-purple-600 dark:text-purple-400 font-medium">
        ✓ Capital preserved · ✓ Term rewards · ✓ Principal returned
      </div>
    </div>
  </div>
  
  {/* Hybrid Option Toggle */}
  <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={formData.isHybrid}
        onChange={(e) => setFormData({
          ...formData, 
          isHybrid: e.target.checked,
          waqfType: e.target.checked ? 'hybrid' : 'permanent'
        })}
        className="w-5 h-5"
      />
      <div>
        <span className="font-semibold">Enable Hybrid Allocation</span>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Split your contribution across multiple waqf types for each cause
        </p>
      </div>
    </label>
  </div>
</div>
```

#### Step 3: Add Conditional Configuration Sections

```tsx
{/* Consumable Waqf Configuration */}
{(formData.waqfType === 'temporary_consumable' || formData.isHybrid) && (
  <div className="space-y-4 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
      Consumable Waqf Configuration
    </h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="startDate">Start Date</Label>
        <Input
          type="date"
          id="startDate"
          value={formData.consumableDetails?.startDate || ''}
          onChange={(e) => setFormData({
            ...formData,
            consumableDetails: {
              ...formData.consumableDetails!,
              startDate: e.target.value
            }
          })}
        />
      </div>
      
      <div>
        <Label htmlFor="endDate">End Date</Label>
        <Input
          type="date"
          id="endDate"
          value={formData.consumableDetails?.endDate || ''}
          onChange={(e) => setFormData({
            ...formData,
            consumableDetails: {
              ...formData.consumableDetails!,
              endDate: e.target.value
            }
          })}
        />
      </div>
    </div>
    
    <div>
      <Label htmlFor="spendingSchedule">Spending Schedule</Label>
      <select
        id="spendingSchedule"
        value={formData.consumableDetails?.spendingSchedule || 'phased'}
        onChange={(e) => setFormData({
          ...formData,
          consumableDetails: {
            ...formData.consumableDetails!,
            spendingSchedule: e.target.value as 'immediate' | 'phased' | 'milestone-based'
          }
        })}
        className="w-full px-4 py-2 border rounded-md"
      >
        <option value="immediate">Immediate - Spend as soon as possible</option>
        <option value="phased">Phased - Gradual spending over time</option>
        <option value="milestone-based">Milestone-Based - Spend upon milestones</option>
      </select>
    </div>
  </div>
)}

{/* Revolving Waqf Configuration */}
{(formData.waqfType === 'temporary_revolving' || formData.isHybrid) && (
  <div className="space-y-4 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
    <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
      Revolving Waqf Configuration
    </h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="lockPeriod">Lock Period (months)</Label>
        <Input
          type="number"
          id="lockPeriod"
          min="1"
          max="240"
          value={formData.revolvingDetails?.lockPeriodMonths || 12}
          onChange={(e) => {
            const months = parseInt(e.target.value);
            const maturityDate = new Date();
            maturityDate.setMonth(maturityDate.getMonth() + months);
            
            setFormData({
              ...formData,
              revolvingDetails: {
                ...formData.revolvingDetails!,
                lockPeriodMonths: months,
                maturityDate: maturityDate.toISOString()
              }
            });
          }}
        />
        <p className="text-xs text-gray-500 mt-1">
          Min: 1 month, Max: 240 months (20 years)
        </p>
      </div>
      
      <div>
        <Label htmlFor="returnMethod">Principal Return Method</Label>
        <select
          id="returnMethod"
          value={formData.revolvingDetails?.principalReturnMethod || 'lump_sum'}
          onChange={(e) => setFormData({
            ...formData,
            revolvingDetails: {
              ...formData.revolvingDetails!,
              principalReturnMethod: e.target.value as 'lump_sum' | 'installments'
            }
          })}
          className="w-full px-4 py-2 border rounded-md"
        >
          <option value="lump_sum">Lump Sum - Return all at maturity</option>
          <option value="installments">Installments - Return in portions</option>
        </select>
      </div>
    </div>
    
    <div className="p-4 bg-white dark:bg-gray-800 rounded-md">
      <p className="text-sm text-gray-700 dark:text-gray-300">
        <strong>Maturity Date:</strong> {formData.revolvingDetails?.maturityDate ? 
          new Date(formData.revolvingDetails.maturityDate).toLocaleDateString() : 'Not set'}
      </p>
      <p className="text-xs text-gray-500 mt-2">
        Your principal will be returned to you on this date. All investment returns 
        generated during the lock period will be distributed to your selected causes.
      </p>
    </div>
  </div>
)}

{/* Hybrid Allocation Interface */}
{formData.isHybrid && (
  <div className="space-y-4 p-6 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 dark:from-green-900/20 dark:via-blue-900/20 dark:to-purple-900/20 rounded-lg">
    <h3 className="text-lg font-semibold">Hybrid Allocation per Cause</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400">
      For each selected cause, specify how to split your contribution across waqf types.
      Percentages for each cause must sum to 100%.
    </p>
    
    {formData.selectedCauseIds.map(causeId => {
      const cause = availableCauses.find(c => c.id === causeId);
      const allocation = formData.hybridAllocations[causeId] || {
        permanent: 50,
        temporary_consumable: 25,
        temporary_revolving: 25
      };
      
      return (
        <div key={causeId} className="p-4 bg-white dark:bg-gray-800 rounded-lg space-y-3">
          <h4 className="font-semibold">{cause?.name}</h4>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Permanent %</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={allocation.permanent}
                onChange={(e) => {
                  const newAllocation = {
                    ...formData.hybridAllocations,
                    [causeId]: {
                      ...allocation,
                      permanent: parseFloat(e.target.value)
                    }
                  };
                  setFormData({...formData, hybridAllocations: newAllocation});
                }}
              />
            </div>
            
            <div>
              <Label>Consumable %</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={allocation.temporary_consumable}
                onChange={(e) => {
                  const newAllocation = {
                    ...formData.hybridAllocations,
                    [causeId]: {
                      ...allocation,
                      temporary_consumable: parseFloat(e.target.value)
                    }
                  };
                  setFormData({...formData, hybridAllocations: newAllocation});
                }}
              />
            </div>
            
            <div>
              <Label>Revolving %</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={allocation.temporary_revolving}
                onChange={(e) => {
                  const newAllocation = {
                    ...formData.hybridAllocations,
                    [causeId]: {
                      ...allocation,
                      temporary_revolving: parseFloat(e.target.value)
                    }
                  };
                  setFormData({...formData, hybridAllocations: newAllocation});
                }}
              />
            </div>
          </div>
          
          {/* Validation Indicator */}
          {(() => {
            const total = allocation.permanent + allocation.temporary_consumable + allocation.temporary_revolving;
            const isValid = Math.abs(total - 100) < 0.01;
            return (
              <div className={`text-sm font-medium ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                Total: {total.toFixed(1)}% {isValid ? '✓' : '⚠️ Must equal 100%'}
              </div>
            );
          })()}
        </div>
      );
    })}
  </div>
)}
```

---

### Waqf Dashboard Display Updates

**File**: `src/components/waqf/WaqfCard.tsx` or similar

Add conditional rendering based on waqf type:

```tsx
{/* Display different metrics based on waqf type */}
{waqf.waqfType === 'permanent' && (
  <div className="metric">
    <span className="label">Legacy Status</span>
    <span className="value">Active Forever ∞</span>
  </div>
)}

{waqf.waqfType === 'temporary_consumable' && waqf.consumableDetails && (
  <>
    <div className="metric">
      <span className="label">Spending Schedule</span>
      <span className="value">{waqf.consumableDetails.spendingSchedule}</span>
    </div>
    <div className="metric">
      <span className="label">Completion Date</span>
      <span className="value">
        {new Date(waqf.consumableDetails.endDate).toLocaleDateString()}
      </span>
    </div>
  </>
)}

{waqf.waqfType === 'temporary_revolving' && waqf.revolvingDetails && (
  <>
    <div className="metric">
      <span className="label">Principal</span>
      <span className="value">
        ${waqf.waqfAsset.toFixed(2)} (returns on {new Date(waqf.revolvingDetails.maturityDate).toLocaleDateString()})
      </span>
    </div>
    <div className="metric">
      <span className="label">Time Remaining</span>
      <span className="value">
        {calculateTimeRemaining(waqf.revolvingDetails.maturityDate)}
      </span>
    </div>
    <div className="metric">
      <span className="label">Status</span>
      <span className="value">
        {waqf.status === 'matured' ? '✓ Matured - Principal Available' : '🔒 Locked'}
      </span>
    </div>
  </>
)}

{waqf.waqfType === 'hybrid' && (
  <div className="metric">
    <span className="label">Allocation Strategy</span>
    <span className="value">Hybrid (Mixed Types)</span>
  </div>
)}
```

---

## Phase 3: Data Migration & Testing (⏸️ PENDING)

### Migration Steps

1. ☐ **Backup existing data**
   - Export all waqfs from production
   - Export all causes from production

2. ☐ **Add default values to existing records**
   - Set `supportedWaqfTypes: ['permanent']` for all existing causes
   - Set `isHybrid: false` for all existing waqfs
   - Convert old `temporaryDetails` to new `consumableDetails` where applicable

3. ☐ **Test Rust satellite rebuild**
   ```bash
   cargo build --target wasm32-unknown-unknown --release
   ```

4. ☐ **Deploy to development satellite**
   ```bash
   juno hosting deploy
   ```

5. ☐ **Test all waqf type combinations**
   - Create permanent waqf
   - Create consumable waqf
   - Create revolving waqf
   - Create hybrid waqf

6. ☐ **Validation testing**
   - Test hybrid allocation percentages
   - Test lock period constraints
   - Test spending schedule options
   - Test maturity date calculations

---

## Phase 4: Financial Tracking (⏸️ PENDING)

### Maturity Tracking System

**New File**: `src/lib/maturity-tracker.ts`

```typescript
export async function checkMaturedWaqfs() {
  // Query all revolving waqfs
  // Check maturity dates
  // Update status to 'matured' for eligible waqfs
  // Trigger notifications to donors
}

export function calculateTimeRemaining(maturityDate: string): string {
  const now = new Date();
  const maturity = new Date(maturityDate);
  const diff = maturity.getTime() - now.getTime();
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);
  
  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ${months % 12} month${months % 12 !== 1 ? 's' : ''}`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''}`;
  return `${days} day${days !== 1 ? 's' : ''}`;
}
```

### Cron Job / Scheduled Function

```typescript
// Run daily to check for matured waqfs
export async function dailyMaturityCheck() {
  const maturedWaqfs = await checkMaturedWaqfs();
  
  for (const waqf of maturedWaqfs) {
    // Update status
    await updateWaqfStatus(waqf.id, 'matured');
    
    // Send notification to donor
    await sendMaturityNotification(waqf);
    
    // Log the event
    await logActivityEvent({
      action: 'waqf_matured',
      waqfId: waqf.id,
      details: `Revolving waqf matured. Principal ready for return.`
    });
  }
}
```

---

## Phase 5: Documentation & User Guide (⏸️ PENDING)

### User-Facing Documentation

Create: `docs/waqf-types-guide.md`

Content: Educational guide explaining:
- What is permanent waqf?
- What is consumable waqf?
- What is revolving waqf?
- When to use hybrid allocation?
- Examples and use cases
- Shariah compliance notes

### Developer Documentation

Update: `README.md`

Add section on:
- New waqf type architecture
- How to add new waqf types
- Validation logic flow
- Financial tracking implementation

---

## Testing Checklist

### Unit Tests
- ☐ Zod schema validation tests
- ☐ Rust validation logic tests
- ☐ Hybrid allocation sum validation
- ☐ Date validation tests

### Integration Tests  
- ☐ Waqf creation flow (all types)
- ☐ Waqf update flow
- ☐ Hybrid allocation workflow
- ☐ Payment integration
- ☐ Status transitions

### E2E Tests
- ☐ Complete waqf creation journey
- ☐ Donor dashboard display
- ☐ Admin cause management
- ☐ Maturity notification flow

---

## Deployment Plan

### Pre-Deployment
1. ☐ Run all tests
2. ☐ Review security implications
3. ☐ Backup production data
4. ☐ Prepare rollback plan

### Deployment Steps
1. ☐ Deploy Rust satellite (backend)
2. ☐ Verify satellite health
3. ☐ Deploy frontend
4. ☐ Run smoke tests
5. ☐ Monitor error logs

### Post-Deployment
1. ☐ Verify all waqf types are creatable
2. ☐ Check dashboard rendering
3. ☐ Monitor user feedback
4. ☐ Document any issues

---

## Next Steps

**Immediate Priority:**
1. Update `CauseFormModal.tsx` with new fields
2. Update `WaqfForm.tsx` with type selection UI
3. Create helper functions for validation
4. Test with development satellite

**After Core Implementation:**
1. Build maturity tracking system
2. Create notification system
3. Add analytics for waqf type distribution
4. Create user education materials
