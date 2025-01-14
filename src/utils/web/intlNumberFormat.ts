import { SupportedLocale } from '@/utils/shared/supportedLocales'

// wrapper around Intl.NumberFormat that includes some legacy browser compat fixes
export function intlNumberFormat(locale: SupportedLocale, args?: Intl.NumberFormatOptions) {
  // https://stackoverflow.com/a/41045289
  if (args?.maximumFractionDigits !== undefined && args?.minimumFractionDigits === undefined) {
    args.minimumFractionDigits = args.maximumFractionDigits
  }
  return new Intl.NumberFormat(locale, args)
}
