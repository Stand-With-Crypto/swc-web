import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { fragmentDTSIPersonCard } from '@/data/dtsi/fragments/fragmentDTSIPersonCard'
import { fragmentDTSIPersonTableRow } from '@/data/dtsi/fragments/fragmentDTSIPersonTableRow'
import { DTSI_AllPeopleQuery, DTSI_AllPeopleQueryVariables } from '@/data/dtsi/generated'
import { REPLACE_ME__captureException } from '@/utils/shared/captureException'
import _ from 'lodash'

export const query = /* GraphQL */ `
  query AllPeople {
    people(limit: 1500, offset: 0) {
      ...PersonTableRow
    }
  }
  ${fragmentDTSIPersonTableRow}
`
/*
Because this request returns so many results, we should ensure we're only triggering this logic in cached endpoints/routes
*/
export const queryDTSIAllPeople = async () => {
  const results = await fetchDTSI<DTSI_AllPeopleQuery, DTSI_AllPeopleQueryVariables>(query)
  if (results.people.length === 1500) {
    REPLACE_ME__captureException(
      new Error(
        'Previous limit set in queryDTSIAllPeople has been reached, we should consider re-evaluating our architecture',
      ),
    )
  }
  return results
}
