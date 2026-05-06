import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useTranslation } from 'react-i18next';
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';
export function PayPalCheckout({ amount, currency, items = [], onSuccess, onError, onCancel }) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    if (!PAYPAL_CLIENT_ID) {
        return (_jsx("div", { className: "payment-error", children: _jsx("p", { children: "PayPal is not configured. Please contact support." }) }));
    }
    const initialOptions = {
        clientId: PAYPAL_CLIENT_ID,
        currency: currency,
        intent: 'capture',
        components: 'buttons',
        'data-sdk-integration-source': 'sandbox',
        enableFunding: ['paypal', 'card', 'paylater'],
        disableFunding: ['venmo'],
        buyerCountry: 'IL',
        locale: 'en_US'
    };
    const createOrder = async () => {
        try {
            setLoading(true);
            const orderData = {
                amount: {
                    value: amount,
                    currency_code: currency
                },
                description: `Wine order - ${items.length} items`,
                items: items.map(item => ({
                    name: item.name,
                    quantity: item.quantity.toString(),
                    unit_amount: {
                        value: item.price.toFixed(2),
                        currency_code: currency
                    }
                }))
            };
            const response = await fetch('/api/payments/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(orderData)
            });
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to create order');
            }
            return result.orderId;
        }
        catch (error) {
            console.error('Error creating PayPal order:', error);
            onError(error);
            throw error;
        }
        finally {
            setLoading(false);
        }
    };
    const onApprove = async (data) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/payments/orders/${data.orderID}/capture`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || 'Failed to capture payment');
            }
            onSuccess({
                orderID: data.orderID,
                paymentID: result.captureId,
                payerID: data.payerID,
                status: result.status,
                amount: result.amount
            });
        }
        catch (error) {
            console.error('Error capturing PayPal payment:', error);
            onError(error);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "paypal-checkout", children: _jsx(PayPalScriptProvider, { options: initialOptions, children: _jsxs("div", { className: "payment-section", children: [_jsx("h3", { children: t('cart.paymentTitle', 'Complete Your Purchase') }), _jsx("div", { className: "payment-summary", children: _jsxs("div", { className: "payment-row", children: [_jsxs("span", { children: [t('cart.total', 'Total'), ":"] }), _jsxs("span", { className: "amount", children: [currency === 'ILS' ? '₪' : '$', amount] })] }) }), loading && (_jsx("div", { className: "payment-loading", children: _jsxs("p", { children: [t('common.loading', 'Loading'), "..."] }) })), _jsx(PayPalButtons, { style: {
                            layout: 'vertical',
                            color: 'gold',
                            shape: 'rect',
                            label: 'paypal',
                            height: 45
                        }, createOrder: createOrder, onApprove: onApprove, onError: (err) => {
                            console.error('PayPal Error:', err);
                            onError(err);
                        }, onCancel: () => {
                            console.log('PayPal payment cancelled');
                            onCancel?.();
                        }, disabled: loading }), _jsx("div", { className: "payment-methods-info", children: _jsx("p", { className: "payment-note", children: t('cart.paymentNote', 'Secure payment with PayPal. Supports credit cards, Apple Pay, and Google Pay.') }) })] }) }) }));
}
//# sourceMappingURL=PayPalCheckout.js.map