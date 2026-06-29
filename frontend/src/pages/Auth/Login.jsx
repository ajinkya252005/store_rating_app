import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const StarIcon = () => (
  <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      const role = res.data.user.role;
      if (role === 'SYSTEM_ADMIN') navigate('/admin');
      else if (role === 'STORE_OWNER') navigate('/owner');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ── warm brand side */}
      <div className="hidden lg:flex lg:w-[52%] bg-amber-50 flex-col justify-between p-14 xl:p-20">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <StarIcon />
          <span className="text-xl font-bold text-gray-900 tracking-tight">StoreRate</span>
        </div>

        {/* Main copy */}
        <div>
          <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Find the stores<br />worth visiting.
          </h1>
          <p className="text-gray-500 text-base mb-10 leading-relaxed max-w-sm">
            Real ratings from real customers. Help local businesses grow or find your next favourite spot.
          </p>

          {/* Feature bullets */}
          <div className="space-y-4">
            {[
              { icon: '⭐', text: 'Rate any registered store from 1 to 5 stars' },
              { icon: '📍', text: 'Browse stores near you with honest reviews' },
              { icon: '📊', text: 'Store owners track their ratings and improve' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-gray-600 text-sm">
                <span className="text-lg w-7 text-center">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400">© 2026 StoreRate. All rights reserved.</p>
      </div>

      {/* ── Right panel ── clean form */}
      <div className="w-full lg:w-[48%] flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <StarIcon />
            <span className="text-xl font-bold text-gray-900">StoreRate</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-8">Sign in to your account to continue.</p>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 mt-2 text-sm"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-gray-500">
            New here?{' '}
            <Link to="/signup" className="text-amber-600 hover:text-amber-700 font-semibold">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;