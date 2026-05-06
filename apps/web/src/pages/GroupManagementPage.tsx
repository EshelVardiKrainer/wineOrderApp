import { useEffect, useState } from 'react';
import { groupMembersApi } from '../api/client';
import type { IGroup } from '@wine-order-app/shared-types';

export function GroupManagementPage() {
  const [groups, setGroups] = useState<IGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const g = await groupMembersApi.getMyGroups();
      setGroups(g);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleApprove = async (groupId: string, userId: string) => {
    await groupMembersApi.approveMember(groupId, userId);
    await fetchGroups();
  };

  const handleRoleChange = async (groupId: string, userId: string, role: string) => {
    await groupMembersApi.changeMemberRole(groupId, userId, { role });
    await fetchGroups();
  };

  const handleInvite = async (groupId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      await groupMembersApi.inviteUser(groupId, { email: inviteEmail });
      setInviteEmail('');
      await fetchGroups();
      alert('Invited Successfully!');
    } catch (e: any) {
      alert(e.message || 'Failed to invite');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="card page-card">
      <h2>My Groups & Membership</h2>
      {groups.length === 0 && <p>You aren't active in any groups.</p>}
      
      {groups.map(g => {
        // Assume active user is OWNER or MANAGER if they are exploring this view.
        return (
          <div key={g.id} style={{ border: '1px solid #eee', padding: '1rem', marginBottom: '1rem' }}>
            <h3>{g.name} - {g.status}</h3>
            <p>Location: {g.shippingSite?.name}</p>

            <div style={{ marginTop: '1rem' }}>
              <h4>Members</h4>
              <ul>
                {g.members?.map(m => (
                  <li key={m.id} style={{ marginBottom: '0.5rem' }}>
                    {m.user?.name} ({m.user?.email}) - Role: {m.role} - Status: {m.status}
                    
                    {m.status === 'PENDING' && (
                      <button style={{ marginLeft: '1rem' }} onClick={() => handleApprove(g.id, m.userId)}>
                        Approve Join
                      </button>
                    )}
                    
                    {m.status === 'ACTIVE' && m.role !== 'OWNER' && (
                      <select 
                        value={m.role} 
                        onChange={(e) => handleRoleChange(g.id, m.userId, e.target.value)}
                        style={{ marginLeft: '1rem' }}
                      >
                        <option value="MEMBER">MEMBER</option>
                        <option value="MANAGER">MANAGER</option>
                      </select>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <h4>Invite someone new</h4>
              <form onSubmit={(e) => handleInvite(g.id, e)} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="email" 
                  placeholder="Enter email to invite" 
                  value={inviteEmail} 
                  onChange={(e) => setInviteEmail(e.target.value)} 
                />
                <button type="submit">Invite</button>
              </form>
            </div>
          </div>
        );
      })}
    </div>
  );
}
