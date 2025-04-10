import useSWR, { SWRConfiguration } from 'swr'

import { queryDTSIAllPeople } from '@/data/dtsi/queries/queryDTSIAllPeople'
import { fetchReq } from '@/utils/shared/fetchReq'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { apiUrls } from '@/utils/shared/urls'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'

/*
To prevent excessive initial page load size, we lazy load the majority of the data for this page via api endpoint.
The static data is just the first "screen" of the politicians table
*/
export function useGetAllPeople(countryCode: SupportedCountryCodes, options?: SWRConfiguration) {
  return useSWR(
    apiUrls.dtsiAllPeople({ countryCode }),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as Awaited<ReturnType<typeof queryDTSIAllPeople>>)
        .catch(catchUnexpectedServerErrorAndTriggerToast),
    options,
  )
}
