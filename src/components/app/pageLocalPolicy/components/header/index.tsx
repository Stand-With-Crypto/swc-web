'use client'
import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { HeaderSectionProps } from '@/components/app/pageLocalPolicy/components/types'
import { Button } from '@/components/ui/button'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { StateShield } from '@/components/ui/stateShield'
import { GetAdvocatesMapDataResponse } from '@/data/pageSpecific/getAdvocatesMapData'
import { useApiAdvocateMap } from '@/hooks/useApiAdvocateMap'
import { useSession } from '@/hooks/useSession'
import { SupportedLocale } from '@/utils/shared/supportedLocales'
import { intlNumberFormat } from '@/utils/web/intlNumberFormat'

const STATE_CTA_TEXT = 'Join SWC'

const formatNumber = intlNumberFormat(SupportedLocale.EN_US).format

export function HeaderSection({ countryCode, stateCode, stateName }: HeaderSectionProps) {
  const session = useSession()

  const { isLoading, data } = useApiAdvocateMap(
    {} as GetAdvocatesMapDataResponse,
    stateCode.toUpperCase(),
  )

  const totalAdvocates = isLoading
    ? 0
    : data.advocatesMapData.totalAdvocatesPerState[0].totalAdvocates

  const STATE_PAGE_TITLE = stateName
  const STATE_PAGE_DESCRIPTION = `${formatNumber(totalAdvocates)} ${totalAdvocates < 2 ? 'advocate' : 'advocates'} in ${stateName}`

  return (
    <div className="container mb-16 flex flex-col items-center gap-y-7">
      <StateShield countryCode={countryCode} size={150} state={stateCode} />

      <PageTitle>{STATE_PAGE_TITLE}</PageTitle>
      <PageSubTitle>{isLoading ? 'Loading...' : STATE_PAGE_DESCRIPTION}</PageSubTitle>

      {!session.isLoggedIn && (
        <LoginDialogWrapper>
          <Button variant="secondary">{STATE_CTA_TEXT}</Button>
        </LoginDialogWrapper>
      )}
    </div>
  )
}
