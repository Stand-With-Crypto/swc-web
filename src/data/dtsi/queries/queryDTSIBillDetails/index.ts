import * as Sentry from '@sentry/nextjs'

import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { DTSI_BillDetailsQuery, DTSI_BillDetailsQueryVariables } from '@/data/dtsi/generated'
import { dtsiBillDetailsQueryString } from '@/data/dtsi/queries/queryDTSIBillDetails/dtsiBillDetailsQueryString'

export type DTSIBillDetails = DTSI_BillDetailsQuery['bill']

export const queryDTSIBillDetails = (id: string) =>
  fetchDTSI<DTSI_BillDetailsQuery, DTSI_BillDetailsQueryVariables>(dtsiBillDetailsQueryString, {
    id,
  })
    .then(res => res.bill)
    .catch(error => {
      Sentry.captureException(error, {
        extra: { id },
        tags: { domain: 'queryDTSIBillDetails' },
      })
      return null
    })
