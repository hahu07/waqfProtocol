/**
 * Impact Event Types
 * 
 * Types for tracking and displaying real-time impact events
 */

// ============================================
// IMPACT EVENT TYPES
// ============================================

export type ImpactEventType = 
  | 'distribution'
  | 'milestone_completed'
  | 'beneficiary_helped'
  | 'project_completed'
  | 'funds_deployed'
  | 'emergency_response'
  | 'investment_return';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface ImpactEventLocation {
  country: string;
  city?: string;
  region?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface BeneficiaryTestimonial {
  name: string;
  quote: string;
  photo?: string;
  date?: string;
}

export interface ImpactEventMedia {
  photos: string[];
  videos: string[];
  testimonials: BeneficiaryTestimonial[];
}

export interface ImpactEventVerification {
  verifiedBy: string; // Organization or admin name
  verificationDate: string; // Nanosecond timestamp
  proofDocuments: string[]; // URLs to receipts, invoices, etc.
  status: VerificationStatus;
  notes?: string;
}

export interface ImpactEvent {
  id: string;
  waqfId: string;
  waqfName: string;
  causeId: string;
  causeName: string;
  timestamp: string; // Nanosecond timestamp
  type: ImpactEventType;
  
  // Financial details
  amount: number;
  currency: string;
  
  // Impact metrics
  beneficiaryCount: number;
  projectsCompleted?: number;
  
  // Location
  location: ImpactEventLocation;
  
  // Media and proof
  media: ImpactEventMedia;
  verification: ImpactEventVerification;
  
  // Additional context
  description: string;
  title: string;
  
  // Metadata
  createdBy: string; // User ID or organization ID
  createdAt: string; // Nanosecond timestamp
  updatedAt?: string; // Nanosecond timestamp
  
  // Visibility
  isPublic: boolean;
  isFeatured: boolean;
}

// ============================================
// DONOR PROGRESSION TYPES
// ============================================

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type BadgeCategory = 'contribution' | 'impact' | 'social' | 'special' | 'seasonal';

export interface DonorBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string; // Nanosecond timestamp
  rarity: BadgeRarity;
  category: BadgeCategory;
  progress?: {
    current: number;
    target: number;
  };
}

export interface DonorStats {
  totalContributed: number;
  beneficiariesHelped: number;
  causesSupported: number;
  waqfsCreated: number;
  referralsConverted: number;
  consecutiveDays: number; // Current streak
  longestStreak: number;
  lastContributionDate?: string; // Nanosecond timestamp
}

export interface DonorRank {
  global: number;
  category: Record<string, number>; // Per cause category
  monthly: number;
  allTime: number;
}

export interface DonorProfile {
  userId: string;
  displayName: string;
  avatar?: string;
  
  // Progression
  level: number; // 1-100
  xp: number; // Experience points
  nextLevelXp: number;
  
  // Achievements
  badges: DonorBadge[];
  
  // Stats
  stats: DonorStats;
  
  // Rankings
  rank: DonorRank;
  
  // Preferences
  publicProfile: boolean;
  showOnLeaderboard: boolean;
  
  // Metadata
  createdAt: string; // Nanosecond timestamp
  updatedAt: string; // Nanosecond timestamp
}

// ============================================
// REFERRAL TYPES
// ============================================

export type ReferralStatus = 'pending' | 'active' | 'inactive';

export interface ReferralTier {
  tier: number;
  referralsRequired: number;
  bonus: string;
  badge: string;
  percentageBonus?: number; // % of referee contributions
}

export interface Referral {
  userId: string;
  displayName: string;
  joinedAt: string; // Nanosecond timestamp
  totalContributed: number;
  status: ReferralStatus;
  firstContributionDate?: string;
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarned: number;
  conversionRate: number;
  currentTier: number;
}

export interface ReferralProgram {
  referrerId: string;
  referralCode: string;
  
  // Rewards
  refereeBonus: number; // New user bonus
  referrerBonus: number; // Referrer bonus
  
  // Tiers
  tiers: ReferralTier[];
  
  // Stats
  stats: ReferralStats;
  
  // Referrals
  referrals: Referral[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ============================================
// LEADERBOARD TYPES
// ============================================

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all-time';
export type LeaderboardType = 'contributors' | 'impact' | 'rising_stars' | 'streaks' | 'referrals';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatar?: string;
  score: number;
  badge?: string;
  change: number; // Rank change from previous period
  level?: number;
}

export interface Leaderboard {
  type: LeaderboardType;
  period: LeaderboardPeriod;
  category?: string; // Optional: filter by cause category
  waqfType?: string; // Optional: filter by waqf type
  
  entries: LeaderboardEntry[];
  
  // Metadata
  generatedAt: string; // Nanosecond timestamp
  totalParticipants: number;
}

// ============================================
// CAMPAIGN TYPES (for Consumable Waqfs)
// ============================================

export type CampaignUrgency = 'emergency' | 'high' | 'medium' | 'low';
export type CampaignStatus = 'draft' | 'active' | 'funded' | 'in_progress' | 'completed' | 'cancelled';

export interface CampaignMilestone {
  id: string;
  description: string;
  targetAmount: number;
  targetDate?: string; // Nanosecond timestamp
  status: 'pending' | 'funded' | 'in_progress' | 'completed';
  
  // Completion proof
  completionProof?: {
    photos: string[];
    videos: string[];
    beneficiaryTestimonials: BeneficiaryTestimonial[];
    gpsLocation?: { lat: number; lng: number };
    verifiedBy: string;
    verificationDate: string;
  };
}

export interface CampaignMatching {
  sponsor: string;
  matchRatio: number; // 1:1, 2:1, etc.
  maxMatch: number;
  remaining: number;
  expiresAt?: string; // Nanosecond timestamp
}

export interface RecentBacker {
  displayName: string;
  amount: number;
  timestamp: string;
  message?: string;
  isAnonymous?: boolean;
}

export interface CampaignUpdate {
  id: string;
  title: string;
  content: string;
  media: string[];
  timestamp: string;
  author: string;
}

export interface Campaign {
  id: string;
  waqfId: string;
  
  // Campaign details
  projectType: string;
  fundingGoal: number;
  currentFunding: number;
  backers: number;
  
  // Urgency
  daysRemaining: number;
  urgency: CampaignUrgency;
  status: CampaignStatus;
  
  // Milestones
  milestones: CampaignMilestone[];
  
  // Matching
  matching?: CampaignMatching;
  
  // Social proof
  recentBackers: RecentBacker[];
  
  // Updates
  updates: CampaignUpdate[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

