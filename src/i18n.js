// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector'; // 1. Import the plugin

i18n
  .use(HttpApi)
  .use(LanguageDetector) // 2. Add the plugin to i18next
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    // 3. Configure the detector
    detection: {
      order: ['localStorage', 'navigator'], // Check localStorage first, then the browser language
      caches: ['localStorage'], // Save the chosen language to localStorage
    },
  });

export default i18n;