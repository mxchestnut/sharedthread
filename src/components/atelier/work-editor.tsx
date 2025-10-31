'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { WritingAssistantPanel } from './WritingAssistantPanel';
import { logError } from '@/lib/error-logger';


interface ContentNode {
  type: string;
  text?: string;
}

interface ContentParagraph {
  type: string;
  content?: ContentNode[];
}

interface WorkContent {
  type: string;
  content: ContentParagraph[];
}

interface Work {
  id?: string;
  title: string;
  content: WorkContent;
  excerpt?: string;
  status: 'DRAFT' | 'BETA' | 'PUBLISHED' | 'ARCHIVED';
  visibility: 'PRIVATE' | 'FOLLOWERS' | 'COMMUNITY' | 'PUBLIC';
  acceptingFeedback: boolean;
  betaEndDate?: string;
  tags: string[];
  publishedToCommunities: string[];
  publishedToPublic: boolean;
  publishedToFollowers: boolean;
}

interface WorkEditorProps {
  work?: Work;
  onSave?: (work: Work) => void;
  isLoading?: boolean;
  projectId?: string | null;
  promptId?: string | null;
  templateId?: string | null;
}

const defaultWork: Work = {
  title: '',
  content: { type: 'doc', content: [] },
  status: 'DRAFT',
  visibility: 'PRIVATE',
  acceptingFeedback: false,
  tags: [],
  publishedToCommunities: [],
  publishedToPublic: false,
  publishedToFollowers: false
};

