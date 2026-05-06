import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { groupMembersApi } from '../api/client';
export function GroupManagementPage() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const fetchGroups = async () => {
        setLoading(true);
        try {
            const g = await groupMembersApi.getMyGroups();
            setGroups(g);
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchGroups();
    }, []);
    const handleApprove = async (groupId, userId) => {
        await groupMembersApi.approveMember(groupId, userId);
        await fetchGroups();
    };
    const handleRoleChange = async (groupId, userId, role) => {
        await groupMembersApi.changeMemberRole(groupId, userId, { role });
        await fetchGroups();
    };
    const handleInvite = async (groupId, e) => {
        e.preventDefault();
        if (!inviteEmail)
            return;
        try {
            await groupMembersApi.inviteUser(groupId, { email: inviteEmail });
            setInviteEmail('');
            await fetchGroups();
            alert('Invited Successfully!');
        }
        catch (e) {
            alert(e.message || 'Failed to invite');
        }
    };
    if (loading)
        return _jsx("div", { children: "Loading..." });
    return (_jsxs("div", { className: "card page-card", children: [_jsx("h2", { children: "My Groups & Membership" }), groups.length === 0 && _jsx("p", { children: "You aren't active in any groups." }), groups.map(g => {
                // Assume active user is OWNER or MANAGER if they are exploring this view.
                return (_jsxs("div", { style: { border: '1px solid #eee', padding: '1rem', marginBottom: '1rem' }, children: [_jsxs("h3", { children: [g.name, " - ", g.status] }), _jsxs("p", { children: ["Location: ", g.shippingSite?.name] }), _jsxs("div", { style: { marginTop: '1rem' }, children: [_jsx("h4", { children: "Members" }), _jsx("ul", { children: g.members?.map(m => (_jsxs("li", { style: { marginBottom: '0.5rem' }, children: [m.user?.name, " (", m.user?.email, ") - Role: ", m.role, " - Status: ", m.status, m.status === 'PENDING' && (_jsx("button", { style: { marginLeft: '1rem' }, onClick: () => handleApprove(g.id, m.userId), children: "Approve Join" })), m.status === 'ACTIVE' && m.role !== 'OWNER' && (_jsxs("select", { value: m.role, onChange: (e) => handleRoleChange(g.id, m.userId, e.target.value), style: { marginLeft: '1rem' }, children: [_jsx("option", { value: "MEMBER", children: "MEMBER" }), _jsx("option", { value: "MANAGER", children: "MANAGER" })] }))] }, m.id))) })] }), _jsxs("div", { style: { marginTop: '1rem' }, children: [_jsx("h4", { children: "Invite someone new" }), _jsxs("form", { onSubmit: (e) => handleInvite(g.id, e), style: { display: 'flex', gap: '0.5rem' }, children: [_jsx("input", { type: "email", placeholder: "Enter email to invite", value: inviteEmail, onChange: (e) => setInviteEmail(e.target.value) }), _jsx("button", { type: "submit", children: "Invite" })] })] })] }, g.id));
            })] }));
}
//# sourceMappingURL=GroupManagementPage.js.map