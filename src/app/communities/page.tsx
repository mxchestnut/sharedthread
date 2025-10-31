'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, ArrowRight, Globe } from 'lucide-react';
import { logInfo } from '@/lib/error-logger';


interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  memberCount: number;
  createdAt: string;
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCommunities();
  }, []);

    const fetchCommunities = async () => {
    try {
      const response = await fetch('/api/communities');
      if (response.ok) {
        const data = await response.json();
        setCommunities(data);
      } else if (response.status === 401) {
        // Authentication failed, show mock data for testing
        logInfo('Authentication failed, showing mock data');
        setCommunities([
          {
            id: '1',
            name: 'Hieroscope',
            slug: 'hieroscope',
            description: 'A divination practice combining cleromancy with bibliomancy, using marked tiles and texts to reveal hidden patterns and insights.',
            memberCount: 0,
            createdAt: new Date().toISOString()
          }
        ]);
      } else {
        setError('Failed to fetch communities');
      }
    } catch {
      setError('Failed to fetch communities');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-support">Loading communities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-ink mb-4">Communities</h1>
          <p className="text-support leading-relaxed">
            Discover and join private communities on Shared Thread. Each community has its own 
            space for focused discussions and collaborative work.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 text-red-800 rounded-md">
            {error}
            <button
              onClick={fetchCommunities}
              className="ml-4 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {communities.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-support mb-4" />
            <h2 className="text-xl font-medium text-ink mb-2">No Communities Yet</h2>
            <p className="text-support mb-6">
              Be the first to propose a community for Shared Thread.
            </p>
            <Link
              href="/community-proposals"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
            >
              Propose a Community
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {communities.map((community) => (
              <div
                key={community.id}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-medium text-ink">
                        {community.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-support">
                        <Globe size={12} />
                        Public
                      </div>
                    </div>
                    
                    <p className="text-support mb-4 leading-relaxed">
                      {community.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-support">
                      <span>
                        {community.memberCount} member{community.memberCount !== 1 ? 's' : ''}
                      </span>
                      <span>•</span>
                      <span>
                        Created {new Date(community.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <Link
                    href={`/communities/${community.slug}`}
                    className="ml-6 inline-flex items-center gap-2 px-4 py-2 border-2 border-accent text-accent hover:bg-accent hover:text-white transition-colors rounded-md"
                  >
                    View Community
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/community-proposals"
            className="inline-flex items-center gap-2 text-accent hover:text-accent/80 underline"
          >
            Want to create your own community?
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}