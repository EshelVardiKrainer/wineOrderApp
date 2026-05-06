import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { groupsApi } from '../api/client';
export function GroupRequestPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
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
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await groupsApi.requestGroup(formData);
            setSuccess(true);
            setTimeout(() => navigate('/group-orders'), 3000);
        }
        catch (err) {
            setError(err.message || 'Failed to request group');
        }
        finally {
            setLoading(false);
        }
    };
    if (success) {
        return (_jsxs("div", { className: "card page-card", style: { textAlign: 'center' }, children: [_jsx("h2", { children: "Group Requested Successfully!" }), _jsx("p", { children: "Your request has been sent to the administrators for approval. You will receive an email once it is approved." }), _jsx("p", { children: "Redirecting to Group Orders..." })] }));
    }
    return (_jsxs("div", { className: "card page-card", style: { maxWidth: '600px', margin: '0 auto' }, children: [_jsx("h2", { children: "Request a New Group" }), _jsx("p", { children: "Create a new group in a specific new physical location. Administrators will review your request." }), error && _jsx("div", { className: "alert-error", style: { marginBottom: '1rem', color: 'red' }, children: error }), _jsxs("form", { onSubmit: handleSubmit, style: { display: 'flex', flexDirection: 'column', gap: '1rem' }, children: [_jsxs("div", { children: [_jsx("label", { children: "Group Name" }), _jsx("input", { type: "text", required: true, value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), style: { width: '100%', padding: '0.5rem' } })] }), _jsxs("fieldset", { style: { padding: '1rem', border: '1px solid #ccc' }, children: [_jsx("legend", { children: "Location Details" }), _jsxs("div", { style: { marginBottom: '1rem' }, children: [_jsx("label", { children: "Location Name (e.g. \"Google Office\")" }), _jsx("input", { type: "text", required: true, value: formData.shippingSiteDetails.name, onChange: (e) => setFormData({
                                            ...formData,
                                            shippingSiteDetails: { ...formData.shippingSiteDetails, name: e.target.value }
                                        }), style: { width: '100%', padding: '0.5rem' } })] }), _jsxs("div", { style: { marginBottom: '1rem' }, children: [_jsx("label", { children: "Street Address" }), _jsx("input", { type: "text", required: true, value: formData.shippingSiteDetails.address, onChange: (e) => setFormData({
                                            ...formData,
                                            shippingSiteDetails: { ...formData.shippingSiteDetails, address: e.target.value }
                                        }), style: { width: '100%', padding: '0.5rem' } })] }), _jsxs("div", { children: [_jsx("label", { children: "City" }), _jsx("input", { type: "text", required: true, value: formData.shippingSiteDetails.city, onChange: (e) => setFormData({
                                            ...formData,
                                            shippingSiteDetails: { ...formData.shippingSiteDetails, city: e.target.value }
                                        }), style: { width: '100%', padding: '0.5rem' } })] })] }), _jsx("button", { type: "submit", disabled: loading, style: { padding: '0.75rem', marginTop: '1rem' }, children: loading ? 'Submitting...' : 'Submit Request' })] })] }));
}
//# sourceMappingURL=GroupRequestPage.js.map