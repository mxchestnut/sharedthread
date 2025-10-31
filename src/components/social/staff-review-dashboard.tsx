'use client';

import React, { useState } from 'react';
import { ProposalStatus, type CommunityProposal, type ReviewProposalData } from '@/types/social';
import { logError } from '@/lib/error-logger';


interface StaffReviewDashboardProps {
  proposals: CommunityProposal[];
  onReviewProposal: (proposalId: string, review: ReviewProposalData) => Promise<void>;
  isLoading?: boolean;
}

export function StaffReviewDashboard({ 
  proposals, 
  onReviewProposal, 
  isLoading = false 
}: StaffReviewDashboardProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'reviewed'>('pending');
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const pendingProposals = proposals.filter(p => p.status === ProposalStatus.PENDING);
  const reviewedProposals = proposals.filter(p => p.status !== ProposalStatus.PENDING);

  const currentProposals = activeTab === 'pending' ? pendingProposals : reviewedProposals;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-medium text-ink mb-2">
          Community Proposal Review
        </h1>
        <p className="text-ink/70">
          Review and approve community proposals for subdomain allocation
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 border-b border-ink/10">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-accent text-accent'
              : 'border-transparent text-ink/60 hover:text-ink'
          }`}
        >
          Pending Review ({pendingProposals.length})
        </button>
        <button
          onClick={() => setActiveTab('reviewed')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'reviewed'
              ? 'border-accent text-accent'
              : 'border-transparent text-ink/60 hover:text-ink'
          }`}
        >
          Reviewed ({reviewedProposals.length})
        </button>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {currentProposals.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-ink/40 mb-4">
              {activeTab === 'pending' ? (
                <>
                  <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium text-ink/60 mb-2">All caught up!</p>
                  <p className="text-ink/50">No community proposals waiting for review.</p>
                </>
              ) : (
                <>
                  <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <p className="text-lg font-medium text-ink/60 mb-2">No reviews yet</p>
                  <p className="text-ink/50">Reviewed proposals will appear here.</p>
                </>
              )}
            </div>
          </div>
        ) : (
          currentProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              onReview={onReviewProposal}
              isReviewing={reviewingId === proposal.id}
              setReviewing={setReviewingId}
              showReviewActions={activeTab === 'pending'}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface ProposalCardProps {
  proposal: CommunityProposal;
  onReview: (proposalId: string, review: ReviewProposalData) => Promise<void>;
  isReviewing: boolean;
  setReviewing: (id: string | null) => void;
  showReviewActions: boolean;
}

function ProposalCard({ 
  proposal, 
  onReview, 
  isReviewing, 
  setReviewing, 
  showReviewActions 
}: ProposalCardProps) {
  const [reviewData, setReviewData] = useState<ReviewProposalData>({
    status: ProposalStatus.APPROVED,
    approvedSlug: proposal.proposedSlug,
    rejectionReason: ''
  });

  const handleReview = async (status: ProposalStatus) => {
    const finalReviewData = {
      ...reviewData,
      status,
      ...(status === ProposalStatus.REJECTED && { approvedSlug: undefined }),
      ...(status === ProposalStatus.APPROVED && { rejectionReason: undefined })
    };

    try {
      await onReview(proposal.id, finalReviewData);
      setReviewing(null);
    } catch (error) {
      logError('Failed to review proposal:', error);
    }
  };

  const getStatusColor = (status: ProposalStatus) => {
    switch (status) {
      case ProposalStatus.PENDING:
        return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case ProposalStatus.APPROVED:
        return 'text-green-700 bg-green-100 border-green-300';
      case ProposalStatus.REJECTED:
        return 'text-red-700 bg-red-100 border-red-300';
      case ProposalStatus.EXPIRED:
        return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="p-6 bg-white border border-ink/10 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-medium text-ink mb-1">
            {proposal.proposedName}
          </h3>
          <p className="text-sm text-ink/60">
            Proposed by <span className="font-medium">{proposal.submitter.displayName || proposal.submitter.username}</span>
            {' • '}
            <span className="text-xs">
              {proposal.submittedAt.toLocaleDateString()} at {proposal.submittedAt.toLocaleTimeString()}
            </span>
          </p>
        </div>
        <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(proposal.status)}`}>
          {proposal.status}
        </span>
      </div>

      {/* Submitter Info */}
      <div className="grid md:grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-md">
        <div>
          <span className="text-xs font-medium text-ink/60 uppercase tracking-wider">Submitter Details</span>
          <div className="mt-1 text-sm">
            <p><strong>Email:</strong> {proposal.submitter.email}</p>
            <p><strong>Reputation:</strong> {proposal.submitter.reputation}</p>
          </div>
        </div>
        <div>
          <span className="text-xs font-medium text-ink/60 uppercase tracking-wider">Community Details</span>
          <div className="mt-1 text-sm">
            <p><strong>Expected Members:</strong> {proposal.expectedMembers}</p>
            <p><strong>Proposed URL:</strong> {proposal.proposedSlug}.sharedthread.co</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-ink mb-2">Description</h4>
        <p className="text-sm text-ink/80 leading-relaxed bg-gray-50 p-3 rounded-md">
          {proposal.description}
        </p>
      </div>

      {/* Purpose */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-ink mb-2">Purpose & Goals</h4>
        <p className="text-sm text-ink/80 leading-relaxed bg-gray-50 p-3 rounded-md whitespace-pre-line">
          {proposal.purpose}
        </p>
      </div>

      {/* Review Section */}
      {showReviewActions && (
        <div className="border-t border-ink/10 pt-4">
          {!isReviewing ? (
            <button
              onClick={() => setReviewing(proposal.id)}
              className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
            >
              Review This Proposal
            </button>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Approved Slug */}
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    Approved Subdomain (if approving)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={reviewData.approvedSlug || ''}
                      onChange={(e) => setReviewData(prev => ({ ...prev, approvedSlug: e.target.value }))}
                      className="flex-1 p-2 border border-ink/20 rounded-l-md bg-white focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none text-sm"
                      placeholder="community-name"
                      pattern="[a-z0-9-]+"
                    />
                    <span className="px-3 py-2 bg-gray-50 border border-l-0 border-ink/20 rounded-r-md text-sm text-ink/60">
                      .sharedthread.co
                    </span>
                  </div>
                </div>

                {/* Rejection Reason */}
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    Rejection Reason (if rejecting)
                  </label>
                  <textarea
                    value={reviewData.rejectionReason || ''}
                    onChange={(e) => setReviewData(prev => ({ ...prev, rejectionReason: e.target.value }))}
                    className="w-full p-2 border border-ink/20 rounded-md bg-white focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none text-sm resize-none"
                    rows={3}
                    placeholder="Reason for rejection..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleReview(ProposalStatus.APPROVED)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReview(ProposalStatus.REJECTED)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => setReviewing(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review History */}
      {proposal.reviewedAt && proposal.reviewer && (
        <div className="border-t border-ink/10 pt-4 mt-4">
          <div className="text-sm text-ink/60">
            <p>
              <strong>Reviewed by:</strong> {proposal.reviewer.displayName || proposal.reviewer.username}
              {' • '}
              {proposal.reviewedAt.toLocaleDateString()} at {proposal.reviewedAt.toLocaleTimeString()}
            </p>
            {proposal.rejectionReason && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700">
                <strong>Rejection reason:</strong> {proposal.rejectionReason}
              </div>
            )}
            {proposal.status === ProposalStatus.APPROVED && proposal.approvedSlug && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-green-700">
                <strong>Approved subdomain:</strong> {proposal.approvedSlug}.sharedthread.co
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}