import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'
import type { PostGridSenderContact } from '@/validation/fields/zodPostGridAddress'

/**
 * SUITE 2, LEVEL 1
 * 9-11 GROSVENOR STREET
 * NEUTRAL BAY NSW 2089
 */
export const AU_USER_ACTION_LETTER_SENDER_ADDRESS: Omit<PostGridSenderContact, 'metadata'> = {
  addressLine1: '9-11 Grosvenor Street',
  addressLine2: 'Suite 2, Level 1',
  city: 'Neutral Bay',
  provinceOrState: 'NSW',
  postalOrZip: '2089',
  countryCode: 'AU',
  firstName: 'Stand With Crypto',
  lastName: '',
}

const AU_LETTER_TEMPLATE_IDS = {
  test: 'template_iUD4isUdA8kz8BpCc3c6F3',
  live: 'template_9AKHp5vdWnzEsgy6eD9Nwo',
} as const

export const AU_USER_ACTION_LETTER_TEMPLATE_ID =
  NEXT_PUBLIC_ENVIRONMENT === 'production'
    ? AU_LETTER_TEMPLATE_IDS.live
    : AU_LETTER_TEMPLATE_IDS.test
