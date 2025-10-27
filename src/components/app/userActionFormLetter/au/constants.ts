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
