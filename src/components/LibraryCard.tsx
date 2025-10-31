import React from 'react';
import Link from 'next/link';
import { Star, MessageSquare, Bookmark, ArrowRight } from 'lucide-react';

type Props = {
  title: string;
  excerpt: string;
  rating: string | number;
  comments: number;
  saves: number;
  author?: string;
  authorUsername?: string;
  tags?: string[];
  workId?: string;
  status?: string;
};

export default function LibraryCard({ 
  title, 
  excerpt, 
  rating, 
  comments, 
  saves, 
  author, 
  authorUsername,
  tags = [], 
  workId, 
  status 
}: Props) {
  return (
    <article className="card flex flex-col justify-between h-full hover:shadow-md transition-shadow border-2 border-black bg-white">
      <div>
        {/* Work Title */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={`/works/${workId || '#'}`}>
              <h3 className="text-lg font-medium text-black mb-1 hover:underline transition-colors cursor-pointer">
                {title}
              </h3>
            </Link>
          </div>
          {status && status !== 'PUBLISHED' && (
            <span className={`px-2 py-1 text-xs rounded ml-2 border border-black ${
              status === 'BETA' ? 'bg-gray-200 text-black' :
              status === 'DRAFT' ? 'bg-gray-100 text-black' :
              'bg-white text-black'
            }`}>
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </span>
          )}
        </div>

        {/* Author */}
        {author && (
          <p className="text-xs text-gray-600 mb-2">
            by {authorUsername ? (
              <Link href={`/users/${authorUsername}`} className="hover:underline transition-colors">
                {author}
              </Link>
            ) : (
              author
            )}
          </p>
        )}

        {/* Excerpt */}
        <p className="mt-2 text-sm text-black line-clamp-3">{excerpt}</p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <span 
                key={tag} 
                className="px-2 py-1 bg-white border border-black text-black text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-gray-600">+{tags.length - 3} more</span>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 text-sm text-right text-black flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-black font-medium flex items-center gap-1">
            <Star size={14} fill="black" />
            {rating}
          </span>
          <span className="text-gray-600 flex items-center gap-1">
            <MessageSquare size={14} />
            {comments}
          </span>
          <span className="text-gray-600 flex items-center gap-1">
            <Bookmark size={14} />
            {saves}
          </span>
        </div>
        {workId && (
          <Link 
            href={`/works/${workId}`}
            className="text-black hover:underline text-xs font-medium flex items-center gap-1"
          >
            Read <ArrowRight size={12} />
          </Link>
        )}
      </div>
    </article>
  );
}
