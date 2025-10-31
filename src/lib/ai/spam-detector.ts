/**
 * Unified Spam Detection Service
 * Extends spam detection to all content types across the platform
 */

import { moderationEngine } from '@/lib/moderation-engine';

export interface SpamCheckResult {
  isSpam: boolean;
  confidence: number;
  reasons: string[];
  shouldBlock: boolean; // Auto-block without review
  shouldFlag: boolean;  // Flag for human review
  category: 'work' | 'comment' | 'profile' | 'collection' | 'discussion' | 'reply' | 'proposal';
}

export interface ContentToCheck {
  type: 'work' | 'comment' | 'profile' | 'collection' | 'discussion' | 'reply' | 'proposal';
  content: string;
  title?: string;
  metadata?: {
    tags?: string[];
    links?: string[];
    language?: string;
  };
  authorId: string;
}

/**
 * Check any content for spam
 */
export async function checkForSpam(input: ContentToCheck): Promise<SpamCheckResult> {
  // Use existing moderation engine
  const result = await moderationEngine.moderateContent({
    id: `temp-${Date.now()}`,
    type: input.type === 'work' ? 'work' : 
          input.type === 'collection' ? 'collection' : 
          input.type === 'profile' ? 'profile' : 'comment',
    content: input.content,
    metadata: {
      title: input.title,
      tags: input.metadata?.tags,
      media_urls: input.metadata?.links,
      language: input.metadata?.language || 'en'
    },
    author_id: input.authorId,
    created_at: new Date().toISOString()
  });

  // Determine spam status based on moderation engine result
  const isSpam = result.status === 'rejected';
  const shouldBlock = result.status === 'rejected';
  const shouldFlag = result.status === 'pending_review' || result.status === 'flagged';

  return {
    isSpam,
    confidence: result.confidence,
    reasons: result.reasons,
    shouldBlock,
    shouldFlag,
    category: input.type
  };
}

/**
 * Check work content (title + body)
 */
export async function checkWorkSpam(
  title: string,
  content: string,
  tags: string[],
  authorId: string
): Promise<SpamCheckResult> {
  const fullText = `${title}\n\n${content}`;
  return checkForSpam({
    type: 'work',
    content: fullText,
    title,
    metadata: { tags },
    authorId
  });
}

/**
 * Check comment spam
 */
export async function checkCommentSpam(
  content: string,
  authorId: string
): Promise<SpamCheckResult> {
  return checkForSpam({
    type: 'comment',
    content,
    authorId
  });
}

/**
 * Check profile bio spam
 */
export async function checkProfileSpam(
  displayName: string,
  bio: string,
  authorId: string
): Promise<SpamCheckResult> {
  const fullText = `${displayName}\n${bio}`;
  return checkForSpam({
    type: 'profile',
    content: fullText,
    authorId
  });
}

/**
 * Check collection spam
 */
export async function checkCollectionSpam(
  name: string,
  description: string,
  authorId: string
): Promise<SpamCheckResult> {
  const fullText = `${name}\n${description}`;
  return checkForSpam({
    type: 'collection',
    content: fullText,
    title: name,
    authorId
  });
}

/**
 * Check discussion/reply spam (already implemented for communities)
 */
export async function checkDiscussionSpam(
  title: string,
  content: string,
  authorId: string
): Promise<SpamCheckResult> {
  const fullText = `${title}\n\n${content}`;
  return checkForSpam({
    type: 'discussion',
    content: fullText,
    title,
    authorId
  });
}

/**
 * Check community proposal spam
 */
export async function checkProposalSpam(
  name: string,
  description: string,
  purpose: string,
  authorId: string
): Promise<SpamCheckResult> {
  const fullText = `${name}\n${description}\n${purpose}`;
  return checkForSpam({
    type: 'proposal',
    content: fullText,
    title: name,
    authorId
  });
}
