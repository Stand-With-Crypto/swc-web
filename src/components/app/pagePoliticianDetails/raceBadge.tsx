import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { DTSI_PersonRoleCategory } from '@/data/dtsi/generated'
import { DTSIPersonDetails } from '@/data/dtsi/queries/queryDTSIPersonDetails'
import { SupportedLocale } from '@/intl/locales'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { getIntlUrls } from '@/utils/shared/urls'
import { getUSStateNameFromStateCode, USStateCode } from '@/utils/shared/usStateUtils'

export function RaceBadge({
  person,
  locale,
  runningRole,
}: {
  person: DTSIPersonDetails
  locale: SupportedLocale
  runningRole?: DTSIPersonDetails['roles'][0]
}) {
  if (!runningRole) {
    return null
  }

  const urls = getIntlUrls(locale)

  const getBadgeText = () => {
    if (!runningRole) {
      return null
    }
    const { roleCategory, primaryState } = runningRole
    const name = dtsiPersonFullName(person)

    if (
      roleCategory === DTSI_PersonRoleCategory.PRESIDENT ||
      roleCategory === DTSI_PersonRoleCategory.VICE_PRESIDENT
    ) {
      const roleDisplayName =
        roleCategory === DTSI_PersonRoleCategory.PRESIDENT ? 'president' : 'vice president'
      return `${name} is running for ${roleDisplayName} on November 5th`
    }

    return `${name} is running for office ${primaryState ? `in ${getUSStateNameFromStateCode(primaryState as USStateCode)} ` : ''}on November 5th`
  }

  const getRacePageUrl = () => {
    const { roleCategory, primaryState, primaryDistrict } = runningRole
    const parsedState = primaryState as USStateCode
    if (
      roleCategory === DTSI_PersonRoleCategory.PRESIDENT ||
      roleCategory === DTSI_PersonRoleCategory.VICE_PRESIDENT
    ) {
      return urls.locationUnitedStatesPresidential()
    }

    if (roleCategory === DTSI_PersonRoleCategory.SENATE && parsedState) {
      return urls.locationStateSpecificSenateRace(parsedState)
    }

    if (Number(primaryDistrict) && parsedState) {
      return urls.locationDistrictSpecific({
        stateCode: parsedState,
        district: Number(primaryDistrict),
      })
    }

    return parsedState ? urls.locationStateSpecific(parsedState) : urls.locationUnitedStates()
  }

  return (
    <Link href={getRacePageUrl()}>
      <Badge
        className="mb-14 flex w-full items-center justify-between gap-8 rounded-2xl p-6 text-sm md:text-base"
        variant="primary-cta-subtle"
      >
        <p className="font-normal">{getBadgeText()}.</p>
        <p className="min-w-max">View race</p>
      </Badge>
    </Link>
  )
}
