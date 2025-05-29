'use client'
import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { DTSI_PersonRole, DTSI_PersonRoleCategory } from '@/data/dtsi/generated'
import {
  UseGetDTSIPeopleFromUSAddressResponse,
  formatGetDTSIPeopleFromUSAddressNotFoundReason,
} from '@/hooks/useGetDTSIPeopleFromUSAddress'
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
  dtsiPeopleResponse?: UseGetDTSIPeopleFromUSAddressResponse
}) {
  if (!dtsiPeopleResponse || 'notFoundReason' in dtsiPeopleResponse) {
    return <div>{formatGetDTSIPeopleFromUSAddressNotFoundReason(dtsiPeopleResponse)}</div>
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
