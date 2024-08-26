import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import {
  DTSI_BillRelationShipByPersonQuery,
  DTSI_BillRelationShipByPersonQueryVariables,
} from '@/data/dtsi/generated'

const query = /* GraphQL */ `
  query BillRelationShipByPerson($billId: String!, $personSlugIn: [String!]) {
    bill(id: $billId) {
      relationships(personSlugIn: $personSlugIn) {
        relationshipType
      }
    }
  }
`

export async function queryDTSIBillRelationshipByPerson({
  personSlug,
  ...variables
}: Omit<DTSI_BillRelationShipByPersonQueryVariables, 'personSlugIn'> & { personSlug: string }) {
  const result = await fetchDTSI<
    DTSI_BillRelationShipByPersonQuery,
    DTSI_BillRelationShipByPersonQueryVariables
  >(query, {
    ...variables,
    personSlugIn: [personSlug],
  })

  // Have to make it nullable, there's a possibility of that person not having a relationship with that bill
  return result.bill.relationships[0] as (typeof result.bill.relationships)[0] | undefined
}
