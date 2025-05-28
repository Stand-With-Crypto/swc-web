'use client'

import { Header } from '@/components/app/pageLocalPolicy/common/statePage/header'
import { useApiAdvocatesCountByState } from '@/hooks/useApiAdvocatesCountByState'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useSession } from '@/hooks/useSession'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SupportedLocale } from '@/utils/shared/supportedLocales'
import { intlNumberFormat } from '@/utils/web/intlNumberFormat'

const CTA_LABEL = 'Join SWC'

interface UsHeaderProps {
  countryCode: SupportedCountryCodes
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

export function UsHeader({
  countryCode,
  initialTotalAdvocates,
  stateCode,
  stateName,
}: UsHeaderProps) {
  const session = useSession()

  const hasHydrated = useHasHydrated()

  const { data } = useApiAdvocatesCountByState(
    { advocatesCountByState: initialTotalAdvocates },
    stateCode,
  )

  const headerTitle = stateName
  const headerDescription = `${getHeaderDescription(data.advocatesCountByState)} in ${stateName}`

  const isCTAVisible = hasHydrated && !session.isLoggedIn

  return (
    <Header>
      <Header.Shield countryCode={countryCode} stateCode={stateCode} />

      <Header.Title>{headerTitle}</Header.Title>
      <Header.SubTitle>{headerDescription}</Header.SubTitle>

      {isCTAVisible && <Header.CTA>{CTA_LABEL}</Header.CTA>}
    </Header>
  )
}
