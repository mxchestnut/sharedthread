/**
 * Contextual Help Service
 * 
 * Provides AI-powered assistance based on user location and behavior patterns.
 * - Detects where users are stuck
 * - Suggests relevant help content
 * - Non-intrusive, opt-in hints
 * 
 * IMPORTANT: No automated AI chat. Only FAQ suggestions and helpful hints.
 */

import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/error-logger';


const anthropic = process.env.ANTHROPIC_API_KEY 
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// ============================================================================
// Types
// ============================================================================

export interface HelpContext {
  userId: string;
  currentPage: string;
  action?: string;
  timeOnPage?: number;
  previousPages?: string[];
  userRole?: string;
  accountAge?: number; // days since signup
}

export interface HelpSuggestion {
  type: 'hint' | 'tutorial' | 'faq' | 'video';
  title: string;
  content: string;
  actionUrl?: string;
  actionText?: string;
  priority: 'low' | 'medium' | 'high';
  dismissable: boolean;
}

export interface FAQSuggestion {
  id: string;
  question: string;
  answer: string;
  category: string;
  relevanceScore: number;
}

// ============================================================================
// Contextual Help Detection
// ============================================================================

/**
 * Analyze user behavior and suggest contextual help
 */
export async function getContextualHelp(context: HelpContext): Promise<HelpSuggestion[]> {
  const suggestions: HelpSuggestion[] = [];

  // 1. Check if user is new (first 7 days)
  if (context.accountAge !== undefined && context.accountAge < 7) {
    const newUserHelp = getNewUserHelp(context.currentPage, context.accountAge);
    if (newUserHelp) suggestions.push(newUserHelp);
  }

  // 2. Check for common stuck points
  const stuckPointHelp = await detectStuckPoint(context);
  if (stuckPointHelp) suggestions.push(stuckPointHelp);

  // 3. Page-specific tips
  const pageHelp = getPageSpecificHelp(context.currentPage, context.action);
  if (pageHelp) suggestions.push(pageHelp);

  return suggestions;
}

/**
 * Help for new users based on current page
 */
function getNewUserHelp(currentPage: string, accountAge: number): HelpSuggestion | null {
  // First day - basic orientation
  if (accountAge === 0) {
    if (currentPage === '/library') {
      return {
        type: 'hint',
        title: 'Welcome to Shared Thread!',
        content: 'This is the Library where you can discover published works. Use tags to find topics you\'re interested in.',
        actionUrl: '/help/getting-started',
        actionText: 'Learn More',
        priority: 'high',
        dismissable: true,
      };
    }
    
    if (currentPage === '/atelier') {
      return {
        type: 'tutorial',
        title: 'Ready to create?',
        content: 'The Atelier is your creative workspace. Start with a draft, get feedback in Beta mode, then publish when ready.',
        actionUrl: '/help/atelier-guide',
        actionText: 'View Tutorial',
        priority: 'high',
        dismissable: true,
      };
    }
  }

  // Day 2-7 - advanced features
  if (accountAge > 0 && accountAge < 7) {
    if (currentPage.startsWith('/works/') && currentPage.includes('/beta')) {
      return {
        type: 'hint',
        title: 'Beta Mode Tips',
        content: 'In Beta mode, readers can leave paragraph-level annotations. This helps you refine your work before publishing.',
        actionUrl: '/help/beta-mode',
        actionText: 'Learn About Beta',
        priority: 'medium',
        dismissable: true,
      };
    }
  }

  return null;
}

/**
 * Detect if user is stuck based on behavior patterns
 */
