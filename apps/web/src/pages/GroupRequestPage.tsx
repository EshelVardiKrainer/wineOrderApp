import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { groupsApi } from '../api/client';
import type { IGroupCreateRequest } from '@wine-order-app/shared-types';

export function GroupRequestPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<IGroupCreateRequest>({
    name: '',
    shippingSiteDetails: {
      name: '',
      address: '',
      city: '',
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await groupsApi.requestGroup(formData);
      setSuccess(true);
      setTimeout(() => navigate('/group-orders'), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to request group');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card page-card" style={{ textAlign: 'center' }}>
        <h2>Group Requested Successfully!</h2>
        <p>Your request has been sent to the administrators for approval. You will receive an email once it is approved.</p>
        <p>Redirecting to Group Orders...</p>
      </div>
    );
  }

  return (
    <div className="card page-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Request a New Group</h2>
      <p>Create a new group in a specific new physical location. Administrators will review your request.</p>
      
      {error && <div className="alert-error" style={{ marginBottom: '1rem', color: 'red' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label>Group Name</label>
          <input 
            type="text" 
            required 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <fieldset style={{ padding: '1rem', border: '1px solid #ccc' }}>
          <legend>Location Details</legend>
          <div style={{ marginBottom: '1rem' }}>
            <label>Location Name (e.g. "Google Office")</label>
            <input 
              type="text" 
              required 
              value={formData.shippingSiteDetails.name}
              onChange={(e) => setFormData({
                ...formData, 
                shippingSiteDetails: { ...formData.shippingSiteDetails, name: e.target.value}
              })}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Street Address</label>
            <input 
              type="text" 
              required 
              value={formData.shippingSiteDetails.address}
              onChange={(e) => setFormData({
                ...formData, 
                shippingSiteDetails: { ...formData.shippingSiteDetails, address: e.target.value}
              })}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          <div>
            <label>City</label>
            <input 
              type="text" 
              required 
              value={formData.shippingSiteDetails.city}
              onChange={(e) => setFormData({
                ...formData, 
                shippingSiteDetails: { ...formData.shippingSiteDetails, city: e.target.value}
              })}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
        </fieldset>

        <button type="submit" disabled={loading} style={{ padding: '0.75rem', marginTop: '1rem' }}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}
