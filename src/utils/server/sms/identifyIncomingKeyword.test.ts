import { describe, expect, it } from '@jest/globals'

import { identifyIncomingKeyword } from '@/utils/server/sms/identifyIncomingKeyword'

describe('identifyIncomingKeyword', () => {
  it.each(['STOP', 'Stop', 'Stop\n', 'stop ', '\nSTOPALL', '   STop'])(
    'should identify opt-out keyword: %s',
    keyword => {
      expect(identifyIncomingKeyword(keyword)).toEqual({
        isOptOutKeyword: true,
        isHelpKeyword: false,
        isUnstopKeyword: false,
      })
    },
  )

  it.each(['HELP', 'Help', 'help ', '\nHELP', '   Help'])(
    'should identify help keyword: %s',
    keyword => {
      expect(identifyIncomingKeyword(keyword)).toEqual({
        isOptOutKeyword: false,
        isHelpKeyword: true,
        isUnstopKeyword: false,
      })
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
    expect(identifyIncomingKeyword(keyword)).toEqual({
      isOptOutKeyword: false,
      isHelpKeyword: false,
      isUnstopKeyword: true,
    })
  })
})
