'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { logError } from '@/lib/error-logger';

interface Collection {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    items: number;
  };
  items: CollectionItem[];
}

interface CollectionItem {
  id: string;
  work: {
    id: string;
    title: string;
    excerpt: string;
    author: {
      displayName: string;
      username: string;
    };
  };
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollection, setNewCollection] = useState({
    name: '',
    description: '',
    isPublic: false,
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/collections');
      
      if (response.ok) {
        const data = await response.json();
        setCollections(data.collections || []);
      }
    } catch (error) {
      logError('Error fetching collections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollection.name.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCollection),
      });

      if (response.ok) {
        const result = await response.json();
        setCollections(prev => [result.collection, ...prev]);
        setNewCollection({ name: '', description: '', isPublic: false });
        setShowCreateForm(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create collection');
      }
    } catch (error) {
      logError('Error creating collection:', error);
      alert('Failed to create collection');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (!confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCollections(prev => prev.filter(c => c.id !== collectionId));
      } else {
        throw new Error('Failed to delete collection');
      }
    } catch {
      alert('Failed to delete collection');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-ink/60">Loading your collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-medium text-ink mb-2">My Collections</h1>
            <p className="text-gray-600">
              Organize and curate your favorite works into personalized collections.
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            New Collection
          </button>
        </div>

        {/* Create Collection Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-medium text-ink mb-4">Create New Collection</h3>
            <form onSubmit={handleCreateCollection}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Collection Name *
                  </label>
                  <input
                    type="text"
                    value={newCollection.name}
                    onChange={(e) => setNewCollection(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Must-Read Essays, Science Fiction Favorites"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={newCollection.description}
                    onChange={(e) => setNewCollection(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What makes this collection special?"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newCollection.isPublic}
                    onChange={(e) => setNewCollection(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <label htmlFor="isPublic" className="text-sm text-gray-700">
                    Make this collection public (others can discover and view it)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewCollection({ name: '', description: '', isPublic: false });
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newCollection.name.trim()}
                  className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Create Collection'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Collections Grid */}
        {collections.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No collections yet</h3>
            <p className="text-sm mb-4">Start organizing your favorite works by creating your first collection.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
            >
              Create Your First Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <div key={collection.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link href={`/collections/${collection.id}`}>
                      <h3 className="text-lg font-medium text-ink hover:text-blue-600 transition-colors cursor-pointer mb-1">
                        {collection.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{collection._count.items} works</span>
                      <span>•</span>
                      <span className={collection.isPublic ? 'text-green-600' : 'text-gray-500'}>
                        {collection.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/collections/${collection.id}/edit`}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDeleteCollection(collection.id)}
                      className="p-2 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {collection.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {collection.description}
                  </p>
                )}

                {/* Preview of collection items */}
                {collection.items.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Recent Works</h4>
                    <div className="space-y-2">
                      {collection.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="text-sm">
                          <Link 
                            href={`/works/${item.work.id}`}
                            className="text-ink hover:text-blue-600 transition-colors font-medium line-clamp-1"
                          >
                            {item.work.title}
                          </Link>
                          <p className="text-gray-500 text-xs">by {item.work.author.displayName}</p>
                        </div>
                      ))}
                      {collection.items.length > 3 && (
                        <p className="text-xs text-gray-500">+{collection.items.length - 3} more works</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
                  Created {formatDate(collection.createdAt)}
                  {collection.updatedAt !== collection.createdAt && (
                    <span> • Updated {formatDate(collection.updatedAt)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}