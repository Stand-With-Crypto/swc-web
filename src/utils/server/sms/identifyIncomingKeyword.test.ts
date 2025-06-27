import { describe, expect, it } from '@jest/globals'

import { identifyIncomingKeyword } from '@/utils/server/sms/identifyIncomingKeyword'
import { getSMSMessages } from '@/utils/server/sms/messages'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'

const messages = getSMSMessages(DEFAULT_SUPPORTED_COUNTRY_CODE)

describe('identifyIncomingKeyword', () => {
  it.each([
    'STOP',
    'Stop',
    'Stop\n',
    'stop ',
    '\nSTOPALL',
    '   STop',
    'Stop it!',
    'STOPALL NOW',
    'UNSUBSCRIBE PLEASE',
    'CANCEL THIS',
    'END IT',
    'QUIT NOW',
    'STOP IMMEDIATELY',
    'stop,',
    'Stop to opt out',
    'Unsubscribe me',
    'Stop!',
    '	Stop 🛑',
    'Stop end',
  ])('should identify opt-out keyword: %s', keyword => {
    expect(identifyIncomingKeyword(keyword)?.isOptOutKeyword).toBe(true)
    expect(identifyIncomingKeyword(keyword)?.isHelpKeyword).toBe(false)
    expect(identifyIncomingKeyword(keyword)?.isUnstopKeyword).toBe(false)
    expect(identifyIncomingKeyword(keyword)?.isUnidentifiedKeyword).toBe(false)
  })

  it.each(['HELP', 'Help', 'help ', '\nHELP', '   Help'])(
    'should identify help keyword: %s',
    keyword => {
      expect(identifyIncomingKeyword(keyword)?.isHelpKeyword).toBe(true)
      expect(identifyIncomingKeyword(keyword)?.isOptOutKeyword).toBe(false)
      expect(identifyIncomingKeyword(keyword)?.isUnstopKeyword).toBe(false)
      expect(identifyIncomingKeyword(keyword)?.isUnidentifiedKeyword).toBe(false)
    },
  )

  it.each([
    'YES',
    'Yes',
    'yes ',
    'start ',
    '\nSTART',
    '   Start',
    'CONTINUE',
    '\nUNSTOP',
    '   Unstop',
  ])('should identify unstop keyword: %s', keyword => {
    expect(identifyIncomingKeyword(keyword)?.isUnstopKeyword).toBe(true)
    expect(identifyIncomingKeyword(keyword)?.isOptOutKeyword).toBe(false)
    expect(identifyIncomingKeyword(keyword)?.isHelpKeyword).toBe(false)
    expect(identifyIncomingKeyword(keyword)?.isUnidentifiedKeyword).toBe(false)
  })

  it.each([
    'HELP ME',
    'YES PLEASE',
    'START NOW',
    'CONTINUE PLEASE',
    'UNSTOP NOW',
    "Yes, let's make them stop!",
  ])('should not identify any keyword: %s', keyword => {
    expect(identifyIncomingKeyword(keyword)?.isOptOutKeyword).toBe(false)
    expect(identifyIncomingKeyword(keyword)?.isHelpKeyword).toBe(false)
    expect(identifyIncomingKeyword(keyword)?.isUnstopKeyword).toBe(false)
    expect(identifyIncomingKeyword(keyword)?.isUnidentifiedKeyword).toBe(true)
  })

  it.each([
    `Questioned “${messages.bulkWelcomeMessage}”`,
    `Liked “${messages.welcomeMessage}”`,
    `👍 to “${messages.welcomeMessage}”`,
  ])('should not identify text on reactions: %s', keyword => {
    expect(identifyIncomingKeyword(keyword)?.isOptOutKeyword).toBe(false)
    expect(identifyIncomingKeyword(keyword)?.isHelpKeyword).toBe(false)
    expect(identifyIncomingKeyword(keyword)?.isUnstopKeyword).toBe(false)
    expect(identifyIncomingKeyword(keyword)?.isUnidentifiedKeyword).toBe(false)
  })
})
