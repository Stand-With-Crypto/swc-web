'use client'
import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import {
  formatGetDTSIPeopleFromAddressNotFoundReason,
  UseGetDTSIPeopleFromAddressResponse,
} from '@/hooks/useGetDTSIPeopleFromAddress'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { convertDTSIStanceScoreToCryptoSupportLanguageSentence } from '@/utils/dtsi/dtsiStanceScoreUtils'

export function DtsiCongresspersonDisplay({
  dtsiPersonResponse,
}: {
  dtsiPersonResponse?: UseGetDTSIPeopleFromAddressResponse
}) {
  if (!dtsiPersonResponse || 'notFoundReason' in dtsiPersonResponse) {
    return <div>{formatGetDTSIPeopleFromAddressNotFoundReason(dtsiPersonResponse)}</div>
  }

  const { dtsiPerson } = dtsiPersonResponse

  return (
    <div className="flex flex-row items-center gap-4 text-sm md:text-base">
      <div className="relative">
        <DTSIAvatar person={dtsiPerson} size={60} />
        <div className="absolute bottom-[-8px] right-[-8px]">
          <DTSIFormattedLetterGrade person={dtsiPerson} size={25} />
        </div>
      </div>
      <div>
        <div className="font-bold">
          Your representative is{' '}
          <span className="text-nowrap">{dtsiPersonFullName(dtsiPerson)}</span>
        </div>
        <div className="text-fontcolor-muted">
          {convertDTSIStanceScoreToCryptoSupportLanguageSentence(dtsiPerson)}
        </div>
      </div>
    </div>
  )
}
