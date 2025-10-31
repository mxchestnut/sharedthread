'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  FileText, 
  MessageSquare, 
  Star,
  Folder,
  BookOpen,
  BarChart3,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
  ArrowLeft
} from 'lucide-react';

interface BehaviorInsight {
  metric: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  interpretation: string;
}

interface FeatureUsage {
  feature: string;
  activeUsers: number;
  usageRate: string;
  trend: 'up' | 'down' | 'stable';
}

interface QualityAlert {
  type: 'spam' | 'low_engagement' | 'quality_drop' | 'abandonment';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedCount: number;
  recommendation: string;
}

interface TrendInsight {
  pattern: string;
  confidence: string;
  implication: string;
  recommendation: string;
}

interface PlatformHealth {
  overallScore: number;
  scoreChange: number;
  behaviorInsights?: BehaviorInsight[];
  featureUsage?: FeatureUsage[];
  qualityAlerts?: QualityAlert[];
  trendInsights?: TrendInsight[];
  recommendations?: string[];
  lastUpdated: string;
}

export default function AIInsightsDashboard() {
  const [health, setHealth] = useState<PlatformHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealthData();
  }, []);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/staff/ai-insights');
      if (!res.ok) throw new Error('Failed to fetch health data');
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Activity className="w-12 h-12 text-accent mx-auto mb-4 animate-pulse" />
              <p className="text-support">Loading platform health data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !health) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Link 
              href="/staff"
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Staff Dashboard
            </Link>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-900 font-semibold mb-1">Error Loading Dashboard</h3>
                <p className="text-red-700">{error || 'Unknown error occurred'}</p>
                <button
                  onClick={fetchHealthData}
                  className="mt-3 text-sm text-red-600 hover:text-red-700 underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/staff"
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Staff Dashboard
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif text-primary mb-1">AI Platform Insights</h1>
              <p className="text-support text-sm">
                Platform health analytics powered by AI • Last updated {new Date(health.lastUpdated).toLocaleString()}
              </p>
            </div>
            <button
              onClick={fetchHealthData}
              className="px-4 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8">
        {/* Health Score Card */}
        <HealthScoreCard score={health.overallScore} change={health.scoreChange} />

        {/* Behavior Insights */}
        <section>
          <h2 className="text-xl font-serif text-primary mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            User Behavior Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {health.behaviorInsights?.map((insight, idx) => (
              <BehaviorCard key={idx} insight={insight} />
            )) || (
              <p className="text-support col-span-full text-center py-8">
                No behavior insights available yet.
              </p>
            )}
          </div>
        </section>

        {/* Feature Usage */}
        <section>
          <h2 className="text-xl font-serif text-primary mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent" />
            Feature Usage Statistics
          </h2>
          <div className="bg-white rounded-lg border border-border p-6">
            <FeatureUsageChart features={health.featureUsage || []} />
          </div>
        </section>

        {/* Quality Alerts */}
        {health.qualityAlerts && health.qualityAlerts.length > 0 && (
          <section>
            <h2 className="text-xl font-serif text-primary mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Quality Alerts
            </h2>
            <div className="space-y-3">
              {health.qualityAlerts.map((alert, idx) => (
                <QualityAlertCard key={idx} alert={alert} />
              ))}
            </div>
          </section>
        )}

        {/* AI Trend Analysis */}
        <section>
          <h2 className="text-xl font-serif text-primary mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            AI Trend Analysis
          </h2>
          <div className="space-y-3">
            {health.trendInsights?.map((trend, idx) => (
              <TrendInsightCard key={idx} trend={trend} />
            )) || (
              <p className="text-support text-center py-8">
                No trend insights available yet.
              </p>
            )}
          </div>
        </section>

        {/* Recommendations */}
        <section>
          <h2 className="text-xl font-serif text-primary mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Recommended Actions
          </h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <ul className="space-y-2">
              {health.recommendations?.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-green-900 text-sm">{rec}</span>
                </li>
              )) || (
                <li className="text-green-700 text-sm">
                  No specific recommendations at this time. Platform health is good!
                </li>
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

// Health Score Card Component
function HealthScoreCard({ score, change }: { score: number; change: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <div className={`rounded-lg border p-8 ${getScoreBg(score)}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-support mb-2">Overall Platform Health</p>
          <div className="flex items-baseline gap-3">
            <h2 className={`text-6xl font-bold ${getScoreColor(score)}`}>
              {score}
            </h2>
            <span className="text-2xl text-support">/100</span>
          </div>
          <p className={`text-lg font-medium mt-2 ${getScoreColor(score)}`}>
            {getScoreLabel(score)}
          </p>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end mb-2">
            {change > 0 ? (
              <ArrowUp className="w-5 h-5 text-green-600" />
            ) : change < 0 ? (
              <ArrowDown className="w-5 h-5 text-red-600" />
            ) : (
              <Minus className="w-5 h-5 text-gray-400" />
            )}
            <span className={`text-xl font-semibold ${
              change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-400'
            }`}>
              {change > 0 ? '+' : ''}{change}
            </span>
          </div>
          <p className="text-sm text-support">from last check</p>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-6 h-3 bg-white rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// Behavior Card Component
function BehaviorCard({ insight }: { insight: BehaviorInsight }) {
  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-400';
  };

  return (
    <div className="bg-white rounded-lg border border-border p-5">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium text-primary">{insight.metric}</h3>
        {getTrendIcon(insight.trend)}
      </div>
      <p className={`text-2xl font-bold mb-2 ${getTrendColor(insight.trend)}`}>
        {insight.value}
      </p>
      <p className="text-sm text-support">{insight.interpretation}</p>
    </div>
  );
}

// Feature Usage Chart Component
function FeatureUsageChart({ features }: { features: FeatureUsage[] }) {
  const getFeatureIcon = (feature: string) => {
    switch (feature.toLowerCase()) {
      case 'works':
        return <FileText className="w-5 h-5" />;
      case 'ratings':
        return <Star className="w-5 h-5" />;
      case 'discussions':
        return <MessageSquare className="w-5 h-5" />;
      case 'collections':
        return <Folder className="w-5 h-5" />;
      case 'annotations':
        return <BookOpen className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const maxUsers = Math.max(...features.map(f => f.activeUsers));

  return (
    <div className="space-y-4">
      {features.map((feature, idx) => (
        <div key={idx}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-accent">{getFeatureIcon(feature.feature)}</span>
              <span className="font-medium text-primary">{feature.feature}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-support">
                {feature.activeUsers} users ({feature.usageRate})
              </span>
              {feature.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
              {feature.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
              {feature.trend === 'stable' && <Minus className="w-4 h-4 text-gray-400" />}
            </div>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${(feature.activeUsers / maxUsers) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Quality Alert Card Component
function QualityAlertCard({ alert }: { alert: QualityAlert }) {
  const getSeverityColor = (severity: string) => {
    if (severity === 'high') return 'border-red-200 bg-red-50';
    if (severity === 'medium') return 'border-yellow-200 bg-yellow-50';
    return 'border-blue-200 bg-blue-50';
  };

  const getSeverityTextColor = (severity: string) => {
    if (severity === 'high') return 'text-red-900';
    if (severity === 'medium') return 'text-yellow-900';
    return 'text-blue-900';
  };

  const getSeverityBadgeColor = (severity: string) => {
    if (severity === 'high') return 'bg-red-600 text-white';
    if (severity === 'medium') return 'bg-yellow-600 text-white';
    return 'bg-blue-600 text-white';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'spam':
        return <AlertTriangle className="w-5 h-5" />;
      case 'low_engagement':
        return <TrendingDown className="w-5 h-5" />;
      case 'quality_drop':
        return <Activity className="w-5 h-5" />;
      case 'abandonment':
        return <Users className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  return (
    <div className={`rounded-lg border p-5 ${getSeverityColor(alert.severity)}`}>
      <div className="flex items-start gap-3">
        <span className={getSeverityTextColor(alert.severity)}>
          {getTypeIcon(alert.type)}
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`font-semibold ${getSeverityTextColor(alert.severity)}`}>
              {alert.description}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityBadgeColor(alert.severity)}`}>
              {alert.severity.toUpperCase()}
            </span>
          </div>
          <p className={`text-sm mb-3 ${getSeverityTextColor(alert.severity)}`}>
            Affects {alert.affectedCount} {alert.affectedCount === 1 ? 'item' : 'items'}
          </p>
          <div className={`text-sm ${getSeverityTextColor(alert.severity)} bg-white/50 rounded p-3`}>
            <p className="font-medium mb-1">Recommendation:</p>
            <p>{alert.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Trend Insight Card Component
function TrendInsightCard({ trend }: { trend: TrendInsight }) {
  return (
    <div className="bg-white rounded-lg border border-border p-5">
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-primary">{trend.pattern}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">
              {trend.confidence} confidence
            </span>
          </div>
          <p className="text-sm text-support mb-3">{trend.implication}</p>
          <div className="bg-accent/5 rounded p-3">
            <p className="text-sm text-primary">
              <span className="font-medium">Recommendation:</span> {trend.recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
