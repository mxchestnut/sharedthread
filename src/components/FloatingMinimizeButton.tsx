'use client';

import { Minimize2 } from 'lucide-react';

interface FloatingMinimizeButtonProps {
  onClick: () => void;
  show: boolean;
}

export default function FloatingMinimizeButton({ onClick, show }: FloatingMinimizeButtonProps) {
  if (!show) return null;

  return (
    <button
      onClick={onClick}
      className="fixed top-6 right-6 z-50 p-3 bg-white border-2 border-black shadow-lg hover:bg-gray-50 transition-all duration-200 rounded-full"
      title="Open Navigation"
    >
      <Minimize2 size={20} />
    </button>
  );
}