import { SupportedLocale } from '@/intl/locales'

export type PageProps<Params = object> = {
  params: Params & {
    locale: SupportedLocale
  }
  searchParams?: { [key: string]: string | string[] | undefined }
}

// ensures that optional fields are at least queried for in graphql requests
export type PartialButDefined<T> = {
  [P in keyof T]: T[P] | undefined | null
}
