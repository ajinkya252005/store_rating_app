import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const StarIcon = () => (
  <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const roleBadge = {
  SYSTEM_ADMIN: 'bg-gray-900 text-white',
  STORE_OWNER:  'bg-amber-100 text-amber-800',
  NORMAL_USER:  'bg-emerald-100 text-emerald-800',
};

const roleLabel = {
  SYSTEM_ADMIN: 'System Admin',
  STORE_OWNER:  'Store Owner',
  NORMAL_USER:  'User',
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const firstName = user?.name?.split(' ')[0] || 'User';
  const showProfileLink = user?.role === 'NORMAL_USER' || user?.role === 'STORE_OWNER';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={
            user?.role === 'SYSTEM_ADMIN' ? '/admin'
            : user?.role === 'STORE_OWNER' ? '/owner'
            : '/dashboard'
          } className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <StarIcon />
            <span className="text-lg font-bold text-gray-900 tracking-tight">StoreRate</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Role badge */}
            {user && (
              <span className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadge[user.role]}`}>
                {roleLabel[user.role]}
              </span>
            )}

            {/* User name */}
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              Hi, {firstName}
            </span>

            {/* Profile / password link */}
            {showProfileLink && (
              <Link
                to="/profile"
                className="text-sm text-gray-500 hover:text-amber-600 transition-colors hidden md:block"
              >
                Change Password
              </Link>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
