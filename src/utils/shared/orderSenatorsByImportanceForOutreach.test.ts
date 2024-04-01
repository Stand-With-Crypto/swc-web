import { expect, it } from '@jest/globals'

import { orderSenatorsByImportanceForOutreach } from '@/utils/shared/orderSenatorsByImportanceForOutreach'

it('correctly orders list', () => {
  const results = [
    'not---in-priority-list',
    'mike---crapo',
    'jack---reed',
    'sherrod---brown',
    'tim---scott',
    'not---in-priority-list-2',
  ]
  expect(
    orderSenatorsByImportanceForOutreach(results.map(slug => ({ slug }))).map(({ slug }) => slug),
  ).toMatchInlineSnapshot(`
[
  "tim---scott",
  "sherrod---brown",
  "jack---reed",
  "mike---crapo",
  "not---in-priority-list",
  "not---in-priority-list-2",
]
`)
})
