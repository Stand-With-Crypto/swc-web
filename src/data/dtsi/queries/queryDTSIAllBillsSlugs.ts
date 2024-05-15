import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { DTSI_AllBillsSlugsQuery, DTSI_AllBillsSlugsQueryVariables } from '@/data/dtsi/generated'

export const query = /* GraphQL */ `
  query AllBillsSlugs {
    bills {
      id
      slug
    }
  }
`

export const queryDTSIAllBillsSlugs = async () => {
  const results = await fetchDTSI<DTSI_AllBillsSlugsQuery, DTSI_AllBillsSlugsQueryVariables>(query)

  return results
}