async function detectStuckPoint(context: HelpContext): Promise<HelpSuggestion | null> {
  // Long time on page (>5 minutes) without action
  if (context.timeOnPage && context.timeOnPage > 300) {
    if (context.currentPage === '/atelier/new') {
      return {
        type: 'hint',
        title: 'Need inspiration?',
        content: 'Starting can be the hardest part. Try free-writing for 5 minutes, or outline your main points first.',
        actionUrl: '/help/writing-tips',
        actionText: 'Writing Tips',
        priority: 'medium',
        dismissable: true,
      };
    }

    if (context.currentPage.includes('/settings')) {
      return {
        type: 'faq',
        title: 'Common Settings Questions',
        content: 'Looking for something specific? Check our settings FAQ or contact support.',
        actionUrl: '/help/faq#settings',
        actionText: 'View FAQ',
        priority: 'low',
        dismissable: true,
      };
    }
  }

  // Bouncing between pages (visited 3+ pages in last minute)
  if (context.previousPages && context.previousPages.length >= 3) {
    const uniquePages = new Set(context.previousPages);
    if (uniquePages.size >= 3) {
      return {
        type: 'hint',
        title: 'Can we help you find something?',
        content: 'Use the search bar at the top, or check our help center for guides and tutorials.',
        actionUrl: '/help',
        actionText: 'Browse Help',
        priority: 'low',
        dismissable: true,
      };
    }
  }

  return null;
}

/**
 * Page-specific help based on current location
 */
function getPageSpecificHelp(currentPage: string, action?: string): HelpSuggestion | null {
  // Creating first work
  if (currentPage === '/atelier/new' && action === 'first-work') {
    return {
      type: 'tutorial',
      title: 'Creating Your First Work',
      content: 'Give your work a title, write or paste your content, and add relevant tags. You can save as draft and come back anytime.',
      priority: 'medium',
      dismissable: true,
    };
  }

  // Publishing for the first time
  if (currentPage.includes('/works/') && action === 'publish') {
    return {
      type: 'hint',
      title: 'Ready to publish?',
      content: 'Published works appear in the Library. You can choose to publish publicly, to followers only, or to specific communities.',
      actionUrl: '/help/publishing',
      actionText: 'Publishing Guide',
      priority: 'high',
      dismissable: false, // Important step
    };
  }

  // Joining first community
  if (currentPage.includes('/communities') && action === 'join') {
    return {
      type: 'hint',
      title: 'Joining Communities',
      content: 'Communities are spaces for focused discussion. Public communities are open to all; private ones require an invite.',
      priority: 'low',
      dismissable: true,
    };
  }

  return null;
}

// ============================================================================
// FAQ Suggestion Engine
// ============================================================================

/**
 * Suggest relevant FAQ articles based on user query or context
 */
export async function suggestFAQ(query: string, context?: HelpContext): Promise<FAQSuggestion[]> {
  // Static FAQ database (in production, this would be from CMS/database)
  const faqDatabase = getFAQDatabase();

  // Simple keyword matching (can be enhanced with AI)
  const results = faqDatabase
    .map((faq) => {
      const relevanceScore = calculateFAQRelevance(query, faq, context);
      return { ...faq, relevanceScore };
    })
    .filter((faq) => faq.relevanceScore > 0.3)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5);

  // If AI is available, enhance with semantic understanding
  if (anthropic && results.length > 0) {
    return await enhanceFAQSuggestions(query, results);
  }

  return results;
}

/**
 * Calculate FAQ relevance score (0-1)
 */
function calculateFAQRelevance(
  query: string,
  faq: FAQSuggestion,
  context?: HelpContext
): number {
  const queryLower = query.toLowerCase();
  const questionLower = faq.question.toLowerCase();
  const answerLower = faq.answer.toLowerCase();

  let score = 0;

  // Exact phrase match in question
  if (questionLower.includes(queryLower)) {
    score += 0.8;
  }

  // Word overlap in question
  const queryWords = queryLower.split(/\s+/);
  const questionWords = questionLower.split(/\s+/);
  const wordOverlap = queryWords.filter((w) => questionWords.includes(w)).length;
  score += (wordOverlap / queryWords.length) * 0.5;

  // Answer contains query keywords
  const answerMatches = queryWords.filter((w) => answerLower.includes(w)).length;
  score += (answerMatches / queryWords.length) * 0.3;

  // Context bonus: current page matches FAQ category
  if (context?.currentPage && faq.category) {
    if (context.currentPage.includes(faq.category.toLowerCase())) {
      score += 0.2;
    }
  }

  return Math.min(score, 1);
}

/**
 * Use AI to enhance FAQ suggestions with semantic understanding
 */
