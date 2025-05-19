'use client'
import useSWR from 'swr'

import { Header } from '@/components/app/pageLocalPolicy/common/statePage/header'
import { GetAdvocatesCountByStateDataResponse } from '@/data/pageSpecific/getAdvocatesCountByStateData'
import { useSession } from '@/hooks/useSession'
import { fetchReq } from '@/utils/shared/fetchReq'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLocale } from '@/utils/shared/supportedLocales'
import { apiUrls } from '@/utils/shared/urls'
import { intlNumberFormat } from '@/utils/web/intlNumberFormat'

const CTA_LABEL = 'Join SWC'

const formatNumber = intlNumberFormat(SupportedLocale.EN_US).format

interface UsHeaderProps {
  countryCode: SupportedCountryCodes
  initialTotalAdvocates: number
  stateCode: string
  stateName: string
}

export function UsHeader({
  countryCode,
  initialTotalAdvocates,
  stateCode,
  stateName,
}: UsHeaderProps) {
  const session = useSession()

  const { data } = useSWR(
    apiUrls.advocatesCountByState(stateCode),
    url =>
      fetchReq(url)
        .then(response => response.json())
        .then(value => value as GetAdvocatesCountByStateDataResponse),
    {
      fallbackData: { advocatesCountByState: initialTotalAdvocates },
    },
  )

  const HEADER_TITLE = stateName
  const HEADER_DESCRIPTION = `${formatNumber(data.advocatesCountByState)} ${data.advocatesCountByState < 2 ? 'advocate' : 'advocates'} in ${stateName}`

  return (
    <Header>
      <Header.Shield countryCode={countryCode} stateCode={stateCode} />

      <Header.Title>{HEADER_TITLE}</Header.Title>
      <Header.SubTitle>{HEADER_DESCRIPTION}</Header.SubTitle>

      {!session.isLoggedIn && <Header.CTA>{CTA_LABEL}</Header.CTA>}
    </Header>
  )
}
