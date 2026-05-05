import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import pl from './locales/pl.json'

export const i18n = createI18n({
  legacy: false,
  locale: 'pl',
  fallbackLocale: 'en',
  messages: { en, pl },
  pluralRules: {
    pl: (choice) => {
      if (choice === 0) return 0
      if (choice === 1) return 1
      const mod10 = choice % 10
      const mod100 = choice % 100
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 2
      return 3
    },
  },
})
