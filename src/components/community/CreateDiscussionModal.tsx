'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { logError } from '@/lib/error-logger';


interface DiscussionCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  color: string;
  icon: string;
}

interface CreateDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content: string; categoryId: string }) => Promise<void>;
  categories: DiscussionCategory[];
  isSubmitting?: boolean;
}

export function CreateDiscussionModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  isSubmitting = false
}: CreateDiscussionModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: { [key: string]: string } = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    if (!categoryId) {
      newErrors.categoryId = 'Category is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      await onSubmit({ title: title.trim(), content: content.trim(), categoryId });
      
      // Reset form on success
      setTitle('');
      setContent('');
      setCategoryId('');
      setErrors({});
      onClose();
    } catch (error) {
      logError('Failed to create discussion:', error);
      setErrors({ submit: 'Failed to create discussion. Please try again.' });
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setCategoryId('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-ink">Start New Discussion</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Title */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-ink mb-2">
              Discussion Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-border rounded-md focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
              placeholder="What would you like to discuss?"
              disabled={isSubmitting}
              maxLength={200}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Category */}
          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-ink mb-2">
              Category
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-3 border border-border rounded-md focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
              disabled={isSubmitting}
            >
              <option value="">Select a category...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                  {category.description && ` - ${category.description}`}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
            )}
          </div>

          {/* Content */}
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-ink mb-2">
              Discussion Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full p-3 border border-border rounded-md focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none resize-none"
              placeholder="Share your thoughts, ask questions, or start a conversation..."
              disabled={isSubmitting}
              maxLength={5000}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.content && (
                <p className="text-sm text-red-600">{errors.content}</p>
              )}
              <div className="text-xs text-support ml-auto">
                {content.length}/5000 characters
              </div>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-border text-support rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim() || !categoryId}
              className="px-6 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Discussion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}