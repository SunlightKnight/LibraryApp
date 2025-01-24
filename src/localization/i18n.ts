import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import stringsIT from "./it/strings.json"
import stringsEN from "./en/strings.json"
import { getLocales } from 'react-native-localize';

// For more info on how I18n works: https://react.i18next.com/

export const resources = {
  // The two languages available, imported at lines 3 and 4.
  it: { translation: stringsIT },
  en: { translation: stringsEN }
}

// "locale" contain the device current locale, so the app starts
// by displaying the correct language. If no match is found, "fallBackLng" (line 26)
// is used instead.
const locale = getLocales()[0].languageCode

i18n.use(initReactI18next).init({
  resources,
  lng: locale,
  fallbackLng: "it",
  interpolation: {
    escapeValue: false,
    },
 });

export default i18n;