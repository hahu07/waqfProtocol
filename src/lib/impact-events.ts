/**
 * Impact Event Management
 * 
 * Functions for creating, fetching, and managing impact events
 */

import { getDoc, setDoc, listDocs } from '@junobuild/core';
import type { ImpactEvent, ImpactEventType } from '@/types/impact';
import { randomUUID } from '@/lib/crypto-polyfill';

const COLLECTION_NAME = 'impact_events';

// ============================================
// CREATE IMPACT EVENT
// ============================================

export interface CreateImpactEventParams {
  waqfId: string;
  waqfName: string;
  causeId: string;
  causeName: string;
  type: ImpactEventType;
  amount: number;
  currency: string;
  beneficiaryCount: number;
  projectsCompleted?: number;
  location: {
    country: string;
    city?: string;
    region?: string;
    coordinates?: { lat: number; lng: number };
  };
  description: string;
  title: string;
  createdBy: string;
  media?: {
    photos?: string[];
    videos?: string[];
    testimonials?: Array<{
      name: string;
      quote: string;
      photo?: string;
      date?: string;
    }>;
  };
  isPublic?: boolean;
  isFeatured?: boolean;
}

export async function createImpactEvent(
  params: CreateImpactEventParams
): Promise<{ success: boolean; event?: ImpactEvent; error?: string }> {
  try {
    const now = Date.now() * 1_000_000; // Convert to nanoseconds
    const eventId = randomUUID();

    const event: ImpactEvent = {
      id: eventId,
      waqfId: params.waqfId,
      waqfName: params.waqfName,
      causeId: params.causeId,
      causeName: params.causeName,
      timestamp: now.toString(),
      type: params.type,
      amount: params.amount,
      currency: params.currency,
      beneficiaryCount: params.beneficiaryCount,
      projectsCompleted: params.projectsCompleted,
      location: params.location,
      media: {
        photos: params.media?.photos || [],
        videos: params.media?.videos || [],
        testimonials: params.media?.testimonials || [],
      },
      verification: {
        verifiedBy: params.createdBy,
        verificationDate: now.toString(),
        proofDocuments: [],
        status: 'pending',
      },
      description: params.description,
      title: params.title,
      createdBy: params.createdBy,
      createdAt: now.toString(),
      isPublic: params.isPublic ?? true,
      isFeatured: params.isFeatured ?? false,
    };

    await setDoc({
      collection: COLLECTION_NAME,
      doc: {
        key: eventId,
        data: event,
      },
    });

    return { success: true, event };
  } catch (error) {
    console.error('Error creating impact event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create impact event',
    };
  }
}

// ============================================
// FETCH IMPACT EVENTS
// ============================================

export async function getImpactEvent(eventId: string): Promise<ImpactEvent | null> {
  try {
    const doc = await getDoc({
      collection: COLLECTION_NAME,
      key: eventId,
    });

    return doc ? (doc.data as ImpactEvent) : null;
  } catch (error) {
    console.error('Error fetching impact event:', error);
    return null;
  }
}

export async function getImpactEventsByWaqf(waqfId: string): Promise<ImpactEvent[]> {
  try {
    const { items } = await listDocs({
      collection: COLLECTION_NAME,
    });

    const events = items
      .map((item) => item.data as ImpactEvent)
      .filter((event) => event.waqfId === waqfId)
      .sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));

    return events;
  } catch (error) {
    console.error('Error fetching waqf impact events:', error);
    return [];
  }
}

export async function getImpactEventsByCause(causeId: string): Promise<ImpactEvent[]> {
  try {
    const { items } = await listDocs({
      collection: COLLECTION_NAME,
    });

    const events = items
      .map((item) => item.data as ImpactEvent)
      .filter((event) => event.causeId === causeId)
      .sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));

    return events;
  } catch (error) {
    console.error('Error fetching cause impact events:', error);
    return [];
  }
}

