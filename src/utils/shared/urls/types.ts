import { getIntlUrls } from './index'

type FilterNeverKeys<T> = {
  [K in keyof T]: T[K] extends never ? never : K
}[keyof T]

type FunctionsKeys<K> = {
  // @ts-ignore
  [P in keyof K]: Parameters<K[P]>[0] extends undefined ? K[P] : never
}

type GetIntlUrlsReturnType = ReturnType<typeof getIntlUrls>

export type UrlDestinationsWithoutParams = FilterNeverKeys<FunctionsKeys<GetIntlUrlsReturnType>>
