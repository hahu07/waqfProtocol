# Impact Events - Quick Start Guide

## 📍 Where to Find the Utility Functions

The utility functions are located in: **`src/lib/impact-events.ts`**

## 🔧 Available Utility Functions

### 1. Create Impact Event
```typescript
import { createImpactEvent } from '@/lib/impact-events';

const result = await createImpactEvent({
  waqfId: 'waqf-123',
  waqfName: 'Education Fund',
  causeId: 'cause-456',
  causeName: 'Build Schools',
  type: 'distribution', // or 'milestone_completed', 'beneficiary_helped', etc.
  amount: 5000,
  currency: 'USD',
  beneficiaryCount: 100,
  location: {
    country: 'Kenya',
    city: 'Nairobi',
  },
  description: 'Distributed funds to build a new school',
  title: 'New School Construction Started',
  createdBy: 'user-id',
  media: {
    photos: ['https://example.com/photo.jpg'],
    testimonials: [{
      name: 'Ahmed',
      quote: 'This will change our community',
    }],
  },
});

if (result.success) {
  console.log('Created event:', result.event);
} else {
  console.error('Error:', result.error);
}
```

### 2. Get Impact Events
```typescript
import {
  getImpactEvent,
  getImpactEventsByWaqf,
  getImpactEventsByCause,
  getRecentImpactEvents,
  getFeaturedImpactEvents,
} from '@/lib/impact-events';

// Get single event
const event = await getImpactEvent('event-id');

// Get events for a waqf
const waqfEvents = await getImpactEventsByWaqf('waqf-123');

// Get events for a cause
const causeEvents = await getImpactEventsByCause('cause-456');

// Get recent public events
const recentEvents = await getRecentImpactEvents(20);

// Get featured events
const featuredEvents = await getFeaturedImpactEvents(10);
```

### 3. Update Impact Event
```typescript
import {
  updateImpactEventVerification,
  addImpactEventMedia,
} from '@/lib/impact-events';

// Update verification status
await updateImpactEventVerification('event-id', {
  verifiedBy: 'admin-id',
  status: 'verified',
  proofDocuments: ['https://example.com/receipt.pdf'],
  notes: 'Verified with receipts and photos',
});

// Add media
await addImpactEventMedia('event-id', {
  photos: ['https://example.com/new-photo.jpg'],
  testimonials: [{
    name: 'Fatima',
    quote: 'Thank you for your support',
  }],
});
```

### 4. Helper Functions
```typescript
import {
  formatImpactEventType,
  getImpactEventIcon,
  getImpactEventColor,
} from '@/lib/impact-events';

// Format event type for display
const displayName = formatImpactEventType('distribution'); // "Funds Distributed"

// Get icon for event type
const icon = getImpactEventIcon('distribution'); // "💰"

// Get color for event type
const color = getImpactEventColor('distribution'); // "blue"
```

## 🎨 UI Components

### Impact Event Feed Component
```tsx
import { ImpactEventFeed } from '@/components/impact/ImpactEventFeed';

// Show recent events
<ImpactEventFeed limit={20} showFeatured={false} />

// Show featured stories
<ImpactEventFeed limit={10} showFeatured={true} />

// Show events for specific waqf
<ImpactEventFeed waqfId="waqf-123" limit={10} />

// Show events for specific cause
<ImpactEventFeed causeId="cause-456" limit={10} />
```

## 🧪 Testing with Sample Data

### Option 1: Use the Admin Page (Easiest)

1. Navigate to: **`/admin/sample-data`**
2. Click "Create 10 Sample Events"
3. View results at: **`/impact`**

### Option 2: Use the Script Functions

```typescript
import {
  createSampleImpactEvents,
  createFeaturedEvent,
  generateSampleEvent,
} from '@/scripts/create-sample-impact-events';

// Create 10 random events
const events = await createSampleImpactEvents(10);

// Create a featured event
const featured = await createFeaturedEvent();

// Generate event data (without saving)
const eventData = generateSampleEvent();
```

### Option 3: Manual Creation

