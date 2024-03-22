import { DTSIPersonCard } from '@/components/app/dtsiPersonCard'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { DTSI_PersonRoleCategory, DTSI_StateSpecificInformationQuery } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import {
  formatDTSIPersonRoleId,
  NormalizedDTSIPersonRoleId,
  normalizeDistrictFromDTSIPersonRoleToId,
} from '@/utils/dtsi/dtsiPersonRoleUtils'
import {
  formatStateSpecificDTSIPerson,
  StateSpecificDTSIPerson,
} from '@/utils/dtsi/stateSpecificDTSIPerson'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { getIntlUrls } from '@/utils/shared/urls'
import { getUSStateNameFromStateCode } from '@/utils/shared/usStateUtils'
import { maybeWithOrdinalSuffix } from '@/utils/web/withOrdinalSuffix'

interface LocationStateSpecificProps extends DTSI_StateSpecificInformationQuery {
  stateCode: string
  locale: SupportedLocale
}

function getTitle({ stateCode }: { stateCode: string }) {
  const stateName = getUSStateNameFromStateCode(stateCode)
  return `See where ${stateName} politicians stand on crypto`
}
function getDescription({ stateCode }: { stateCode: string }) {
  const stateName = getUSStateNameFromStateCode(stateCode)
  return `We asked ${stateName} politicians for their thoughts on crypto. Here's what they said.`
}

function organizeStateSpecificPeople(people: DTSI_StateSpecificInformationQuery['people']) {
  const formatted = people.map(formatStateSpecificDTSIPerson)
  const grouped = {
    current: {
      senators: [] as StateSpecificDTSIPerson[],
      congresspeople: [] as StateSpecificDTSIPerson[],
    },
    runningFor: {
      senators: [] as StateSpecificDTSIPerson[],
      congresspeople: {} as Record<
        string,
        { district: NormalizedDTSIPersonRoleId; people: StateSpecificDTSIPerson[] }
      >,
    },
  }
  formatted.forEach(person => {
    if (person.currentStateSpecificRole) {
      if (person.currentStateSpecificRole.roleCategory === DTSI_PersonRoleCategory.SENATE) {
        grouped.current.senators.push(person)
      } else if (
        person.currentStateSpecificRole.roleCategory === DTSI_PersonRoleCategory.CONGRESS
      ) {
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
      if (person.runningForStateSpecificRole.roleCategory === DTSI_PersonRoleCategory.SENATE) {
        grouped.runningFor.senators.push(person)
      } else if (
        person.runningForStateSpecificRole.roleCategory === DTSI_PersonRoleCategory.CONGRESS
      ) {
        const district = normalizeDistrictFromDTSIPersonRoleToId(person.runningForStateSpecificRole)
        if (district) {
          if (!grouped.runningFor.congresspeople[district]) {
            grouped.runningFor.congresspeople[district] = { district, people: [] }
          }
          grouped.runningFor.congresspeople[district].people.push(person)
        }
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

export function LocationStateSpecific({ stateCode, people, locale }: LocationStateSpecificProps) {
  const groups = organizeStateSpecificPeople(people)
  const urls = getIntlUrls(locale)
  return (
    <div className="container space-y-20">
      <div className="space-y-6">
        <PageTitle>{getTitle({ stateCode })}</PageTitle>
        <PageSubTitle>{getDescription({ stateCode })}</PageSubTitle>
      </div>
      <section className="space-y-10">
        <PageTitle as="h3" size="md">
          Current Senators
        </PageTitle>
        {groups.current.senators.map(person => (
          <DTSIPersonCard key={person.id} locale={locale} person={person} />
        ))}
      </section>
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
          Running for Senate
        </PageTitle>
        {groups.runningFor.senators.map(person => (
          <DTSIPersonCard key={person.id} locale={locale} person={person} />
        ))}
      </section>

      <section className="space-y-10">
        <PageTitle as="h3" size="md">
          Running for Congress
        </PageTitle>
        {Object.values(groups.runningFor.congresspeople).map(group => (
          <div className="space-y-10" key={group.district}>
            <PageSubTitle as="h4">
              <InternalLink
                href={urls.locationDistrictSpecific({ stateCode, district: group.district })}
              >
                {`${formatDTSIPersonRoleId(group.district)} District`}
              </InternalLink>
            </PageSubTitle>
            {group.people.map(person => (
              <DTSIPersonCard key={person.id} locale={locale} person={person} />
            ))}
          </div>
        ))}
      </section>
    </div>
  )
}
LocationStateSpecific.getTitle = getTitle
LocationStateSpecific.getDescription = getTitle
