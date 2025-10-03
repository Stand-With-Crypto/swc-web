'use client'
import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { DTSIPeopleFromAddress } from '@/components/app/userActionFormCallCongressperson'
import { DTSI_PersonRole, DTSI_PersonRoleCategory } from '@/data/dtsi/generated'
import { formatGetDTSIPeopleFromAddressNotFoundReason } from '@/hooks/useGetDTSIPeopleFromAddress'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { convertDTSIPersonStanceScoreToCryptoSupportLanguageSentence } from '@/utils/dtsi/dtsiStanceScoreUtils'
import { gracefullyError } from '@/utils/shared/gracefullyError'

function formatDTSICategory(role?: Pick<DTSI_PersonRole, 'roleCategory'> | null) {
  const { roleCategory } = role || {}
  switch (roleCategory) {
    case DTSI_PersonRoleCategory.SENATE:
      return 'senator'
    case DTSI_PersonRoleCategory.CONGRESS:
      return 'representative'
    case DTSI_PersonRoleCategory.GOVERNOR:
      return 'governor'
    case DTSI_PersonRoleCategory.ATTORNEY_GENERAL:
      return 'attorney general'
    case DTSI_PersonRoleCategory.MAYOR:
      return 'mayor'
    case DTSI_PersonRoleCategory.PRESIDENT:
      return 'president'
    case DTSI_PersonRoleCategory.VICE_PRESIDENT:
      return 'vice president'
    case DTSI_PersonRoleCategory.STATE_CONGRESS:
      return 'state representative'
    case DTSI_PersonRoleCategory.STATE_SENATE:
      return 'state senator'
    case DTSI_PersonRoleCategory.COMMITTEE_CHAIR:
      return 'committee chair'
    case DTSI_PersonRoleCategory.COMMITTEE_MEMBER:
      return 'committee member'
    case DTSI_PersonRoleCategory.HOUSE_OF_COMMONS:
      return 'member of parliament'
    case DTSI_PersonRoleCategory.HOUSE_OF_LORDS:
      return 'member of house of lords'
    default:
      return gracefullyError({
        msg: `Unknown role category ${roleCategory!} in formatDTSICategory`,
        fallback: 'representative',
        hint: { extra: { role } },
      })
  }
}

export function DtsiCongresspersonDisplay({
  dtsiPeopleResponse,
  maxPeopleDisplayed,
}: {
  maxPeopleDisplayed?: number
  dtsiPeopleResponse?: DTSIPeopleFromAddress
}) {
  if (!dtsiPeopleResponse || 'notFoundReason' in dtsiPeopleResponse) {
    return <div>{formatGetDTSIPeopleFromAddressNotFoundReason(dtsiPeopleResponse)}</div>
  }

  const { dtsiPeople } = dtsiPeopleResponse
  const people = maxPeopleDisplayed ? dtsiPeople.slice(0, maxPeopleDisplayed) : dtsiPeople

  return people.map(person => (
    <div className="flex flex-row items-center gap-4 pb-2 text-sm md:text-base" key={person.id}>
      <div className="relative">
        <DTSIAvatar person={person} size={60} />
        <div className="absolute bottom-[-8px] right-[-8px]">
          <DTSIFormattedLetterGrade className="h-6 w-6" person={person} />
        </div>
      </div>
      <div>
        <div className="font-bold">
          Your {formatDTSICategory(person.primaryRole)} is{' '}
          <span className="text-nowrap">{dtsiPersonFullName(person)}</span>
        </div>
        <div className="text-fontcolor-muted">
          {convertDTSIPersonStanceScoreToCryptoSupportLanguageSentence(person)}
        </div>
      </div>
    </div>
  ))
}
