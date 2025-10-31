/**
 * User Reputation System
 * Manages trust levels, reputation scoring, and user progression
 */

export interface UserReputationData {
  user_id: string
  trust_level: TrustLevel
  reputation_score: number
  strikes: Strike[]
  achievements: Achievement[]
  moderation_history: ModerationHistory
  community_standing: CommunityStanding
  created_at: string
  updated_at: string
}

export type TrustLevel = 0 | 1 | 2 | 3 | 4

export interface TrustLevelConfig {
  level: TrustLevel
  name: string
  description: string
  privileges: string[]
  requirements: {
    min_reputation: number
    min_approved_submissions: number
    max_strikes: number
    account_age_days: number
    community_endorsements?: number
  }
  publishing_limits: {
    works_per_day: number
    comments_per_hour: number
    requires_approval: string[]
  }
}

export interface Strike {
  id: string
  type: 'spam' | 'policy_violation' | 'community_guidelines' | 'copyright' | 'harassment'
  severity: 'minor' | 'moderate' | 'severe'
  description: string
  evidence: string[]
  issued_by: string
  issued_at: string
  expires_at: string
  appealed: boolean
  appeal_result?: 'upheld' | 'overturned' | 'reduced'
}

export interface Achievement {
  id: string
  type: 'content_quality' | 'community_contribution' | 'milestone' | 'special_recognition'
  title: string
  description: string
  reputation_bonus: number
  earned_at: string
}

export interface ModerationHistory {
  total_submissions: number
  approved_submissions: number
  rejected_submissions: number
  pending_submissions: number
  appeals_filed: number
  appeals_successful: number
  last_violation: string | null
  clean_streak_days: number
}

export interface CommunityStanding {
  peer_endorsements: number
  helpful_reports: number
  false_reports: number
  community_moderator_nominations: number
  follow_count: number
  engagement_quality_score: number
}

export class UserReputationSystem {
  private readonly TRUST_LEVELS: Record<TrustLevel, TrustLevelConfig> = {
    0: {
      level: 0,
      name: 'New User',
      description: 'Recently joined Shared Thread, building initial reputation',
      privileges: ['create_works', 'comment_public', 'basic_collections'],
      requirements: {
        min_reputation: 0,
        min_approved_submissions: 0,
        max_strikes: 0,
        account_age_days: 0
      },
      publishing_limits: {
        works_per_day: 1,
        comments_per_hour: 5,
        requires_approval: ['works', 'media_uploads']
      }
    },
    1: {
      level: 1,
      name: 'Verified User',
      description: 'Established user with consistent quality content',
      privileges: ['auto_approve_text', 'comment_beta', 'create_collections', 'report_content'],
      requirements: {
        min_reputation: 100,
        min_approved_submissions: 10,
        max_strikes: 1,
        account_age_days: 7
      },
      publishing_limits: {
        works_per_day: 5,
        comments_per_hour: 15,
        requires_approval: ['media_uploads']
      }
    },
    2: {
      level: 2,
      name: 'Trusted Creator',
      description: 'Valued community member with proven content quality',
      privileges: ['auto_approve_most', 'priority_support', 'beta_features', 'mentor_new_users'],
      requirements: {
        min_reputation: 500,
        min_approved_submissions: 50,
        max_strikes: 2,
        account_age_days: 30
      },
      publishing_limits: {
        works_per_day: 10,
        comments_per_hour: 30,
        requires_approval: ['sensitive_content']
      }
    },
    3: {
      level: 3,
      name: 'Community Moderator',
      description: 'Trusted with community moderation responsibilities',
      privileges: ['flag_content', 'moderate_comments', 'access_reports', 'community_insights'],
      requirements: {
        min_reputation: 1500,
        min_approved_submissions: 150,
        max_strikes: 1,
        account_age_days: 90,
        community_endorsements: 10
      },
      publishing_limits: {
        works_per_day: 20,
        comments_per_hour: 50,
        requires_approval: []
      }
    },
    4: {
      level: 4,
      name: 'Staff Moderator',
      description: 'Shared Thread staff member with full moderation privileges',
      privileges: ['full_moderation', 'user_management', 'policy_enforcement', 'system_administration'],
      requirements: {
        min_reputation: 5000,
        min_approved_submissions: 500,
        max_strikes: 0,
        account_age_days: 180
      },
      publishing_limits: {
        works_per_day: 100,
        comments_per_hour: 200,
        requires_approval: []
      }
    }
  }

