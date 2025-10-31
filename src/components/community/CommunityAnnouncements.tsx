'use client';

import { useState } from 'react';
import { Megaphone, Plus, X, Calendar } from 'lucide-react';
import { logError } from '@/lib/error-logger';


interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  isImportant: boolean;
}

interface CommunityAnnouncementsProps {
  announcements: Announcement[];
  canManage: boolean;
  onCreateAnnouncement?: (announcement: { title: string; content: string; isImportant: boolean }) => Promise<void>;
  onDeleteAnnouncement?: (id: string) => Promise<void>;
}

export function CommunityAnnouncements({ 
  announcements, 
  canManage, 
  onCreateAnnouncement, 
  onDeleteAnnouncement 
}: CommunityAnnouncementsProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isImportant: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCreateAnnouncement) return;

    setIsSubmitting(true);
    try {
      await onCreateAnnouncement(formData);
      setFormData({ title: '', content: '', isImportant: false });
      setShowCreateForm(false);
    } catch (error) {
      logError('Failed to create announcement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!onDeleteAnnouncement) return;
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await onDeleteAnnouncement(id);
    } catch (error) {
      logError('Failed to delete announcement:', error);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Megaphone size={20} className="text-accent" />
          <h3 className="text-lg font-medium text-ink">Community Announcements</h3>
        </div>
        {canManage && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
          >
            <Plus size={14} />
            New Announcement
          </button>
        )}
      </div>

      {/* Create Form */}
      {showCreateForm && canManage && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Announcement title..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Write your announcement..."
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isImportant"
                checked={formData.isImportant}
                onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                className="rounded border-gray-300 text-accent focus:ring-accent"
              />
              <label htmlFor="isImportant" className="text-sm text-support">
                Mark as important (will be highlighted)
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Announcement'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Announcements List */}
      {announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className={`p-4 rounded-lg border-l-4 ${
                announcement.isImportant
                  ? 'border-l-red-500 bg-red-50'
                  : 'border-l-accent bg-accent/5'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-ink">{announcement.title}</h4>
                    {announcement.isImportant && (
                      <span className="text-xs px-2 py-0.5 bg-red-500 text-white rounded-full">
                        Important
                      </span>
                    )}
                  </div>
                  
                  <p className="text-support text-sm leading-relaxed mb-3">
                    {announcement.content}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-support">
                    <span>By {announcement.authorName}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {canManage && (
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-support">
          <Megaphone size={48} className="mx-auto mb-4 text-accent/50" />
          <p className="text-lg mb-2">No announcements yet</p>
          <p>
            {canManage 
              ? 'Create your first announcement to keep the community informed!'
              : 'Community announcements will appear here.'
            }
          </p>
        </div>
      )}
    </div>
  );
}