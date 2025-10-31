"use client";
import { useEffect } from 'react';

export default function GlobalHotkeys() {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // '/' focuses header search
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const input = document.getElementById('header-search') as HTMLInputElement | null;
        if (input) {
          e.preventDefault();
          input.focus();
        }
      }
      // 'Escape' blurs active element
      if (e.key === 'Escape') {
        (document.activeElement as HTMLElement | null)?.blur?.();
      }
      // '?' opens shortcuts modal (stub)
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        // Shift+/ is '?', but some keyboards send '?' directly when shift+/
        // As a stub, show an alert; replace with a real modal later.
        e.preventDefault();
  // Temporary stub: replace with proper modal later
  alert('Shortcuts:\n/ Focus search\nEsc Blur\nC Create new work (coming soon)');
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
  return null;
}
