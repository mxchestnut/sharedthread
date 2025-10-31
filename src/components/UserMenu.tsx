'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logError } from '@/lib/error-logger';


import Link from 'next/link';
import { User, FilePen, Shield, LogOut, Search } from 'lucide-react';
import type { AuthUser } from '@/types/auth';

export default function UserMenu() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchScope, setSearchScope] = useState<'project' | 'works' | 'site'>('site');
  const router = useRouter();

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

  if (isLoading) {
    return (
      <div className="px-3 py-2 text-sm text-gray-600">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <Link 
        href="/login" 
        className="px-4 py-2 border-2 border-black bg-white text-black text-sm font-medium hover:bg-black hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-black"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center gap-2 px-3 py-2 border-2 border-black bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-black"
        aria-expanded={isMenuOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-sm font-medium">
          {user.displayName.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm text-black font-medium hidden sm:block">
          {user.displayName}
        </span>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border-2 border-black shadow-lg z-50">
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-200">
              {user.email}
            </div>
            
            {/* Main Navigation */}
            <div className="border-b border-gray-200">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Navigation
              </div>
              <Link
                href="/library"
                className="flex items-center gap-2 px-4 py-2 text-sm text-black hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Library
              </Link>
              <Link
                href="/communities"
                className="flex items-center gap-2 px-4 py-2 text-sm text-black hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Communities
              </Link>
              <Link
                href="/users"
                className="flex items-center gap-2 px-4 py-2 text-sm text-black hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Writers
              </Link>
              <Link
                href="/feed"
                className="flex items-center gap-2 px-4 py-2 text-sm text-black hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Feed
              </Link>
            </div>

            {/* Search */}
            <div className="border-b border-gray-200 p-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
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



            {/* User Menu */}
            <div className="border-b border-gray-200">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Account
              </div>
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 text-sm text-black hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={16} />
                Profile
              </Link>
              <Link
                href="/atelier"
                className="flex items-center gap-2 px-4 py-2 text-sm text-black hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <FilePen size={16} />
                Atelier
              </Link>
            </div>

            {/* Admin & Logout */}
            <div>
              {user.role === 'admin' && (
                <Link
                  href="/staff"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-black hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Shield size={16} />
                  Staff Dashboard
                </Link>
              )}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}