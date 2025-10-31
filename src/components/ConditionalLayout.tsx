'use client';

import { useState, useEffect } from 'react';
import Header from './Header';
import NavigationSidebar from './NavigationSidebar';
import FloatingMinimizeButton from './FloatingMinimizeButton';
import type { AuthUser } from '@/types/auth';


interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const [isNavSidebarOpen, setIsNavSidebarOpen] = useState(false);
  const [isNavSidebarMinimized, setIsNavSidebarMinimized] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check authentication status
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, []);

  // Determine if we should show the traditional header (for all non-authenticated users)
  const shouldShowTraditionalHeader = !isLoading && !user;
  
  // Show floating minimize button for authenticated users only
  const shouldShowFloatingButton = !isLoading && !!user && !isNavSidebarOpen;

  // Traditional landing page layout for non-authenticated users
  if (shouldShowTraditionalHeader) {
    return (
      <div className="min-h-screen bg-paper">
        <Header onOpenSidebar={() => setIsNavSidebarOpen(true)} />
        <main id="main-content" className="w-full">
          {children}
        </main>
      </div>
    );
  }

  // Full-screen layout for all other cases
  return (
    <div className="min-h-screen bg-paper flex">
      {/* Main content area - adjusts width based on sidebar state */}
      <main 
        id="main-content"
        className={`min-h-screen transition-all duration-300 ease-in-out ${
          isNavSidebarOpen 
            ? isNavSidebarMinimized 
              ? 'w-[calc(100%-80px)]' // Minimized sidebar width (20 * 4 = 80px)
              : 'w-[calc(100%-400px)]' // Full sidebar width
            : 'w-full' // No sidebar
        }`}
      >
        {children}
      </main>

      {/* Floating minimize button - only when sidebar is closed */}
      <FloatingMinimizeButton
        show={shouldShowFloatingButton}
        onClick={() => setIsNavSidebarOpen(true)}
      />

      {/* Navigation Sidebar - now uses flex positioning */}
      <NavigationSidebar
        isOpen={isNavSidebarOpen}
        isMinimized={isNavSidebarMinimized}
        onClose={() => setIsNavSidebarOpen(false)}
        onToggleMinimize={() => setIsNavSidebarMinimized(!isNavSidebarMinimized)}
      />
    </div>
  );
}