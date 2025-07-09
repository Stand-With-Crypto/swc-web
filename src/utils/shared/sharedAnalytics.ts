import { Address } from '@prisma/client'

export enum AnalyticComponentType {
  banner = 'Banner',
  button = 'Button',
  card = 'Card',
  chart = 'Chart',
  dropdown = 'Dropdown',
  link = 'Link',
  page = 'Page',
  modal = 'Modal',
  table = 'Table',
  searchBar = 'Search Bar',
  text = 'Text',
  textInput = 'Text Input',
  checkbox = 'Checkbox',
}

export enum AnalyticActionType {
  blur = 'Blur',
  click = 'Click',
  change = 'Change',
  dismiss = 'Dismiss',
  focus = 'Focus',
  hover = 'Hover',
  select = 'Select',
  move = 'Move',
  render = 'Render',
  scroll = 'Scroll',
  view = 'View',
  search = 'Search',
  keyPress = 'Key Press',
}

export interface AnalyticProperties {
  action?: AnalyticActionType
  component?: AnalyticComponentType
  [key: string]: string | number | boolean | undefined | null | Date | string[] | number[]
}

export interface AnalyticsPeopleProperties {
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
