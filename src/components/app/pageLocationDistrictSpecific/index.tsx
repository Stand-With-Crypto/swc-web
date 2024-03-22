import { DTSIPersonCard } from '@/components/app/dtsiPersonCard'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import {
  DTSI_DistrictSpecificInformationQuery,
  DTSI_PersonRoleCategory,
} from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import {
  formatDTSIPersonRoleId,
  NormalizedDTSIPersonRoleId,
} from '@/utils/dtsi/dtsiPersonRoleUtils'
import {
  formatStateSpecificDTSIPerson,
  StateSpecificDTSIPerson,
} from '@/utils/dtsi/stateSpecificDTSIPerson'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { getUSStateNameFromStateCode } from '@/utils/shared/usStateUtils'

interface LocationDistrictSpecificProps extends DTSI_DistrictSpecificInformationQuery {
  stateCode: string
  district: NormalizedDTSIPersonRoleId
  locale: SupportedLocale
}

function getTitle({
  stateCode,
  district,
}: Pick<LocationDistrictSpecificProps, 'stateCode' | 'district'>) {
  const stateName = getUSStateNameFromStateCode(stateCode)
  return `See where politicians in the ${formatDTSIPersonRoleId(district)} of ${stateName} stand on crypto`
}
function getDescription({
  stateCode,
  district,
}: Pick<LocationDistrictSpecificProps, 'stateCode' | 'district'>) {
  const stateName = getUSStateNameFromStateCode(stateCode)
  return `We asked politicians in the ${formatDTSIPersonRoleId(district)} of ${stateName} for their thoughts on crypto. Here's what they said.`
}

function organizeStateSpecificPeople(people: DTSI_DistrictSpecificInformationQuery['people']) {
  const formatted = people.map(formatStateSpecificDTSIPerson)
  const grouped = {
    current: {
      congresspeople: [] as StateSpecificDTSIPerson[],
    },
    runningFor: {
      congresspeople: [] as StateSpecificDTSIPerson[],
    },
  }
  formatted.forEach(person => {
    if (person.currentStateSpecificRole) {
      if (person.currentStateSpecificRole.roleCategory === DTSI_PersonRoleCategory.CONGRESS) {
        grouped.current.congresspeople.push(person)
      } else {
        gracefullyError({
          msg: 'Unexpected currentStateSpecificRole',
          fallback: null,
          hint: { extra: { person } },
        })
      }
    }
    if (person.runningForStateSpecificRole) {
      if (person.runningForStateSpecificRole.roleCategory === DTSI_PersonRoleCategory.CONGRESS) {
        grouped.runningFor.congresspeople.push(person)
      } else {
        gracefullyError({
          msg: 'Unexpected runningForStateSpecificRole',
          fallback: null,
          hint: { extra: { person } },
        })
      }
    }
  })
  return grouped
}

export function LocationDistrictSpecific({
  stateCode,
  district,
  people,
  locale,
}: LocationDistrictSpecificProps) {
  const groups = organizeStateSpecificPeople(people)
  return (
    <div className="container space-y-20">
      <div className="space-y-6">
        <PageTitle>{getTitle({ stateCode, district })}</PageTitle>
        <PageSubTitle>{getDescription({ stateCode, district })}</PageSubTitle>
      </div>
      <section className="space-y-10">
        <PageTitle as="h3" size="md">
          Current Congresspeople
        </PageTitle>
        {groups.current.congresspeople.map(person => (
          <DTSIPersonCard key={person.id} locale={locale} person={person} />
        ))}
      </section>
      <section className="space-y-10">
        <PageTitle as="h3" size="md">
          Running for Congress
        </PageTitle>
        {groups.runningFor.congresspeople.map(person => (
          <DTSIPersonCard key={person.id} locale={locale} person={person} />
        ))}
      </section>
    </div>
  )
}
LocationDistrictSpecific.getTitle = getTitle
LocationDistrictSpecific.getDescription = getTitle
