import { useMemo } from 'react'

import { StateList } from '@/components/app/pageLocalPolicy/common/stateList'
import { Section } from '@/components/app/pageLocalPolicy/common/statePage/section'
import { states } from '@/components/app/pageLocalPolicy/us/config'
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
    const statesList = Object.entries(states).map(([code, name]) => ({
      code,
      name,
      url: urls.localPolicy(code),
    }))

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
