'use client'

import { createContext, useContext, useEffect, useState } from 'react'

import {
  COUNTRY_CODE_TO_SUPPORTED_LOCALES,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { SupportedLocale } from '@/utils/shared/supportedLocales'

interface LanguageContextType {
  locale: SupportedLocale
  setLocale: (locale: SupportedLocale) => void
  availableLocales: SupportedLocale[]
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const LANGUAGE_STORAGE_KEY = 'preferred_language'

function getStoredLanguage(): SupportedLocale | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLocale | null
  } catch {
    return null
  }
}

function setStoredLanguage(locale: SupportedLocale): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, locale)
  } catch {
    // Silently fail if localStorage is not available
  }
}

function getPreferredLocale(
  countryCode: SupportedCountryCodes,
  availableLocales: SupportedLocale[],
): SupportedLocale {
  // 1. Check localStorage first
  const storedLanguage = getStoredLanguage()
  if (storedLanguage && availableLocales.includes(storedLanguage)) {
    return storedLanguage
  }

  // 2. Check browser language
  if (typeof window !== 'undefined') {
    const browserLang = navigator.language
    const matchingLocale = availableLocales.find(locale => locale === browserLang)
    if (matchingLocale) {
      return matchingLocale
    }
  }

  // 3. Fall back to first available locale
  return availableLocales[0]
}

interface LanguageProviderProps {
  children: React.ReactNode
  countryCode: SupportedCountryCodes
}

export function LanguageProvider({ children, countryCode }: LanguageProviderProps) {
  const availableLocales = COUNTRY_CODE_TO_SUPPORTED_LOCALES[countryCode]

  // Initialize with default locale to avoid hydration mismatch
  const [locale, setLocaleState] = useState<SupportedLocale>(availableLocales[0])
  const [isInitialized, setIsInitialized] = useState(false)

  const setLocale = (newLocale: SupportedLocale) => {
    setLocaleState(newLocale)
    setStoredLanguage(newLocale)
  }

  // On mount, load the preferred language from localStorage
  useEffect(() => {
    const preferredLocale = getPreferredLocale(countryCode, availableLocales)
    setLocaleState(preferredLocale)
    setIsInitialized(true)
  }, [countryCode, availableLocales])

  // Update document lang attribute when locale changes
  useEffect(() => {
    if (isInitialized) {
      document.documentElement.lang = locale
    }
  }, [locale, isInitialized])

  return (
    <LanguageContext.Provider value={{ locale, setLocale, availableLocales }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Convenience hook to get translation function
export function useTranslation<T extends Record<SupportedLocale, any>>(
  translations: T,
): T[SupportedLocale] {
  const { locale } = useLanguage()
  return translations[locale] || translations[SupportedLocale.EN_US]
}
