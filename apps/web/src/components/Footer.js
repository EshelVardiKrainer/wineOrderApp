import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';
export function Footer() {
    const { t } = useTranslation();
    return (_jsx("footer", { className: "app-footer", children: _jsxs("div", { className: "footer-content", children: [_jsx("div", { className: "footer-left", children: _jsxs("span", { children: ["\u00A9 2024 ", t('nav.brand')] }) }), _jsx("div", { className: "footer-right", children: _jsx(LanguageSwitcher, {}) })] }) }));
}
//# sourceMappingURL=Footer.js.map