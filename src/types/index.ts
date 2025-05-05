import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export interface PageProps<Params = object> {
  params: Promise<
    Params & {
      countryCode: SupportedCountryCodes
    }
  >
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

// ensures that optional fields are at least queried for in graphql requests
export type PartialButDefined<T> = {
  [P in keyof T]: T[P] | undefined | null
}
