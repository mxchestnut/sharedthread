'use client';

import React, { useState, useEffect } from 'react';
import { CommunityProposalForm, ProposalStatusCard } from '@/components/social/community-proposal-form';
import { CreateCommunityProposalData } from '@/types/social';
import { logError } from '@/lib/error-logger';


interface Proposal {
  id: string;
  proposedName: string;
  proposedSlug: string;
  status: string;
  submittedAt: Date;
  reviewedAt?: Date;
  rejectionReason?: string;
  approvedSlug?: string;
}

export default function CommunityProposalPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch existing proposals on mount
  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const response = await fetch('/api/community-proposals');
      if (response.ok) {
        const data = await response.json();
        setProposals(data.proposals || []);
      }
    } catch (error) {
      logError('Failed to fetch proposals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitProposal = async (data: CreateCommunityProposalData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/community-proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit proposal');
      }

      alert(result.message || 'Proposal submitted successfully!');
      setShowForm(false);
      // Refresh the proposals list
      await fetchProposals();
      
    } catch (error) {
      logError('Failed to submit proposal:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit proposal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-ink mb-4">
            Community Proposals
          </h1>
          <p className="text-ink/70 leading-relaxed">
            Create private communities with their own subdomains. All community proposals 
            require staff approval to ensure quality and alignment with Shared Thread values.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
          >
            {showForm ? 'Cancel' : 'Propose New Community'}
          </button>
        </div>

        {/* Proposal Form */}
        {showForm && (
          <div className="mb-8">
            <CommunityProposalForm 
              onSubmit={handleSubmitProposal}
              isLoading={isSubmitting}
            />
          </div>
        )}

        {/* Existing Proposals */}
        <div>
          <h2 className="text-xl font-medium text-ink mb-4">
            Your Proposals
          </h2>
          
          {isLoading ? (
            <div className="text-center py-12 text-ink/60">
              <p>Loading your proposals...</p>
            </div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-12 text-ink/60">
              <p>You haven&apos;t submitted any community proposals yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-accent hover:text-accent/80 underline"
              >
                Submit your first proposal
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {proposals.map((proposal) => (
                <ProposalStatusCard 
                  key={proposal.id} 
                  proposal={{
                    ...proposal,
                    submittedAt: new Date(proposal.submittedAt),
                    reviewedAt: proposal.reviewedAt ? new Date(proposal.reviewedAt) : undefined
                  }} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Information Section */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            Community Benefits
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Approved Communities Get:</h4>
              <ul className="space-y-1">
                <li>• Custom subdomain (e.g., yourname.sharedthread.co)</li>
                <li>• Private discussion spaces</li>
                <li>• Community-specific work publishing</li>
                <li>• Member management tools</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Review Criteria:</h4>
              <ul className="space-y-1">
                <li>• Clear purpose and goals</li>
                <li>• Alignment with Shared Thread values</li>
                <li>• Realistic member expectations</li>
                <li>• Constructive community focus</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}