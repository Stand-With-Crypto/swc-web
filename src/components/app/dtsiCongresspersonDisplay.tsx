'use client'
import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { UseGetDTSIPeopleFromAddressResponse } from '@/hooks/useGetDTSIPeopleFromAddress'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { convertDTSIStanceScoreToCryptoSupportLanguageSentence } from '@/utils/dtsi/dtsiStanceScoreUtils'

export function DtsiCongresspersonDisplay({
  congressperson,
}: {
  congressperson?: UseGetDTSIPeopleFromAddressResponse
}) {
  if (!congressperson || 'notFoundReason' in congressperson) {
    return <div>No available representative</div>
  }

  return (
    <div className="flex flex-row items-center gap-4 text-sm md:text-base">
      <div className="relative">
        <DTSIAvatar person={congressperson} size={60} />
        <div className="absolute bottom-[-8px] right-[-8px]">
          <DTSIFormattedLetterGrade size={25} person={congressperson} />
        </div>
      </div>
      <div>
        <div className="font-bold">Your representative is {dtsiPersonFullName(congressperson)}</div>
        <div className="text-fontcolor-muted">
          {convertDTSIStanceScoreToCryptoSupportLanguageSentence(congressperson)}
        </div>
      </div>
    </div>
  )
}
