'use client';

import { useState, useEffect } from 'react';
import { logError } from '@/lib/error-logger';


interface Annotation {
  id: string;
  paragraphIndex: number;
  startOffset?: number;
  endOffset?: number;
  content: string;
  type: 'FEEDBACK' | 'SUGGESTION' | 'QUESTION' | 'PRAISE';
  isResolved: boolean;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
  };
  replies: AnnotationReply[];
}

interface AnnotationReply {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
  };
}

interface ContentNode {
  type: string;
  content?: Array<{ text?: string; [key: string]: unknown }>;
  [key: string]: unknown;
}

interface Content {
  content?: ContentNode[];
  [key: string]: unknown;
}

interface Props {
  workId: string;
  content: Content | string;
  isAuthor?: boolean;
}

export default function AnnotatedContent({ workId, content }: Props) {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedParagraph, setSelectedParagraph] = useState<number | null>(null);
  const [showAnnotationForm, setShowAnnotationForm] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [annotationType, setAnnotationType] = useState<'FEEDBACK' | 'SUGGESTION' | 'QUESTION' | 'PRAISE'>('FEEDBACK');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadAnnotations = async () => {
      try {
        const response = await fetch(`/api/works/${workId}/annotations`);
        if (response.ok) {
          const data = await response.json();
          setAnnotations(data.annotations || []);
        }
      } catch (error) {
        logError('Error fetching annotations:', error);
      }
    };
    
    loadAnnotations();
  }, [workId]);



  const extractParagraphs = (content: Content | string): string[] => {
    if (typeof content === 'string') {
      return content.split('\n\n').filter(p => p.trim().length > 0);
    }
    
    if (!content || !content.content) return [];
    
    return content.content
      .filter((node: ContentNode) => node.type === 'paragraph')
      .map((node: ContentNode) => {
        if (node.content) {
          return node.content.map((text) => text.text || '').join('');
        }
        return '';
      })
      .filter((p: string) => p.trim().length > 0);
  };

  const handleParagraphClick = (index: number) => {
    if (selectedParagraph === index) {
      setSelectedParagraph(null);
      setShowAnnotationForm(false);
    } else {
      setSelectedParagraph(index);
      setShowAnnotationForm(true);
    }
  };

  const handleSubmitAnnotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnotation.trim() || selectedParagraph === null) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/works/${workId}/annotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paragraphIndex: selectedParagraph,
          content: newAnnotation,
          type: annotationType,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setAnnotations(prev => [...prev, result.annotation]);
        setNewAnnotation('');
        setShowAnnotationForm(false);
        setSelectedParagraph(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create annotation');
      }
    } catch (error) {
      logError('Error creating annotation:', error);
      alert('Failed to create annotation');
    } finally {
      setIsLoading(false);
    }
  };

  const getAnnotationTypeColor = (type: string) => {
    switch (type) {
      case 'FEEDBACK': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'SUGGESTION': return 'bg-green-100 text-green-800 border-green-300';
      case 'QUESTION': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'PRAISE': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getAnnotationTypeIcon = (type: string) => {
    switch (type) {
      case 'FEEDBACK': return '💬';
      case 'SUGGESTION': return '💡';
      case 'QUESTION': return '❓';
      case 'PRAISE': return '👏';
      default: return '📝';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const paragraphs = extractParagraphs(content);
  
  return (
    <div className="flex gap-8">
      {/* Main Content */}
      <div className="flex-1">
        <div className="prose prose-lg max-w-none">
          {paragraphs.map((paragraph, index) => {
            const paragraphAnnotations = annotations.filter(a => a.paragraphIndex === index);
            const isSelected = selectedParagraph === index;
            const hasAnnotations = paragraphAnnotations.length > 0;
            
            return (
              <div key={index} className="relative group">
                <p
                  onClick={() => handleParagraphClick(index)}
                  className={`cursor-pointer transition-all duration-200 rounded-md p-3 mb-4 ${
                    isSelected
                      ? 'bg-blue-50 border-l-4 border-blue-400'
                      : hasAnnotations
                      ? 'bg-yellow-50 border-l-4 border-yellow-400 hover:bg-yellow-100'
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  {paragraph}
                  
                  {/* Annotation indicators */}
                  {hasAnnotations && (
                    <div className="absolute -right-2 top-2 flex flex-col gap-1">
                      {paragraphAnnotations.slice(0, 3).map((annotation) => (
                        <div
                          key={annotation.id}
                          className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                            annotation.type === 'FEEDBACK' ? 'bg-blue-400' :
                            annotation.type === 'SUGGESTION' ? 'bg-green-400' :
                            annotation.type === 'QUESTION' ? 'bg-yellow-400' :
                            'bg-purple-400'
                          }`}
                        />
                      ))}
                      {paragraphAnnotations.length > 3 && (
                        <div className="w-3 h-3 rounded-full bg-gray-400 border-2 border-white shadow-sm text-xs text-white flex items-center justify-center">
                          +
                        </div>
                      )}
                    </div>
                  )}
                </p>
                
                {/* Annotation form */}
                {isSelected && showAnnotationForm && (
                  <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <form onSubmit={handleSubmitAnnotation}>
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Annotation Type
                        </label>
                        <select
                          value={annotationType}
                          onChange={(e) => setAnnotationType(e.target.value as 'FEEDBACK' | 'SUGGESTION' | 'QUESTION' | 'PRAISE')}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="FEEDBACK">💬 General Feedback</option>
                          <option value="SUGGESTION">💡 Suggestion</option>
                          <option value="QUESTION">❓ Question</option>
                          <option value="PRAISE">👏 Praise</option>
                        </select>
                      </div>
                      <textarea
                        value={newAnnotation}
                        onChange={(e) => setNewAnnotation(e.target.value)}
                        placeholder="Share your thoughts about this paragraph..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                      <div className="flex justify-end gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAnnotationForm(false);
                            setSelectedParagraph(null);
                            setNewAnnotation('');
                          }}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading || !newAnnotation.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Adding...' : 'Add Annotation'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Annotations Sidebar */}
      <div className="w-96 bg-gray-50 rounded-lg p-4 h-fit sticky top-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Annotations ({annotations.length})
        </h3>
        
        {annotations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No annotations yet.</p>
            <p className="text-xs mt-1">Click on any paragraph to add feedback.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {annotations.map((annotation) => (
              <div key={annotation.id} className={`p-3 rounded-lg border ${getAnnotationTypeColor(annotation.type)}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{getAnnotationTypeIcon(annotation.type)}</span>
                    <span className="text-xs font-medium">
                      {annotation.type.charAt(0) + annotation.type.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    Para {annotation.paragraphIndex + 1}
                  </span>
                </div>
                
                <p className="text-sm mb-2">{annotation.content}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>by {annotation.user.displayName}</span>
                  <span>{formatDate(annotation.createdAt)}</span>
                </div>
                
                {annotation.replies.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-gray-200 pt-2">
                    {annotation.replies.map((reply) => (
                      <div key={reply.id} className="bg-white bg-opacity-50 p-2 rounded text-xs">
                        <p className="mb-1">{reply.content}</p>
                        <div className="flex justify-between text-gray-500">
                          <span>{reply.user.displayName}</span>
                          <span>{formatDate(reply.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">How to annotate:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Click any paragraph to add feedback</li>
            <li>• Use different types for specific feedback</li>
            <li>• Colored dots show existing annotations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}