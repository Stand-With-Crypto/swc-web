import { SupportedLocale } from '@/intl/locales'
import { MessageDescriptor } from 'react-intl'

export type PageProps<Params = object> = {
  params: Params & {
    locale: SupportedLocale
  }
}

export type GetDefineMessageResults<T extends Record<string, MessageDescriptor>> = Record<
  keyof T,
  string
>

export type MaybeAuthenticatedApiResponse<T extends (...args: any[]) => Promise<any>> =
  | Awaited<ReturnType<T>>
  | { authenticated: false }

// ensures that optional fields are at least queried for in graphql requests
export type PartialButDefined<T> = {
  [P in keyof T]: T[P] | undefined | null
}
