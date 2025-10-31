'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronUp, ChevronDown, ArrowLeft } from 'lucide-react';

interface Comment {
  id: string;
  author: {
    id: string;
    username: string;
    displayName: string;
  };
  content: string;
  upvotes: number;
  downvotes: number;
  userVote: 'up' | 'down' | null;
  createdAt: string;
  replies: Comment[];
}

interface DiscoursePost {
  id: string;
  author: {
    id: string;
    username: string;
    displayName: string;
  };
  title: string;
  content: string;
  hashtags: string[];
  upvotes: number;
  downvotes: number;
  commentCount: number;
  createdAt: string;
  userVote: 'up' | 'down' | null;
}

export default function DiscoursePostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  // Mock post data
  const [post, setPost] = useState<DiscoursePost>({
    id: postId,
    author: {
      id: 'u1',
      username: 'sarah_writes',
      displayName: 'Sarah Martinez',
    },
    title: 'The future of collaborative storytelling platforms',
    content: `I've been thinking about how platforms like Shared Thread are changing the way we create and share stories. The ability to get real-time feedback during beta phases is revolutionary.

Traditional publishing has always been a one-way street: you write, you submit, you wait months for feedback, and then maybe you get published. But platforms that enable collaborative creation are fundamentally different.

Here's what I've noticed after using Shared Thread for six months:

1. **Faster iteration**: Getting feedback on specific paragraphs means I can improve my work while I'm still in the creative flow, not weeks later when I've moved on mentally.

2. **Community building**: The discourse system creates conversations around ideas, not just finished products. This means we're learning from each other constantly.

3. **Quality through transparency**: When beta readers can annotate specific sections, the feedback is so much more actionable than "I liked it" or "needs work."

What do you all think? Are we seeing a fundamental shift in how creative work gets made?`,
    hashtags: ['storytelling', 'collaboration', 'creative-writing'],
    upvotes: 42,
    downvotes: 3,
    commentCount: 18,
    createdAt: '2024-01-15T14:30:00Z',
    userVote: null,
  });

  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'c1',
      author: {
        id: 'u2',
        username: 'alex_dev',
        displayName: 'Alex Chen',
      },
      content: 'This resonates so much! I\'ve been using the annotation system for my essays and the quality of feedback has improved dramatically. Instead of vague comments, I get specific suggestions on structure, word choice, etc.',
      upvotes: 15,
      downvotes: 0,
      userVote: 'up',
      createdAt: '2024-01-15T15:00:00Z',
      replies: [
        {
          id: 'c1-1',
          author: {
            id: 'u1',
            username: 'sarah_writes',
            displayName: 'Sarah Martinez',
          },
          content: 'Exactly! The specificity makes all the difference. I used to get frustrated with beta readers who would say "chapter 3 needs work" without explaining what or why.',
          upvotes: 8,
          downvotes: 0,
          userVote: null,
          createdAt: '2024-01-15T15:30:00Z',
          replies: [],
        },
      ],
    },
    {
      id: 'c2',
      author: {
        id: 'u3',
        username: 'jamie_poet',
        displayName: 'Jamie Rivera',
      },
      content: 'I wonder if this changes the nature of the work itself though. Are we optimizing for "what the community likes" rather than taking creative risks? Sometimes the most interesting art is the stuff that makes people uncomfortable at first.',
      upvotes: 23,
      downvotes: 2,
      userVote: null,
      createdAt: '2024-01-15T16:00:00Z',
      replies: [
        {
          id: 'c2-1',
          author: {
            id: 'u4',
            username: 'marcus_reads',
            displayName: 'Marcus Thompson',
          },
          content: 'Great point. I think the key is choosing your beta readers carefully. If you surround yourself with people who appreciate experimental work, the feedback will push you to be more daring, not less.',
          upvotes: 12,
          downvotes: 1,
          userVote: null,
          createdAt: '2024-01-15T16:45:00Z',
          replies: [],
        },
        {
          id: 'c2-2',
          author: {
            id: 'u1',
            username: 'sarah_writes',
            displayName: 'Sarah Martinez',
          },
          content: 'This is a valid concern. I try to balance community feedback with my own artistic vision. The platform gives me data points, but I still have to decide what to do with them.',
          upvotes: 10,
          downvotes: 0,
          userVote: null,
          createdAt: '2024-01-15T17:00:00Z',
          replies: [],
        },
      ],
    },
    {
      id: 'c3',
      author: {
        id: 'u5',
        username: 'elena_editor',
        displayName: 'Elena Rodriguez',
      },
      content: 'As someone who came from traditional publishing, I have mixed feelings. The speed is great, but sometimes slow, careful editing produces better results than fast iteration. Not everything needs to be agile.',
      upvotes: 18,
      downvotes: 5,
      userVote: null,
      createdAt: '2024-01-15T18:00:00Z',
      replies: [],
    },
  ]);

  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handlePostVote = (voteType: 'up' | 'down') => {
    setPost(prev => {
      const newPost = { ...prev };
      
      // Remove previous vote if exists
      if (prev.userVote === voteType) {
        newPost.userVote = null;
        if (voteType === 'up') newPost.upvotes--;
        else newPost.downvotes--;
      } else {
        // Remove opposite vote if exists
        if (prev.userVote === 'up') newPost.upvotes--;
        if (prev.userVote === 'down') newPost.downvotes--;
        
        // Add new vote
        newPost.userVote = voteType;
        if (voteType === 'up') newPost.upvotes++;
        else newPost.downvotes++;
      }
      
      return newPost;
    });
  };

  const handleCommentVote = (commentId: string, voteType: 'up' | 'down') => {
    setComments(prev => {
      const updateComment = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            const updated = { ...comment };
            
            if (comment.userVote === voteType) {
              updated.userVote = null;
              if (voteType === 'up') updated.upvotes--;
              else updated.downvotes--;
            } else {
              if (comment.userVote === 'up') updated.upvotes--;
              if (comment.userVote === 'down') updated.downvotes--;
              
              updated.userVote = voteType;
              if (voteType === 'up') updated.upvotes++;
              else updated.downvotes++;
            }
            
            return updated;
          }
          
          if (comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateComment(comment.replies),
            };
          }
          
          return comment;
        });
      };
      
      return updateComment(prev);
    });
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: `c${Date.now()}`,
      author: {
        id: 'current-user',
        username: 'you',
        displayName: 'Current User',
      },
      content: newComment,
      upvotes: 0,
      downvotes: 0,
      userVote: null,
      createdAt: new Date().toISOString(),
      replies: [],
    };
    
    setComments(prev => [...prev, comment]);
    setNewComment('');
  };

  const handleSubmitReply = (parentId: string) => {
    if (!replyContent.trim()) return;
    
    const reply: Comment = {
      id: `c${Date.now()}`,
      author: {
        id: 'current-user',
        username: 'you',
        displayName: 'Current User',
      },
      content: replyContent,
      upvotes: 0,
      downvotes: 0,
      userVote: null,
      createdAt: new Date().toISOString(),
      replies: [],
    };
    
    setComments(prev => {
      const addReply = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [...comment.replies, reply],
            };
          }
          
          if (comment.replies.length > 0) {
            return {
              ...comment,
              replies: addReply(comment.replies),
            };
          }
          
          return comment;
        });
      };
      
      return addReply(prev);
    });
    
    setReplyTo(null);
    setReplyContent('');
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    const score = comment.upvotes - comment.downvotes;
    
    return (
      <div key={comment.id} className={depth > 0 ? 'ml-8 mt-4' : 'mt-6'}>
        <div className="flex gap-3">
          {/* Vote buttons */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <button
              onClick={() => handleCommentVote(comment.id, 'up')}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronUp
                size={20}
                className={comment.userVote === 'up' ? 'text-orange-500' : 'text-gray-400'}
                fill={comment.userVote === 'up' ? 'currentColor' : 'none'}
              />
            </button>
            <span className={`text-sm font-medium ${
              score > 0 ? 'text-orange-500' : score < 0 ? 'text-blue-500' : 'text-gray-600'
            }`}>
              {score}
            </span>
            <button
              onClick={() => handleCommentVote(comment.id, 'down')}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronDown
                size={20}
                className={comment.userVote === 'down' ? 'text-blue-500' : 'text-gray-400'}
                fill={comment.userVote === 'down' ? 'currentColor' : 'none'}
              />
            </button>
          </div>

          {/* Comment content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-medium text-gray-900">{comment.author.displayName}</span>
              <span className="text-sm text-gray-500">@{comment.author.username}</span>
              <span className="text-sm text-gray-400">•</span>
              <span className="text-sm text-gray-500">{formatTimestamp(comment.createdAt)}</span>
            </div>
            
            <p className="mt-2 text-gray-700 leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
            
            <button
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              className="mt-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Reply
            </button>
            
            {replyTo === comment.id && (
              <div className="mt-3">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  rows={3}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleSubmitReply(comment.id)}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    Submit Reply
                  </button>
                  <button
                    onClick={() => {
                      setReplyTo(null);
                      setReplyContent('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {/* Nested replies */}
            {comment.replies.length > 0 && (
              <div className="mt-4">
                {comment.replies.map(reply => renderComment(reply, depth + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const score = post.upvotes - post.downvotes;

  return (
    <div className="min-h-screen bg-[#FAF7F0]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back to Discourse</span>
        </button>

        {/* Post */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex gap-4">
            {/* Vote buttons */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handlePostVote('up')}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronUp
                  size={24}
                  className={post.userVote === 'up' ? 'text-orange-500' : 'text-gray-400'}
                  fill={post.userVote === 'up' ? 'currentColor' : 'none'}
                />
              </button>
              <span className={`text-lg font-bold ${
                score > 0 ? 'text-orange-500' : score < 0 ? 'text-blue-500' : 'text-gray-600'
              }`}>
                {score}
              </span>
              <button
                onClick={() => handlePostVote('down')}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronDown
                  size={24}
                  className={post.userVote === 'down' ? 'text-blue-500' : 'text-gray-400'}
                  fill={post.userVote === 'down' ? 'currentColor' : 'none'}
                />
              </button>
            </div>

            {/* Post content */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {post.title}
              </h1>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <span className="font-medium text-gray-900">{post.author.displayName}</span>
                <span className="text-gray-400">•</span>
                <span>@{post.author.username}</span>
                <span className="text-gray-400">•</span>
                <span>{formatTimestamp(post.createdAt)}</span>
              </div>
              
              <div className="prose prose-sm max-w-none mb-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Comments section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
          </h2>
          
          {/* New comment form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              rows={4}
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-sm text-gray-500">
                {newComment.length} / 5000
              </span>
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Post Comment
              </button>
            </div>
          </div>
          
          {/* Comments list */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            {comments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {comments.map(comment => (
                  <div key={comment.id} className="first:pt-0 pt-6">
                    {renderComment(comment)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
