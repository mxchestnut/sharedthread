/**
 * Staff Dashboard Insights Service
 * 
 * Provides AI-powered analytics for staff to understand:
 * - User behavior patterns and stuck points
 * - Feature usage trends
 * - Content quality metrics
 * - Automated anomaly detection (spam waves, unusual activity)
 * 
 * PRIVACY: Aggregated data only. No individual user tracking beyond admin use.
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

export interface UserBehaviorInsight {
  metric: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  change: number; // percentage change
  interpretation: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface FeatureUsageStats {
  feature: string;
  activeUsers: number;
  totalActions: number;
  avgActionsPerUser: number;
  growthRate: number; // percentage
  popularityScore: number; // 0-100
}

export interface ContentQualityAlert {
  type: 'low_engagement' | 'high_complaints' | 'spam_wave' | 'quality_drop';
  targetId: string;
  targetType: 'work' | 'discussion' | 'community' | 'user';
  severity: 'low' | 'medium' | 'high';
  metrics: Record<string, number>;
  recommendation: string;
  detectedAt: Date;
}

export interface TrendAnalysis {
  trend: string;
  description: string;
  confidence: number; // 0-1
  dataPoints: { date: string; value: number }[];
  prediction?: string;
}

// ============================================================================
// User Behavior Analytics
// ============================================================================

/**
 * Analyze where users are getting stuck or dropping off
 */
export async function analyzeUserStuckPoints(): Promise<UserBehaviorInsight[]> {
  const insights: UserBehaviorInsight[] = [];

  // 1. New users who haven't created works (potential barrier)
  const newUsersWithoutWorks = await prisma.user.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
      works: {
        none: {},
      },
    },
  });

  const totalNewUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
  });

  const workCreationRate = totalNewUsers > 0 
    ? ((totalNewUsers - newUsersWithoutWorks) / totalNewUsers) * 100 
    : 0;

  insights.push({
    metric: 'New User Work Creation Rate',
    value: Math.round(workCreationRate),
    trend: workCreationRate > 30 ? 'up' : workCreationRate > 15 ? 'stable' : 'down',
    change: 0, // Would compare to previous period
    interpretation: workCreationRate < 15 
      ? 'Many new users not creating works. Consider improving onboarding or reducing friction.'
      : workCreationRate > 30
      ? 'Good work creation rate among new users.'
      : 'Moderate work creation. Monitor for trends.',
    severity: workCreationRate < 15 ? 'warning' : 'info',
  });

  // 2. Users who started but didn't publish (stuck in draft)
  const draftOnlyUsers = await prisma.user.count({
    where: {
      works: {
        some: {
          status: 'DRAFT',
        },
        none: {
          status: 'PUBLISHED',
        },
      },
    },
  });

  const usersWithWorks = await prisma.user.count({
    where: {
      works: {
        some: {},
      },
    },
  });

  const publishRate = usersWithWorks > 0 
    ? ((usersWithWorks - draftOnlyUsers) / usersWithWorks) * 100 
    : 0;

  insights.push({
    metric: 'Draft to Publish Conversion',
    value: Math.round(publishRate),
    trend: publishRate > 50 ? 'up' : publishRate > 30 ? 'stable' : 'down',
    change: 0,
    interpretation: publishRate < 30
      ? 'Many users stuck in draft phase. Consider Beta mode encouragement or publish prompts.'
      : 'Healthy publish rate. Users confident in sharing work.',
    severity: publishRate < 30 ? 'warning' : 'info',
  });

  // 3. Community engagement (joined but inactive)
  const inactiveCommunityMembers = await prisma.communityMember.count({
    where: {
      user: {
        discussionPosts: {
          none: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
      },
    },
  });

  const totalCommunityMembers = await prisma.communityMember.count();

  const communityEngagementRate = totalCommunityMembers > 0
    ? ((totalCommunityMembers - inactiveCommunityMembers) / totalCommunityMembers) * 100
    : 0;

  insights.push({
    metric: 'Community Member Engagement',
    value: Math.round(communityEngagementRate),
    trend: communityEngagementRate > 40 ? 'up' : communityEngagementRate > 20 ? 'stable' : 'down',
    change: 0,
    interpretation: communityEngagementRate < 20
      ? 'Low community activity. Consider prompting members to participate in discussions.'
      : 'Good community engagement.',
    severity: communityEngagementRate < 20 ? 'warning' : 'info',
  });

  return insights;
}

