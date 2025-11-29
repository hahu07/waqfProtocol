/**
 * Sample Impact Events Generator
 * 
 * Run this script to create sample impact events for testing
 * Usage: Create a page or API route that calls these functions
 */

import { createImpactEvent } from '@/lib/impact-events';
import type { ImpactEventType } from '@/types/impact';

// Sample data
const sampleWaqfs = [
  { id: 'waqf-001', name: 'Education Endowment Fund' },
  { id: 'waqf-002', name: 'Healthcare Support Waqf' },
  { id: 'waqf-003', name: 'Clean Water Initiative' },
  { id: 'waqf-004', name: 'Orphan Care Fund' },
  { id: 'waqf-005', name: 'Emergency Relief Waqf' },
];

const sampleCauses = [
  { id: 'cause-001', name: 'Build Schools in Rural Areas' },
  { id: 'cause-002', name: 'Provide Medical Equipment' },
  { id: 'cause-003', name: 'Install Water Wells' },
  { id: 'cause-004', name: 'Support Orphanages' },
  { id: 'cause-005', name: 'Disaster Relief Operations' },
];

const sampleLocations = [
  { country: 'Kenya', city: 'Nairobi', region: 'Nairobi County' },
  { country: 'Nigeria', city: 'Lagos', region: 'Lagos State' },
  { country: 'Pakistan', city: 'Karachi', region: 'Sindh' },
  { country: 'Bangladesh', city: 'Dhaka', region: 'Dhaka Division' },
  { country: 'Indonesia', city: 'Jakarta', region: 'Jakarta' },
  { country: 'Egypt', city: 'Cairo', region: 'Cairo Governorate' },
  { country: 'Turkey', city: 'Istanbul', region: 'Istanbul Province' },
  { country: 'Malaysia', city: 'Kuala Lumpur', region: 'Federal Territory' },
];

const sampleTestimonials = [
  {
    name: 'Ahmed Hassan',
    quote: 'This support has changed our entire community. Our children now have access to quality education.',
    photo: 'https://i.pravatar.cc/150?img=12',
  },
  {
    name: 'Fatima Noor',
    quote: 'The medical equipment saved my daughter\'s life. We are forever grateful.',
    photo: 'https://i.pravatar.cc/150?img=45',
  },
  {
    name: 'Ibrahim Yusuf',
    quote: 'Clean water has reduced disease in our village by 80%. Thank you!',
    photo: 'https://i.pravatar.cc/150?img=33',
  },
  {
    name: 'Aisha Mohammed',
    quote: 'The orphanage now provides a safe home for 50 children. This is a blessing.',
    photo: 'https://i.pravatar.cc/150?img=28',
  },
  {
    name: 'Omar Abdullah',
    quote: 'Emergency relief arrived within 24 hours. You saved our families.',
    photo: 'https://i.pravatar.cc/150?img=51',
  },
];

const samplePhotos = [
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
  'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800',
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
];

// Event templates
const eventTemplates = [
  {
    type: 'distribution' as ImpactEventType,
    title: 'Quarterly Distribution to {cause}',
    description: 'Successfully distributed funds to support {cause}. The funds will directly benefit {beneficiaries} families in {location}.',
    amount: 5000,
    beneficiaryCount: 100,
  },
  {
    type: 'milestone_completed' as ImpactEventType,
    title: 'Major Milestone: {cause} Reaches 50% Completion',
    description: 'We\'ve reached a significant milestone in our {cause} project. Construction is now 50% complete and on schedule.',
    amount: 15000,
    beneficiaryCount: 250,
    projectsCompleted: 1,
  },
  {
    type: 'beneficiary_helped' as ImpactEventType,
    title: '{beneficiaries} Families Received Support',
    description: 'Direct assistance provided to {beneficiaries} families through {cause}. Each family received essential supplies and support.',
    amount: 3000,
    beneficiaryCount: 50,
  },
  {
    type: 'project_completed' as ImpactEventType,
    title: 'Project Complete: New School Opens in {location}',
    description: 'Celebrating the completion of a new school building! This facility will serve {beneficiaries} students for generations to come.',
    amount: 50000,
    beneficiaryCount: 500,
    projectsCompleted: 1,
  },
  {
    type: 'funds_deployed' as ImpactEventType,
    title: 'Investment Funds Deployed for {cause}',
    description: 'Allocated investment capital to support {cause}. Expected to generate sustainable returns for ongoing support.',
    amount: 25000,
    beneficiaryCount: 200,
  },
  {
    type: 'emergency_response' as ImpactEventType,
    title: 'Emergency Relief Deployed to {location}',
    description: 'Rapid response team deployed emergency supplies to {location}. Providing immediate assistance to {beneficiaries} affected families.',
    amount: 10000,
    beneficiaryCount: 300,
  },
  {
    type: 'investment_return' as ImpactEventType,
    title: 'Investment Returns Generated',
    description: 'Quarterly investment returns from {waqf} have been realized. These returns will fund ongoing charitable activities.',
    amount: 2500,
    beneficiaryCount: 75,
  },
];

