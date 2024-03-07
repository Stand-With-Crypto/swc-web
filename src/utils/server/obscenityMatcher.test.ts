import { describe, expect, it } from '@jest/globals'

import { hasBadWord } from './obscenityMatcher'

describe('utils/server/hasBadWord', () => {
  it.each([['Fickes'], ['Murdock'], ['Dickerson'], ['Haydock'], ['dock']])(
    'should not have false positives - %p',
    word => {
      expect(hasBadWord(word)).toBe(false)
    },
  )

  it.each([['fuck'], ['fick'], ['fock'], ['fuuuuck'], ['bitch'], ['ass'], ['arse'], ['dick']])(
    'should detect obscenity with variants - %p',
    word => {
      expect(hasBadWord(word)).toBe(true)
    },
  )
})