/**
 * Get feature usage statistics across the platform
 */
export async function getFeatureUsageStats(): Promise<FeatureUsageStats[]> {
  const stats: FeatureUsageStats[] = [];

  // 1. Works Creation & Publishing
  const worksCreated = await prisma.work.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  const uniqueAuthors = await prisma.work.groupBy({
    by: ['authorId'],
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  stats.push({
    feature: 'Work Creation',
    activeUsers: uniqueAuthors.length,
    totalActions: worksCreated,
    avgActionsPerUser: uniqueAuthors.length > 0 ? worksCreated / uniqueAuthors.length : 0,
    growthRate: 0, // Would calculate from previous period
    popularityScore: Math.min((worksCreated / 10) * 10, 100), // Scale to 100
  });

  // 2. Ratings & Reviews
  const ratingsCount = await prisma.rating.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  const uniqueRaters = await prisma.rating.groupBy({
    by: ['userId'],
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  stats.push({
    feature: 'Ratings & Reviews',
    activeUsers: uniqueRaters.length,
    totalActions: ratingsCount,
    avgActionsPerUser: uniqueRaters.length > 0 ? ratingsCount / uniqueRaters.length : 0,
    growthRate: 0,
    popularityScore: Math.min((ratingsCount / 20) * 10, 100),
  });

  // 3. Discussions
  const discussionPosts = await prisma.discussionPost.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  const uniquePosters = await prisma.discussionPost.groupBy({
    by: ['authorId'],
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  stats.push({
    feature: 'Discussions',
    activeUsers: uniquePosters.length,
    totalActions: discussionPosts,
    avgActionsPerUser: uniquePosters.length > 0 ? discussionPosts / uniquePosters.length : 0,
    growthRate: 0,
    popularityScore: Math.min((discussionPosts / 15) * 10, 100),
  });

  // 4. Collections
  const collectionsCount = await prisma.collection.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  const uniqueCollectors = await prisma.collection.groupBy({
    by: ['ownerId'],
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  stats.push({
    feature: 'Collections',
    activeUsers: uniqueCollectors.length,
    totalActions: collectionsCount,
    avgActionsPerUser: uniqueCollectors.length > 0 ? collectionsCount / uniqueCollectors.length : 0,
    growthRate: 0,
    popularityScore: Math.min((collectionsCount / 5) * 10, 100),
  });

  // 5. Beta Mode Feedback (Annotations)
  const annotationsCount = await prisma.annotation.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  const uniqueAnnotators = await prisma.annotation.groupBy({
    by: ['userId'],
    where: {
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  stats.push({
    feature: 'Beta Annotations',
    activeUsers: uniqueAnnotators.length,
    totalActions: annotationsCount,
    avgActionsPerUser: uniqueAnnotators.length > 0 ? annotationsCount / uniqueAnnotators.length : 0,
    growthRate: 0,
    popularityScore: Math.min((annotationsCount / 10) * 10, 100),
  });

  return stats;
}

// ============================================================================
// Content Quality Monitoring
// ============================================================================

/**
 * Detect content quality issues and generate alerts
 */
export async function detectContentQualityIssues(): Promise<ContentQualityAlert[]> {
  const alerts: ContentQualityAlert[] = [];

  // 1. Works with low engagement (published but no views/ratings)
  const lowEngagementWorks = await prisma.work.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: {
        lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Published 7+ days ago
      },
      viewCount: {
        lt: 10,
      },
    },
    include: {
      author: {
        select: { username: true },
      },
      ratings: true,
    },
    take: 10,
  });

  for (const work of lowEngagementWorks) {
    alerts.push({
      type: 'low_engagement',
      targetId: work.id,
      targetType: 'work',
      severity: 'low',
      metrics: {
        viewCount: work.viewCount,
        ratingCount: work.ratings.length,
        daysPublished: Math.floor(
          (Date.now() - (work.publishedAt?.getTime() || 0)) / (1000 * 60 * 60 * 24)
        ),
      },
      recommendation: `Work "${work.title}" has low engagement. Consider featuring in discovery feed or checking tags/visibility.`,
      detectedAt: new Date(),
    });
  }

  // 2. Spam wave detection (count recent discussion posts for potential spam)
  const recentPosts = await prisma.discussionPost.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
  });

  const totalPosts = await prisma.discussionPost.count();

  // Check if posting rate is unusually high
  const avgDailyPosts = totalPosts / Math.max(1, Math.floor(
    (Date.now() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24)
  ));

  if (recentPosts > avgDailyPosts * 3) {
    alerts.push({
      type: 'spam_wave',
      targetId: 'platform',
      targetType: 'discussion',
      severity: 'high',
      metrics: {
        recentPosts,
        avgDailyPosts: Math.round(avgDailyPosts),
        multiplier: recentPosts / avgDailyPosts,
      },
      recommendation: `Unusual posting activity detected: ${recentPosts} posts in last 24 hours (${Math.round(recentPosts / avgDailyPosts)}x normal rate). Review for potential spam.`,
      detectedAt: new Date(),
    });
  }

  // 3. Monitor works flagged for moderation
  const flaggedWorks = await prisma.work.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      // Note: Add moderation fields when available in schema
    },
  });

  if (flaggedWorks > 5) {
    alerts.push({
      type: 'high_complaints',
      targetId: 'moderation',
      targetType: 'work',
      severity: 'medium',
      metrics: {
        flaggedContent: flaggedWorks,
      },
      recommendation: `${flaggedWorks} works created recently. Monitor content quality.`,
      detectedAt: new Date(),
    });
  }

  // 4. Quality drop detection (average ratings falling)
  const recentRatings = await prisma.rating.aggregate({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
    _avg: {
      value: true,
    },
  });

  const olderRatings = await prisma.rating.aggregate({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
    _avg: {
      value: true,
    },
  });

  const recentAvg = recentRatings._avg.value || 3;
  const olderAvg = olderRatings._avg.value || 3;
  const qualityChange = ((recentAvg - olderAvg) / olderAvg) * 100;

  if (qualityChange < -10) {
    alerts.push({
      type: 'quality_drop',
      targetId: 'platform',
      targetType: 'work',
      severity: 'medium',
      metrics: {
        recentAvgRating: recentAvg,
        previousAvgRating: olderAvg,
        changePercent: qualityChange,
      },
      recommendation: `Average ratings dropped ${Math.abs(qualityChange).toFixed(1)}%. Monitor content quality and consider featuring high-quality works.`,
      detectedAt: new Date(),
    });
  }

  return alerts;
}

// ============================================================================
// AI-Powered Trend Analysis
// ============================================================================

/**
 * Use AI to interpret trends and provide insights
 */
export async function analyzeTrendsWithAI(
  behaviorInsights: UserBehaviorInsight[],
  featureStats: FeatureUsageStats[],
  qualityAlerts: ContentQualityAlert[]
): Promise<TrendAnalysis[]> {
  if (!anthropic) {
    // Fallback without AI
    return [
      {
        trend: 'Feature Usage',
        description: 'Check feature statistics for detailed usage patterns.',
        confidence: 0.5,
        dataPoints: [],
      },
    ];
  }

  try {
    const prompt = `Analyze platform health metrics for a creative writing platform:

BEHAVIOR INSIGHTS:
${behaviorInsights.map((i) => `- ${i.metric}: ${i.value}% (${i.interpretation})`).join('\n')}

FEATURE USAGE (Last 30 Days):
${featureStats.map((f) => `- ${f.feature}: ${f.activeUsers} users, ${f.totalActions} actions, popularity: ${f.popularityScore}/100`).join('\n')}

QUALITY ALERTS:
${qualityAlerts.length > 0 ? qualityAlerts.map((a) => `- ${a.type}: ${a.recommendation}`).join('\n') : 'None'}

Provide 3-5 key trends with:
1. What's happening (brief description)
2. Why it matters
3. Actionable recommendation

Return JSON array:
[
  {
    "trend": "New User Onboarding Challenge",
    "description": "Only X% of new users create works...",
    "confidence": 0.85,
    "recommendation": "Improve onboarding flow..."
  }
]`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') return [];

    const analysis = JSON.parse(content.text) as Array<{
      trend: string;
      description: string;
      confidence?: number;
      recommendation?: string;
    }>;

    return analysis.map((item) => ({
      trend: item.trend,
      description: item.description,
      confidence: item.confidence || 0.7,
      dataPoints: [],
      prediction: item.recommendation,
    }));
  } catch (error) {
    logError('AI trend analysis failed:', error);
    return [];
  }
}

// ============================================================================
// Platform Health Summary
// ============================================================================

export interface PlatformHealthSummary {
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
  score: number; // 0-100
  behaviorInsights: UserBehaviorInsight[];
  featureStats: FeatureUsageStats[];
  qualityAlerts: ContentQualityAlert[];
  trends: TrendAnalysis[];
  recommendations: string[];
}

/**
 * Generate comprehensive platform health report
 */
export async function generatePlatformHealthReport(): Promise<PlatformHealthSummary> {
  // Gather all metrics
  const behaviorInsights = await analyzeUserStuckPoints();
  const featureStats = await getFeatureUsageStats();
  const qualityAlerts = await detectContentQualityIssues();
  const trends = await analyzeTrendsWithAI(behaviorInsights, featureStats, qualityAlerts);

  // Calculate overall health score
  const criticalIssues = behaviorInsights.filter((i) => i.severity === 'critical').length;
  const warnings = behaviorInsights.filter((i) => i.severity === 'warning').length;
  const highSeverityAlerts = qualityAlerts.filter((a) => a.severity === 'high').length;

  let score = 100;
  score -= criticalIssues * 20;
  score -= warnings * 10;
  score -= highSeverityAlerts * 15;
  score = Math.max(0, score);

  const overallHealth: 'excellent' | 'good' | 'fair' | 'poor' =
    score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor';

  // Generate recommendations
  const recommendations: string[] = [];

  if (behaviorInsights.some((i) => i.metric.includes('Work Creation') && i.severity === 'warning')) {
    recommendations.push('Improve new user onboarding to encourage work creation');
  }

  if (behaviorInsights.some((i) => i.metric.includes('Publish') && i.severity === 'warning')) {
    recommendations.push('Add publish prompts or Beta mode encouragement for draft works');
  }

  if (qualityAlerts.some((a) => a.type === 'spam_wave')) {
    recommendations.push('Increase moderation capacity and review spam detection thresholds');
  }

  if (qualityAlerts.some((a) => a.type === 'quality_drop')) {
    recommendations.push('Feature high-quality works and consider content quality initiatives');
  }

  if (featureStats.some((f) => f.feature === 'Beta Annotations' && f.popularityScore < 30)) {
    recommendations.push('Promote Beta mode benefits to increase pre-publish feedback');
  }

  return {
    overallHealth,
    score,
    behaviorInsights,
    featureStats,
    qualityAlerts,
    trends,
    recommendations,
  };
}
