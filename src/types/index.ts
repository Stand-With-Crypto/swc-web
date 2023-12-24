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

// https://stackoverflow.com/a/47375979
export type CommonProperties<A, B> = {
  [P in keyof A & keyof B]: A[P] | B[P]
}

export type MaybeAuthenticatedApiResponse<T extends (...args: any[]) => Promise<any>> =
  | Awaited<ReturnType<T>>
  | { authenticated: false }
