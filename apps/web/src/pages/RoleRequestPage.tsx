import { useEffect, useState } from 'react';
import { roleRequestsApi } from '../api/client';
import { useAuthStore } from '../stores/auth.store';
import type { IRoleRequest } from '@wine-order-app/shared-types';

const STATUS_STYLES: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  PENDING:  { color: 'var(--warning-700)', bg: 'var(--warning-50)', border: 'rgba(245,158,11,0.2)',  icon: '⏳' },
  APPROVED: { color: 'var(--success-700)', bg: 'var(--success-50)', border: 'rgba(16,185,129,0.2)',  icon: '✅' },
  DENIED:   { color: 'var(--danger-700)',  bg: 'var(--danger-50)',  border: 'rgba(239,68,68,0.2)',   icon: '❌' },
};

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

  useEffect(() => { fetchRequests(); }, []);

  const hasPending = requests.some((r) => r.status === 'PENDING');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await roleRequestsApi.create({ requestedRole, reason: reason || undefined });
      setSuccess('Your role request has been submitted successfully. A super admin will review it shortly.');
      setReason('');
      await fetchRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Request a Role</h1>
        <p>
          You're currently a <strong style={{ color: 'var(--wine-700)' }}>{user?.role}</strong>.
          Submit a request to upgrade your access level.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-xl)', alignItems: 'start' }}>
        <div>
          {/* ── Form / Pending Notice ── */}
          {!hasPending ? (
            <div className="section-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-xl)' }}>
                <div style={{
                  width: 44, height: 44,
                  background: 'var(--wine-50)',
                  border: '1px solid var(--wine-100)',
                  borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem',
                }}>🔑</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem' }}>New Role Request</h3>
                  <p className="text-muted text-sm" style={{ marginTop: 2 }}>
                    Requests are reviewed by the super administrator
                  </p>
                </div>
              </div>

              {error && <div className="error-msg">{error}</div>}
              {success && (
                <div className="info-box info-box--success" style={{ marginBottom: 'var(--space-lg)' }}>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Requested Role</label>
                  <select value={requestedRole} onChange={(e) => setRequestedRole(e.target.value as 'ADMIN' | 'RETAIL')}>
                    <option value="ADMIN">Admin — Manage group orders and wines</option>
                    <option value="RETAIL">Retailer — Access retail pricing and features</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Reason (optional)</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Briefly explain why you need this role..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '1.5px solid var(--gray-200)',
                      borderRadius: 'var(--radius-sm)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.925rem',
                      color: 'var(--gray-800)',
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--wine-400)';
                      e.currentTarget.style.boxShadow = '0 0 0 4px var(--wine-50)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--gray-200)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <button type="submit" className="btn btn--primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Request →'}
                </button>
              </form>
            </div>
          ) : (
            <div className="section-panel" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>⏳</div>
              <h3 style={{ marginBottom: 'var(--space-sm)' }}>Request Under Review</h3>
              <p className="text-muted" style={{ maxWidth: 360, margin: '0 auto' }}>
                Your role request is pending review. The super admin will approve or deny it shortly. You'll be notified once a decision is made.
              </p>
            </div>
          )}

          {/* ── History ── */}
          {requests.length > 0 && (
            <div className="section-panel" style={{ marginTop: 'var(--space-lg)' }}>
              <h3 style={{ marginBottom: 'var(--space-lg)', fontFamily: 'var(--font-display)' }}>Request History</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Requested Role</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => {
                      const s = STATUS_STYLES[r.status] ?? STATUS_STYLES.PENDING;
                      return (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{r.requestedRole}</td>
                          <td className="text-muted text-sm" style={{ maxWidth: 200 }}>{r.reason || '—'}</td>
                          <td>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '4px 12px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: s.bg,
                              color: s.color,
                              border: `1px solid ${s.border}`,
                            }}>
                              {s.icon} {r.status}
                            </span>
                          </td>
                          <td className="text-muted text-sm">{new Date(r.createdAt).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Info Panel ── */}
        <div>
          <div className="section-panel" style={{ background: 'linear-gradient(155deg, var(--wine-950), var(--wine-800))', border: 'none', color: 'white' }}>
            <h3 style={{ color: 'white', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-lg)' }}>Available Roles</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {[
                { role: 'Admin', icon: '⚙️', desc: 'Create and manage group orders, wines, and shipping sites.' },
                { role: 'Retailer', icon: '🏪', desc: 'Access wholesale pricing and retailer-specific features.' },
              ].map(({ role, icon, desc }) => (
                <div key={role} style={{
                  padding: 'var(--space-md)',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                    <strong style={{ color: 'var(--gold-300)', fontSize: '0.9rem' }}>{role}</strong>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', margin: 0, lineHeight: 1.55 }}>{desc}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 'var(--space-lg)', paddingTop: 'var(--space-lg)', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
              Role changes take effect immediately upon approval.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
