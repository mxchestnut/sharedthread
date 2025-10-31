'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Search, ExternalLink, Mail, Loader2 } from 'lucide-react';
import { logError } from '@/lib/error-logger';


interface FAQArticle {
  id: string;
  question: string;
  answer: string;
  category: string;
  relevanceScore: number;
}

export function FAQSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FAQArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const searchFAQs = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/help/suggest-faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!res.ok) {
        throw new Error('Failed to search FAQs');
      }

      const data = await res.json();
      setResults(data.suggestions || []);
      setShowContactForm(data.showContactForm || false);
      setSearched(true);
    } catch (err) {
      logError('FAQ search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Debounce search
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      searchFAQs(value);
    }, 500);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-support" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="What do you need help with?"
          className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-support animate-spin" />
        )}
      </div>

      {/* Results */}
      {searched && (
        <div className="space-y-4">
          {results.length > 0 ? (
            <>
              <p className="text-sm text-support mb-4">
                Found {results.length} article{results.length !== 1 ? 's' : ''} that might help
              </p>
              
              {results.map(article => (
                <article
                  key={article.id}
                  className="bg-white border border-border rounded-lg p-6 hover:border-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <span className="inline-block px-2 py-1 bg-surface text-support text-xs rounded mb-2">
                        {article.category}
                      </span>
                      <h3 className="text-lg font-semibold text-primary">
                        {article.question}
                      </h3>
                    </div>
                    {article.relevanceScore > 0.7 && (
                      <span className="ml-4 px-2 py-1 bg-accent/10 text-accent text-xs rounded">
                        {Math.round(article.relevanceScore * 100)}% match
                      </span>
                    )}
                  </div>

                  <p className="text-secondary mb-4 line-clamp-3">
                    {article.answer}
                  </p>

                  <a
                    href={`/help/articles/${article.id}`}
                    className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80 font-medium"
                  >
                    Read full article
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </article>
              ))}
            </>
          ) : (
            <div className="bg-white border border-border rounded-lg p-8 text-center">
              <p className="text-support mb-4">
                No matching articles found for &quot;{query}&quot;
              </p>
            </div>
          )}

          {/* Contact Form Option */}
          {(showContactForm || results.length === 0) && searched && (
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-6 mt-6">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-primary mb-2">
                    Still need help?
                  </h3>
                  <p className="text-support mb-4">
                    Our team is here to assist you. Send us a message and we&apos;ll get back to you soon.
                  </p>
                  <a
                    href="/contact"
                    className="inline-block px-6 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Default State */}
      {!searched && !query && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="bg-white border border-border rounded-lg p-6">
            <h3 className="font-semibold text-primary mb-2">Getting Started</h3>
            <p className="text-support text-sm mb-4">
              Learn the basics of Shared Thread
            </p>
            <a href="/help/getting-started" className="text-accent text-sm hover:text-accent/80">
              View guides →
            </a>
          </div>
          
          <div className="bg-white border border-border rounded-lg p-6">
            <h3 className="font-semibold text-primary mb-2">Writing Tips</h3>
            <p className="text-support text-sm mb-4">
              Make the most of Atelier and Beta mode
            </p>
            <a href="/help/writing" className="text-accent text-sm hover:text-accent/80">
              Learn more →
            </a>
          </div>
          
          <div className="bg-white border border-border rounded-lg p-6">
            <h3 className="font-semibold text-primary mb-2">Community Guidelines</h3>
            <p className="text-support text-sm mb-4">
              How to participate respectfully
            </p>
            <a href="/help/guidelines" className="text-accent text-sm hover:text-accent/80">
              Read guidelines →
            </a>
          </div>
          
          <div className="bg-white border border-border rounded-lg p-6">
            <h3 className="font-semibold text-primary mb-2">Account & Privacy</h3>
            <p className="text-support text-sm mb-4">
              Manage your account and data
            </p>
            <a href="/help/privacy" className="text-accent text-sm hover:text-accent/80">
              Privacy info →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
