import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../../components/Navbar';
import StatCard from '../../components/StatCard';
import StarRating from '../../components/StarRating';
import LoadingSpinner from '../../components/LoadingSpinner';
import CreateUserModal from './CreateUserModal';
import CreateStoreModal from './CreateStoreModal';
import api from '../../services/api';

/* ── helpers ─────────────────────────────────────────── */
const roleBadge = {
  SYSTEM_ADMIN: 'bg-gray-900 text-white',
  STORE_OWNER:  'bg-amber-100 text-amber-800',
  NORMAL_USER:  'bg-emerald-100 text-emerald-800',
};
const roleLabel = { SYSTEM_ADMIN: 'System Admin', STORE_OWNER: 'Store Owner', NORMAL_USER: 'Normal User' };

const SortIcon = ({ field, sort }) => {
  if (sort.field !== field) return <span className="ml-1 text-gray-300">↕</span>;
  return <span className="ml-1 text-amber-500">{sort.dir === 'asc' ? '↑' : '↓'}</span>;
};

const ThBtn = ({ children, field, sort, onSort }) => (
  <th
    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-800 select-none"
    onClick={() => onSort(field)}
  >
    {children}
    <SortIcon field={field} sort={sort} />
  </th>
);

/* ── Main component ──────────────────────────────────── */
const AdminDashboard = () => {
  const [stats,   setStats]   = useState(null);
  const [users,   setUsers]   = useState([]);
  const [stores,  setStores]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const [activeTab, setActiveTab] = useState('users');

  // Filters
  const [userSearch,      setUserSearch]      = useState('');
  const [userRoleFilter,  setUserRoleFilter]  = useState('');
  const [storeSearch,     setStoreSearch]     = useState('');

  // Sort
  const [userSort,  setUserSort]  = useState({ field: 'name', dir: 'asc' });
  const [storeSort, setStoreSort] = useState({ field: 'name', dir: 'asc' });

  // Modals
  const [showCreateUser,  setShowCreateUser]  = useState(false);
  const [showCreateStore, setShowCreateStore] = useState(false);

  /* ── Data fetching ── */
  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, usersRes, storesRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
        api.get('/admin/stores'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setStores(storesRes.data);
    } catch {
      setError('Failed to load dashboard data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  /* ── Sort toggle ── */
  const toggleSort = (sortState, setSort) => (field) => {
    setSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { field, dir: 'asc' }
    );
  };

  /* ── Filtered + sorted users ── */
  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase();
    return [...users]
      .filter((u) =>
        (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.address || '').toLowerCase().includes(q))
        && (!userRoleFilter || u.role === userRoleFilter)
      )
      .sort((a, b) => {
        const av = (a[userSort.field] || '').toString().toLowerCase();
        const bv = (b[userSort.field] || '').toString().toLowerCase();
        return userSort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
  }, [users, userSearch, userRoleFilter, userSort]);

  /* ── Filtered + sorted stores ── */
  const filteredStores = useMemo(() => {
    const q = storeSearch.toLowerCase();
    return [...stores]
      .filter((s) =>
        !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.address || '').toLowerCase().includes(q)
      )
      .sort((a, b) => {
        if (storeSort.field === 'average_rating') {
          const av = parseFloat(a.average_rating) || 0;
          const bv = parseFloat(b.average_rating) || 0;
          return storeSort.dir === 'asc' ? av - bv : bv - av;
        }
        const av = (a[storeSort.field] || '').toString().toLowerCase();
        const bv = (b[storeSort.field] || '').toString().toLowerCase();
        return storeSort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
  }, [stores, storeSearch, storeSort]);

  const storeOwners = users.filter((u) => u.role === 'STORE_OWNER');

  /* ── Render ── */
  if (loading) return <><Navbar /><LoadingSpinner message="Loading dashboard..." /></>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="page-container">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage users and stores across the platform.</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
        )}

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Users"   value={stats?.totalUsers}   icon="👤" color="blue"  />
          <StatCard label="Total Stores"  value={stats?.totalStores}  icon="🏪" color="amber" />
          <StatCard label="Ratings Given" value={stats?.totalRatings} icon="⭐" color="green" />
        </div>

        {/* ── Tab navigation ── */}
        <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
          {[
            { key: 'users',  label: `Users (${users.length})` },
            { key: 'stores', label: `Stores (${stores.length})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                activeTab === key
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Users Tab ── */}
        {activeTab === 'users' && (
          <div className="card overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-gray-100">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name, email or address…"
                className="input-field !bg-white flex-1 min-w-0"
              />
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="input-field !bg-white w-full sm:w-44"
              >
                <option value="">All Roles</option>
                <option value="NORMAL_USER">Normal User</option>
                <option value="STORE_OWNER">Store Owner</option>
                <option value="SYSTEM_ADMIN">System Admin</option>
              </select>
              <button
                onClick={() => setShowCreateUser(true)}
                className="btn-primary text-sm px-4 py-2.5 whitespace-nowrap"
              >
                + Add User
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <ThBtn field="name"       sort={userSort} onSort={toggleSort(userSort, setUserSort)}>Name</ThBtn>
                    <ThBtn field="email"      sort={userSort} onSort={toggleSort(userSort, setUserSort)}>Email</ThBtn>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</th>
                    <ThBtn field="role"       sort={userSort} onSort={toggleSort(userSort, setUserSort)}>Role</ThBtn>
                    <ThBtn field="created_at" sort={userSort} onSort={toggleSort(userSort, setUserSort)}>Joined</ThBtn>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">No users found.</td></tr>
                  ) : filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5 text-sm font-medium text-gray-900">{u.name}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">{u.email}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-500 max-w-xs truncate">{u.address || '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadge[u.role]}`}>
                          {roleLabel[u.role]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-500">
                        {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Row count */}
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>
        )}

        {/* ── Stores Tab ── */}
        {activeTab === 'stores' && (
          <div className="card overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-gray-100">
              <input
                type="text"
                value={storeSearch}
                onChange={(e) => setStoreSearch(e.target.value)}
                placeholder="Search by name, email or address…"
                className="input-field !bg-white flex-1 min-w-0"
              />
              <button
                onClick={() => setShowCreateStore(true)}
                className="btn-primary text-sm px-4 py-2.5 whitespace-nowrap"
              >
                + Add Store
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <ThBtn field="name"           sort={storeSort} onSort={toggleSort(storeSort, setStoreSort)}>Store Name</ThBtn>
                    <ThBtn field="email"          sort={storeSort} onSort={toggleSort(storeSort, setStoreSort)}>Email</ThBtn>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
                    <ThBtn field="average_rating" sort={storeSort} onSort={toggleSort(storeSort, setStoreSort)}>Avg Rating</ThBtn>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredStores.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">No stores found.</td></tr>
                  ) : filteredStores.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5 text-sm font-medium text-gray-900">{s.name}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">{s.email}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-500 max-w-xs truncate">{s.address}</td>
                      <td className="px-4 py-3.5 text-sm text-gray-600">{s.owner_name || '—'}</td>
                      <td className="px-4 py-3.5">
                        {parseFloat(s.average_rating) > 0 ? (
                          <div className="flex items-center gap-2">
                            <StarRating value={s.average_rating} size="sm" />
                            <span className="text-xs text-gray-500">
                              {parseFloat(s.average_rating).toFixed(1)} ({s.total_ratings})
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No ratings yet</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Row count */}
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
              Showing {filteredStores.length} of {stores.length} stores
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateUserModal
        isOpen={showCreateUser}
        onClose={() => setShowCreateUser(false)}
        onSuccess={fetchAll}
      />
      <CreateStoreModal
        isOpen={showCreateStore}
        onClose={() => setShowCreateStore(false)}
        onSuccess={fetchAll}
        storeOwners={storeOwners}
      />
    </div>
  );
};

export default AdminDashboard;
