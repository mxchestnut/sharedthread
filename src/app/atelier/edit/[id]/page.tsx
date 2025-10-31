'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { WorkEditor } from '@/components/atelier/work-editor';

interface WorkFromAPI {
  id: string;
  title: string;
  content: Record<string, unknown>;
  excerpt?: string;
  status: 'DRAFT' | 'BETA' | 'PUBLISHED' | 'ARCHIVED';
  visibility: 'PRIVATE' | 'FOLLOWERS' | 'COMMUNITY' | 'PUBLIC';
  acceptingFeedback: boolean;
  betaEndDate?: string;
  tags: string[];
  publishedToCommunities: string[];
  publishedToPublic: boolean;
  publishedToFollowers: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    displayName: string;
  };
}

export default function EditWorkPage() {
  const params = useParams();
  const workId = params.id as string;
  const [work, setWork] = useState<WorkFromAPI | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWork = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/works/${workId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Work not found');
          } else if (response.status === 403) {
            throw new Error('You do not have permission to edit this work');
          } else {
            throw new Error('Failed to load work');
          }
        }

        const data = await response.json();
        setWork(data.work);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    if (workId) {
      fetchWork();
    }
  }, [workId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-ink/60">Loading work...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-ink mb-4">Error</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-ink mb-4">Work Not Found</h1>
          <p className="text-ink/60 mb-4">The work you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // @ts-expect-error - API and editor types don't match perfectly
  return <WorkEditor work={work} />;
}