```typescript
import { createImpactEvent } from '@/lib/impact-events';

const result = await createImpactEvent({
  waqfId: 'waqf-001',
  waqfName: 'Education Endowment Fund',
  causeId: 'cause-001',
  causeName: 'Build Schools',
  type: 'distribution',
  amount: 5000,
  currency: 'USD',
  beneficiaryCount: 100,
  location: {
    country: 'Kenya',
    city: 'Nairobi',
  },
  description: 'Distributed funds to support school construction',
  title: 'Quarterly Distribution to Build Schools',
  createdBy: 'admin-user',
  isPublic: true,
  isFeatured: false,
});
```

## 📊 Event Types

Available impact event types:

1. **`distribution`** - Funds distributed to beneficiaries
2. **`milestone_completed`** - Project milestone reached
3. **`beneficiary_helped`** - Direct assistance to beneficiaries
4. **`project_completed`** - Project fully completed
5. **`funds_deployed`** - Investment funds deployed
6. **`emergency_response`** - Emergency relief provided
7. **`investment_return`** - Investment returns generated

## 🔐 Before You Start

### 1. Create the Collection in Juno

1. Go to [Juno Console](https://console.juno.build)
2. Select your satellite
3. Go to "Datastore" → "Collections"
4. Create a new collection named: **`impact_events`**
5. Set permissions:
   - **Read**: Public (or Authenticated)
   - **Write**: Authenticated
   - **Delete**: Controllers only

### 2. Deploy the Satellite (if needed)

If you've made changes to the Rust backend:

```bash
cd src/satellite
cargo build --release --target wasm32-unknown-unknown
juno deploy
```

## 🚀 Quick Test Flow

1. **Create the collection** in Juno Console
2. **Navigate to** `/admin/sample-data`
3. **Click** "Create 10 Sample Events"
4. **View results** at `/impact`
5. **Verify** events appear in the feed

## 📁 File Locations

- **Utility Functions**: `src/lib/impact-events.ts`
- **TypeScript Types**: `src/types/impact.ts`
- **Validation Schemas**: `src/schemas/index.ts`
- **UI Component**: `src/components/impact/ImpactEventFeed.tsx`
- **Sample Generator**: `src/scripts/create-sample-impact-events.ts`
- **Admin Page**: `src/app/admin/sample-data/page.tsx`
- **Impact Dashboard**: `src/app/impact/page.tsx`
- **Rust Types**: `src/satellite/src/impact_event_types.rs`
- **Rust Hooks**: `src/satellite/src/impact_event_hooks.rs`

## 🔗 Integration Examples

### Integrate with Distribution System

```typescript
// In your distribution execution function
import { createImpactEvent } from '@/lib/impact-events';

async function executeDistribution(distributionData) {
  // ... execute distribution logic ...
  
  // Create impact event
  await createImpactEvent({
    waqfId: distributionData.waqfId,
    waqfName: distributionData.waqfName,
    causeId: distributionData.causeId,
    causeName: distributionData.causeName,
    type: 'distribution',
    amount: distributionData.amount,
    currency: distributionData.currency,
    beneficiaryCount: distributionData.beneficiaryCount,
    location: distributionData.location,
    description: `Distributed ${distributionData.amount} ${distributionData.currency} to support ${distributionData.causeName}`,
    title: `Distribution to ${distributionData.causeName}`,
    createdBy: currentUserId,
  });
}
```

### Add to Waqf Dashboard

```tsx
// In your waqf dashboard component
import { ImpactEventFeed } from '@/components/impact/ImpactEventFeed';

function WaqfDashboard({ waqfId }) {
  return (
    <div>
      {/* ... other dashboard content ... */}
      
      <section>
        <h2>Recent Impact</h2>
        <ImpactEventFeed waqfId={waqfId} limit={5} />
      </section>
    </div>
  );
}
```

## 🎯 Next Steps

After testing the Impact Event Feed:

1. **Integrate with distributions** - Auto-create events when funds are distributed
2. **Add verification workflow** - Admin page to verify events
3. **Add notifications** - Notify donors of new impact events
4. **Move to next feature** - Donor Progression System (badges, XP, levels)

## 📞 Need Help?

- Check the implementation guide: `docs/INNOVATION_IMPLEMENTATION_GUIDE.md`
- Review the type definitions: `src/types/impact.ts`
- Look at sample data generator: `src/scripts/create-sample-impact-events.ts`

