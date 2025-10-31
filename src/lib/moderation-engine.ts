import { logError } from '@/lib/error-logger';

/**
 * Content Moderation System
 * Handles content classification, spam detection, and approval workflows
 */

export interface ContentSubmission {
  id: string
  type: 'work' | 'comment' | 'profile' | 'collection'
  content: string
  metadata: {
    title?: string
    media_urls?: string[]
    tags?: string[]
    language?: string
  }
  author_id: string
  created_at: string
}

export interface ModerationResult {
  submission_id: string
  status: 'approved' | 'rejected' | 'pending_review' | 'flagged'
  confidence: number
  reasons: string[]
  reviewer_id?: string
  reviewed_at?: string
  appeal_deadline?: string
}

export interface UserReputation {
  user_id: string
  trust_level: 0 | 1 | 2 | 3 | 4
  reputation_score: number
  strikes: number
  last_violation?: string
  total_submissions: number
  approved_submissions: number
  community_reports: number
  created_at: string
  updated_at: string
}

export interface SpamSignals {
  content_analysis: {
    keyword_spam_score: number
    repetition_score: number
    link_spam_score: number
    sentiment_score: number
  }
  behavioral_analysis: {
    velocity_score: number
    pattern_score: number
    timing_score: number
  }
  reputation_factors: {
    user_trust_level: number
    historical_violations: number
    community_standing: number
  }
  overall_spam_probability: number
}

export class ContentModerationEngine {
  private readonly TRUST_THRESHOLDS = {
    AUTO_APPROVE: 0.9,
    HUMAN_REVIEW: 0.5,
    AUTO_REJECT: 0.1
  }

  private readonly SPAM_THRESHOLDS = {
    DEFINITE_SPAM: 0.8,
    LIKELY_SPAM: 0.6,
    SUSPICIOUS: 0.4,
    CLEAN: 0.2
  }

  /**
   * Main moderation entry point
   */
  async moderateContent(submission: ContentSubmission): Promise<ModerationResult> {
    try {
      // Get user reputation
      const reputation = await this.getUserReputation(submission.author_id)
      
      // Analyze content for spam signals
      const spamSignals = await this.analyzeSpamSignals(submission, reputation)
      
      // Determine moderation action
      const decision = this.determineAction(spamSignals, reputation)
      
      // Log decision for audit
      await this.logModerationDecision(submission, decision, spamSignals)
      
      return decision
    } catch (error) {
      logError('Moderation error:', error);
      // Default to human review on errors
      return {
        submission_id: submission.id,
        status: 'pending_review',
        confidence: 0,
        reasons: ['system_error'],
        appeal_deadline: this.getAppealDeadline()
      }
    }
  }

  /**
   * Analyze content for spam signals
   */
  private async analyzeSpamSignals(
    submission: ContentSubmission, 
    reputation: UserReputation
  ): Promise<SpamSignals> {
    const contentAnalysis = await this.analyzeContent(submission)
    const behavioralAnalysis = await this.analyzeBehavior(submission.author_id)
    const reputationFactors = this.analyzeReputation(reputation)

    // Combine all signals with weighted scoring
    const overallScore = this.calculateOverallSpamScore(
      contentAnalysis,
      behavioralAnalysis,
      reputationFactors
    )

    return {
      content_analysis: contentAnalysis,
      behavioral_analysis: behavioralAnalysis,
      reputation_factors: reputationFactors,
      overall_spam_probability: overallScore
    }
  }

  /**
   * Analyze content for spam indicators
   */
  private async analyzeContent(submission: ContentSubmission) {
    const { content, metadata } = submission

    // Keyword spam detection
    const keywordSpamScore = this.detectKeywordSpam(content)
    
    // Repetition and template detection
    const repetitionScore = this.detectRepetition(content)
    
    // Link spam analysis
    const linkSpamScore = await this.analyzeLinkSpam(content, metadata.media_urls)
    
    // Sentiment analysis (detect extremely negative or promotional content)
    const sentimentScore = this.analyzeSentiment(content)

    return {
      keyword_spam_score: keywordSpamScore,
      repetition_score: repetitionScore,
      link_spam_score: linkSpamScore,
      sentiment_score: sentimentScore
    }
  }

