import { useEffect, useState } from 'react';
import { roleRequestsApi } from '../api/client';
import { useAuthStore } from '../stores/auth.store';
import type { IRoleRequest } from '@wine-order-app/shared-types';

export function RoleRequestPage() {
  const user = useAuthStore((s) => s.user);
  const [requests, setRequests] = useState<IRoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requestedRole, setRequestedRole] = useState<'ADMIN' | 'RETAIL'>('ADMIN');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchRequests = async () => {
    try {
      const data = await roleRequestsApi.getMine();
      setRequests(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const hasPending = requests.some((r) => r.status === 'PENDING');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await roleRequestsApi.create({ requestedRole, reason: reason || undefined });
      setSuccess('Your role request has been submitted! The super admin will review it.');
      setReason('');
      await fetchRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      PENDING: { bg: 'var(--warning-50)', color: 'var(--warning-700)' },
      APPROVED: { bg: 'var(--success-50)', color: 'var(--success-700)' },
      DENIED: { bg: 'var(--danger-50)', color: 'var(--danger-700)' },
    };
    const style = map[status] || { bg: 'var(--gray-100)', color: 'var(--gray-600)' };
    return (
      <span
        style={{
          padding: '3px 10px',
          borderRadius: '999px',
          fontSize: '0.75rem',
          fontWeight: 600,
          background: style.bg,
          color: style.color,
        }}
      >
        {status}
      </span>
    );
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Request a Role</h1>
        <p>
          You are currently a <strong>{user?.role}</strong>. Submit a request to
          become an Admin or Retailer.
        </p>
      </div>

      {/* ── Submit Request Form ────────────────── */}
      {!hasPending ? (
        <div className="section-panel" style={{ maxWidth: 520, marginBottom: 'var(--space-xl)' }}>
          <h3 style={{ marginBottom: 'var(--space-md)', fontSize: '1rem' }}>
            New Role Request
          </h3>

          {error && <div className="error-msg">{error}</div>}
          {success && (
            <div className="info-box info-box--success" style={{ marginBottom: 'var(--space-md)' }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Requested Role</label>
              <select
                value={requestedRole}
                onChange={(e) => setRequestedRole(e.target.value as 'ADMIN' | 'RETAIL')}
              >
                <option value="ADMIN">Admin</option>
                <option value="RETAIL">Retailer</option>
              </select>
            </div>
            <div className="form-group">
              <label>Reason (optional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why do you need this role?"
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.9rem',
                  border: '1.5px solid var(--gray-200)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.925rem',
                  color: 'var(--gray-800)',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      ) : (
        <div
          className="info-box info-box--warning"
          style={{ marginBottom: 'var(--space-xl)', maxWidth: 520 }}
        >
          You already have a pending role request. Please wait for the super admin to review it.
        </div>
      )}

      {/* ── Request History ────────────────────── */}
      {requests.length > 0 && (
        <>
          <div className="section-header">
            <h2>Your Request History</h2>
          </div>
          <div className="section-panel" style={{ maxWidth: 700 }}>
            <table>
              <thead>
                <tr>
                  <th>Requested Role</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
                      {r.requestedRole}
                    </td>
                    <td className="text-muted text-sm">
                      {r.reason || '—'}
                    </td>
                    <td>{statusBadge(r.status)}</td>
                    <td className="text-muted text-sm">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