// Helper function to replace placeholders
function fillTemplate(template: string, data: Record<string, string | number>): string {
  let result = template;
  Object.entries(data).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{${key}}`, 'g'), String(value));
  });
  return result;
}

// Generate random sample event
export function generateSampleEvent() {
  const waqf = sampleWaqfs[Math.floor(Math.random() * sampleWaqfs.length)];
  const cause = sampleCauses[Math.floor(Math.random() * sampleCauses.length)];
  const location = sampleLocations[Math.floor(Math.random() * sampleLocations.length)];
  const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
  
  // Random number of photos (0-3)
  const photoCount = Math.floor(Math.random() * 4);
  const photos = Array.from({ length: photoCount }, () => 
    samplePhotos[Math.floor(Math.random() * samplePhotos.length)]
  );
  
  // Random number of testimonials (0-2)
  const testimonialCount = Math.floor(Math.random() * 3);
  const testimonials = Array.from({ length: testimonialCount }, () => 
    sampleTestimonials[Math.floor(Math.random() * sampleTestimonials.length)]
  );
  
  const locationStr = location.city ? `${location.city}, ${location.country}` : location.country;
  
  const data = {
    waqf: waqf.name,
    cause: cause.name,
    location: locationStr,
    beneficiaries: template.beneficiaryCount.toString(),
  };
  
  return {
    waqfId: waqf.id,
    waqfName: waqf.name,
    causeId: cause.id,
    causeName: cause.name,
    type: template.type,
    amount: template.amount + Math.floor(Math.random() * 5000),
    currency: 'USD',
    beneficiaryCount: template.beneficiaryCount + Math.floor(Math.random() * 50),
    projectsCompleted: template.projectsCompleted,
    location,
    description: fillTemplate(template.description, data),
    title: fillTemplate(template.title, data),
    createdBy: 'admin-sample-generator',
    media: {
      photos,
      testimonials,
    },
    isPublic: true,
    isFeatured: Math.random() > 0.7, // 30% chance of being featured
  };
}

// Create multiple sample events
export async function createSampleImpactEvents(count: number = 10) {
  const results = [];
  
  for (let i = 0; i < count; i++) {
    const eventData = generateSampleEvent();
    const result = await createImpactEvent(eventData);
    
    if (result.success) {
      console.log(`✅ Created sample event ${i + 1}/${count}: ${result.event?.title}`);
      results.push(result.event);
    } else {
      console.error(`❌ Failed to create event ${i + 1}/${count}:`, result.error);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}

// Create a specific featured event
export async function createFeaturedEvent() {
  const eventData = {
    waqfId: 'waqf-001',
    waqfName: 'Education Endowment Fund',
    causeId: 'cause-001',
    causeName: 'Build Schools in Rural Areas',
    type: 'project_completed' as ImpactEventType,
    amount: 75000,
    currency: 'USD',
    beneficiaryCount: 800,
    projectsCompleted: 1,
    location: {
      country: 'Kenya',
      city: 'Nairobi',
      region: 'Nairobi County',
      coordinates: { lat: -1.2921, lng: 36.8219 },
    },
    description: 'After 18 months of construction, we are thrilled to announce the completion of Al-Noor Primary School in Nairobi. This state-of-the-art facility includes 12 classrooms, a library, computer lab, and playground. The school will serve 800 students from underserved communities, providing quality education for generations to come.',
    title: '🎉 Al-Noor Primary School Grand Opening',
    createdBy: 'admin-featured',
    media: {
      photos: [
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800',
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
      ],
      testimonials: [
        {
          name: 'Ahmed Hassan',
          quote: 'This school is a dream come true for our community. My three children will finally have access to quality education close to home.',
          photo: 'https://i.pravatar.cc/150?img=12',
        },
        {
          name: 'Fatima Noor',
          quote: 'As a teacher, I am amazed by the facilities. This will transform education in our area.',
          photo: 'https://i.pravatar.cc/150?img=45',
        },
      ],
    },
    isPublic: true,
    isFeatured: true,
  };
  
  const result = await createImpactEvent(eventData);
  
  if (result.success) {
    console.log('✅ Created featured event:', result.event?.title);
  } else {
    console.error('❌ Failed to create featured event:', result.error);
  }
  
  return result;
}

