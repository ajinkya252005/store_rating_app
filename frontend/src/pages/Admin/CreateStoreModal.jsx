import React, { useState } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';

const CreateStoreModal = ({ isOpen, onClose, onSuccess, storeOwners }) => {
  const [form, setForm] = useState({ name: '', email: '', address: '', owner_id: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleClose = () => {
    setForm({ name: '', email: '', address: '', owner_id: '' });
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.owner_id) return setError('Please select a store owner.');

    setLoading(true);
    try {
      await api.post('/admin/stores', form);
      onSuccess();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create store.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Store">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {storeOwners.length === 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
          No Store Owner accounts exist yet. Create a user with the Store Owner role first.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Store name */}
        <div>
          <label className="label">Store name</label>
          <input
            id="cs-name"
            type="text"
            required
            value={form.name}
            onChange={set('name')}
            className="input-field"
            placeholder="e.g. The Coffee Corner"
          />
        </div>

        {/* Store email */}
        <div>
          <label className="label">Store email</label>
          <input
            id="cs-email"
            type="email"
            required
            value={form.email}
            onChange={set('email')}
            className="input-field"
            placeholder="store@example.com"
          />
        </div>

        {/* Address */}
        <div>
          <label className="label">Address</label>
          <input
            id="cs-address"
            type="text"
            required
            value={form.address}
            onChange={set('address')}
            className="input-field"
            placeholder="123 Main St, City, State"
          />
        </div>

        {/* Owner dropdown */}
        <div>
          <label className="label">Assign to Store Owner</label>
          <select
            id="cs-owner"
            value={form.owner_id}
            onChange={set('owner_id')}
            className="input-field"
            required
          >
            <option value="">— Select a Store Owner —</option>
            {storeOwners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name} ({owner.email})
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={handleClose} className="flex-1 btn-secondary py-2.5 text-sm">Cancel</button>
          <button
            type="submit"
            disabled={loading || storeOwners.length === 0}
            className="flex-1 btn-primary py-2.5 text-sm"
          >
            {loading ? 'Creating...' : 'Create Store'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateStoreModal;
