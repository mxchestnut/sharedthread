// src/components/Editor.tsx
import React from 'react';

interface EditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function Editor({ value, onChange, placeholder, minHeight = 120 }: EditorProps) {
  return (
    <textarea
      className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-2 focus:ring-2 focus:ring-accent focus:border-accent"
      style={{ minHeight }}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}
