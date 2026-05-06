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

  return (
    <div className="container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <div className="payment-success-content">
        <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>✅</div>
        
        <h1 style={{ 
          color: 'var(--success-700)', 
          marginBottom: '1rem',
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)'
        }}>
          {t('payment.successTitle', 'Payment Successful!')}
        </h1>
        
        <p style={{ 
          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', 
          color: 'var(--gray-600)', 
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 2rem'
        }}>
          {t('payment.successMessage', 'Thank you for your purchase! Your wine order has been processed successfully.')}
        </p>

        {orderId && (
          <div className="order-details" style={{
            background: 'var(--gray-50)',
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            margin: '2rem auto',
            maxWidth: '400px'
          }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--gray-800)' }}>
              {t('payment.orderDetails', 'Order Details')}
            </h3>
            <p><strong>{t('payment.orderId', 'Order ID')}:</strong> {orderId}</p>
            {paymentId && <p><strong>{t('payment.paymentId', 'Payment ID')}:</strong> {paymentId}</p>}
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginTop: '2rem'
        }}>
          <Link to="/my-orders" className="btn btn--primary">
            {t('payment.viewOrders', 'View My Orders')}
          </Link>
          <Link to="/wines" className="btn btn--secondary">
            {t('payment.continueShopping', 'Continue Shopping')}
          </Link>
          <Link to="/" className="btn btn--ghost">
            {t('payment.backHome', 'Back to Home')}
          </Link>
        </div>
      </div>
    </div>
  );
}