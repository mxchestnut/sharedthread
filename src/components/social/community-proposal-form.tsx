'use client';

import React, { useState } from 'react';
import { createCommunityProposalSchema, type CreateCommunityProposalData } from '@/types/social';
import { z } from 'zod';

interface CommunityProposalFormProps {
  onSubmit: (data: CreateCommunityProposalData) => Promise<void>;
  isLoading?: boolean;
}

export function CommunityProposalForm({ onSubmit, isLoading = false }: CommunityProposalFormProps) {
  const [formData, setFormData] = useState<CreateCommunityProposalData>({
    proposedName: '',
    proposedSlug: '',
    description: '',
    purpose: '',
    expectedMembers: 1
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .slice(0, 50);
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      proposedName: name,
      proposedSlug: generateSlug(name)
    }));
  };

  const validateForm = () => {
    try {
      createCommunityProposalSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            newErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-paper border border-ink/10 rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-medium text-ink mb-2">
          Propose a Community
        </h2>
        <p className="text-ink/70 text-sm leading-relaxed">
          Communities require staff approval. Approved communities receive a subdomain 
          (e.g., yourname.sharedthread.co) and enhanced features for organizing discussions 
          and collaborative work.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Community Name */}
        <div>
          <label htmlFor="proposedName" className="block text-sm font-medium text-ink mb-2">
            Community Name
          </label>
          <input
            type="text"
            id="proposedName"
            value={formData.proposedName}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full p-3 border border-ink/20 rounded-md bg-white focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
            placeholder="e.g., Creative Writers Circle"
            maxLength={100}
          />
          {errors.proposedName && (
            <p className="mt-1 text-sm text-red-600">{errors.proposedName}</p>
          )}
        </div>

        {/* Proposed Slug */}
        <div>
          <label htmlFor="proposedSlug" className="block text-sm font-medium text-ink mb-2">
            Proposed URL Slug
          </label>
          <div className="flex items-center">
            <input
              type="text"
              id="proposedSlug"
              value={formData.proposedSlug}
              onChange={(e) => setFormData(prev => ({ ...prev, proposedSlug: e.target.value }))}
              className="flex-1 p-3 border border-ink/20 rounded-l-md bg-white focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
              placeholder="creative-writers"
              maxLength={50}
              pattern="[a-z0-9-]+"
            />
            <span className="px-3 py-3 bg-gray-50 border border-l-0 border-ink/20 rounded-r-md text-sm text-ink/60">
              .sharedthread.co
            </span>
          </div>
          <p className="mt-1 text-xs text-ink/60">
            Only lowercase letters, numbers, and hyphens allowed
          </p>
          {errors.proposedSlug && (
            <p className="mt-1 text-sm text-red-600">{errors.proposedSlug}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-ink mb-2">
            Short Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full p-3 border border-ink/20 rounded-md bg-white focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none resize-none"
            placeholder="A brief description of your community that will appear in listings..."
            maxLength={500}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-ink/60">
              {formData.description.length}/500 characters
            </span>
            {errors.description && (
              <span className="text-sm text-red-600">{errors.description}</span>
            )}
          </div>
        </div>

        {/* Purpose */}
        <div>
          <label htmlFor="purpose" className="block text-sm font-medium text-ink mb-2">
            Purpose & Goals
          </label>
          <textarea
            id="purpose"
            value={formData.purpose}
            onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
            rows={4}
            className="w-full p-3 border border-ink/20 rounded-md bg-white focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none resize-none"
            placeholder="Explain the purpose of this community, what kinds of discussions and content you envision, and what goals you hope to achieve..."
            maxLength={1000}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-ink/60">
              {formData.purpose.length}/1000 characters
            </span>
            {errors.purpose && (
              <span className="text-sm text-red-600">{errors.purpose}</span>
            )}
          </div>
        </div>

        {/* Expected Members */}
        <div>
          <label htmlFor="expectedMembers" className="block text-sm font-medium text-ink mb-2">
            Expected Initial Members
          </label>
          <input
            type="number"
            id="expectedMembers"
            value={formData.expectedMembers}
            onChange={(e) => setFormData(prev => ({ ...prev, expectedMembers: parseInt(e.target.value) || 1 }))}
            min="1"
            max="10000"
            className="w-full p-3 border border-ink/20 rounded-md bg-white focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none"
            placeholder="25"
          />
          <p className="mt-1 text-xs text-ink/60">
            Estimate how many people you expect to invite initially
          </p>
          {errors.expectedMembers && (
            <p className="mt-1 text-sm text-red-600">{errors.expectedMembers}</p>
          )}
        </div>

        {/* Terms */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">Review Process</h4>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• Staff will review your proposal within 3-5 business days</li>
            <li>• We may suggest modifications to the name or slug</li>
            <li>• Approved communities get subdomain access and enhanced features</li>
            <li>• Community creators become moderators with content management tools</li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-accent text-white rounded-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Submitting...' : 'Submit Proposal'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Quick status component for existing proposals
interface ProposalStatusCardProps {
  proposal: {
    id: string;
    proposedName: string;
    proposedSlug: string;
    status: string;
    submittedAt: Date;
    reviewedAt?: Date;
    rejectionReason?: string;
    approvedSlug?: string;
  };
}

export function ProposalStatusCard({ proposal }: ProposalStatusCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'APPROVED': return 'text-green-600 bg-green-50 border-green-200';
      case 'REJECTED': return 'text-red-600 bg-red-50 border-red-200';
      case 'EXPIRED': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="p-4 bg-white border border-ink/10 rounded-lg shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-ink">{proposal.proposedName}</h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(proposal.status)}`}>
          {proposal.status}
        </span>
      </div>
      
      <p className="text-sm text-ink/60 mb-2">
        Proposed URL: {proposal.approvedSlug || proposal.proposedSlug}.sharedthread.co
      </p>
      
      <div className="text-xs text-ink/50">
        <p>Submitted: {proposal.submittedAt.toLocaleDateString()}</p>
        {proposal.reviewedAt && (
          <p>Reviewed: {proposal.reviewedAt.toLocaleDateString()}</p>
        )}
      </div>

      {proposal.rejectionReason && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          <strong>Rejection reason:</strong> {proposal.rejectionReason}
        </div>
      )}
    </div>
  );
}