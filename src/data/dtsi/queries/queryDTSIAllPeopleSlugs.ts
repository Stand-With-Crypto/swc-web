import { fetchDTSI } from '@/data/dtsi/fetchDTSI'
import { DTSI_AllPeopleSlugsQuery, DTSI_AllPeopleSlugsQueryVariables } from '@/data/dtsi/generated'
import { REPLACE_ME__captureException } from '@/utils/shared/captureException'

export const query = /* GraphQL */ `
  query AllPeopleSlugs {
    people(limit: 1500, offset: 0) {
      slug
    }
  }
`
/*
Because this request returns so many results, we should ensure we're only triggering this logic in cached endpoints/routes
*/
export const queryDTSIAllPeopleSlugs = async () => {
  const results = await fetchDTSI<DTSI_AllPeopleSlugsQuery, DTSI_AllPeopleSlugsQueryVariables>(
    query,
  )
  if (results.people.length === 1500) {
    REPLACE_ME__captureException(
      new Error(
        'Previous limit set in queryDTSIAllPeopleSlugs has been reached, we should consider re-evaluating our architecture',
      ),
    )
  }
  return results
}
