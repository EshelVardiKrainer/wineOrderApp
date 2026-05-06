import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import { Wine, LogIn, ShoppingCart, Users, ClipboardList, Settings } from 'lucide-react';

const CARDS_GUEST: { icon: ReactNode; titleKey: string; descKey: string; labelKey: string; to: string }[] = [
  { icon: <Wine size={28} />, titleKey: 'home.browseWines', descKey: 'home.browseWinesDesc', labelKey: 'home.viewCatalog', to: '/wines' },
  { icon: <LogIn size={28} />, titleKey: 'home.signIn',     descKey: 'home.signInDesc',      labelKey: 'home.signIn',      to: '/login' },
];

const CARDS_USER: { icon: ReactNode; titleKey: string; descKey: string; labelKey: string; to: string }[] = [
  { icon: <Wine size={28} />,          titleKey: 'home.browseWines', descKey: 'home.browseWinesDesc', labelKey: 'home.viewCatalog', to: '/wines' },
  { icon: <ShoppingCart size={28} />,  titleKey: 'home.yourCart',    descKey: 'home.yourCartDesc',    labelKey: 'home.viewCart',    to: '/cart' },
  { icon: <Users size={28} />,         titleKey: 'home.groupOrders', descKey: 'home.groupOrdersDesc', labelKey: 'home.viewOrders',  to: '/group-orders' },
  { icon: <ClipboardList size={28} />, titleKey: 'home.myOrders',    descKey: 'home.welcomeBackDesc', labelKey: 'home.myOrders',    to: '/my-orders' },
];

export function HomePage() {
  const user = useAuthStore((s) => s.user);
  const { t } = useTranslation();

  const cards = user ? CARDS_USER : CARDS_GUEST;

  return (
    <div className="animate-in">
      {/* Hero */}
      <div className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-badge" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Wine size={14} /> Wine Market
          </div>
          <h1 className="home-hero-title">{t('home.welcome')}</h1>
          <p className="home-hero-sub">{t('home.subtitle')}</p>
          {user && (
            <p className="home-hero-welcome">{t('home.welcomeBack', { name: user.name.split(' ')[0] })}</p>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="container">
        <div className="home-cards">
          {cards.map((card) => (
            <div key={card.to} className="home-card">
              <div className="home-card-icon">{card.icon}</div>
              <div className="home-card-body">
                <h3 className="home-card-title">{t(card.titleKey)}</h3>
                <p className="home-card-desc">{t(card.descKey)}</p>
              </div>
              <Link to={card.to} className="btn btn--primary home-card-btn">
                {t(card.labelKey)} →
              </Link>
            </div>
          ))}
          {user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
            <div className="home-card home-card--dark">
              <div className="home-card-icon"><Settings size={28} /></div>
              <div className="home-card-body">
                <h3 className="home-card-title" style={{ color: 'var(--gold-300)' }}>{t('home.adminPanel')}</h3>
                <p className="home-card-desc" style={{ color: 'rgba(255,255,255,0.55)' }}>{t('home.welcomeBackDesc')}</p>
              </div>
              <Link to="/admin" className="btn home-card-btn" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
                {t('home.adminPanel')} →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
