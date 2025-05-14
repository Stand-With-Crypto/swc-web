import { HeaderSection } from '@/components/app/pageLocalPolicy/components/header'
import { PoliticiansSection } from '@/components/app/pageLocalPolicy/components/politicians'
import { LocalPolicyStatePageProps } from '@/components/app/pageLocalPolicy/components/types'
import { getStateNameResolver } from '@/utils/shared/stateUtils'

export function LocalPolicyStatePage({ countryCode, stateCode }: LocalPolicyStatePageProps) {
  const stateNameResolver = getStateNameResolver(countryCode)
  const stateName = stateNameResolver(stateCode.toUpperCase())

  return (
    <section className="standard-spacing-from-navbar container mb-16 space-y-20">
      <HeaderSection countryCode={countryCode} stateCode={stateCode} stateName={stateName} />

      <PoliticiansSection countryCode={countryCode} stateCode={stateCode} stateName={stateName} />
    </section>
  )
}
