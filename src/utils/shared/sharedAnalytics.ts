// TODO align on the naming conventions for all these analytics
// There are internal best practices, but depending on the tool we end up leveraging, we might need to change the naming conventions

import { customLogger, logger } from '@/utils/shared/logger'

// TODO expand this list as needed
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
