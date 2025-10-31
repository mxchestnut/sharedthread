"use client";
import Link from 'next/link';
import React, { useRef } from 'react';
import { UserPlus, LogIn } from 'lucide-react';

interface HeaderProps {
  onOpenSidebar?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Header({ onOpenSidebar }: HeaderProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = searchRef.current?.value?.trim();
    if (q) {
      window.location.href = `/search?q=${encodeURIComponent(q)}`;
    }
  }
  return (
    <header className="sticky top-0 z-30 bg-white border-b-2 border-black shadow-sm">
      <div className="w-full px-6 py-3 flex items-center justify-between">
        {/* Logo/Brand */}
        <Link href="/" className="text-lg font-bold text-black hover:text-gray-800" aria-label="Shared Thread home">
          Shared Thread
        </Link>

        {/* Search + Auth */}
        <nav aria-label="Primary actions">
          <ul className="flex items-center gap-3">
            <li className="hidden md:block">
              <form onSubmit={handleSubmit} role="search" aria-label="Site search">
                <label htmlFor="header-search" className="sr-only">Search</label>
                <input
                  ref={searchRef}
                  id="header-search"
                  type="search"
                  placeholder="Search…"
                  className="px-3 py-2 border border-gray-300 rounded text-sm w-64 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </form>
            </li>
            <li>
              <Link 
                href="/signup" 
                className="flex items-center gap-2 px-4 py-2 border-2 border-black text-black text-sm font-medium hover:bg-gray-50 transition-colors rounded"
              >
                <UserPlus size={16} aria-hidden="true" />
                Sign Up
              </Link>
            </li>
            
            <li>
              <Link 
                href="/login" 
                className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors rounded"
              >
                <LogIn size={16} aria-hidden="true" />
                Sign In
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
