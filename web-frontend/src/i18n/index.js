import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import cs from './cs.json';

const resources = {
  cs: {
    translation: cs,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('bbx_lang') || 'cs',
  fallbackLng: 'cs',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
