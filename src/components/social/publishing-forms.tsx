'use client';

import React, { useState } from 'react';
import { Visibility, WorkStatus, PublishingOptions } from '@/types/social';

interface PublishingFormProps {
  initialValues?: Partial<PublishingOptions>;
  onSubmit: (options: PublishingOptions) => void;
  userPermissions: {
    canPublishToPublic: boolean;
    canPublishToFollowers: boolean;
    canCreateCommunities: boolean;
    canInviteToExistingCommunities: string[];
    dailyPublishLimit: number;
    remainingPublishes: number;
  };
  userCommunities: Array<{
    id: string;
    name: string;
    slug: string;
    role: string;
  }>;
}

export function PublishingForm({ 
  initialValues, 
  onSubmit, 
  userPermissions, 
  userCommunities 
}: PublishingFormProps) {
  const [publishingOptions, setPublishingOptions] = useState<PublishingOptions>({
    visibility: initialValues?.visibility || Visibility.PRIVATE,
    publishToPublic: initialValues?.publishToPublic || false,
    publishToFollowers: initialValues?.publishToFollowers || false,
    publishToCommunities: initialValues?.publishToCommunities || [],
    acceptingFeedback: initialValues?.acceptingFeedback || false,
    betaEndDate: initialValues?.betaEndDate,
    tags: initialValues?.tags || []
  });

  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(publishingOptions);
  };

  const addTag = () => {
    if (newTag.trim() && !publishingOptions.tags.includes(newTag.trim())) {
      setPublishingOptions(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setPublishingOptions(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const toggleCommunity = (communityId: string) => {
    setPublishingOptions(prev => ({
      ...prev,
      publishToCommunities: prev.publishToCommunities.includes(communityId)
        ? prev.publishToCommunities.filter(id => id !== communityId)
        : [...prev.publishToCommunities, communityId]
    }));
  };

  const getVisibilityDescription = () => {
    const descriptions = {
      [Visibility.PRIVATE]: 'Only you can see this work',
      [Visibility.FOLLOWERS]: 'Only your followers can see this work',
      [Visibility.COMMUNITY]: 'Only members of selected communities can see this work',
      [Visibility.PUBLIC]: 'Everyone can see this work'
    };
    return descriptions[publishingOptions.visibility];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-[var(--color-pewter)]">
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-ink)] mb-4">
          Publishing Options
        </h3>
        
        {/* Publishing Limits Info */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            Daily publishing limit: {userPermissions.remainingPublishes} of {userPermissions.dailyPublishLimit} remaining
          </p>
        </div>
      </div>

      {/* Audience Selection */}
      <div className="space-y-4">
        <h4 className="font-medium text-[var(--color-ink)]">Who can see this work?</h4>
        
        {/* Public Publishing */}
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={publishingOptions.publishToPublic}
            onChange={(e) => setPublishingOptions(prev => ({
              ...prev,
              publishToPublic: e.target.checked,
              visibility: e.target.checked ? Visibility.PUBLIC : prev.visibility
            }))}
            disabled={!userPermissions.canPublishToPublic}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="font-medium">Public Library</div>
            <div className="text-sm text-[var(--color-charcoal)]">
              Share with the entire Shared Thread community
            </div>
            {!userPermissions.canPublishToPublic && (
              <div className="text-sm text-red-600 mt-1">
                Requires higher reputation level
              </div>
            )}
          </div>
        </label>

        {/* Followers Publishing */}
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={publishingOptions.publishToFollowers}
            onChange={(e) => setPublishingOptions(prev => ({
              ...prev,
              publishToFollowers: e.target.checked,
              visibility: e.target.checked && !prev.publishToPublic ? Visibility.FOLLOWERS : prev.visibility
            }))}
            disabled={!userPermissions.canPublishToFollowers}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="font-medium">Your Followers</div>
            <div className="text-sm text-[var(--color-charcoal)]">
              Share only with users who follow you
            </div>
          </div>
        </label>

        {/* Community Publishing */}
        {userCommunities.length > 0 && (
          <div>
            <div className="font-medium mb-2">Communities</div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {userCommunities.map(community => (
                <label key={community.id} className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={publishingOptions.publishToCommunities.includes(community.id)}
                    onChange={() => toggleCommunity(community.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{community.name}</div>
                    <div className="text-sm text-[var(--color-charcoal)]">
                      Role: {community.role}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Visibility Summary */}
        <div className="p-3 bg-gray-50 rounded border">
          <div className="text-sm text-[var(--color-charcoal)]">
            <strong>Visibility:</strong> {getVisibilityDescription()}
          </div>
        </div>
      </div>

      {/* Beta/Feedback Options */}
      <div className="space-y-4">
        <h4 className="font-medium text-[var(--color-ink)]">Feedback & Beta Testing</h4>
        
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={publishingOptions.acceptingFeedback}
            onChange={(e) => setPublishingOptions(prev => ({
              ...prev,
              acceptingFeedback: e.target.checked
            }))}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="font-medium">Accept Feedback</div>
            <div className="text-sm text-[var(--color-charcoal)]">
              Allow readers to leave paragraph-level comments and suggestions
            </div>
          </div>
        </label>

        {publishingOptions.acceptingFeedback && (
          <div>
            <label className="block text-sm font-medium text-[var(--color-ink)] mb-2">
              Beta End Date (Optional)
            </label>
            <input
              type="datetime-local"
              value={publishingOptions.betaEndDate ? publishingOptions.betaEndDate.toISOString().slice(0, 16) : ''}
              onChange={(e) => setPublishingOptions(prev => ({
                ...prev,
                betaEndDate: e.target.value ? new Date(e.target.value) : undefined
              }))}
              className="border border-[var(--color-pewter)] rounded px-3 py-2 text-sm"
            />
            <div className="text-xs text-[var(--color-charcoal)] mt-1">
              Automatically stop accepting feedback after this date
            </div>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-4">
        <h4 className="font-medium text-[var(--color-ink)]">Tags</h4>
        
        <div className="flex space-x-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Add a tag..."
            className="flex-1 border border-[var(--color-pewter)] rounded px-3 py-2 text-sm"
            maxLength={30}
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 border border-[var(--color-pewter)] rounded text-sm hover:bg-gray-50"
          >
            Add
          </button>
        </div>

        {publishingOptions.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {publishingOptions.tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-[var(--color-pewter)]">
        <button
          type="submit"
          disabled={userPermissions.remainingPublishes <= 0}
          className="w-full bg-[var(--color-ink)] text-white px-6 py-3 rounded hover:bg-[var(--color-charcoal)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {userPermissions.remainingPublishes <= 0 ? 'Daily Limit Reached' : 'Publish Work'}
        </button>
      </div>
    </form>
  );
}

// Newsletter signup component for the header
export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // TODO: Integrate with Buttondown API
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setStatus('success');
        setEmail('');
        setTimeout(() => {
          setStatus('idle');
          setIsExpanded(false);
        }, 3000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="text-sm text-[var(--color-charcoal)] hover:text-[var(--color-ink)] transition-colors"
      >
        Stay Updated
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        disabled={status === 'loading'}
        className="text-sm px-3 py-1 border border-[var(--color-pewter)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--color-ink)] disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={status === 'loading' || !email}
        className="text-sm px-3 py-1 bg-[var(--color-ink)] text-white rounded hover:bg-[var(--color-charcoal)] disabled:opacity-50 transition-colors"
      >
        {status === 'loading' ? '...' : status === 'success' ? '✓' : 'Join'}
      </button>
      <button
        type="button"
        onClick={() => setIsExpanded(false)}
        className="text-sm text-[var(--color-charcoal)] hover:text-[var(--color-ink)]"
      >
        ×
      </button>
      
      {status === 'success' && (
        <span className="text-sm text-green-600">Thanks!</span>
      )}
      {status === 'error' && (
        <span className="text-sm text-red-600">Error</span>
      )}
    </form>
  );
}

// Community creation form
export function CreateCommunityForm({ 
  onSubmit, 
  onCancel 
}: { 
  onSubmit: (data: { name: string; description?: string; isPrivate: boolean }) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      description: formData.description || undefined,
      isPrivate: formData.isPrivate
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border border-[var(--color-pewter)]">
      <h3 className="text-lg font-semibold text-[var(--color-ink)]">Create Community</h3>
      
      <div>
        <label className="block text-sm font-medium text-[var(--color-ink)] mb-2">
          Community Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
          maxLength={100}
          className="w-full border border-[var(--color-pewter)] rounded px-3 py-2"
          placeholder="Enter community name..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-ink)] mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          maxLength={500}
          rows={3}
          className="w-full border border-[var(--color-pewter)] rounded px-3 py-2"
          placeholder="Describe your community..."
        />
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.isPrivate}
            onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
          />
          <span className="text-sm">Private community (invite-only)</span>
        </label>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          disabled={!formData.name.trim()}
          className="flex-1 bg-[var(--color-ink)] text-white px-4 py-2 rounded hover:bg-[var(--color-charcoal)] disabled:opacity-50"
        >
          Create Community
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-[var(--color-pewter)] px-4 py-2 rounded hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}