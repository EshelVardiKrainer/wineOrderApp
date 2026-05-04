import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { useTranslation } from 'react-i18next';

export function HomePage() {
  const user = useAuthStore((s) => s.user);
  const { t } = useTranslation();

  return (
    <div className="animate-in">
      <div className="masthead">
        <div className="container">
          <h1>{t('home.welcome')}</h1>
          <p>{t('home.subtitle')}</p>
        </div>
      </div>

      <div className="container">
        <div className="grid">
          <div className="wine-card">
            <h3>{t('home.browseWines')}</h3>
            <p>{t('home.browseWinesDesc')}</p>
            <Link to="/wines" className="btn btn--primary">
              {t('home.viewCatalog')}
            </Link>
          </div>

          {user && (
            <>
              <div className="wine-card">
                <h3>{t('home.yourCart')}</h3>
                <p>{t('home.yourCartDesc')}</p>
                <Link to="/cart" className="btn btn--primary">
                  {t('home.viewCart')}
                </Link>
              </div>

              <div className="wine-card">
                <h3>{t('home.groupOrders')}</h3>
                <p>{t('home.groupOrdersDesc')}</p>
                <Link to="/group-orders" className="btn btn--primary">
                  {t('home.viewOrders')}
                </Link>
              </div>
            </>
          )}

          {!user && (
            <div className="wine-card">
              <h3>{t('home.signIn')}</h3>
              <p>{t('home.signInDesc')}</p>
              <Link to="/login" className="btn btn--primary">
                {t('home.signIn')}
              </Link>
            </div>
          )}
        </div>

        {user && (
          <div className="wine-card" style={{ marginTop: '2rem' }}>
            <h2>{t('home.welcomeBack', { name: user.name })}</h2>
            <p>{t('home.welcomeBackDesc')}</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/my-orders" className="btn btn--secondary">
                {t('home.myOrders')}
              </Link>
              {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                <Link to="/admin" className="btn btn--secondary">
                  {t('home.adminPanel')}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}