import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function PaymentCancelPage() {
  const { t } = useTranslation();

  return (
    <div className="container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <div className="payment-cancel-content">
        <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>⚠️</div>
        
        <h1 style={{ 
          color: 'var(--warning-700)', 
          marginBottom: '1rem',
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)'
        }}>
          {t('payment.cancelTitle', 'Payment Cancelled')}
        </h1>
        
        <p style={{ 
          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', 
          color: 'var(--gray-600)', 
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 2rem'
        }}>
          {t('payment.cancelMessage', 'Your payment was cancelled. Your cart items are still saved and ready for checkout.')}
        </p>

        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginTop: '2rem'
        }}>
          <Link to="/cart" className="btn btn--primary">
            {t('payment.backToCart', 'Back to Cart')}
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