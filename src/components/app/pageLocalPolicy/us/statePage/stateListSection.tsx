import { useMemo } from 'react'

import { StateList } from '@/components/app/pageLocalPolicy/common/stateList'
import { Section } from '@/components/app/pageLocalPolicy/common/statePage/section'
import { IntlUrls } from '@/components/app/pageLocalPolicy/common/types'

const STATE_LIST_SECTION_TITLE = 'Other states'
const STATE_LIST_SECTION_SUBTITLE = 'Dive deeper and discover races in other states.'

export function UsStateListSection({
  stateCode,
  states,
  urls,
}: {
  stateCode: string
  states: Record<string, string>
  urls: IntlUrls
}) {
  const otherStates = useMemo(() => {
    const statesList = Object.entries(states).map(([code, name]) => ({
      code,
      name,
      url: urls.localPolicy(code),
    }))

    return statesList.filter(({ code }) => code !== stateCode)
  }, [stateCode, states, urls])

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
