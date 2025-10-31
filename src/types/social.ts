import { z } from 'zod';

// Publishing visibility options
export enum Visibility {
  PRIVATE = 'PRIVATE',        // Only author can see
  FOLLOWERS = 'FOLLOWERS',    // Only followers can see  
  COMMUNITY = 'COMMUNITY',    // Only community members can see
  PUBLIC = 'PUBLIC'          // Everyone can see
}

export enum WorkStatus {
  DRAFT = 'DRAFT',
  BETA = 'BETA',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

// Publishing options interface
export interface PublishingOptions {
  visibility: Visibility;
  publishToPublic: boolean;
  publishToFollowers: boolean;
  publishToCommunities: string[]; // Community IDs
  acceptingFeedback: boolean;
  betaEndDate?: Date;
  tags: string[];
}

// Validation schema for publishing
export const publishingOptionsSchema = z.object({
  visibility: z.nativeEnum(Visibility),
  publishToPublic: z.boolean(),
  publishToFollowers: z.boolean(),
  publishToCommunities: z.array(z.string()),
  acceptingFeedback: z.boolean(),
  betaEndDate: z.date().optional(),
  tags: z.array(z.string())
});

// Work creation/update schemas
export const createWorkSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.record(z.string(), z.unknown()), // Rich content JSON
  excerpt: z.string().optional(),
  publishingOptions: publishingOptionsSchema,
  status: z.nativeEnum(WorkStatus).default(WorkStatus.DRAFT)
});

export const updateWorkSchema = createWorkSchema.partial();

export enum ProposalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED', 
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

// Community proposal schemas
export const createCommunityProposalSchema = z.object({
  proposedName: z.string().min(1).max(100),
  proposedSlug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().min(10).max(500),
  purpose: z.string().min(20).max(1000),
  expectedMembers: z.number().min(1).max(10000)
});

export const reviewProposalSchema = z.object({
  status: z.nativeEnum(ProposalStatus),
  rejectionReason: z.string().optional(),
  approvedSlug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/).optional()
});

// Community schemas (updated)
export const createCommunitySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPrivate: z.boolean().default(true),
  settings: z.record(z.string(), z.unknown()).default({}),
  // Note: Communities can only be created via staff approval now
});

export const inviteToCommunitySchema = z.object({
  communityId: z.string(),
  email: z.string().email().optional(),
  userId: z.string().optional(),
  message: z.string().max(500).optional()
}).refine(data => data.email || data.userId, {
  message: "Either email or userId must be provided"
});

// Follow system schemas
export const followUserSchema = z.object({
  targetUserId: z.string()
});

// Types derived from schemas
export type CreateWorkData = z.infer<typeof createWorkSchema>;
export type UpdateWorkData = z.infer<typeof updateWorkSchema>;
export type CreateCommunityData = z.infer<typeof createCommunitySchema>;
export type InviteToCommunityData = z.infer<typeof inviteToCommunitySchema>;
export type FollowUserData = z.infer<typeof followUserSchema>;

// Work with full relations
export interface WorkWithDetails {
  id: string;
  title: string;
  content: Record<string, unknown>;
  excerpt?: string;
  authorId: string;
  status: WorkStatus;
  visibility: Visibility;
  publishedToCommunities: string[];
  publishedToPublic: boolean;
  publishedToFollowers: boolean;
  acceptingFeedback: boolean;
  betaEndDate?: Date;
  viewCount: number;
  rating?: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  
  // Relations
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  community?: {
    id: string;
    name: string;
    slug: string;
  };
  comments: {
    id: string;
    content: string;
    authorId: string;
    createdAt: Date;
    author: {
      username: string;
      displayName: string;
      avatarUrl?: string;
    };
  }[];
  ratings: {
    id: string;
    value: number;
    review?: string;
    userId: string;
    createdAt: Date;
  }[];
  _count: {
    comments: number;
    ratings: number;
  };
}

// Community with details
export interface CommunityWithDetails {
  id: string;
  name: string;
  description?: string;
  slug: string;
  isPrivate: boolean;
  ownerId: string;
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  
  owner: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  members: {
    id: string;
    userId: string;
    role: string;
    joinedAt: Date;
    user: {
      id: string;
      username: string;
      displayName: string;
      avatarUrl?: string;
    };
  }[];
  _count: {
    members: number;
    works: number;
  };
}

// User with social stats
export interface UserWithSocialStats {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: Date;
  reputationScore: number;
  trustLevel: number;
  
  _count: {
    works: number;
    followers: number;
    following: number;
    ownedCommunities: number;
    memberships: number;
  };
}

// Publishing permissions
export interface PublishingPermissions {
  canPublishToPublic: boolean;
  canPublishToFollowers: boolean;
  canCreateCommunities: boolean;
  canInviteToExistingCommunities: string[]; // Community IDs user can invite to
  dailyPublishLimit: number;
  remainingPublishes: number;
  requiresApproval: string[]; // Content types that need approval
}

// Feed filters
export interface FeedFilters {
  visibility?: Visibility[];
  tags?: string[];
  communities?: string[];
  followingOnly?: boolean;
  timeRange?: {
    from: Date;
    to: Date;
  };
  status?: WorkStatus[];
}

// Activity feed item
export interface ActivityItem {
  id: string;
  type: 'work_published' | 'work_updated' | 'community_created' | 'user_followed' | 'comment_added';
  actorId: string;
  targetId: string;
  targetType: 'work' | 'community' | 'user' | 'comment';
  createdAt: Date;
  
  actor: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  
  // Context based on type
  work?: {
    id: string;
    title: string;
    excerpt?: string;
  };
  community?: {
    id: string;
    name: string;
    slug: string;
  };
  comment?: {
    id: string;
    content: string;
  };
}

// Community Proposal Types
export type CommunityProposal = {
  id: string;
  proposedName: string;
  proposedSlug: string;
  description: string;
  purpose: string;
  expectedMembers: number;
  submittedAt: Date;
  reviewedAt?: Date;
  status: ProposalStatus;
  rejectionReason?: string;
  approvedSlug?: string;
  submitterId: string;
  submitter: {
    id: string;
    username: string;
    displayName?: string;
    email: string;
    reputation: number;
  };
  reviewerId?: string;
  reviewer?: {
    id: string;
    username: string;
    displayName?: string;
  };
};

export type CreateCommunityProposalData = z.infer<typeof createCommunityProposalSchema>;
export type ReviewProposalData = z.infer<typeof reviewProposalSchema>;