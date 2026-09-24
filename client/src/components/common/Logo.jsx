import React from 'react';
import { BookOpen } from 'lucide-react';

export default function Logo({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'text-base gap-2',
    md: 'text-xl gap-2.5',
    lg: 'text-2xl gap-3',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className={`flex items-center font-black text-gray-900 tracking-tight ${sizeClasses[size] || sizeClasses.md} ${className}`}>
      <div className="flex items-center justify-center rounded-xl bg-[#0B5D3B] text-white p-1.5 shadow-xs">
        <BookOpen className={iconSizes[size] || iconSizes.md} />
      </div>
      <span className="flex items-center">
        <span className="text-[#0B5D3B]">LearnHub</span>
        <span className="text-[#FF6B1A] ml-1">AI</span>
      </span>
    </div>
  );
}
