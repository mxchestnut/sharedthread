'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { logError } from '@/lib/error-logger';


type AppealStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface Appeal {
  id: string;
  targetType: 'POST' | 'REPLY';
  reason: string;
  message?: string;
  status: AppealStatus;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  post?: {
    id: string;
    title: string;
    content: string;
    hasPlagiarismFlag: boolean;
    hasAIFlag: boolean;
    aiScore?: number;
    plagiarismScore?: number;
    citations?: unknown;
  };
  reply?: {
    id: string;
    content: string;
    hasPlagiarismFlag: boolean;
    hasAIFlag: boolean;
    aiScore?: number;
    plagiarismScore?: number;
    citations?: unknown;
  };
}

export default function ModerationAppealsPage() {
  const router = useRouter();
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AppealStatus | 'ALL'>('ALL');
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [resolving, setResolving] = useState(false);

  const loadAppeals = useCallback(async () => {
    try {
      const url = filter === 'ALL' 
        ? '/api/staff/moderation/appeals'
        : `/api/staff/moderation/appeals?status=${filter}`;
      
      const res = await fetch(url);
      if (res.status === 403) {
        router.push('/');
        return;
      }
      const data = await res.json();
      setAppeals(data.appeals || []);
    } catch (error) {
      logError('Error loading appeals:', error);
    } finally {
      setLoading(false);
    }
  }, [filter, router]);

  useEffect(() => {
    loadAppeals();
  }, [loadAppeals]);

  async function resolveAppeal(appealId: string, decision: 'APPROVED' | 'REJECTED', staffNotes: string) {
    setResolving(true);
    try {
      const res = await fetch(`/api/staff/moderation/appeals/${appealId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, staffNotes }),
      });

      if (res.ok) {
        setSelectedAppeal(null);
        loadAppeals();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      logError('Error resolving appeal:', error);
      alert('Failed to resolve appeal');
    } finally {
      setResolving(false);
    }
  }

  const filteredAppeals = appeals;

  return (
    <div className="min-h-screen bg-[#f8f6f1] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#2a2a2a] mb-6">Moderation Appeals</h1>

        {/* Filter buttons */}
        <div className="flex gap-2 mb-6">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded transition-colors ${
                filter === status
                  ? 'bg-[#6366f1] text-white'
                  : 'bg-white text-[#2a2a2a] hover:bg-gray-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">Loading appeals...</div>
        ) : filteredAppeals.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-500">
            No appeals found
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAppeals.map((appeal) => (
              <div
                key={appeal.id}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedAppeal(appeal)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                      appeal.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      appeal.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {appeal.status}
                    </span>
                    <span className="ml-3 text-sm text-gray-500">
                      {appeal.targetType} appeal
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(appeal.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mb-3">
                  <strong className="text-[#2a2a2a]">Reason:</strong>
                  <p className="text-gray-700 mt-1">{appeal.reason}</p>
                  {appeal.message && (
                    <p className="text-gray-600 mt-2 italic">&quot;{appeal.message}&quot;</p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>By: {appeal.user.displayName} (@{appeal.user.username})</span>
                </div>

                {/* Flag indicators */}
                <div className="mt-3 flex gap-2">
                  {(appeal.post?.hasPlagiarismFlag || appeal.reply?.hasPlagiarismFlag) && (
                    <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded">
                      Plagiarism: {((appeal.post?.plagiarismScore || appeal.reply?.plagiarismScore || 0) * 100).toFixed(0)}%
                    </span>
                  )}
                  {(appeal.post?.hasAIFlag || appeal.reply?.hasAIFlag) && (
                    <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded">
                      AI: {((appeal.post?.aiScore || appeal.reply?.aiScore || 0) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appeal detail modal */}
      {selectedAppeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedAppeal(null)}>
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#2a2a2a]">Appeal Details</h2>
              <button
                onClick={() => setSelectedAppeal(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                selectedAppeal.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                selectedAppeal.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {selectedAppeal.status}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <strong className="text-[#2a2a2a]">User:</strong>
                <p className="text-gray-700">{selectedAppeal.user.displayName} (@{selectedAppeal.user.username})</p>
              </div>

              <div>
                <strong className="text-[#2a2a2a]">Reason:</strong>
                <p className="text-gray-700">{selectedAppeal.reason}</p>
              </div>

              {selectedAppeal.message && (
                <div>
                  <strong className="text-[#2a2a2a]">Message:</strong>
                  <p className="text-gray-700 italic">&quot;{selectedAppeal.message}&quot;</p>
                </div>
              )}

              <div>
                <strong className="text-[#2a2a2a]">Content ({selectedAppeal.targetType}):</strong>
                {selectedAppeal.post && (
                  <div className="mt-2 p-4 bg-gray-50 rounded">
                    <h3 className="font-semibold text-lg mb-2">{selectedAppeal.post.title}</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedAppeal.post.content}</p>
                  </div>
                )}
                {selectedAppeal.reply && (
                  <div className="mt-2 p-4 bg-gray-50 rounded">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedAppeal.reply.content}</p>
                  </div>
                )}
              </div>

              <div>
                <strong className="text-[#2a2a2a]">Flags:</strong>
                <div className="mt-2 flex gap-2">
                  {(selectedAppeal.post?.hasPlagiarismFlag || selectedAppeal.reply?.hasPlagiarismFlag) && (
                    <span className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded">
                      Plagiarism: {((selectedAppeal.post?.plagiarismScore || selectedAppeal.reply?.plagiarismScore || 0) * 100).toFixed(1)}%
                    </span>
                  )}
                  {(selectedAppeal.post?.hasAIFlag || selectedAppeal.reply?.hasAIFlag) && (
                    <span className="px-3 py-1 bg-orange-50 text-orange-700 text-sm rounded">
                      AI-generated: {((selectedAppeal.post?.aiScore || selectedAppeal.reply?.aiScore || 0) * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              {((selectedAppeal.post?.citations !== null && selectedAppeal.post?.citations !== undefined) || 
                (selectedAppeal.reply?.citations !== null && selectedAppeal.reply?.citations !== undefined)) && (
                <div>
                  <strong className="text-[#2a2a2a]">Citations:</strong>
                  <pre className="mt-2 p-3 bg-gray-50 rounded text-sm overflow-x-auto">
                    {JSON.stringify(selectedAppeal.post?.citations || selectedAppeal.reply?.citations || {}, null, 2)}
                  </pre>
                </div>
              )}

              {selectedAppeal.status === 'PENDING' && (
                <div className="pt-4 border-t space-y-3">
                  <strong className="text-[#2a2a2a]">Resolve Appeal:</strong>
                  <textarea
                    id="staffNotes"
                    placeholder="Add staff notes (optional)..."
                    className="w-full p-3 border rounded resize-none"
                    rows={3}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const notes = (document.getElementById('staffNotes') as HTMLTextAreaElement)?.value || '';
                        resolveAppeal(selectedAppeal.id, 'APPROVED', notes);
                      }}
                      disabled={resolving}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {resolving ? 'Processing...' : 'Approve Appeal'}
                    </button>
                    <button
                      onClick={() => {
                        const notes = (document.getElementById('staffNotes') as HTMLTextAreaElement)?.value || '';
                        resolveAppeal(selectedAppeal.id, 'REJECTED', notes);
                      }}
                      disabled={resolving}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      {resolving ? 'Processing...' : 'Reject Appeal'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
