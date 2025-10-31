'use client';

import React, { useState } from 'react';
import { MessageSquare, Reply, Check, MoreVertical, User } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  resolved: boolean;
  replies?: Comment[];
  selectedText?: string;
  position?: {
    start: number;
    end: number;
  };
}

interface CommentThreadProps {
  comment: Comment;
  onReply?: (commentId: string, content: string) => void;
  onResolve?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
}

function CommentThread({ comment, onReply, onResolve, onDelete }: CommentThreadProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showActions, setShowActions] = useState(false);

  const handleReply = () => {
    if (replyContent.trim() && onReply) {
      onReply(comment.id, replyContent.trim());
      setReplyContent('');
      setIsReplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className={`border rounded-lg p-3 ${comment.resolved ? 'bg-green-50 border-green-200' : 'bg-white border-border'}`}>
      {/* Selected text context */}
      {comment.selectedText && (
        <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
          <div className="text-xs text-support mb-1">Commenting on:</div>
          <div className="italic text-gray-700">&ldquo;{comment.selectedText}&rdquo;</div>
        </div>
      )}

      {/* Main comment */}
      <div className="flex gap-3">
        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
          {comment.author.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={comment.author.avatar} alt={comment.author.name} className="w-8 h-8 rounded-full" />
          ) : (
            <User size={14} />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{comment.author.name}</span>
              <span className="text-xs text-support">{formatDate(comment.createdAt)}</span>
              {comment.resolved && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Resolved
                </span>
              )}
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <MoreVertical size={14} />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-8 bg-white border border-border rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                  {!comment.resolved && onResolve && (
                    <button
                      onClick={() => {
                        onResolve(comment.id);
                        setShowActions(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm flex items-center gap-2"
                    >
                      <Check size={14} />
                      Resolve
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        onDelete(comment.id);
                        setShowActions(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-red-600"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <p className="text-sm text-ink mb-3">{comment.content}</p>
          
          {!comment.resolved && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="text-xs text-accent hover:text-accent/80 flex items-center gap-1"
            >
              <Reply size={12} />
              Reply
            </button>
          )}
          
          {/* Reply form */}
          {isReplying && (
            <div className="mt-3 space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-2 border border-border rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReply}
                  disabled={!replyContent.trim()}
                  className="px-3 py-1 bg-accent text-white rounded text-xs hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reply
                </button>
                <button
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent('');
                  }}
                  className="px-3 py-1 border border-border rounded text-xs hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-11 mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onResolve={onResolve}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CommentsPanelProps {
  comments: Comment[];
  onAddComment?: (content: string, selectedText?: string) => void;
  onReply?: (commentId: string, content: string) => void;
  onResolve?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  selectedText?: string;
  className?: string;
}

export default function CommentsPanel({
  comments,
  onAddComment,
  onReply,
  onResolve,
  onDelete,
  selectedText,
  className = ''
}: CommentsPanelProps) {
  const [newComment, setNewComment] = useState('');
  const [showNewComment, setShowNewComment] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');

  const handleAddComment = () => {
    if (newComment.trim() && onAddComment) {
      onAddComment(newComment.trim(), selectedText);
      setNewComment('');
      setShowNewComment(false);
    }
  };

  const filteredComments = comments.filter(comment => {
    switch (filter) {
      case 'unresolved':
        return !comment.resolved;
      case 'resolved':
        return comment.resolved;
      default:
        return true;
    }
  });

  return (
    <div className={`bg-gray-50 border-l border-border h-full ${className}`}>
      <div className="p-4 border-b border-border bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-ink">Comments</h3>
          <span className="text-xs text-support bg-gray-100 px-2 py-1 rounded-full">
            {comments.length}
          </span>
        </div>
        
        {/* Filter tabs */}
        <div className="flex gap-1 bg-gray-100 rounded p-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs rounded ${filter === 'all' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unresolved')}
            className={`px-3 py-1 text-xs rounded ${filter === 'unresolved' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
          >
            Open ({comments.filter(c => !c.resolved).length})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1 text-xs rounded ${filter === 'resolved' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
          >
            Resolved ({comments.filter(c => c.resolved).length})
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {/* Selected text prompt */}
        {selectedText && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-xs text-blue-600 mb-1">Selected text:</div>
            <div className="text-sm text-blue-800 italic mb-3">&ldquo;{selectedText}&rdquo;</div>
            <button
              onClick={() => setShowNewComment(true)}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Add Comment
            </button>
          </div>
        )}
        
        {/* Add comment button */}
        {!selectedText && !showNewComment && (
          <button
            onClick={() => setShowNewComment(true)}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-accent hover:bg-accent/5 transition-colors mb-4"
          >
            <MessageSquare size={20} className="mx-auto text-gray-400 mb-2" />
            <div className="text-sm text-gray-600">Add a comment</div>
          </button>
        )}
        
        {/* New comment form */}
        {showNewComment && (
          <div className="mb-4 p-3 bg-white border border-border rounded-lg">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment..."
              className="w-full p-2 border border-border rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-3 py-1 bg-accent text-white rounded text-xs hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Comment
              </button>
              <button
                onClick={() => {
                  setShowNewComment(false);
                  setNewComment('');
                }}
                className="px-3 py-1 border border-border rounded text-xs hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {/* Comments list */}
        <div className="space-y-3">
          {filteredComments.length > 0 ? (
            filteredComments.map((comment) => (
              <CommentThread
                key={comment.id}
                comment={comment}
                onReply={onReply}
                onResolve={onResolve}
                onDelete={onDelete}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-support mb-2">
                {filter === 'all' 
                  ? 'No comments yet' 
                  : filter === 'resolved' 
                    ? 'No resolved comments' 
                    : 'No open comments'
                }
              </p>
              <p className="text-xs text-support">
                {selectedText 
                  ? 'Click "Add Comment" above to comment on the selected text' 
                  : 'Select text in the document to add a comment'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}