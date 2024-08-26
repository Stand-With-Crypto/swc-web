import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIBillCard } from '@/data/dtsi/fragments/fragmentDTSIBillCard'
import { DTSI_AllBillsQuery, DTSI_AllBillsQueryVariables } from '@/data/dtsi/generated'

const query = /* GraphQL */ `
  query AllBills {
    bills {
      ...BillCard
    }
  }
  ${fragmentDTSIBillCard}
`

export const queryDTSIAllBills = async () => {
  const results = await fetchDTSI<DTSI_AllBillsQuery, DTSI_AllBillsQueryVariables>(query)

  return results.bills
}
