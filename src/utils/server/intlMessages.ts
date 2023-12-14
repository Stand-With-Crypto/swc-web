import 'server-only'
import { SUPPORTED_LOCALE } from '@/utils/shared/locales'

// TODO
const mockIntlMessages = async (locale: SUPPORTED_LOCALE) => {
  switch (locale) {
    case 'es':
      return {
        hello: 'hola',
        world: 'mundo',
      }
    default:
      return {
        hello: 'hello',
        world: 'world',
      }
  }
}

export const getIntlMessages = async (locale: SUPPORTED_LOCALE) => {
  return mockIntlMessages(locale)
}
