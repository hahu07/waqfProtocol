# Deprecated Waqf Components

This folder contains components that have been replaced by newer implementations and are no longer used in the application.

## Components

### EnhancedWaqfDashboard.tsx
**Status:** ❌ Deprecated  
**Replaced by:** `PortfolioWaqfDashboard.tsx`  
**Reason:** The enhanced dashboard was replaced with a portfolio-based dashboard that better handles multi-cause waqf portfolios and provides improved UI/UX.

**Key differences:**
- PortfolioWaqfDashboard has better support for hybrid waqf types
- Improved revolving waqf tranche management
- Better integration with the portfolio creation flow
- Enhanced maturity action handling

### WaqfForm.tsx
**Status:** ❌ Deprecated  
**Replaced by:** CauseMarketplace flow (`/waqf/build-portfolio`, `/waqf/design-allocation`, etc.)  
**Reason:** Waqf creation moved from a single form to a multi-step portfolio-based flow for better UX and more flexibility.

**New flow:**
1. `/waqf/build-portfolio` - Select causes from marketplace
2. `/waqf/design-allocation` - Configure waqf type allocations and expiration preferences
3. `/waqf/preview-impact` - See projected impact
4. `/waqf/donor-details` - Enter donor information
5. `/waqf/sign-deed` - Sign the waqf deed

**What was extracted:**
- Expiration preference UI was relocated to the design-allocation page (see `docs/EXPIRATION_PREFERENCE_RELOCATION.md`)

## ⚠️ Important

**DO NOT USE THESE COMPONENTS** - They are kept here only for reference and may be deleted in the future.

If you need to reference any logic from these components, please:
1. Check the replacement components first
2. Document what you're extracting
3. Test thoroughly in the new context

## When to Delete

These files can be safely deleted after:
- [ ] Final verification that all functionality has been migrated
- [ ] Code review confirms nothing is missing
- [ ] Production has been stable with new components for at least 1 month

---
*Archived on: 2025-11-28*
