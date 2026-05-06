import { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons, ReactPayPalScriptOptions } from '@paypal/react-paypal-js';
import { useTranslation } from 'react-i18next';

interface PayPalCheckoutProps {
  amount: string;
  currency: 'USD' | 'ILS';
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  onCancel?: () => void;
}

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';

export function PayPalCheckout({ 
  amount, 
  currency, 
  items = [], 
  onSuccess, 
  onError, 
  onCancel 
}: PayPalCheckoutProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  if (!PAYPAL_CLIENT_ID) {
    return (
      <div className="payment-error">
        <p>PayPal is not configured. Please contact support.</p>
      </div>
    );
  }

  const initialOptions: ReactPayPalScriptOptions = {
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
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      onError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const onApprove = async (data: any) => {
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
    } catch (error) {
      console.error('Error capturing PayPal payment:', error);
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="paypal-checkout">
      <PayPalScriptProvider options={initialOptions}>
        <div className="payment-section">
          <h3>{t('cart.paymentTitle', 'Complete Your Purchase')}</h3>
          <div className="payment-summary">
            <div className="payment-row">
              <span>{t('cart.total', 'Total')}:</span>
              <span className="amount">
                {currency === 'ILS' ? '₪' : '$'}{amount}
              </span>
            </div>
          </div>
          
          {loading && (
            <div className="payment-loading">
              <p>{t('common.loading', 'Loading')}...</p>
            </div>
          )}
          
          <PayPalButtons
            style={{
              layout: 'vertical',
              color: 'gold',
              shape: 'rect',
              label: 'paypal',
              height: 45
            }}
            createOrder={createOrder}
            onApprove={onApprove}
            onError={(err) => {
              console.error('PayPal Error:', err);
              onError(err);
            }}
            onCancel={() => {
              console.log('PayPal payment cancelled');
              onCancel?.();
            }}
            disabled={loading}
          />
          
          <div className="payment-methods-info">
            <p className="payment-note">
              {t('cart.paymentNote', 'Secure payment with PayPal. Supports credit cards, Apple Pay, and Google Pay.')}
            </p>
          </div>
        </div>
      </PayPalScriptProvider>
    </div>
  );
}