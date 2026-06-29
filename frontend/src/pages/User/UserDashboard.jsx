import React, { useState, useEffect, useContext, useMemo } from 'react';
import Navbar from '../../components/Navbar';
import StoreCard from '../../components/StoreCard';
import StarRating from '../../components/StarRating';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

/* ── Rating Modal ─────────────────────────────────────── */
const RatingModal = ({ store, onClose, onSubmit }) => {
  const [score, setScore]   = useState(store?.user_rating || 0);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const isUpdate = store?.user_rating != null;

  const handleSubmit = async () => {
    if (!score) return setError('Please select a rating before submitting.');
    setLoading(true);
    setError('');
    try {
      await onSubmit(store.id, score, isUpdate);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit rating.');
    } finally {
      setLoading(false);
    }
  };

  if (!store) return null;

  return (
    <Modal isOpen={!!store} onClose={onClose} title={isUpdate ? 'Update Your Rating' : 'Rate This Store'} maxWidth="max-w-sm">
      <div className="text-center">
        <p className="font-semibold text-gray-900 text-base mb-1">{store.name}</p>
        <p className="text-gray-500 text-sm mb-8">{store.address}</p>

        {/* Star picker */}
        <div className="flex justify-center mb-3">
          <StarRating value={score} onChange={setScore} size="xl" />
        </div>
        <p className="text-sm text-gray-400 mb-6">
          {score === 0 && 'Tap a star to rate'}
          {score === 1 && 'Poor'}
          {score === 2 && 'Below average'}
          {score === 3 && 'Average'}
          {score === 4 && 'Good'}
          {score === 5 && 'Excellent!'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || score === 0}
          className="w-full btn-primary py-2.5 text-sm"
        >
          {loading ? 'Submitting…' : isUpdate ? 'Update Rating' : 'Submit Rating'}
        </button>
      </div>
    </Modal>
  );
};

/* ── Main page ────────────────────────────────────────── */
const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stores,  setStores]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const [ratingStore, setRatingStore] = useState(null); // store being rated

  const fetchStores = async () => {
    try {
      const res = await api.get('/stores');
      setStores(res.data);
    } catch {
      setError('Failed to load stores. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStores(); }, []);

  /* Filter by search */
  const filteredStores = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return stores;
    return stores.filter((s) =>
      s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)
    );
  }, [stores, search]);

  /* Split: already rated vs not yet */
  const ratedStores    = filteredStores.filter((s) => s.user_rating != null);
  const unratedStores  = filteredStores.filter((s) => s.user_rating == null);

  /* Handle rating submission */
  const handleRateSubmit = async (storeId, score, isUpdate) => {
    if (isUpdate) {
      await api.put(`/stores/${storeId}/ratings`, { score });
    } else {
      await api.post(`/stores/${storeId}/ratings`, { score });
    }
    await fetchStores(); // refresh all stores to update ratings
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  if (loading) return <><Navbar /><LoadingSpinner message="Loading stores…" /></>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="page-container">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-900">Hi, {firstName} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Browse and rate the stores below.</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
        )}

        {/* Search */}
        <div className="relative mb-8 max-w-lg">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores by name or address…"
            className="input-field pl-10 !bg-white shadow-sm"
          />
        </div>

        {filteredStores.length === 0 && !loading && (
          <div className="text-center py-16">
            <span className="text-4xl mb-4 block">🔍</span>
            <p className="text-gray-500 text-sm">No stores found matching your search.</p>
          </div>
        )}

        {/* ── Unrated stores ── */}
        {unratedStores.length > 0 && (
          <section className="mb-10">
            <h2 className="text-base font-semibold text-gray-700 mb-4">
              Stores to rate
              <span className="ml-2 text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{unratedStores.length}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {unratedStores.map((store) => (
                <StoreCard key={store.id} store={store} onRate={setRatingStore} />
              ))}
            </div>
          </section>
        )}

        {/* ── Rated stores ── */}
        {ratedStores.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-gray-700 mb-4">
              Already rated
              <span className="ml-2 text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{ratedStores.length}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ratedStores.map((store) => (
                <StoreCard key={store.id} store={store} onRate={setRatingStore} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Rating modal */}
      {ratingStore && (
        <RatingModal
          store={ratingStore}
          onClose={() => setRatingStore(null)}
          onSubmit={handleRateSubmit}
        />
      )}
    </div>
  );
};

export default UserDashboard;
