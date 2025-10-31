'use client';

import React, { useEffect, useState } from 'react';
import { X, HelpCircle, Lightbulb } from 'lucide-react';
import { logError } from '@/lib/error-logger';


interface HelpSuggestion {
  type: 'new_user' | 'feature_highlight' | 'stuck_point' | 'page_specific';
  message: string;
  actionText?: string;
  actionUrl?: string;
  dismissible: boolean;
}

interface ContextualHelpProps {
  page: 'library' | 'atelier' | 'settings' | 'communities' | 'work' | 'profile';
  context?: Record<string, unknown>;
}

export function ContextualHelp({ page, context = {} }: ContextualHelpProps) {
  const [suggestions, setSuggestions] = useState<HelpSuggestion[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load dismissed suggestions from localStorage
    const stored = localStorage.getItem('dismissed-help-suggestions');
    if (stored) {
      try {
        setDismissedIds(new Set(JSON.parse(stored)));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  useEffect(() => {
    async function fetchHelp() {
      try {
        setLoading(true);
        const res = await fetch('/api/ai/contextual-help', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPage: page,
            context,
          }),
        });

        if (!res.ok) {
          throw new Error('Failed to load help');
        }

        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch (err) {
        // Silently fail - help is optional
        logError('Contextual help error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHelp();
  }, [page, context]);

  const dismiss = (suggestionId: string) => {
    const newDismissed = new Set(dismissedIds);
    newDismissed.add(suggestionId);
    setDismissedIds(newDismissed);
    localStorage.setItem('dismissed-help-suggestions', JSON.stringify([...newDismissed]));
  };

  const clearAllDismissed = () => {
    setDismissedIds(new Set());
    localStorage.removeItem('dismissed-help-suggestions');
  };

  if (loading || suggestions.length === 0) {
    return null;
  }

  const visibleSuggestions = suggestions.filter(
    (s, idx) => !dismissedIds.has(`${page}-${idx}`)
  );

  if (visibleSuggestions.length === 0) {
    return (
      <button
        onClick={clearAllDismissed}
        className="fixed bottom-4 right-4 p-2 bg-white border border-border rounded-full shadow-lg hover:shadow-xl transition-shadow text-support hover:text-accent"
        title="Show help tips again"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm space-y-2 z-40">
      {visibleSuggestions.map((suggestion, idx) => {
        const suggestionId = `${page}-${idx}`;
        
        return (
          <div
            key={suggestionId}
            className="bg-white border border-accent/30 rounded-lg shadow-lg p-4 animate-fade-in"
          >
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-secondary mb-2">
                  {suggestion.message}
                </p>
                
                {suggestion.actionUrl && suggestion.actionText && (
                  <a
                    href={suggestion.actionUrl}
                    className="inline-block text-sm text-accent hover:text-accent/80 font-medium"
                  >
                    {suggestion.actionText} →
                  </a>
                )}
              </div>

              {suggestion.dismissible && (
                <button
                  onClick={() => dismiss(suggestionId)}
                  className="text-support hover:text-secondary transition-colors flex-shrink-0"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
