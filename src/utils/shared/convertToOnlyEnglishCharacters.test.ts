import { describe, expect, it } from '@jest/globals'

import { convertToOnlyEnglishCharacters } from '@/utils/shared/convertToOnlyEnglishCharacters'

describe('utils/shared/convertToOnlyEnglishCharacters', () => {
  it.each([
    ['Giménez', 'Gimenez'],
    ['Díaz-Balart', 'Diaz-Balart'],
  ])('%p should match %p', (input, output) => {
    expect(convertToOnlyEnglishCharacters(input)).toEqual(output)
  })
})
