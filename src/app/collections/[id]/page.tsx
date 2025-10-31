'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Collection {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    username: string;
    displayName: string;
  };
  _count: {
    items: number;
  };
  items: CollectionItem[];
  isOwner?: boolean;
}

interface CollectionItem {
  id: string;
  addedAt: string;
  work: {
    id: string;
    title: string;
    excerpt: string;
    status: string;
    viewCount: number;
    rating?: number;
    tags: string[];
    createdAt: string;
    publishedAt?: string;
    author: {
      id: string;
      displayName: string;
      username: string;
    };
    _count: {
      comments: number;
      ratings: number;
    };
  };
}

export default function CollectionPage() {
  const params = useParams();
  const collectionId = params.id as string;
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddToCollection, setShowAddToCollection] = useState(false);

  const fetchCollection = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/collections/${collectionId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Collection not found');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to view this collection');
        } else {
          throw new Error('Failed to load collection');
        }
      }

      const data = await response.json();
      setCollection(data.collection);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    if (collectionId) {
      fetchCollection();
    }
  }, [collectionId, fetchCollection]);

  const handleRemoveFromCollection = async (itemId: string) => {
    if (!confirm('Remove this work from the collection?')) return;

    try {
      const response = await fetch(`/api/collections/${collectionId}/items/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCollection(prev => prev ? {
          ...prev,
          items: prev.items.filter(item => item.id !== itemId),
          _count: { items: prev._count.items - 1 }
        } : null);
      } else {
        throw new Error('Failed to remove work from collection');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove work');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'text-green-600 bg-green-100';
      case 'BETA': return 'text-blue-600 bg-blue-100';
      case 'DRAFT': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-ink/60">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-ink mb-4">Collection Not Found</h1>
          <p className="text-red-600 mb-4">{error || 'Collection not found'}</p>
          <Link 
            href="/collections"
            className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
          >
            Back to Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Collection Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-medium text-ink">{collection.name}</h1>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  collection.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {collection.isPublic ? 'Public' : 'Private'}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <span>by <Link href={`/users/${collection.owner.username}`} className="font-medium hover:text-blue-600 transition-colors">{collection.owner.displayName}</Link></span>
                <span>•</span>
                <span>{collection._count.items} works</span>
                <span>•</span>
                <span>Created {formatDate(collection.createdAt)}</span>
              </div>

              {collection.description && (
                <p className="text-gray-700 leading-relaxed">{collection.description}</p>
              )}
            </div>

            {collection.isOwner && (
              <div className="flex items-center gap-2">
                <Link
                  href={`/collections/${collection.id}/edit`}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md transition-colors text-sm"
                >
                  Edit
                </Link>
                <button
                  onClick={() => setShowAddToCollection(true)}
                  className="px-3 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors text-sm"
                >
                  Add Works
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/collections"
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Collections
            </Link>
          </div>
        </div>

        {/* Collection Items */}
        {collection.items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">This collection is empty</h3>
            <p className="text-sm">
              {collection.isOwner 
                ? "Start adding works to build your collection."
                : "The owner hasn't added any works to this collection yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {collection.items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <Link href={`/works/${item.work.id}`}>
                        <h3 className="text-xl font-medium text-ink hover:text-blue-600 transition-colors cursor-pointer">
                          {item.work.title}
                        </h3>
                      </Link>
                      
                      <span className={`px-2 py-1 text-xs rounded font-medium ${getStatusColor(item.work.status)}`}>
                        {item.work.status.charAt(0) + item.work.status.slice(1).toLowerCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span>by <Link href={`/users/${item.work.author.username}`} className="font-medium hover:text-blue-600 transition-colors">{item.work.author.displayName}</Link></span>
                      <span>•</span>
                      <span>{item.work.viewCount} views</span>
                      <span>•</span>
                      <span>{item.work._count.comments} comments</span>
                      <span>•</span>
                      <span>{item.work._count.ratings} ratings</span>
                      {item.work.rating && (
                        <>
                          <span>•</span>
                          <span>★ {item.work.rating.toFixed(1)}</span>
                        </>
                      )}
                    </div>

                    <p className="text-gray-600 mb-3">{item.work.excerpt}</p>
                    
                    {/* Tags */}
                    {item.work.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.work.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Added to collection {formatDate(item.addedAt)}
                    </div>
                  </div>

                  {collection.isOwner && (
                    <button
                      onClick={() => handleRemoveFromCollection(item.id)}
                      className="p-2 text-red-400 hover:text-red-600 transition-colors ml-4"
                      title="Remove from collection"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add to Collection Modal would go here */}
        {showAddToCollection && collection.isOwner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-ink">Add Works to Collection</h3>
                <button
                  onClick={() => setShowAddToCollection(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="text-center py-8 text-gray-500">
                <p>Work browser coming soon! For now, you can add works by visiting individual work pages and clicking &ldquo;Add to Collection&rdquo;.</p>
                <button
                  onClick={() => setShowAddToCollection(false)}
                  className="mt-4 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}