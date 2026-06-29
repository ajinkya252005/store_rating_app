import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import api from '../../services/api';

const RuleHint = ({ met, text }) => (
  <div className={`flex items-center gap-1.5 text-xs ${met ? 'text-emerald-600' : 'text-gray-400'}`}>
    <span>{met ? '✓' : '○'}</span><span>{text}</span>
  </div>
);

const UserProfile = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const pwRules = {
    length:    form.newPassword.length >= 8,
    uppercase: /[A-Z]/.test(form.newPassword),
    special:   /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(form.newPassword),
    match:     form.newPassword === form.confirmPassword && form.confirmPassword.length > 0,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.newPassword !== form.confirmPassword) {
      return setError('New passwords do not match.');
    }

    setLoading(true);
    try {
      await api.put('/users/me/password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess('Password updated successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="page-container max-w-lg">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>
          <p className="text-gray-500 text-sm mt-1">Choose a strong password to keep your account secure.</p>
        </div>

        <div className="card p-6">
          {/* Error / Success */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}
          {success && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current password */}
            <div>
              <label className="label">Current password</label>
              <input
                id="profile-current-pw"
                type="password"
                required
                value={form.currentPassword}
                onChange={set('currentPassword')}
                className="input-field"
                placeholder="Enter your current password"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* New password */}
            <div>
              <label className="label">New password</label>
              <input
                id="profile-new-pw"
                type="password"
                required
                value={form.newPassword}
                onChange={set('newPassword')}
                className="input-field"
                placeholder="Create a new password"
              />
              {form.newPassword.length > 0 && (
                <div className="mt-2 space-y-1">
                  <RuleHint met={pwRules.length}    text="At least 8 characters" />
                  <RuleHint met={pwRules.uppercase} text="At least one uppercase letter" />
                  <RuleHint met={pwRules.special}   text="At least one special character" />
                </div>
              )}
            </div>

            {/* Confirm new password */}
            <div>
              <label className="label">Confirm new password</label>
              <input
                id="profile-confirm-pw"
                type="password"
                required
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                className="input-field"
                placeholder="Re-enter your new password"
              />
              {form.confirmPassword.length > 0 && (
                <div className="mt-2">
                  <RuleHint met={pwRules.match} text="Passwords match" />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 text-sm mt-2"
            >
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
