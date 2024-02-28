import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { NextRequest } from 'next/server'
import { Config } from 'next-i18n-router/dist/types'

/*
  This function is copy pasted over from 
  https://github.com/i18nexus/next-i18n-router/blob/main/src/localeDetector.ts
  We're just changing the console.warn to console.log so our vercel error logs
  are not cluttered with locale header redirects from 'en' and '*' to 'en-US'
*/

export function localeDetector(request: NextRequest, config: Config): string {
  const negotiatorHeaders: Record<string, string> = {}

  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages()

  // match can only use specifically formatted locales
  // https://stackoverflow.com/questions/76447732/nextjs-13-i18n-incorrect-locale-information-provided
  try {
    return match(languages, config.locales, config.defaultLocale)
  } catch (e) {
    console.log(`No valid locales in accept-language header: ${languages.join(', ')}`)
    console.log(`Reverting to using defaultLocale: ${config.defaultLocale}`)

    return config.defaultLocale
  }
}
