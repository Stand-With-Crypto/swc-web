import { expect, it } from '@jest/globals'

import { DTSI_PersonRoleCategory } from '@/data/dtsi/generated'
import { orderDTSICongressionalDistrictResults } from '@/utils/shared/orderSenatorsByImportanceForOutreach'

it('correctly orders list', () => {
  const results = [
    {
      slug: 'senator--not-in-list-with-b-last-name',
      lastName: 'BSenator',
      primaryRole: { roleCategory: DTSI_PersonRoleCategory.SENATE },
    },
    {
      slug: 'senator--not-in-list-with-a-last-name',
      lastName: 'ASenator',
      primaryRole: { roleCategory: DTSI_PersonRoleCategory.SENATE },
    },
    {
      slug: 'mike---crapo',
      lastName: 'Crapo',
      primaryRole: { roleCategory: DTSI_PersonRoleCategory.SENATE },
    },
    {
      slug: 'sherrod---brown',
      lastName: 'Brown',
      primaryRole: { roleCategory: DTSI_PersonRoleCategory.SENATE },
    },
    {
      slug: 'tim---scott',
      lastName: 'Scott',
      primaryRole: { roleCategory: DTSI_PersonRoleCategory.SENATE },
    },
    {
      slug: 'congressperson--not-in-list',
      lastName: 'CCongressPerson',
      primaryRole: { roleCategory: DTSI_PersonRoleCategory.CONGRESS },
    },
  ]
  expect(orderDTSICongressionalDistrictResults(results).map(({ slug }) => slug))
    .toMatchInlineSnapshot(`
[
  "congressperson--not-in-list",
  "tim---scott",
  "sherrod---brown",
  "mike---crapo",
  "senator--not-in-list-with-a-last-name",
  "senator--not-in-list-with-b-last-name",
]
`)
})
