'use client'

import { Header } from '@/components/app/pageLocalPolicy/common/statePage/header'
import { useApiAdvocatesCountByState } from '@/hooks/useApiAdvocatesCountByState'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useSession } from '@/hooks/useSession'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { SupportedLocale } from '@/utils/shared/supportedLocales'
import { intlNumberFormat } from '@/utils/web/intlNumberFormat'

const CTA_LABEL = 'Join SWC'

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

interface UsHeaderProps {
  initialTotalAdvocates: number
  stateCode: string
  stateName: string
}

function getHeaderDescription(advocatesCount: number) {
  if (advocatesCount === 0) {
    return 'No advocates'
  }

  if (advocatesCount === 1) {
    return '1 advocate'
  }

  const formatNumber = intlNumberFormat(SupportedLocale.EN_US).format

  return `${formatNumber(advocatesCount)} advocates`
}

export function UsHeader({ initialTotalAdvocates, stateCode, stateName }: UsHeaderProps) {
  const session = useSession()

  const hasHydrated = useHasHydrated()

  const { data } = useApiAdvocatesCountByState(
    { advocatesCountByState: initialTotalAdvocates },
    stateCode,
  )

  const isCTAVisible = hasHydrated && !session.isLoggedIn

  return (
    <Header>
      <Header.Shield countryCode={countryCode} stateCode={stateCode} />

      <Header.Title>{stateName}</Header.Title>
      <Header.SubTitle>
        {getHeaderDescription(data.advocatesCountByState)} in {stateName}
      </Header.SubTitle>

      {isCTAVisible && <Header.CTA>{CTA_LABEL}</Header.CTA>}
    </Header>
  )
}
