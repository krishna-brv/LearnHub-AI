import React from 'react';

export default function Logo({ size = 'md', className = '', inverted = false, showTagline = false }) {
  const iconSizes = {
    xs: 'h-6 w-6',
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-11 w-11',
    xl: 'h-14 w-14',
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const gapSizes = {
    xs: 'gap-1.5',
    sm: 'gap-2',
    md: 'gap-2.5',
    lg: 'gap-3',
    xl: 'gap-3.5',
  };

  return (
    <div className={`inline-flex items-center select-none ${gapSizes[size] || gapSizes.md} ${className}`}>
      <div className="relative flex-shrink-0 transition-transform duration-200 hover:scale-105">
        <img
          src="/logo-icon.png"
          alt="LearnHub AI"
          className={`${iconSizes[size] || iconSizes.md} object-contain rounded-xl drop-shadow-[0_4px_14px_rgba(16,185,129,0.3)]`}
        />
      </div>
      <div className="flex flex-col leading-none">
        <div className={`flex items-baseline font-black tracking-tight font-sans ${textSizes[size] || textSizes.md}`}>
          <span className={inverted ? 'text-white' : 'text-[#0f172a]'}>
            LearnHub
          </span>
          <span className="ml-1 bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent font-black">
            AI
          </span>
        </div>
        {showTagline && (
          <span className={`text-[10px] font-semibold tracking-wide mt-1 ${inverted ? 'text-gray-400' : 'text-gray-500'}`}>
            Learn Smarter. Practice Better. Grow Faster.
          </span>
        )}
      </div>
    </div>
  );
}
