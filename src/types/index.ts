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