  private readonly REPUTATION_ACTIONS = {
    work_approved: 10,
    work_featured: 50,
    comment_approved: 2,
    received_rating_5: 5,
    received_rating_4: 3,
    received_rating_3: 1,
    received_rating_2: -1,
    received_rating_1: -3,
    content_reported_valid: -20,
    strike_issued: -100,
    achievement_earned: 25,
    peer_endorsement: 15,
    helpful_report: 10,
    false_report: -5,
    appeal_successful: 20,
    clean_streak_30_days: 30,
    clean_streak_90_days: 100,
    clean_streak_365_days: 500
  } as const

  /**
   * Get user's current reputation data
   */
  async getUserReputation(userId: string): Promise<UserReputationData> {
    // TODO: Implement actual database query
    // For now, return mock data
    
    return {
      user_id: userId,
      trust_level: 0,
      reputation_score: 50,
      strikes: [],
      achievements: [],
      moderation_history: {
        total_submissions: 0,
        approved_submissions: 0,
        rejected_submissions: 0,
        pending_submissions: 0,
        appeals_filed: 0,
        appeals_successful: 0,
        last_violation: null,
        clean_streak_days: 0
      },
      community_standing: {
        peer_endorsements: 0,
        helpful_reports: 0,
        false_reports: 0,
        community_moderator_nominations: 0,
        follow_count: 0,
        engagement_quality_score: 0.5
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  /**
   * Update user reputation based on action
   */
  async updateReputation(
    userId: string, 
    action: keyof typeof this.REPUTATION_ACTIONS,
    metadata?: Record<string, unknown>
  ): Promise<UserReputationData> {
    const currentReputation = await this.getUserReputation(userId)
    const pointChange = this.REPUTATION_ACTIONS[action]
    
    // Calculate new reputation score
    const newScore = Math.max(0, currentReputation.reputation_score + pointChange)
    
    // Update moderation history
    const updatedHistory = this.updateModerationHistory(
      currentReputation.moderation_history,
      action,
      metadata
    )
    
    // Check for trust level changes
    const newTrustLevel = this.calculateTrustLevel(newScore, updatedHistory, currentReputation)
    
    // Check for new achievements
    const newAchievements = await this.checkForAchievements(
      currentReputation,
      action,
      newScore,
      newTrustLevel
    )

    const updatedReputation: UserReputationData = {
      ...currentReputation,
      reputation_score: newScore,
      trust_level: newTrustLevel,
      moderation_history: updatedHistory,
      achievements: [...currentReputation.achievements, ...newAchievements],
      updated_at: new Date().toISOString()
    }

    // Save to database
    await this.saveReputation(updatedReputation)
    
    // Log reputation change for audit
    await this.logReputationChange(userId, action, pointChange, metadata)

    return updatedReputation
  }

  /**
   * Issue a strike against a user
   */
  async issueStrike(
    userId: string,
    type: Strike['type'],
    severity: Strike['severity'],
    description: string,
    evidence: string[],
    issuedBy: string
  ): Promise<UserReputationData> {
    const currentReputation = await this.getUserReputation(userId)
    
    // Create strike record
    const strike: Strike = {
      id: this.generateStrikeId(),
      type,
      severity,
      description,
      evidence,
      issued_by: issuedBy,
      issued_at: new Date().toISOString(),
      expires_at: this.calculateStrikeExpiry(severity),
      appealed: false
    }

    // Add strike to user record
    const updatedStrikes = [...currentReputation.strikes, strike]
    
    // Calculate reputation penalty
    const reputationPenalty = this.calculateStrikePenalty(severity)
    const newScore = Math.max(0, currentReputation.reputation_score - reputationPenalty)
    
    // Update trust level based on new strikes
    const newTrustLevel = this.calculateTrustLevel(
      newScore,
      currentReputation.moderation_history,
      { ...currentReputation, strikes: updatedStrikes }
    )

    const updatedReputation: UserReputationData = {
      ...currentReputation,
      strikes: updatedStrikes,
      reputation_score: newScore,
      trust_level: newTrustLevel,
      updated_at: new Date().toISOString()
    }

    await this.saveReputation(updatedReputation)
    await this.logStrikeIssued(userId, strike)

    return updatedReputation
  }

  /**
   * Calculate appropriate trust level based on reputation and history
   */
  private calculateTrustLevel(
    reputationScore: number,
    history: ModerationHistory,
    userData: UserReputationData
  ): TrustLevel {
    const accountAgeDays = this.calculateAccountAge(userData.created_at)
    const activeStrikes = this.getActiveStrikes(userData.strikes)

    // Check each trust level from highest to lowest
    for (let level = 4; level >= 0; level--) {
      const config = this.TRUST_LEVELS[level as TrustLevel]
      const requirements = config.requirements

      const meetsRequirements = (
        reputationScore >= requirements.min_reputation &&
        history.approved_submissions >= requirements.min_approved_submissions &&
        activeStrikes.length <= requirements.max_strikes &&
        accountAgeDays >= requirements.account_age_days &&
        (requirements.community_endorsements === undefined || 
         userData.community_standing.peer_endorsements >= requirements.community_endorsements)
      )

      if (meetsRequirements) {
        return level as TrustLevel
      }
    }

    return 0 // Default to new user
  }

  /**
   * Update moderation history based on action
   */
  private updateModerationHistory(
    history: ModerationHistory,
    action: keyof typeof this.REPUTATION_ACTIONS,
    metadata?: Record<string, unknown>
  ): ModerationHistory {
    // Suppress unused parameter warning
    void metadata
    
    const updated = { ...history }

    switch (action) {
      case 'work_approved':
        updated.approved_submissions++
        updated.total_submissions++
        break
      case 'content_reported_valid':
        updated.rejected_submissions++
        updated.last_violation = new Date().toISOString()
        updated.clean_streak_days = 0
        break
      case 'strike_issued':
        updated.last_violation = new Date().toISOString()
        updated.clean_streak_days = 0
        break
      case 'appeal_successful':
        updated.appeals_successful++
        break
    }

    // Calculate clean streak
    if (updated.last_violation) {
      const daysSinceViolation = Math.floor(
        (Date.now() - new Date(updated.last_violation).getTime()) / (1000 * 60 * 60 * 24)
      )
      updated.clean_streak_days = daysSinceViolation
    }

    return updated
  }

  /**
   * Check for new achievements based on recent actions
   */
  private async checkForAchievements(
    currentReputation: UserReputationData,
    action: keyof typeof this.REPUTATION_ACTIONS,
    newScore: number,
    newTrustLevel: TrustLevel
  ): Promise<Achievement[]> {
    const achievements: Achievement[] = []

    // First Work achievement
    if (action === 'work_approved' && currentReputation.moderation_history.approved_submissions === 0) {
      achievements.push({
        id: this.generateAchievementId(),
        type: 'milestone',
        title: 'First Publication',
        description: 'Published your first work on Shared Thread',
        reputation_bonus: 25,
        earned_at: new Date().toISOString()
      })
    }

    // Reputation milestones
    const reputationMilestones = [100, 500, 1000, 2500, 5000, 10000]
    for (const milestone of reputationMilestones) {
      if (newScore >= milestone && currentReputation.reputation_score < milestone) {
        achievements.push({
          id: this.generateAchievementId(),
          type: 'milestone',
          title: `${milestone} Reputation`,
          description: `Reached ${milestone} reputation points`,
          reputation_bonus: Math.floor(milestone / 20),
          earned_at: new Date().toISOString()
        })
      }
    }

    // Trust level promotions
    if (newTrustLevel > currentReputation.trust_level) {
      const levelConfig = this.TRUST_LEVELS[newTrustLevel]
      achievements.push({
        id: this.generateAchievementId(),
        type: 'special_recognition',
        title: `Promoted to ${levelConfig.name}`,
        description: levelConfig.description,
        reputation_bonus: newTrustLevel * 50,
        earned_at: new Date().toISOString()
      })
    }

    return achievements
  }

  /**
   * Get currently active (non-expired) strikes
   */
  private getActiveStrikes(strikes: Strike[]): Strike[] {
    const now = new Date()
    return strikes.filter(strike => {
      const expiryDate = new Date(strike.expires_at)
      return expiryDate > now && strike.appeal_result !== 'overturned'
    })
  }

  /**
   * Calculate account age in days
   */
  private calculateAccountAge(createdAt: string): number {
    const created = new Date(createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - created.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  /**
   * Calculate strike expiry date based on severity
   */
  private calculateStrikeExpiry(severity: Strike['severity']): string {
    const now = new Date()
    let daysToAdd = 30 // Default 30 days

    switch (severity) {
      case 'minor':
        daysToAdd = 30
        break
      case 'moderate':
        daysToAdd = 90
        break
      case 'severe':
        daysToAdd = 365
        break
    }

    now.setDate(now.getDate() + daysToAdd)
    return now.toISOString()
  }

  /**
   * Calculate reputation penalty for strikes
   */
  private calculateStrikePenalty(severity: Strike['severity']): number {
    switch (severity) {
      case 'minor':
        return 50
      case 'moderate':
        return 150
      case 'severe':
        return 500
      default:
        return 100
    }
  }

  /**
   * Generate unique strike ID
   */
  private generateStrikeId(): string {
    return `strike_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  }

  /**
   * Generate unique achievement ID
   */
  private generateAchievementId(): string {
    return `achievement_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  }

  /**
   * Save reputation data to database
   */
  private async saveReputation(reputation: UserReputationData): Promise<void> {
    // TODO: Implement actual database save
    if (process.env.NODE_ENV === 'development') {
      // console.log('Saving reputation:', JSON.stringify(reputation, null, 2)); // Migrated: Use logInfo if needed
    }
  }

  /**
   * Log reputation change for audit
   */
  private async logReputationChange(
    userId: string,
    action: string,
    pointChange: number,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const auditLog = {
      user_id: userId,
      action,
      point_change: pointChange,
      metadata,
      timestamp: new Date().toISOString()
    }

    // TODO: Store in audit log
    if (process.env.NODE_ENV === 'development') {
      // console.log('Reputation Change:', JSON.stringify(auditLog, null, 2)); // Migrated: Use logInfo if needed
    }
  }

  /**
   * Log strike issuance for audit
   */
  private async logStrikeIssued(userId: string, strike: Strike): Promise<void> {
    const auditLog = {
      user_id: userId,
      strike_id: strike.id,
      strike_type: strike.type,
      strike_severity: strike.severity,
      issued_by: strike.issued_by,
      timestamp: strike.issued_at
    }

    // TODO: Store in audit log
    if (process.env.NODE_ENV === 'development') {
      // console.log('Strike Issued:', JSON.stringify(auditLog, null, 2)); // Migrated: Use logInfo if needed
    }
  }

  /**
   * Get trust level configuration
   */
  getTrustLevelConfig(level: TrustLevel): TrustLevelConfig {
    return this.TRUST_LEVELS[level]
  }

  /**
   * Check if user has privilege
   */
  async userHasPrivilege(userId: string, privilege: string): Promise<boolean> {
    const reputation = await this.getUserReputation(userId)
    const config = this.TRUST_LEVELS[reputation.trust_level]
    return config.privileges.includes(privilege)
  }

  /**
   * Get user's publishing limits
   */
  async getUserLimits(userId: string): Promise<TrustLevelConfig['publishing_limits']> {
    const reputation = await this.getUserReputation(userId)
    const config = this.TRUST_LEVELS[reputation.trust_level]
    return config.publishing_limits
  }
}

// Export singleton instance
export const reputationSystem = new UserReputationSystem()