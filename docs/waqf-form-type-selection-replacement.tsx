/* 
 * WAQF TYPE SELECTION UI - COMPLETE REPLACEMENT
 * 
 * Replace the entire "Waqf Type Selection" section in WaqfForm.tsx (approximately lines 574-670)
 * with this updated code that includes:
 * - Three waqf type cards (permanent, consumable, revolving)
 * - Hybrid allocation toggle
 * - Conditional configuration sections
 * - Hybrid allocation interface
 */

{/* Waqf Type Selection */}
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <Label className="text-lg font-semibold text-gray-900 dark:text-white">Waqf Type</Label>
  </div>
  
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
        Principal returned after term. Returns distributed to causes during lock period.
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
            const maturityDate = calculateMaturityDate(months);
            
            setFormData({
              ...formData,
              revolvingDetails: {
                ...formData.revolvingDetails!,
                lockPeriodMonths: months,
                maturityDate: maturityDate
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
{formData.isHybrid && formData.selectedCauseIds.length > 0 && (
  <div className="space-y-4 p-6 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 dark:from-green-900/20 dark:via-blue-900/20 dark:to-purple-900/20 rounded-lg">
    <h3 className="text-lg font-semibold">Hybrid Allocation per Cause</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400">
      For each selected cause, specify how to split your contribution across waqf types.
      Percentages for each cause must sum to 100%.
    </p>
    
    {formData.selectedCauseIds.map(causeId => {
      const cause = availableCauses.find(c => c.id === causeId);
      
      // Initialize allocation if not exists
      if (!formData.hybridAllocations[causeId]) {
        const defaultAllocation = {
          permanent: 50,
          temporary_consumable: 25,
          temporary_revolving: 25
        };
        // Update state asynchronously to avoid render loop
        setTimeout(() => {
          setFormData(prev => ({
            ...prev,
            hybridAllocations: {
              ...prev.hybridAllocations,
              [causeId]: defaultAllocation
            }
          }));
        }, 0);
      }
      
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
                      permanent: parseFloat(e.target.value) || 0
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
                      temporary_consumable: parseFloat(e.target.value) || 0
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
                      temporary_revolving: parseFloat(e.target.value) || 0
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
