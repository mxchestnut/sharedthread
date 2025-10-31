'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  FileCheck, 
  Expand, 
  Quote, 
  X, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface WritingFeedback {
  category: 'clarity' | 'structure' | 'coherence' | 'engagement';
  issue: string;
  suggestion: string;
  severity: 'low' | 'medium' | 'high';
  location?: string;
}

interface ConsistencyIssue {
  type: 'terminology' | 'tone' | 'argument';
  issue: string;
  examples: string[];
  suggestion: string;
  severity: 'low' | 'medium' | 'high';
}

interface ExpansionSuggestion {
  section: string;
  currentLength: number;
  suggestion: string;
  whyExpand: string;
  priority: 'low' | 'medium' | 'high';
}

interface CitationSuggestion {
  claim: string;
  suggestedSources: string[];
  reasoning: string;
  priority: 'low' | 'medium' | 'high';
}

type TabType = 'feedback' | 'consistency' | 'expansion' | 'citations';

interface WritingAssistantPanelProps {
  content: string;
  title: string;
  onClose?: () => void;
  isOpen?: boolean;
}

export function WritingAssistantPanel({ 
  content, 
  title,
  onClose,
  isOpen = true 
}: WritingAssistantPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('feedback');
  const [loading, setLoading] = useState<Record<TabType, boolean>>({
    feedback: false,
    consistency: false,
    expansion: false,
    citations: false,
  });
  const [error, setError] = useState<Record<TabType, string | null>>({
    feedback: null,
    consistency: null,
    expansion: null,
    citations: null,
  });

  // Data states
  const [feedback, setFeedback] = useState<WritingFeedback[]>([]);
  const [consistencyIssues, setConsistencyIssues] = useState<ConsistencyIssue[]>([]);
  const [expansionSuggestions, setExpansionSuggestions] = useState<ExpansionSuggestion[]>([]);
  const [citationSuggestions, setCitationSuggestions] = useState<CitationSuggestion[]>([]);

  // Expanded states for accordion
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  if (!isOpen) return null;

  const tabs = [
    { id: 'feedback' as TabType, label: 'Feedback', icon: Sparkles },
    { id: 'consistency' as TabType, label: 'Consistency', icon: FileCheck },
    { id: 'expansion' as TabType, label: 'Expand', icon: Expand },
    { id: 'citations' as TabType, label: 'Citations', icon: Quote },
  ];

  const fetchFeedback = async () => {
    if (feedback.length > 0) return; // Already fetched

    try {
      setLoading({ ...loading, feedback: true });
      setError({ ...error, feedback: null });

      const res = await fetch('/api/ai/writing-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title }),
      });

      if (!res.ok) throw new Error('Failed to get feedback');

      const data = await res.json();
      setFeedback(data.feedback || []);
    } catch (err) {
      setError({ ...error, feedback: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setLoading({ ...loading, feedback: false });
    }
  };

  const fetchConsistency = async () => {
    if (consistencyIssues.length > 0) return;

    try {
      setLoading({ ...loading, consistency: true });
      setError({ ...error, consistency: null });

      const res = await fetch('/api/ai/consistency-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title }),
      });

      if (!res.ok) throw new Error('Failed to check consistency');

      const data = await res.json();
      setConsistencyIssues(data.issues || []);
    } catch (err) {
      setError({ ...error, consistency: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setLoading({ ...loading, consistency: false });
    }
  };

  const fetchExpansions = async () => {
    if (expansionSuggestions.length > 0) return;

    try {
      setLoading({ ...loading, expansion: true });
      setError({ ...error, expansion: null });

      const res = await fetch('/api/ai/expansion-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title }),
      });

      if (!res.ok) throw new Error('Failed to get expansion suggestions');

      const data = await res.json();
      setExpansionSuggestions(data.suggestions || []);
    } catch (err) {
      setError({ ...error, expansion: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setLoading({ ...loading, expansion: false });
    }
  };

  const fetchCitations = async () => {
    if (citationSuggestions.length > 0) return;

    try {
      setLoading({ ...loading, citations: true });
      setError({ ...error, citations: null });

      const res = await fetch('/api/ai/citation-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title }),
      });

      if (!res.ok) throw new Error('Failed to get citation suggestions');

      const data = await res.json();
      setCitationSuggestions(data.suggestions || []);
    } catch (err) {
      setError({ ...error, citations: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setLoading({ ...loading, citations: false });
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    
    // Lazy load data for each tab
    if (tab === 'feedback' && feedback.length === 0 && !loading.feedback) {
      fetchFeedback();
    } else if (tab === 'consistency' && consistencyIssues.length === 0 && !loading.consistency) {
      fetchConsistency();
    } else if (tab === 'expansion' && expansionSuggestions.length === 0 && !loading.expansion) {
      fetchExpansions();
    } else if (tab === 'citations' && citationSuggestions.length === 0 && !loading.citations) {
      fetchCitations();
    }
  };

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getSeverityIcon = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return AlertCircle;
      case 'medium': return Info;
      case 'low': return CheckCircle2;
    }
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-border shadow-xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <h2 className="font-semibold text-primary">Writing Assistant</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-border rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-support" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-white">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors border-b-2 ${
                isActive
                  ? 'border-accent text-accent bg-accent/5'
                  : 'border-transparent text-support hover:text-secondary hover:bg-surface'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="space-y-3">
            {loading.feedback && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-accent animate-spin" />
              </div>
            )}

            {error.feedback && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error.feedback}</p>
              </div>
            )}

            {!loading.feedback && !error.feedback && feedback.length === 0 && (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-support mx-auto mb-3" />
                <p className="text-support">Click a tab to analyze your writing</p>
              </div>
            )}

            {feedback.map((item, idx) => {
              const SeverityIcon = getSeverityIcon(item.severity);
              const isExpanded = expandedItems.has(idx);

              return (
                <div
                  key={idx}
                  className={`border rounded-lg overflow-hidden ${getSeverityColor(item.severity)}`}
                >
                  <button
                    onClick={() => toggleExpanded(idx)}
                    className="w-full px-4 py-3 flex items-start justify-between hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-start gap-2 text-left">
                      <SeverityIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm capitalize">{item.category}</p>
                        <p className="text-sm mt-1">{item.issue}</p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 flex-shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-3 border-t border-current/20">
                      <p className="text-sm mt-2">
                        <strong>Suggestion:</strong> {item.suggestion}
                      </p>
                      {item.location && (
                        <p className="text-xs mt-2 opacity-75">
                          Location: {item.location}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Consistency Tab */}
        {activeTab === 'consistency' && (
          <div className="space-y-3">
            {loading.consistency && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-accent animate-spin" />
              </div>
            )}

            {error.consistency && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error.consistency}</p>
              </div>
            )}

            {!loading.consistency && !error.consistency && consistencyIssues.length === 0 && (
              <div className="text-center py-8">
                <FileCheck className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-support">No consistency issues found!</p>
              </div>
            )}

            {consistencyIssues.map((issue, idx) => {
              const SeverityIcon = getSeverityIcon(issue.severity);
              const isExpanded = expandedItems.has(idx);

              return (
                <div
                  key={idx}
                  className={`border rounded-lg overflow-hidden ${getSeverityColor(issue.severity)}`}
                >
                  <button
                    onClick={() => toggleExpanded(idx)}
                    className="w-full px-4 py-3 flex items-start justify-between hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-start gap-2 text-left">
                      <SeverityIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm capitalize">{issue.type}</p>
                        <p className="text-sm mt-1">{issue.issue}</p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 flex-shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-3 border-t border-current/20">
                      <p className="text-sm mt-2">
                        <strong>Suggestion:</strong> {issue.suggestion}
                      </p>
                      {issue.examples.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold mb-1">Examples:</p>
                          <ul className="text-xs space-y-1">
                            {issue.examples.map((ex, i) => (
                              <li key={i} className="opacity-75">&quot;{ex}&quot;</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Expansion Tab */}
        {activeTab === 'expansion' && (
          <div className="space-y-3">
            {loading.expansion && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-accent animate-spin" />
              </div>
            )}

            {error.expansion && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error.expansion}</p>
              </div>
            )}

            {!loading.expansion && !error.expansion && expansionSuggestions.length === 0 && (
              <div className="text-center py-8">
                <Expand className="w-12 h-12 text-support mx-auto mb-3" />
                <p className="text-support">Your sections are well-developed!</p>
              </div>
            )}

            {expansionSuggestions.map((suggestion, idx) => {
              const SeverityIcon = getSeverityIcon(suggestion.priority);
              const isExpanded = expandedItems.has(idx);

              return (
                <div
                  key={idx}
                  className={`border rounded-lg overflow-hidden ${getSeverityColor(suggestion.priority)}`}
                >
                  <button
                    onClick={() => toggleExpanded(idx)}
                    className="w-full px-4 py-3 flex items-start justify-between hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-start gap-2 text-left">
                      <SeverityIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{suggestion.section}</p>
                        <p className="text-xs mt-1 opacity-75">
                          {suggestion.currentLength} words
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 flex-shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-3 border-t border-current/20">
                      <p className="text-sm mt-2">
                        <strong>Why expand:</strong> {suggestion.whyExpand}
                      </p>
                      <p className="text-sm mt-2">
                        <strong>Suggestion:</strong> {suggestion.suggestion}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Citations Tab */}
        {activeTab === 'citations' && (
          <div className="space-y-3">
            {loading.citations && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-accent animate-spin" />
              </div>
            )}

            {error.citations && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error.citations}</p>
              </div>
            )}

            {!loading.citations && !error.citations && citationSuggestions.length === 0 && (
              <div className="text-center py-8">
                <Quote className="w-12 h-12 text-support mx-auto mb-3" />
                <p className="text-support">No citation suggestions</p>
              </div>
            )}

            {citationSuggestions.map((citation, idx) => {
              const SeverityIcon = getSeverityIcon(citation.priority);
              const isExpanded = expandedItems.has(idx);

              return (
                <div
                  key={idx}
                  className={`border rounded-lg overflow-hidden ${getSeverityColor(citation.priority)}`}
                >
                  <button
                    onClick={() => toggleExpanded(idx)}
                    className="w-full px-4 py-3 flex items-start justify-between hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-start gap-2 text-left">
                      <SeverityIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm line-clamp-2">{citation.claim}</p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 flex-shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-3 border-t border-current/20">
                      <p className="text-sm mt-2">
                        <strong>Reasoning:</strong> {citation.reasoning}
                      </p>
                      {citation.suggestedSources.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold mb-1">Suggested sources:</p>
                          <ul className="text-xs space-y-1">
                            {citation.suggestedSources.map((source, i) => (
                              <li key={i} className="opacity-75">• {source}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border bg-surface">
        <p className="text-xs text-support">
          💡 All suggestions are AI-generated comments. Review and apply as you see fit.
        </p>
      </div>
    </div>
  );
}
