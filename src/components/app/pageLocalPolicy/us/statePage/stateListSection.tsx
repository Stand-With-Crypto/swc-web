import { useMemo } from 'react'

import { StateList } from '@/components/app/pageLocalPolicy/common/stateList'
import { Section } from '@/components/app/pageLocalPolicy/common/statePage/section'
import { US_MAIN_STATE_CODE_WITH_DC_TO_DISPLAY_NAME_MAP } from '@/utils/shared/stateMappings/usStateUtils'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

const STATE_LIST_SECTION_TITLE = 'Other states'
const STATE_LIST_SECTION_SUBTITLE = 'Dive deeper and discover races in other states.'

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

const urls = getIntlUrls(countryCode)

interface UsStateListSectionProps {
  stateCode: string
}

export function UsStateListSection({ stateCode }: UsStateListSectionProps) {
  const otherStates = useMemo(() => {
    const statesList = Object.entries(US_MAIN_STATE_CODE_WITH_DC_TO_DISPLAY_NAME_MAP)
      .map(([code, name]) => ({
        code,
        name,
        url: urls.localPolicy(code),
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    return statesList.filter(({ code }) => code !== stateCode)
  }, [stateCode])

  return (
    <Section>
      <Section.Title>{STATE_LIST_SECTION_TITLE}</Section.Title>
      <Section.SubTitle>{STATE_LIST_SECTION_SUBTITLE}</Section.SubTitle>

      <StateList>
        <StateList.Content states={otherStates} />
      </StateList>
    </Section>
  )
}