export async function getRecentImpactEvents(limit: number = 20): Promise<ImpactEvent[]> {
  try {
    const { items } = await listDocs({
      collection: COLLECTION_NAME,
    });

    const events = items
      .map((item) => item.data as ImpactEvent)
      .filter((event) => event.isPublic)
      .sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp))
      .slice(0, limit);

    return events;
  } catch (error) {
    console.error('Error fetching recent impact events:', error);
    return [];
  }
}

export async function getFeaturedImpactEvents(limit: number = 10): Promise<ImpactEvent[]> {
  try {
    const { items } = await listDocs({
      collection: COLLECTION_NAME,
    });

    const events = items
      .map((item) => item.data as ImpactEvent)
      .filter((event) => event.isFeatured && event.isPublic)
      .sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp))
      .slice(0, limit);

    return events;
  } catch (error) {
    console.error('Error fetching featured impact events:', error);
    return [];
  }
}

// ============================================
// UPDATE IMPACT EVENT
// ============================================

export async function updateImpactEventVerification(
  eventId: string,
  verification: {
    verifiedBy: string;
    status: 'pending' | 'verified' | 'rejected';
    proofDocuments?: string[];
    notes?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const event = await getImpactEvent(eventId);
    if (!event) {
      return { success: false, error: 'Impact event not found' };
    }

    const now = Date.now() * 1_000_000;
    const updatedEvent: ImpactEvent = {
      ...event,
      verification: {
        ...event.verification,
        ...verification,
        verificationDate: now.toString(),
      },
      updatedAt: now.toString(),
    };

    await setDoc({
      collection: COLLECTION_NAME,
      doc: {
        key: eventId,
        data: updatedEvent,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating impact event verification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update verification',
    };
  }
}

export async function addImpactEventMedia(
  eventId: string,
  media: {
    photos?: string[];
    videos?: string[];
    testimonials?: Array<{
      name: string;
      quote: string;
      photo?: string;
      date?: string;
    }>;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const event = await getImpactEvent(eventId);
    if (!event) {
      return { success: false, error: 'Impact event not found' };
    }

    const now = Date.now() * 1_000_000;
    const updatedEvent: ImpactEvent = {
      ...event,
      media: {
        photos: [...event.media.photos, ...(media.photos || [])],
        videos: [...event.media.videos, ...(media.videos || [])],
        testimonials: [...event.media.testimonials, ...(media.testimonials || [])],
      },
      updatedAt: now.toString(),
    };

    await setDoc({
      collection: COLLECTION_NAME,
      doc: {
        key: eventId,
        data: updatedEvent,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error adding impact event media:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add media',
    };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function formatImpactEventType(type: ImpactEventType): string {
  const typeMap: Record<ImpactEventType, string> = {
    distribution: 'Funds Distributed',
    milestone_completed: 'Milestone Completed',
    beneficiary_helped: 'Beneficiary Helped',
    project_completed: 'Project Completed',
    funds_deployed: 'Funds Deployed',
    emergency_response: 'Emergency Response',
    investment_return: 'Investment Return',
  };
  return typeMap[type] || type;
}

export function getImpactEventIcon(type: ImpactEventType): string {
  const iconMap: Record<ImpactEventType, string> = {
    distribution: '💰',
    milestone_completed: '🎯',
    beneficiary_helped: '🤝',
    project_completed: '✅',
    funds_deployed: '🚀',
    emergency_response: '🚨',
    investment_return: '📈',
  };
  return iconMap[type] || '📊';
}

export function getImpactEventColor(type: ImpactEventType): string {
  const colorMap: Record<ImpactEventType, string> = {
    distribution: 'blue',
    milestone_completed: 'green',
    beneficiary_helped: 'purple',
    project_completed: 'emerald',
    funds_deployed: 'indigo',
    emergency_response: 'red',
    investment_return: 'teal',
  };
  return colorMap[type] || 'gray';
}

