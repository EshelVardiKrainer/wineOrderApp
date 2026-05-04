import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-left">
          <span>© 2024 {t('nav.brand')}</span>
        </div>
        <div className="footer-right">
          <LanguageSwitcher />
        </div>
      </div>
    </footer>
  );
}