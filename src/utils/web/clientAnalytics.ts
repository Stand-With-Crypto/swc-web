// TODO align on the naming conventions for all these analytics
// There are internal best practices, but depending on the tool we end up leveraging, we might need to change the naming conventions

import { logger } from '@/utils/shared/logger'

// TODO expand this list as needed
export enum ClientAnalyticComponentType {
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

export enum ClientAnalyticActionType {
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

export type ClientAnalyticProperties = {
  action?: ClientAnalyticActionType
  component?: ClientAnalyticComponentType
  // TODO determine what property types the analytics library we end up using will support
  [key: string]: any
}

export function initAnalytics(sessionId: string) {
  // TODO replace with actual analytics solution
}

export function trackClientAnalytic(eventName: string, eventProperties: ClientAnalyticProperties) {
  logger.custom(
    `%canalytics - %c ${eventName}`,
    'color: #00aaff',
    'color: #FCFDFB',
    eventProperties,
  )
  // TODO replace with actual analytics solution
}

export function trackFormSubmitted(formName: string) {
  trackClientAnalytic('Form Submitted', { 'Form Name': formName })
}

export function trackFormSubmitSucceeded(formName: string) {
  trackClientAnalytic('Form Submit Succeeded', { 'Form Name': formName })
}

export function trackFormSubmitErrored(formName: string, other?: ClientAnalyticProperties) {
  trackClientAnalytic('Form Submit Errored', { 'Form Name': formName, ...other })
}
