import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import StarRating from '../../components/StarRating';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const OwnerDashboard = () => {
  const [store,   setStore]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/stores/my-store');
        setStore(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load your store.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <><Navbar /><LoadingSpinner message="Loading your store…" /></>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="page-container">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Store</h1>
          <p className="text-gray-500 text-sm mt-1">See how customers are rating your store.</p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
        )}

        {store && (
          <>
            {/* ── Store info card ── */}
            <div className="card p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                {/* Store details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">🏪</span>
                    <h2 className="text-xl font-bold text-gray-900">{store.name}</h2>
                  </div>
                  <p className="text-gray-500 text-sm mb-0.5 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {store.email}
                  </p>
                  <p className="text-gray-500 text-sm flex items-start gap-1.5">
                    <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {store.address}
                  </p>
                </div>

                {/* Big rating display */}
                <div className="bg-amber-50 rounded-2xl px-8 py-6 text-center flex-shrink-0">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest mb-2">Average Rating</p>
                  <p className="text-6xl font-bold text-amber-500 leading-none mb-2">
                    {parseFloat(store.average_rating) > 0 ? parseFloat(store.average_rating).toFixed(1) : '—'}
                  </p>
                  <StarRating value={store.average_rating || 0} size="md" />
                  <p className="text-xs text-gray-500 mt-2">
                    Based on {store.total_ratings || 0} rating{store.total_ratings !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Ratings list ── */}
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Customer Ratings</h3>
                <span className="text-sm text-gray-500">{store.ratings?.length || 0} total</span>
              </div>

              {!store.ratings || store.ratings.length === 0 ? (
                <div className="py-16 text-center">
                  <span className="text-4xl mb-4 block">⭐</span>
                  <p className="text-gray-500 text-sm">No ratings yet. Share your store so customers can rate it!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {store.ratings.map((rating) => (
                    <div key={rating.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                      {/* User info */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                          {rating.user_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{rating.user_name}</p>
                          <p className="text-xs text-gray-500 truncate">{rating.user_email}</p>
                        </div>
                      </div>

                      {/* Rating + date */}
                      <div className="flex items-center gap-6 flex-shrink-0">
                        <StarRating value={rating.score} size="sm" />
                        <span className="text-xs text-gray-400 hidden sm:block">
                          {new Date(rating.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
