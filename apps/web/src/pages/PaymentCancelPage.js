import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
export function PaymentCancelPage() {
    const { t } = useTranslation();
    return (_jsx("div", { className: "container", style: { textAlign: 'center', padding: '4rem 2rem' }, children: _jsxs("div", { className: "payment-cancel-content", children: [_jsx("div", { style: { fontSize: '4rem', marginBottom: '2rem' }, children: "\u26A0\uFE0F" }), _jsx("h1", { style: {
                        color: 'var(--warning-700)',
                        marginBottom: '1rem',
                        fontSize: 'clamp(1.5rem, 4vw, 2.5rem)'
                    }, children: t('payment.cancelTitle', 'Payment Cancelled') }), _jsx("p", { style: {
                        fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                        color: 'var(--gray-600)',
                        marginBottom: '2rem',
                        maxWidth: '600px',
                        margin: '0 auto 2rem'
                    }, children: t('payment.cancelMessage', 'Your payment was cancelled. Your cart items are still saved and ready for checkout.') }), _jsxs("div", { style: {
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        marginTop: '2rem'
                    }, children: [_jsx(Link, { to: "/cart", className: "btn btn--primary", children: t('payment.backToCart', 'Back to Cart') }), _jsx(Link, { to: "/wines", className: "btn btn--secondary", children: t('payment.continueShopping', 'Continue Shopping') }), _jsx(Link, { to: "/", className: "btn btn--ghost", children: t('payment.backHome', 'Back to Home') })] })] }) }));
}
//# sourceMappingURL=PaymentCancelPage.js.map