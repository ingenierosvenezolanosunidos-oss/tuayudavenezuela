import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from '../locales/es.json'
import en from '../locales/en.json'

const savedLang = localStorage.getItem('lang')
const browserLang = navigator.language.startsWith('en') ? 'en' : 'es'

i18next
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    lng: savedLang ?? browserLang,
    fallbackLng: 'es',
    interpolation: { escapeValue: false },
  })

export default i18next