  /**
   * Analyze user behavior patterns
   */
  private async analyzeBehavior(userId: string) {
    // Check submission velocity
    const velocityScore = await this.analyzeSubmissionVelocity(userId)
    
    // Detect automated patterns
    const patternScore = await this.detectAutomatedPatterns(userId)
    
    // Analyze timing patterns
    const timingScore = await this.analyzeTimingPatterns(userId)

    return {
      velocity_score: velocityScore,
      pattern_score: patternScore,
      timing_score: timingScore
    }
  }

  /**
   * Analyze user reputation factors
   */
  private analyzeReputation(reputation: UserReputation) {
    const trustLevelScore = reputation.trust_level / 4 // Normalize to 0-1
    const violationPenalty = Math.min(reputation.strikes * 0.2, 1)
    const approvalRate = reputation.total_submissions > 0 
      ? reputation.approved_submissions / reputation.total_submissions 
      : 0.5

    return {
      user_trust_level: trustLevelScore,
      historical_violations: violationPenalty,
      community_standing: approvalRate
    }
  }

  /**
   * Calculate overall spam probability
   */
  private calculateOverallSpamScore(
    content: SpamSignals['content_analysis'],
    behavior: SpamSignals['behavioral_analysis'],
    reputation: SpamSignals['reputation_factors']
  ): number {
    // Weighted combination of all factors
    const contentWeight = 0.4
    const behaviorWeight = 0.3
    const reputationWeight = 0.3

    const contentScore = (
      content.keyword_spam_score * 0.3 +
      content.repetition_score * 0.3 +
      content.link_spam_score * 0.2 +
      content.sentiment_score * 0.2
    )

    const behaviorScore = (
      behavior.velocity_score * 0.4 +
      behavior.pattern_score * 0.4 +
      behavior.timing_score * 0.2
    )

    const reputationScore = (
      (1 - reputation.user_trust_level) * 0.4 +
      reputation.historical_violations * 0.4 +
      (1 - reputation.community_standing) * 0.2
    )

    return (
      contentScore * contentWeight +
      behaviorScore * behaviorWeight +
      reputationScore * reputationWeight
    )
  }

  /**
   * Determine moderation action based on signals
   */
  private determineAction(
    signals: SpamSignals, 
    reputation: UserReputation
  ): ModerationResult {
    const spamScore = signals.overall_spam_probability
    const trustLevel = reputation.trust_level

    // High trust users get more lenient treatment
    const adjustedThresholds = this.adjustThresholdsForTrust(trustLevel)

    if (spamScore >= adjustedThresholds.AUTO_REJECT) {
      return {
        submission_id: '',
        status: 'rejected',
        confidence: spamScore,
        reasons: this.generateRejectionReasons(signals),
        appeal_deadline: this.getAppealDeadline()
      }
    }

    if (spamScore <= adjustedThresholds.AUTO_APPROVE) {
      return {
        submission_id: '',
        status: 'approved',
        confidence: 1 - spamScore,
        reasons: ['automated_approval']
      }
    }

    // Medium confidence - send to human review
    return {
      submission_id: '',
      status: 'pending_review',
      confidence: Math.abs(0.5 - spamScore),
      reasons: this.generateReviewReasons(signals),
      appeal_deadline: this.getAppealDeadline()
    }
  }

  /**
   * Adjust moderation thresholds based on user trust level
   */
  private adjustThresholdsForTrust(trustLevel: number) {
    const trustBonus = trustLevel * 0.1 // 0-0.4 bonus for high trust users
    
    return {
      AUTO_APPROVE: this.TRUST_THRESHOLDS.AUTO_APPROVE - trustBonus,
      AUTO_REJECT: this.TRUST_THRESHOLDS.AUTO_REJECT + trustBonus
    }
  }

