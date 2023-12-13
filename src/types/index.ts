import { SUPPORTED_LOCALE } from '@/utils/shared/locales'

export type PageProps<Params = object> = {
  params: Params & {
    lang: SUPPORTED_LOCALE
  }
}
