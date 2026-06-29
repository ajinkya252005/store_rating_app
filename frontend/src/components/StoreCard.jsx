import React from 'react';
import StarRating from './StarRating';

const PinIcon = () => (
  <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const StoreCard = ({ store, onRate }) => {
  const { name, address, average_rating, total_ratings, user_rating } = store;
  const hasRated = user_rating !== null && user_rating !== undefined;

  return (
    <div className="card p-5 flex flex-col gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      {/* Store name */}
      <div>
        <h3 className="font-semibold text-gray-900 text-base leading-tight mb-1">{name}</h3>
        <div className="flex items-start gap-1">
          <PinIcon />
          <p className="text-xs text-gray-500 leading-snug">{address}</p>
        </div>
      </div>

      {/* Average rating */}
      <div className="flex items-center gap-2">
        <StarRating
          value={average_rating || 0}
          size="sm"
          showCount={parseInt(total_ratings) || 0}
        />
      </div>

      {/* Divider */}
      <div className="border-t border-gray-50" />

      {/* User's rating / CTA */}
      <div className="flex items-center justify-between gap-2">
        {hasRated ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Your rating:</span>
            <StarRating value={user_rating} size="sm" />
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">You haven't rated this yet</span>
        )}

        <button
          onClick={() => onRate(store)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            hasRated
              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              : 'bg-amber-500 text-white hover:bg-amber-600'
          }`}
        >
          {hasRated ? 'Update' : 'Rate Store'}
        </button>
      </div>
    </div>
  );
};

export default StoreCard;
