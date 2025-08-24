// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi) // Loads translations from your /public/locales folder
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    fallbackLng: 'en', // Use 'en' if the detected language is not available
    debug: true, // Logs info to the console; remove in production
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
  });

export default i18n;