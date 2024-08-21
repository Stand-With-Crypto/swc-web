import { Address } from '@prisma/client'

export enum AnalyticComponentType {
  button = 'Button',
  card = 'Card',
  dropdown = 'Dropdown',
  page = 'Page',
  modal = 'Modal',
  text = 'Text',
}

export enum AnalyticActionType {
  click = 'Click',
  view = 'View',
}

export type AnalyticProperties = {
  action?: AnalyticActionType
  component?: AnalyticComponentType
  [key: string]: string | number | boolean | undefined | null | Date | string[] | number[]
}

export type AnalyticsPeopleProperties = {
  // https://docs.mixpanel.com/docs/data-structure/user-profiles#reserved-user-properties
  // if we end up using other tools, we might need to map these reserved names to other values
  $email?: string
  $phone?: string
  $name?: string
  [key: string]: string | number | boolean | undefined | null | Date | string[] | number[]
}

export function convertAddressToAnalyticsProperties(
  address: Pick<
    Address,
    'administrativeAreaLevel1' | 'administrativeAreaLevel2' | 'countryCode' | 'locality'
  >,
) {
  return {
    'Address Administrative Area Level 1': address.administrativeAreaLevel1,
    'Address Administrative Area Level 2': address.administrativeAreaLevel2,
    'Address Country Code': address.countryCode,
    'Address Locality': address.locality,
  }
}
