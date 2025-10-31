// Enhanced project system types
export interface Project {
  id: string;
  title: string;
  description?: string;
  templateId?: string;
  authorId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' | 'PAUSED';
  progress: number; // 0-100
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  categories?: ProjectCategory[];
  articles?: Article[];
  _count?: {
    categories: number;
    articles: number;
  };
}

export interface ProjectCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  icon: string;
  color: string;
  position: number;
  projectId: string;
  parentId?: string;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  children?: ProjectCategory[];
  articles?: Article[];
  _count?: {
    articles: number;
  };
}

export interface Article {
  id: string;
  title: string;
  content: Record<string, unknown>;
  excerpt?: string;
  slug: string;
  authorId: string;
  projectId: string;
  categoryId?: string;
  templatePromptId?: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'COMPLETE' | 'ARCHIVED';
  visibility: 'PRIVATE' | 'FOLLOWERS' | 'COMMUNITY' | 'PUBLIC';
  acceptingFeedback: boolean;
  metadata: Record<string, unknown>;
  tags: string[];
  position: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  category?: ProjectCategory;
  _count?: {
    comments: number;
  };
}

export interface ActivityItem {
  id: string;
  type: 'project_created' | 'article_created' | 'article_updated' | 'category_created';
  title: string;
  description: string;
  timestamp: string;
  projectId?: string;
  articleId?: string;
  categoryId?: string;
  metadata?: Record<string, unknown>;
}