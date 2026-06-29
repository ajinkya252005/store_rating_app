import React, { useState } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';

const RuleHint = ({ met, text }) => (
  <div className={`flex items-center gap-1.5 text-xs ${met ? 'text-emerald-600' : 'text-gray-400'}`}>
    <span>{met ? '✓' : '○'}</span><span>{text}</span>
  </div>
);

const ROLES = ['NORMAL_USER', 'STORE_OWNER', 'SYSTEM_ADMIN'];

const CreateUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', role: 'NORMAL_USER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const pwRules = {
    length:    form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    special:   /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(form.password),
  };

  const handleClose = () => {
    setForm({ name: '', email: '', password: '', address: '', role: 'NORMAL_USER' });
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.name.trim().length < 20) return setError('Full name must be at least 20 characters.');

    setLoading(true);
    try {
      await api.post('/admin/users', form);
      onSuccess();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  const roleLabels = { NORMAL_USER: 'Normal User', STORE_OWNER: 'Store Owner', SYSTEM_ADMIN: 'System Admin' };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New User">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label !mb-0">Full name</label>
            <span className={`text-xs ${form.name.length >= 20 ? 'text-emerald-500' : 'text-gray-400'}`}>
              {form.name.length}/20 min
            </span>
          </div>
          <input
            id="cu-name"
            type="text"
            required
            value={form.name}
            onChange={set('name')}
            className="input-field"
            placeholder="Min. 20 characters"
          />
        </div>

        {/* Email */}
        <div>
          <label className="label">Email address</label>
          <input id="cu-email" type="email" required value={form.email} onChange={set('email')} className="input-field" placeholder="name@example.com" />
        </div>

        {/* Password */}
        <div>
          <label className="label">Password</label>
          <input id="cu-password" type="password" required value={form.password} onChange={set('password')} className="input-field" placeholder="Create a strong password" />
          {form.password.length > 0 && (
            <div className="mt-2 space-y-1">
              <RuleHint met={pwRules.length}    text="At least 8 characters" />
              <RuleHint met={pwRules.uppercase} text="At least one uppercase letter" />
              <RuleHint met={pwRules.special}   text="At least one special character" />
            </div>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="label">Address</label>
          <input id="cu-address" type="text" required value={form.address} onChange={set('address')} className="input-field" placeholder="Street, city, state" />
        </div>

        {/* Role */}
        <div>
          <label className="label">Role</label>
          <select id="cu-role" value={form.role} onChange={set('role')} className="input-field">
            {ROLES.map((r) => (
              <option key={r} value={r}>{roleLabels[r]}</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={handleClose} className="flex-1 btn-secondary py-2.5 text-sm">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 btn-primary py-2.5 text-sm">
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateUserModal;
