'use client';

import React, { useState, useEffect } from 'react';
import { StaffReviewDashboard } from '@/components/social/staff-review-dashboard';
import { CommunityProposal, ReviewProposalData } from '@/types/social';
import { logError, logInfo } from '@/lib/error-logger';


// Real API functions
async function fetchProposals(): Promise<CommunityProposal[]> {
  const response = await fetch('/api/staff/community-proposals');
  
  if (!response.ok) {
    const errorText = await response.text();
    logError('API Error:', response.status, response.statusText, errorText);
    throw new Error(`Failed to fetch proposals (${response.status}): ${response.statusText}`);
  }
  
  const data = await response.json();
  // Convert date strings to Date objects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proposals = (data.proposals || []).map((p: any) => ({
    ...p,
    submittedAt: new Date(p.submittedAt),
    reviewedAt: p.reviewedAt ? new Date(p.reviewedAt) : undefined,
  }));
  return proposals;
}

async function reviewProposal(proposalId: string, review: ReviewProposalData): Promise<{ proposal: CommunityProposal; message: string }> {
  const response = await fetch('/api/staff/community-proposals', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      proposalId,
      ...review
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to review proposal');
  }

  // Success - the response includes the updated proposal
  const result = await response.json();
  logInfo('Review submitted:', result);
  
  // Convert date strings to Date objects
  if (result.proposal) {
    result.proposal = {
      ...result.proposal,
      submittedAt: new Date(result.proposal.submittedAt),
      reviewedAt: result.proposal.reviewedAt ? new Date(result.proposal.reviewedAt) : undefined,
    };
  }
  
  return result;
}

export default function StaffDashboardPage() {
  const [proposals, setProposals] = useState<CommunityProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchProposals();
      setProposals(data);
      
      // Log success for debugging
      logInfo('✅ Proposals loaded successfully:', data.length, 'proposals');
      
    } catch (err) {
      logError('❌ Failed to load proposals:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      // Provide more helpful error messages
      if (errorMessage.includes('403')) {
        setError('Access denied. Admin privileges required to view proposals.');
      } else if (errorMessage.includes('500')) {
        setError('Database connection error. The database may be initializing - please try again in a moment.');
      } else if (errorMessage.includes('404')) {
        setError('API endpoint not found. Please refresh the page.');
      } else {
        setError(`Failed to load proposals: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewProposal = async (proposalId: string, review: ReviewProposalData) => {
    try {
      const result = await reviewProposal(proposalId, review);
      
      // Update the local state with the API response
      setProposals(prev => prev.map(proposal => 
        proposal.id === proposalId 
          ? result.proposal
          : proposal
      ));

      // Show success message
      alert(result.message);

    } catch (err) {
      logError('Failed to review proposal:', err);
      alert('Failed to review proposal. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-ink/60">Loading proposals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadProposals}
            className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <StaffReviewDashboard 
        proposals={proposals}
        onReviewProposal={handleReviewProposal}
        isLoading={isLoading}
      />
      
      {/* Additional Staff Information */}
      <div className="max-w-6xl mx-auto p-6 mt-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-medium text-green-900 mb-3">
              Approval Process
            </h3>
            <div className="text-sm text-green-800 space-y-2">
              <p><strong>1. Review:</strong> Evaluate proposal quality and alignment</p>
              <p><strong>2. Decide:</strong> Approve with custom slug or reject with reason</p>
              <p><strong>3. Deploy:</strong> System creates community and subdomain</p>
              <p><strong>4. Notify:</strong> User receives confirmation and access</p>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900 mb-3">
              Evaluation Criteria
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>• Clear, constructive purpose</p>
              <p>• Realistic member expectations</p>
              <p>• Alignment with platform values</p>
              <p>• Submitter reputation and history</p>
              <p>• Unique value proposition</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}