export function WorkEditor({ work, onSave, isLoading = false, projectId, promptId, templateId }: WorkEditorProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Work>(work || defaultWork);
  const [contentText, setContentText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showAssistant, setShowAssistant] = useState(false);

  useEffect(() => {
    if (work) {
      setFormData(work);
      // Extract text from content JSON for simple editing
      setContentText(extractTextFromContent(work.content));
    }
  }, [work]);

  const extractTextFromContent = (content: WorkContent | string): string => {
    if (typeof content === 'string') return content;
    if (!content || !content.content) return '';
    
    // Simple extraction for demo - in real app would use proper rich text parsing
    return content.content.map((node: ContentParagraph) => {
      if (node.type === 'paragraph' && node.content) {
        return node.content.map((text: ContentNode) => text.text || '').join('');
      }
      return '';
    }).join('\\n\\n');
  };

  const convertTextToContent = (text: string) => {
    // Simple conversion for demo - in real app would use proper rich text structure
    const paragraphs = text.split('\\n\\n').filter(p => p.trim());
    return {
      type: 'doc',
      content: paragraphs.map(p => ({
        type: 'paragraph',
        content: [{ type: 'text', text: p }]
      }))
    };
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        content: convertTextToContent(contentText),
        excerpt: contentText.slice(0, 200) + (contentText.length > 200 ? '...' : '')
      };

      const url = formData.id ? '/api/works' : '/api/works';
      const method = formData.id ? 'PATCH' : 'POST';
      
      const body = formData.id 
        ? { workId: formData.id, ...payload }
        : payload;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save work');
      }

      const result = await response.json();
      
      if (onSave) {
        onSave(result.work);
      } else if (!formData.id) {
        // Redirect to the editor for the new work
        router.push(`/atelier/edit/${result.work.id}`);
      }

      setHasUnsavedChanges(false);
      alert(result.message || 'Work saved successfully!');

    } catch (error) {
      logError('Error saving work:', error);
      alert(error instanceof Error ? error.message : 'Failed to save work');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = <K extends keyof Work>(field: K, value: Work[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleFieldChange('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleFieldChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'BETA': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PUBLISHED': return 'bg-green-100 text-green-800 border-green-200';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Project Context */}
        {projectId && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <span className="font-medium">Project Context:</span>
              {templateId && (
                <span className="ml-2 px-2 py-1 bg-blue-100 rounded-full text-xs">
                  {templateId === 'business-plan' ? 'Business Plan' : 'Creative Writing'}
                </span>
              )}
            </div>
            {promptId && (
              <div className="text-xs text-blue-600 mt-1">
                Working on: {promptId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            )}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-medium text-ink">
              {formData.id ? 'Edit Work' : 'Create New Work'}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(formData.status)}`}>
                {formData.status}
              </span>
              {hasUnsavedChanges && (
                <span className="text-sm text-amber-600">● Unsaved changes</span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            {/* AI Assistant Toggle */}
            {(formData.status === 'DRAFT' || formData.status === 'BETA') && contentText.length > 100 && (
              <button
                onClick={() => setShowAssistant(!showAssistant)}
                className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                  showAssistant
                    ? 'bg-accent text-white'
                    : 'bg-accent/10 text-accent hover:bg-accent/20'
                }`}
              >
                <Sparkles size={16} />
                AI Assistant
              </button>
            )}
            
            <button
              onClick={() => router.push('/atelier')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              {projectId ? 'Back to Project' : 'Back to Atelier'}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="px-6 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : (formData.id ? 'Update' : 'Create')}
            </button>
          </div>
        </div>

        {/* Main Editor */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <input
                type="text"
                placeholder="Enter your work title..."
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="w-full text-3xl font-medium placeholder-ink/40 bg-transparent border-none outline-none resize-none"
                style={{ lineHeight: '1.2' }}
              />
            </div>

            {/* Content Editor */}
            <div className="border border-gray-200 rounded-lg p-4 min-h-96">
              <textarea
                placeholder="Start writing your work here...\\n\\nThis is a simple text editor. In the full version, this would be a rich text editor with formatting options, collaborative editing, and more."
                value={contentText}
                onChange={(e) => {
                  setContentText(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                className="w-full min-h-80 bg-transparent border-none outline-none resize-none text-ink placeholder-ink/50"
                style={{ lineHeight: '1.6' }}
              />
            </div>

            {/* Content Stats */}
            <div className="flex gap-4 text-sm text-ink/60">
              <span>{contentText.length} characters</span>
              <span>{contentText.split(/\\s+/).filter(w => w.length > 0).length} words</span>
              <span>{contentText.split('\\n\\n').filter(p => p.trim().length > 0).length} paragraphs</span>
            </div>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            {/* Status & Publishing */}
            <div className="card">
              <h3 className="font-medium mb-3">Publishing</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleFieldChange('status', e.target.value as Work['status'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="DRAFT">Draft - Private editing</option>
                    <option value="BETA">Beta - Community feedback</option>
                    <option value="PUBLISHED">Published - Public access</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Visibility</label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => handleFieldChange('visibility', e.target.value as Work['visibility'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="PRIVATE">Private - Only you</option>
                    <option value="FOLLOWERS">Followers - Your followers</option>
                    <option value="COMMUNITY">Community - Community members</option>
                    <option value="PUBLIC">Public - Everyone</option>
                  </select>
                </div>

                {formData.status === 'BETA' && (
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.acceptingFeedback}
                        onChange={(e) => handleFieldChange('acceptingFeedback', e.target.checked)}
                        className="rounded border-gray-300 text-accent focus:ring-accent"
                      />
                      <span className="text-sm">Accept feedback & annotations</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="card">
              <h3 className="font-medium mb-3">Tags</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                  <button
                    onClick={addTag}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                  >
                    Add
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="font-medium mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-accent hover:bg-accent/10 rounded-md transition-colors">
                  📖 Preview Work
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-accent hover:bg-accent/10 rounded-md transition-colors">
                  📊 View Analytics
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-accent hover:bg-accent/10 rounded-md transition-colors">
                  🔗 Share Link
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-accent hover:bg-accent/10 rounded-md transition-colors">
                  💾 Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Writing Assistant Panel */}
      {showAssistant && (
        <WritingAssistantPanel
          content={contentText}
          title={formData.title}
          isOpen={showAssistant}
          onClose={() => setShowAssistant(false)}
        />
      )}
    </div>
  );
}