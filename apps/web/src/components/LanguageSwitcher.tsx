import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'he', name: 'עברית' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    // Update document direction for RTL languages
    document.dir = langCode === 'he' ? 'rtl' : 'ltr';
  };

  return (
    <div className="language-switcher">
      <button 
        className="language-switcher-btn"
        onClick={() => {
          const nextLang = i18n.language === 'en' ? 'he' : 'en';
          changeLanguage(nextLang);
        }}
        title="Switch Language"
      >
        <span className="language-name">{currentLanguage.name}</span>
      </button>
    </div>
  );
}