import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../stores/cart.store';
export function PaymentSuccessPage() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const clearCart = useCartStore((s) => s.clearCart);
    const orderId = searchParams.get('orderID');
    const paymentId = searchParams.get('paymentID');
    useEffect(() => {
        // Clear cart on successful payment
        clearCart();
    }, [clearCart]);
    return (_jsx("div", { className: "container", style: { textAlign: 'center', padding: '4rem 2rem' }, children: _jsxs("div", { className: "payment-success-content", children: [_jsx("div", { style: { fontSize: '4rem', marginBottom: '2rem' }, children: "\u2705" }), _jsx("h1", { style: {
                        color: 'var(--success-700)',
                        marginBottom: '1rem',
                        fontSize: 'clamp(1.5rem, 4vw, 2.5rem)'
                    }, children: t('payment.successTitle', 'Payment Successful!') }), _jsx("p", { style: {
                        fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                        color: 'var(--gray-600)',
                        marginBottom: '2rem',
                        maxWidth: '600px',
                        margin: '0 auto 2rem'
                    }, children: t('payment.successMessage', 'Thank you for your purchase! Your wine order has been processed successfully.') }), orderId && (_jsxs("div", { className: "order-details", style: {
                        background: 'var(--gray-50)',
                        padding: '1.5rem',
                        borderRadius: 'var(--radius-md)',
                        margin: '2rem auto',
                        maxWidth: '400px'
                    }, children: [_jsx("h3", { style: { marginBottom: '1rem', color: 'var(--gray-800)' }, children: t('payment.orderDetails', 'Order Details') }), _jsxs("p", { children: [_jsxs("strong", { children: [t('payment.orderId', 'Order ID'), ":"] }), " ", orderId] }), paymentId && _jsxs("p", { children: [_jsxs("strong", { children: [t('payment.paymentId', 'Payment ID'), ":"] }), " ", paymentId] })] })), _jsxs("div", { style: {
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        marginTop: '2rem'
                    }, children: [_jsx(Link, { to: "/my-orders", className: "btn btn--primary", children: t('payment.viewOrders', 'View My Orders') }), _jsx(Link, { to: "/wines", className: "btn btn--secondary", children: t('payment.continueShopping', 'Continue Shopping') }), _jsx(Link, { to: "/", className: "btn btn--ghost", children: t('payment.backHome', 'Back to Home') })] })] }) }));
}
//# sourceMappingURL=PaymentSuccessPage.js.map