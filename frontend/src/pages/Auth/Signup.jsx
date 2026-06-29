import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const StarIcon = () => (
  <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const RuleHint = ({ met, text }) => (
  <div className={`flex items-center gap-1.5 text-xs ${met ? 'text-emerald-600' : 'text-gray-400'}`}>
    <span>{met ? '✓' : '○'}</span>
    <span>{text}</span>
  </div>
);

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Password rule checks
  const rules = {
    length:    form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    special:   /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(form.password),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.name.trim().length < 20) {
      return setError('Full name must be at least 20 characters long.');
    }

    const handleSubmit_inner = async () => {
      setLoading(true);
      try {
        await api.post('/auth/signup', form);
        setSuccess('Account created! Redirecting to login...');
        setTimeout(() => navigate('/login'), 1800);
      } catch (err) {
        setError(err.response?.data?.error || 'Signup failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    handleSubmit_inner();
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[52%] bg-amber-50 flex-col justify-between p-14 xl:p-20">
        <div className="flex items-center gap-2">
          <StarIcon />
          <span className="text-xl font-bold text-gray-900 tracking-tight">StoreRate</span>
        </div>

        <div>
          <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Join a community<br />of real reviewers.
          </h1>
          <p className="text-gray-500 text-base leading-relaxed max-w-sm">
            Create your free account and start rating the stores you love — helping others make better choices.
          </p>
        </div>

        <p className="text-xs text-gray-400">© 2025 StoreRate. All rights reserved.</p>
      </div>

      {/* ── Right panel ── */}
      <div className="w-full lg:w-[48%] flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <StarIcon />
            <span className="text-xl font-bold text-gray-900">StoreRate</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create account</h2>
          <p className="text-gray-500 text-sm mb-7">It's free. No credit card required.</p>

          {/* Error / Success */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}
          {success && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label !mb-0">Full name</label>
                <span className={`text-xs ${form.name.length >= 20 ? 'text-emerald-500' : 'text-gray-400'}`}>
                  {form.name.length}/20 min
                </span>
              </div>
              <input
                id="signup-name"
                type="text"
                required
                value={form.name}
                onChange={set('name')}
                className="input-field"
                placeholder="Enter your full name (min. 20 characters)"
              />
            </div>

            {/* Email */}
            <div>
              <label className="label">Email address</label>
              <input
                id="signup-email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={set('email')}
                className="input-field"
                placeholder="name@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <input
                id="signup-password"
                type="password"
                required
                autoComplete="new-password"
                value={form.password}
                onChange={set('password')}
                className="input-field"
                placeholder="Create a strong password"
              />
              {/* Password rules */}
              {form.password.length > 0 && (
                <div className="mt-2 space-y-1 pl-0.5">
                  <RuleHint met={rules.length}    text="At least 8 characters" />
                  <RuleHint met={rules.uppercase} text="At least one uppercase letter" />
                  <RuleHint met={rules.special}   text="At least one special character" />
                </div>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="label">Address</label>
              <input
                id="signup-address"
                type="text"
                required
                value={form.address}
                onChange={set('address')}
                className="input-field"
                placeholder="Your street address, city, state"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 mt-2 text-sm"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-600 hover:text-amber-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
