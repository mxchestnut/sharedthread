'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TiptapEditor from '@/components/editor/tiptap-editor';
import CommentsPanel from '@/components/editor/comments-panel';
import { 
  ArrowLeft, 
  Share2, 
  MoreVertical, 
  Clock,
  Eye,
  Settings
} from 'lucide-react';

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
  status: 'DRAFT' | 'BETA' | 'PUBLISHED';
  projectId: string;
  projectTitle: string;
  categoryId: string;
  categoryName: string;
  wordCount: number;
  lastSaved: string;
  collaborators: Collaborator[];
}

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

export default function ArticleEditorPage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [content, setContent] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedText] = useState(''); // TODO: implement text selection handler with setSelectedText
  const commentsDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside handler for comments dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commentsDropdownRef.current && !commentsDropdownRef.current.contains(event.target as Node)) {
        setShowComments(false);
      }
    };

    if (showComments) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showComments]);

  // Mock article data for demo
  useEffect(() => {
    const loadArticle = async () => {
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockArticle: Article = {
        id: String(params.id),
        title: 'Executive Summary',
        content: '<h1>Executive Summary</h1><p>This document outlines the key components of our business strategy...</p>',
        status: 'DRAFT',
        projectId: '1',
        projectTitle: 'My Business Plan',
        categoryId: '1',
        categoryName: 'Market Analysis',
        wordCount: 247,
        lastSaved: new Date().toISOString(),
        collaborators: [
          { id: '1', name: 'You', avatar: '/api/placeholder/32/32' }
        ]
      };
      
      setArticle(mockArticle);
      setContent(mockArticle.content);
      
      // Mock comments for demo
      const mockComments: Comment[] = [
        {
          id: '1',
          content: 'This executive summary looks great! Could we add more detail about the target market size?',
          author: { id: '2', name: 'Alice Johnson' },
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          resolved: false,
          selectedText: 'target market',
          replies: [
            {
              id: '2',
              content: 'Good point! I\'ll add the market research data we gathered.',
              author: { id: '1', name: 'You' },
              createdAt: new Date(Date.now() - 43200000).toISOString(),
              resolved: false
            }
          ]
        },
        {
          id: '3',
          content: 'The business model section is clear and well-structured.',
          author: { id: '3', name: 'Bob Smith' },
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          resolved: true,
          selectedText: 'business model'
        }
      ];
      
      setComments(mockComments);
      setIsLoading(false);
    };
    
    loadArticle();
  }, [params.id]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    // Auto-save logic would go here
  };

  const handleAddComment = (content: string, selectedText?: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      content,
      author: { id: '1', name: 'You' },
      createdAt: new Date().toISOString(),
      resolved: false,
      selectedText
    };
    setComments(prev => [...prev, newComment]);
  };

  const handleReplyToComment = (commentId: string, content: string) => {
    const reply: Comment = {
      id: Date.now().toString(),
      content,
      author: { id: '1', name: 'You' },
      createdAt: new Date().toISOString(),
      resolved: false
    };

    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply]
        };
      }
      return comment;
    }));
  };

  const handleResolveComment = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, resolved: true }
        : comment
    ));
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  };

  const handleBack = () => {
    router.push('/atelier');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-700',
      BETA: 'bg-blue-100 text-blue-700',
      PUBLISHED: 'bg-green-100 text-green-700'
    };
    return styles[status as keyof typeof styles] || styles.DRAFT;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${focusMode ? '' : 'flex flex-col'}`}>
      {/* Header - Hidden in focus mode */}
      {!focusMode && (
        <div className="bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-medium text-ink">{article?.title}</h1>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(article?.status || 'DRAFT')}`}>
                      {article?.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-support mt-1">
                    <span>{article?.projectTitle}</span>
                    <span>•</span>
                    <span>{article?.categoryName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      Last saved {article?.lastSaved ? new Date(article.lastSaved).toLocaleTimeString() : 'Never'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Word Count */}
                <span className="text-sm text-support px-3 py-1 bg-gray-50 rounded">
                  {content.replace(/<[^>]*>/g, '').split(' ').filter(w => w.length > 0).length} words
                </span>

                {/* Collaborators */}
                <div className="flex items-center gap-2">
                  {article?.collaborators?.map((collaborator: Collaborator) => (
                    <div
                      key={collaborator.id}
                      className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-sm font-medium"
                      title={collaborator.name}
                    >
                      {collaborator.name.charAt(0)}
                    </div>
                  ))}
                </div>

                {/* Comments Toggle & Actions */}
                <div className="flex items-center gap-1 border-l border-border pl-2 ml-2">
                  {/* Comments Dropdown */}
                  <div className="relative" ref={commentsDropdownRef}>
                    <button 
                      onClick={() => setShowComments(!showComments)}
                      className={`p-2 hover:bg-gray-100 rounded-lg transition-colors relative ${showComments ? 'bg-gray-100' : ''}`}
                      title="Comments"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 9h8M8 13h6M12 21l-3-3H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2h-4l-3 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {comments.filter(c => !c.resolved).length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {comments.filter(c => !c.resolved).length}
                        </span>
                      )}
                    </button>
                    
                    {/* Comments Dropdown Panel */}
                    {showComments && (
                      <div className="absolute right-0 top-12 w-96 bg-white border border-border rounded-lg shadow-lg z-20 max-h-96 overflow-hidden">
                        <CommentsPanel
                          comments={comments}
                          onAddComment={handleAddComment}
                          onReply={handleReplyToComment}
                          onResolve={handleResolveComment}
                          onDelete={handleDeleteComment}
                          selectedText={selectedText}
                          className="h-96"
                        />
                      </div>
                    )}
                  </div>
                  
                  <button 
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Share"
                  >
                    <Share2 size={16} />
                  </button>
                  <button 
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="View"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Settings"
                  >
                    <Settings size={16} />
                  </button>
                  <button 
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="More options"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Editor Area - Full Width */}
      <div className="flex-1">
        <TiptapEditor
          content={content}
          onChange={handleContentChange}
          placeholder={`Start writing your ${article?.title.toLowerCase()}...`}
          focusMode={focusMode}
          onFocusModeToggle={() => setFocusMode(!focusMode)}
          showComments={showComments}
          onCommentsToggle={() => setShowComments(!showComments)}
          className="w-full"
        />
      </div>

      {/* Status Bar - Hidden in focus mode */}
      {!focusMode && (
        <div className="bg-white border-t border-border px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-support">
            <div className="flex items-center gap-4">
              <span>Connected</span>
              <span>•</span>
              <span>Auto-save enabled</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Press Cmd+K for commands</span>
              <span>•</span>
              <span>Draft saved automatically</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}