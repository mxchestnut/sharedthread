'use client';

import { useState } from 'react';

interface AppealFormProps {
  targetType: 'POST' | 'REPLY';
  targetId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AppealForm({ targetType, targetId, onSuccess, onCancel }: AppealFormProps) {
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/moderation/appeals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          targetId,
          reason,
          message: message || undefined,
        }),
      });

      if (res.ok) {
        onSuccess?.();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit appeal');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-[#2a2a2a] mb-2">
        Submit Moderation Appeal
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        If you believe your content was flagged incorrectly, you can submit an appeal for staff review.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-[#2a2a2a] mb-1">
            Reason <span className="text-red-500">*</span>
          </label>
          <select
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            className="w-full p-2 border rounded focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
          >
            <option value="">Select a reason...</option>
            <option value="False plagiarism detection">False plagiarism detection</option>
            <option value="False AI detection">False AI detection</option>
            <option value="Properly cited content">Properly cited content</option>
            <option value="Original work">Original work</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-[#2a2a2a] mb-1">
            Additional explanation (optional)
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Provide any additional context or explanation..."
            className="w-full p-3 border rounded resize-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting || !reason}
            className="flex-1 px-4 py-2 bg-[#6366f1] text-white rounded hover:bg-[#5558e3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Appeal'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-4 py-2 border border-gray-300 text-[#2a2a2a] rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