  /**
   * Detect keyword spam patterns
   */
  private detectKeywordSpam(content: string): number {
    const spamKeywords = [
      'click here', 'buy now', 'limited time', 'act now', 'free money',
      'make money fast', 'work from home', 'get rich quick', 'no experience',
      'guaranteed income', 'earn $$$', 'miracle cure', 'lose weight fast'
    ]

    const suspiciousPatterns = [
      /\b[A-Z]{3,}\b/g, // Excessive caps
      /[!]{3,}/g, // Multiple exclamation marks
      /\$+[\d,]+/g, // Money amounts
      /https?:\/\/[^\s]+/g // URLs
    ]

    let spamScore = 0
    const lowerContent = content.toLowerCase()

    // Check spam keywords
    spamKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        spamScore += 0.1
      }
    })

    // Check suspicious patterns
    suspiciousPatterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) {
        spamScore += matches.length * 0.05
      }
    })

    return Math.min(spamScore, 1) // Cap at 1.0
  }

  /**
   * Detect repetitive content
   */
  private detectRepetition(content: string): number {
    const words = content.toLowerCase().split(/\s+/)
    const wordCounts = new Map<string, number>()
    
    words.forEach(word => {
      if (word.length > 3) { // Only count meaningful words
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1)
      }
    })

    let repetitionScore = 0
    const totalWords = words.length

    wordCounts.forEach(count => {
      if (count > 1) {
        const repetitionRatio = count / totalWords
        repetitionScore += repetitionRatio * 0.5
      }
    })

    return Math.min(repetitionScore, 1)
  }

  /**
   * Analyze links for spam indicators
   */
  private async analyzeLinkSpam(content: string, mediaUrls: string[] = []): Promise<number> {
    const urlPattern = /https?:\/\/[^\s]+/g
    const contentUrls = content.match(urlPattern) || []
    const allUrls = [...contentUrls, ...mediaUrls]

    if (allUrls.length === 0) return 0

    let spamScore = 0

    // Too many links
    if (allUrls.length > 3) {
      spamScore += 0.3
    }

    // Check for suspicious domains
    const suspiciousDomains = [
      'bit.ly', 'tinyurl.com', 'shorturl.at', 't.co'
    ]

    allUrls.forEach(url => {
      suspiciousDomains.forEach(domain => {
        if (url.includes(domain)) {
          spamScore += 0.2
        }
      })
    })

    return Math.min(spamScore, 1)
  }

  /**
   * Basic sentiment analysis
   */
  private analyzeSentiment(content: string): number {
    const negativeWords = [
      'hate', 'terrible', 'awful', 'disgusting', 'worst', 'horrible',
      'scam', 'fraud', 'fake', 'lies', 'stupid', 'idiot'
    ]

    const promotionalWords = [
      'amazing', 'incredible', 'revolutionary', 'breakthrough', 'exclusive',
      'limited', 'special', 'bonus', 'discount', 'offer'
    ]

    const lowerContent = content.toLowerCase()
    let negativeScore = 0
    let promotionalScore = 0

    negativeWords.forEach(word => {
      if (lowerContent.includes(word)) negativeScore += 0.1
    })

    promotionalWords.forEach(word => {
      if (lowerContent.includes(word)) promotionalScore += 0.1
    })

    // Return higher of negative or promotional sentiment
    return Math.min(Math.max(negativeScore, promotionalScore), 1)
  }

  /**
   * Analyze submission velocity for spam patterns
   */
  private async analyzeSubmissionVelocity(userId: string): Promise<number> {
    // In a real implementation, this would query the database
    // For now, return a mock score
    
    // TODO: Implement actual velocity analysis
    // const recentSubmissions = await getRecentSubmissions(userId, '1h')
    // const submissionRate = recentSubmissions.length
    
    // Example thresholds:
    // - More than 5 submissions per hour = high velocity
    // - More than 20 submissions per day = very high velocity
    
    // Suppress unused parameter warning for TODO implementation
    void userId
    return 0.1 // Mock low velocity score
  }

  /**
   * Detect automated posting patterns
   */
  private async analyzeTimingPatterns(userId: string): Promise<number> {
    // TODO: Implement timing pattern analysis
    // Look for:
    // - Posts at exact intervals (every X minutes)
    // - Posts at unusual hours consistently
    // - Identical timing patterns across accounts
    
    // Suppress unused parameter warning for TODO implementation
    void userId
    return 0.1 // Mock low pattern score
  }

  /**
   * Detect automated behavior patterns
   */
  private async detectAutomatedPatterns(userId: string): Promise<number> {
    // TODO: Implement pattern detection
    // Look for:
    // - Identical content structures
    // - Template-based posting
    // - Mechanical interaction patterns
    
    // Suppress unused parameter warning for TODO implementation
    void userId
    return 0.1 // Mock low automation score
  }

  /**
   * Get user reputation data
   */
  private async getUserReputation(userId: string): Promise<UserReputation> {
    // TODO: Implement actual database query
    // For now, return mock data for a new user
    
    return {
      user_id: userId,
      trust_level: 0,
      reputation_score: 50,
      strikes: 0,
      total_submissions: 0,
      approved_submissions: 0,
      community_reports: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  /**
   * Generate rejection reasons based on signals
   */
  private generateRejectionReasons(signals: SpamSignals): string[] {
    const reasons: string[] = []

    if (signals.content_analysis.keyword_spam_score > 0.5) {
      reasons.push('spam_keywords_detected')
    }
    if (signals.content_analysis.repetition_score > 0.5) {
      reasons.push('excessive_repetition')
    }
    if (signals.content_analysis.link_spam_score > 0.5) {
      reasons.push('suspicious_links')
    }
    if (signals.behavioral_analysis.velocity_score > 0.7) {
      reasons.push('posting_too_frequently')
    }
    if (signals.reputation_factors.historical_violations > 0.5) {
      reasons.push('previous_policy_violations')
    }

    return reasons.length > 0 ? reasons : ['automated_spam_detection']
  }

  /**
   * Generate review reasons for human moderators
   */
  private generateReviewReasons(signals: SpamSignals): string[] {
    const reasons: string[] = []

    if (signals.content_analysis.keyword_spam_score > 0.3) {
      reasons.push('potential_spam_keywords')
    }
    if (signals.behavioral_analysis.velocity_score > 0.4) {
      reasons.push('elevated_posting_frequency')
    }
    if (signals.reputation_factors.user_trust_level < 0.5) {
      reasons.push('new_user_review')
    }

    return reasons.length > 0 ? reasons : ['routine_quality_check']
  }

  /**
   * Get appeal deadline (30 days from decision)
   */
  private getAppealDeadline(): string {
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + 30)
    return deadline.toISOString()
  }

  /**
   * Log moderation decision for audit trail
   */
  private async logModerationDecision(
    submission: ContentSubmission,
    decision: ModerationResult,
    signals: SpamSignals
  ): Promise<void> {
    const auditLog = {
      submission_id: submission.id,
      author_id: submission.author_id,
      decision: decision.status,
      confidence: decision.confidence,
      reasons: decision.reasons,
      spam_signals: signals,
      timestamp: new Date().toISOString(),
      system_version: '1.0'
    }

    // TODO: Store in audit database
    if (process.env.NODE_ENV === 'development') {
      // console.log('Moderation Decision:', JSON.stringify(auditLog, null, 2)); // Migrated: Use logInfo if needed
    }
  }
}

// Export singleton instance
export const moderationEngine = new ContentModerationEngine()