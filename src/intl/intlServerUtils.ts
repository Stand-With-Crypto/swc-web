import 'server-only'

import { MessageDescriptor } from 'react-intl'
import { IntlShape } from '@formatjs/intl'
// Copy pasting this fn from react-intl to prevent getting context errors when importing in the server environment
export function defineMessages<U extends Record<string, MessageDescriptor>>(msgs: U): U {
  return msgs
}

export const generateClientComponentMessages = <M extends ReturnType<typeof defineMessages>>(
  intl: IntlShape<string>,
  messages: M,
) => {
  const clientMessages: Record<string, string> = {}
  Object.entries(messages).forEach(([key, value]) => {
    clientMessages[key] = intl.formatMessage(value)
  })
  return clientMessages as Record<keyof M, string>
}
