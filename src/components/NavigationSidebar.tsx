'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  FilePen, 
  Shield, 
  LogOut, 
  Search, 
  Grid, 
  List, 
  X, 
  Minimize2,
  Library,
  MessageSquare,
  Rss,
  Bell,
  Compass
} from 'lucide-react';
import { logError } from '@/lib/error-logger';
import type { AuthUser } from '@/types/auth';

interface NavigationSidebarProps {
  isOpen: boolean;
  isMinimized: boolean;
  onClose: () => void;
  onToggleMinimize: () => void;
}

export default function NavigationSidebar({ 
  isOpen, 
  isMinimized, 
  onClose, 
  onToggleMinimize 
}: NavigationSidebarProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchScope, setSearchScope] = useState<'project' | 'works' | 'site'>('site');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const router = useRouter();
  const pathname = usePathname();
  
  // Check if we're in Atelier
  const isInAtelier = pathname.startsWith('/atelier');
  
  // Mock project data (in real app, this would come from context/props)
  const mockProject = isInAtelier ? {
    id: '1',
    title: 'The Digital Divide',
    description: 'A research project exploring technology access inequality',
    progress: 45,
    articleCount: 8
  } : null;

  useEffect(() => {
    async function fetchUser() {
      try {
        // Check if we're on the login page
        if (window.location.pathname === '/login') {
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else if (response.status === 401) {
          // User not authenticated - this is normal, don't log as error
          setUser(null);
        } else {
          // Other error
          setUser(null);
        }
      } catch (error) {
        logError('Failed to fetch user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      logError('Logout failed:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile only */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar - now uses flex positioning */}
      <aside 
        className={`flex-shrink-0 h-screen bg-white border-l-2 border-black shadow-lg transition-all duration-300 ease-in-out ${
          isMinimized ? 'w-20' : 'w-[400px]'
        } md:relative md:z-auto fixed right-0 top-0 z-50 md:block`}
        aria-label="Main navigation sidebar"
        role="complementary"
      >
        
        {/* Header */}
        <div className={`flex items-center border-b-2 border-black ${isMinimized ? 'justify-center px-2 py-4' : 'justify-between px-6 py-4'}`}>
          {!isMinimized && (
            <Link href="/dashboard" className="text-lg font-bold text-black hover:text-gray-800 transition-colors" aria-label="Shared Thread dashboard">
              Shared Thread
            </Link>
          )}
          <div className={`flex items-center ${isMinimized ? 'flex-col gap-2' : 'gap-2'}`}>
            <button
              onClick={onToggleMinimize}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              aria-label={isMinimized ? "Expand sidebar" : "Minimize sidebar"}
              aria-expanded={!isMinimized}
              title={isMinimized ? "Expand" : "Minimize"}
            >
              <Minimize2 size={16} aria-hidden="true" />
            </button>
            {!isMinimized && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                aria-label="Close sidebar"
                title="Close"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full overflow-y-auto pb-20">
          
          {/* User Section */}
          {!isLoading && user && (
            <div className={`border-b border-gray-200 ${isMinimized ? 'px-2 py-4' : 'px-6 py-4'}`}>
              <div className={`flex items-center ${isMinimized ? 'justify-center' : 'gap-3'}`}>
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                {!isMinimized && (
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-black truncate">
                      {user.displayName}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {user.email}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Navigation */}
          <div className={`border-b border-gray-200 ${isMinimized ? 'px-2 py-4' : 'px-6 py-4'}`}>
            {!isMinimized && (
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Navigation
              </h2>
            )}
            <nav className={`space-y-1 ${isMinimized ? 'flex flex-col items-center' : ''}`} aria-label="Main navigation">
              <Link
                href="/library"
                className={`flex items-center text-sm text-black hover:bg-gray-100 rounded transition-colors ${
                  isMinimized ? 'p-2 justify-center' : 'gap-3 px-3 py-2'
                }`}
                aria-label="Go to Library"
                title={isMinimized ? "Library" : ""}
              >
                <Library size={16} aria-hidden="true" />
                {!isMinimized && "Library"}
              </Link>
              <Link
                href="/communities"
                className={`flex items-center text-sm text-black hover:bg-gray-100 rounded transition-colors ${
                  isMinimized ? 'p-2 justify-center' : 'gap-3 px-3 py-2'
                }`}
                aria-label="Go to Communities"
                title={isMinimized ? "Communities" : ""}
              >
                <MessageSquare size={16} aria-hidden="true" />
                {!isMinimized && "Communities"}
              </Link>
              <Link
                href="/discourse"
                className={`flex items-center text-sm text-black hover:bg-gray-100 rounded transition-colors ${
                  isMinimized ? 'p-2 justify-center' : 'gap-3 px-3 py-2'
                }`}
                aria-label="Go to Discourse"
                title={isMinimized ? "Discourse" : ""}
              >
                <MessageSquare size={16} />
                {!isMinimized && "Discourse"}
              </Link>
              <Link
                href="/discovery"
                className={`flex items-center text-sm text-black hover:bg-gray-100 rounded transition-colors ${
                  isMinimized ? 'p-2 justify-center' : 'gap-3 px-3 py-2'
                }`}
                title={isMinimized ? "Discovery" : ""}
              >
                <Compass size={16} />
                {!isMinimized && "Discovery"}
              </Link>
              <Link
                href="/notifications"
                className={`flex items-center text-sm text-black hover:bg-gray-100 rounded transition-colors ${
                  isMinimized ? 'p-2 justify-center' : 'gap-3 px-3 py-2'
                }`}
                title={isMinimized ? "Notifications" : ""}
              >
                <Bell size={16} />
                {!isMinimized && "Notifications"}
              </Link>
              <Link
                href="/feed"
                className={`flex items-center text-sm text-black hover:bg-gray-100 rounded transition-colors ${
                  isMinimized ? 'p-2 justify-center' : 'gap-3 px-3 py-2'
                }`}
                title={isMinimized ? "Feed" : ""}
              >
                <Rss size={16} />
                {!isMinimized && "Feed"}
              </Link>
              <Link
                href="/atelier"
                className={`flex items-center text-sm rounded transition-colors ${
                  isInAtelier ? 'bg-accent text-white font-medium' : 'text-black hover:bg-gray-100'
                } ${isMinimized ? 'p-2 justify-center' : 'gap-3 px-3 py-2'}`}
                title={isMinimized ? "Atelier" : ""}
              >
                <FilePen size={16} />
                {!isMinimized && "Atelier"}
              </Link>
            </nav>
          </div>

          {/* Search */}
          {!isMinimized && (
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Search
              </div>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  placeholder={`Search ${searchScope === 'project' ? 'project' : searchScope === 'works' ? 'my works' : 'site'}...`}
                  className="pl-9 pr-4 py-2 border border-gray-300 bg-white text-sm w-full rounded focus:outline-none focus:ring-2 focus:ring-black" 
                />
                <select 
                  value={searchScope}
                  onChange={(e) => setSearchScope(e.target.value as 'project' | 'works' | 'site')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs border-0 bg-transparent focus:outline-none"
                >
                  <option value="project">Project</option>
                  <option value="works">My Works</option>
                  <option value="site">Site</option>
                </select>
              </div>
            </div>
          )}

          {/* Project Controls - only in Atelier and when not minimized */}
          {isInAtelier && mockProject && !isMinimized && (
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Current Project
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-black">{mockProject.title}</h3>
                <p className="text-xs text-gray-600 mb-2">{mockProject.description}</p>
                <div className="text-xs text-gray-500">
                  {mockProject.progress}% complete • {mockProject.articleCount} articles
                </div>
              </div>

              {/* Work Status Filters */}
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-700 mb-2">Status Filters</div>
                <div className="flex flex-wrap gap-1">
                  <button className="px-2 py-1 text-xs font-medium text-black bg-gray-100 hover:bg-gray-200 rounded">
                    All
                  </button>
                  <button className="px-2 py-1 text-xs text-gray-600 hover:text-black hover:bg-gray-100 rounded">
                    Drafts
                  </button>
                  <button className="px-2 py-1 text-xs text-gray-600 hover:text-black hover:bg-gray-100 rounded">
                    Beta
                  </button>
                  <button className="px-2 py-1 text-xs text-gray-600 hover:text-black hover:bg-gray-100 rounded">
                    Published
                  </button>
                </div>
              </div>

              {/* Categories */}
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-700 mb-2">Categories</div>
                <select className="w-full px-2 py-1 border border-gray-300 rounded text-xs bg-white">
                  <option>All Categories</option>
                  <option>Market Analysis</option>
                  <option>Financial Projections</option>
                  <option>Strategy</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-700 mb-2">View Mode</div>
                <div className="flex items-center gap-1 bg-gray-100 border border-gray-300 rounded p-1">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded text-black ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  >
                    <Grid size={14} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded text-black ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                  >
                    <List size={14} />
                  </button>
                </div>
              </div>

              {/* Project Actions */}
              <div className="space-y-2">
                <button className="w-full px-3 py-2 border border-black bg-white text-black text-xs hover:bg-gray-50 transition-colors rounded">
                  Export Project
                </button>
                <button className="w-full px-3 py-2 border border-black bg-white text-black text-xs hover:bg-gray-50 transition-colors rounded">
                  Share Project
                </button>
                <button className="w-full px-3 py-2 bg-accent text-white text-xs hover:bg-accent/90 transition-colors rounded">
                  New Article
                </button>
              </div>
            </div>
          )}

          {/* Account Actions */}
          {!isLoading && user && !isMinimized && (
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Account
              </div>
              <nav className="space-y-1">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-black hover:bg-gray-100 rounded transition-colors"
                >
                  <User size={16} />
                  Profile
                </Link>
                {user.role === 'admin' && (
                  <Link
                    href="/staff"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-black hover:bg-gray-100 rounded transition-colors"
                  >
                    <Shield size={16} />
                    Staff Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full text-left px-3 py-2 text-sm text-black hover:bg-gray-100 rounded transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </nav>
            </div>
          )}

          {/* Sign In - when not authenticated */}
          {!isLoading && !user && !isMinimized && (
            <div className="px-6 py-4">
              <Link 
                href="/login" 
                className="block w-full px-4 py-3 border-2 border-black bg-white text-black text-sm font-medium hover:bg-black hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-black text-center rounded"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Minimized bottom actions */}
          {isMinimized && (
            <div className="px-2 py-4 mt-auto border-t border-gray-200">
              <div className="flex flex-col items-center gap-2">
                {!isLoading && user && (
                  <button
                    onClick={handleLogout}
                    className="p-2 text-black hover:bg-gray-100 rounded transition-colors"
                    title="Sign Out"
                  >
                    <LogOut size={16} />
                  </button>
                )}
                {!isLoading && !user && (
                  <Link 
                    href="/login" 
                    className="p-2 text-black hover:bg-gray-100 rounded transition-colors"
                    title="Sign In"
                  >
                    <User size={16} />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}