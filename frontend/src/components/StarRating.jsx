import React, { useState } from 'react';

const StarIcon = ({ filled, partial, className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      {partial && (
        <linearGradient id={`partial-${partial}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset={`${partial}%`} stopColor="#FBBF24" />
          <stop offset={`${partial}%`} stopColor="#E5E7EB" />
        </linearGradient>
      )}
    </defs>
    <path
      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
      fill={
        partial
          ? `url(#partial-${partial})`
          : filled
          ? '#FBBF24'
          : '#E5E7EB'
      }
    />
  </svg>
);

/**
 * StarRating component
 *
 * Display mode  → pass value (0–5), no onChange
 * Interactive   → pass value + onChange handler
 */
const StarRating = ({ value = 0, onChange = null, size = 'md', showCount = null }) => {
  const [hover, setHover] = useState(0);

  const sizeClass = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-7 h-7', xl: 'w-9 h-9' }[size] || 'w-5 h-5';
  const numValue = parseFloat(value) || 0;

  /* ── Interactive mode ── */
  if (onChange) {
    const active = hover || value;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="transition-transform hover:scale-110 focus:outline-none"
          >
            <StarIcon filled={active >= star} className={sizeClass} />
          </button>
        ))}
      </div>
    );
  }

  /* ── Display mode with partial star ── */
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const diff = numValue - (star - 1);
          const filled = diff >= 1;
          const partial = !filled && diff > 0 ? Math.round(diff * 100) : null;
          return (
            <StarIcon
              key={star}
              filled={filled}
              partial={partial}
              className={sizeClass}
            />
          );
        })}
      </div>
      {showCount !== null && (
        <span className="text-sm text-gray-500">
          {numValue > 0
            ? `${numValue.toFixed(1)} (${showCount})`
            : showCount > 0
            ? `(${showCount})`
            : 'No ratings yet'}
        </span>
      )}
    </div>
  );
};

export default StarRating;
