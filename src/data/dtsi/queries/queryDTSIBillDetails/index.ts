import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { DTSI_BillDetailsQuery, DTSI_BillDetailsQueryVariables } from '@/data/dtsi/generated'
import { dtsiBillDetailsQueryString } from '@/data/dtsi/queries/queryDTSIBillDetails/dtsiBillDetailsQueryString'

export type DTSIBillDetails = DTSI_BillDetailsQuery['bill']

export const queryDTSIBillDetails = async (id: string) => {
  const results = await fetchDTSI<DTSI_BillDetailsQuery, DTSI_BillDetailsQueryVariables>(
    dtsiBillDetailsQueryString,
    {
      id,
    },
  )

  return results.bill
}