async function enhanceFAQSuggestions(
  query: string,
  candidates: FAQSuggestion[]
): Promise<FAQSuggestion[]> {
  if (!anthropic) return candidates;

  try {
    const prompt = `A user is asking: "${query}"

We have these FAQ articles:
${candidates.map((faq, i) => `${i + 1}. ${faq.question}\n   ${faq.answer.substring(0, 150)}...`).join('\n\n')}

Rate each FAQ's relevance to the user's question on a scale of 0-1.
Consider semantic meaning, not just keyword matching.

Return JSON array:
[
  { "index": 1, "relevance": 0.95, "reason": "Directly answers..." },
  { "index": 2, "relevance": 0.7, "reason": "Related to..." }
]`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') return candidates;

    const analysis = JSON.parse(content.text);

    // Update scores with AI analysis
    return candidates.map((faq, index) => {
      const aiResult = analysis.find((a: { index: number }) => a.index === index + 1);
      if (aiResult) {
        return {
          ...faq,
          relevanceScore: (faq.relevanceScore + aiResult.relevance) / 2, // Average with original
        };
      }
      return faq;
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  } catch (error) {
    logError('FAQ enhancement failed:', error);
    return candidates; // Graceful fallback
  }
}

// ============================================================================
// Tutorial Path Generation
// ============================================================================

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  page: string;
  action?: string;
  completed: boolean;
}

export interface TutorialPath {
  id: string;
  name: string;
  description: string;
  targetRole: string;
  estimatedMinutes: number;
  steps: TutorialStep[];
}

/**
 * Generate personalized onboarding path based on user goals
 */
export async function generateOnboardingPath(
  userId: string,
  userGoal: 'reader' | 'writer' | 'community-leader' | 'explorer'
): Promise<TutorialPath> {
  // Get user's current progress
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      works: { take: 1 },
      ratings: { take: 1 },
      ownedCommunities: { take: 1 },
      memberships: { take: 1 },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const hasCreatedWork = user.works.length > 0;
  const hasRatedWork = user.ratings.length > 0;
  const hasJoinedCommunity = user.memberships.length > 0;
  const hasCreatedCommunity = user.ownedCommunities.length > 0;

  // Generate appropriate path
  switch (userGoal) {
    case 'writer':
      return {
        id: 'writer-onboarding',
        name: 'Become a Writer on Shared Thread',
        description: 'Learn to create, refine, and publish your works',
        targetRole: 'writer',
        estimatedMinutes: 15,
        steps: [
          {
            id: 'explore-library',
            title: 'Explore the Library',
            description: 'Browse published works to see what others are creating',
            page: '/library',
            completed: hasRatedWork,
          },
          {
            id: 'create-first-draft',
            title: 'Create Your First Draft',
            description: 'Start writing in the Atelier workspace',
            page: '/atelier/new',
            action: 'create-work',
            completed: hasCreatedWork,
          },
          {
            id: 'share-beta',
            title: 'Share in Beta Mode',
            description: 'Get feedback before publishing',
            page: '/works/[id]/settings',
            action: 'enable-beta',
            completed: false, // Would check work status
          },
          {
            id: 'publish-work',
            title: 'Publish Your Work',
            description: 'Make your work available in the Library',
            page: '/works/[id]/publish',
            action: 'publish',
            completed: false,
          },
        ],
      };

    case 'reader':
      return {
        id: 'reader-onboarding',
        name: 'Discover Great Content',
        description: 'Find and engage with works you love',
        targetRole: 'reader',
        estimatedMinutes: 10,
        steps: [
          {
            id: 'browse-library',
            title: 'Browse the Library',
            description: 'Explore works by tag or category',
            page: '/library',
            completed: true,
          },
          {
            id: 'rate-work',
            title: 'Rate Your First Work',
            description: 'Help others discover quality content',
            page: '/works/[id]',
            action: 'rate',
            completed: hasRatedWork,
          },
          {
            id: 'join-community',
            title: 'Join a Community',
            description: 'Connect with readers who share your interests',
            page: '/communities',
            action: 'join',
            completed: hasJoinedCommunity,
          },
          {
            id: 'follow-writers',
            title: 'Follow Writers',
            description: 'Stay updated on new works from your favorite authors',
            page: '/library',
            action: 'follow',
            completed: false,
          },
        ],
      };

    case 'community-leader':
      return {
        id: 'community-leader-onboarding',
        name: 'Build Your Community',
        description: 'Create and manage a thriving community',
        targetRole: 'community-leader',
        estimatedMinutes: 20,
        steps: [
          {
            id: 'join-communities',
            title: 'Join Existing Communities',
            description: 'Learn how communities work on Shared Thread',
            page: '/communities',
            completed: hasJoinedCommunity,
          },
          {
            id: 'propose-community',
            title: 'Propose Your Community',
            description: 'Submit your community idea for review',
            page: '/communities/propose',
            action: 'propose',
            completed: hasCreatedCommunity,
          },
          {
            id: 'configure-settings',
            title: 'Configure Community Settings',
            description: 'Set up privacy, categories, and rules',
            page: '/communities/[slug]/settings',
            completed: false,
          },
          {
            id: 'invite-members',
            title: 'Invite Members',
            description: 'Build your initial community',
            page: '/communities/[slug]/invite',
            action: 'invite',
            completed: false,
          },
        ],
      };

    default: // explorer
      return {
        id: 'explorer-onboarding',
        name: 'Explore Shared Thread',
        description: 'Get a quick overview of all features',
        targetRole: 'explorer',
        estimatedMinutes: 12,
        steps: [
          {
            id: 'tour-library',
            title: 'Tour the Library',
            description: 'See what people are creating',
            page: '/library',
            completed: true,
          },
          {
            id: 'try-atelier',
            title: 'Try the Atelier',
            description: 'Check out the creative workspace',
            page: '/atelier',
            completed: hasCreatedWork,
          },
          {
            id: 'explore-communities',
            title: 'Explore Communities',
            description: 'Find spaces for your interests',
            page: '/communities',
            completed: hasJoinedCommunity,
          },
          {
            id: 'read-help',
            title: 'Browse Help Docs',
            description: 'Learn about all features',
            page: '/help',
            completed: false,
          },
        ],
      };
  }
}

// ============================================================================
// FAQ Database (Static - In Production use CMS/DB)
// ============================================================================

function getFAQDatabase(): FAQSuggestion[] {
  return [
    {
      id: 'faq-1',
      question: 'How do I create my first work?',
      answer: 'Go to the Atelier (navigation bar) and click "New Work". Give it a title, write your content, add tags, and save as draft. You can publish when ready.',
      category: 'atelier',
      relevanceScore: 0,
    },
    {
      id: 'faq-2',
      question: 'What is Beta mode?',
      answer: 'Beta mode allows readers to leave paragraph-level annotations on your work before you publish. It\'s a great way to get feedback and refine your writing.',
      category: 'beta',
      relevanceScore: 0,
    },
    {
      id: 'faq-3',
      question: 'How do I join a community?',
      answer: 'Browse communities at /communities. Public communities can be joined with one click. Private communities require an invitation from the owner.',
      category: 'communities',
      relevanceScore: 0,
    },
    {
      id: 'faq-4',
      question: 'Can I edit my work after publishing?',
      answer: 'Yes! You can edit published works, but major changes should go through Beta mode again to get fresh feedback.',
      category: 'works',
      relevanceScore: 0,
    },
    {
      id: 'faq-5',
      question: 'How do tags work?',
      answer: 'Tags help readers discover your work. Add 3-7 relevant tags when creating or editing a work. Use existing popular tags when possible.',
      category: 'library',
      relevanceScore: 0,
    },
    {
      id: 'faq-6',
      question: 'What are collections?',
      answer: 'Collections are curated groups of works around a theme. You can create your own collections and add works you love.',
      category: 'collections',
      relevanceScore: 0,
    },
    {
      id: 'faq-7',
      question: 'How does the rating system work?',
      answer: 'Rate works 1-5 stars. Ratings help with discovery and encourage quality content. You can also write a review.',
      category: 'library',
      relevanceScore: 0,
    },
    {
      id: 'faq-8',
      question: 'Can I make my work private?',
      answer: 'Yes. In work settings, you can set visibility to: Private (only you), Followers Only, or Public. You can also publish to specific communities.',
      category: 'works',
      relevanceScore: 0,
    },
  ];
}
