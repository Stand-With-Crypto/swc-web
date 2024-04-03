import { expect } from '@jest/globals'

import { listOfThings } from '@/utils/web/listOfThings'

it('listOfThings works', () => {
  expect(listOfThings(['a']).join('')).toMatchInlineSnapshot(`"a"`)
  expect(listOfThings(['a', 'b']).join('')).toMatchInlineSnapshot(`"a and b"`)
  expect(listOfThings(['a', 'b', 'c']).join('')).toMatchInlineSnapshot(`"a, b, and c"`)
  expect(listOfThings(['a', 'b', 'c', 'd', 'e']).join('')).toMatchInlineSnapshot(
    `"a, b, c, d, and e"`,
  )
})
