'use client'
import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetDTSIPeopleFromAddress } from '@/hooks/useGetDTSIPeopleFromAddress'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { convertDTSIStanceScoreToCryptoSupportLanguageSentence } from '@/utils/dtsi/dtsiStanceScoreUtils'
import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'
import { useEffect } from 'react'
import { z } from 'zod'

export function DTSICongresspersonAssociatedWithAddress({
  address,
  onChangeDTSISlug,
  currentDTSISlugValue,
}: {
  address?: z.infer<typeof zodGooglePlacesAutocompletePrediction>
  currentDTSISlugValue: string
  onChangeDTSISlug: (slug: string) => void
}) {
  const res = useGetDTSIPeopleFromAddress(address?.description || '')
  useEffect(() => {
    if (res.data && 'slug' in res.data && res.data.slug !== currentDTSISlugValue) {
      onChangeDTSISlug(res.data.slug)
    } else if (currentDTSISlugValue && !res.data) {
      onChangeDTSISlug('')
    }
  }, [res.data])
  if (!address || res.isLoading) {
    return <Skeleton className="h-10 w-10" />
  }
  if (!res.data || 'notFoundReason' in res.data) {
    return <div>No available Congressperson</div>
  }
  const person = res.data
  return (
    <div className="flex flex-row items-center gap-4 text-sm md:text-base">
      <div className="relative">
        <DTSIAvatar person={person} size={60} />
        <div className="absolute bottom-[-8px] right-[-8px]">
          <DTSIFormattedLetterGrade size={25} person={person} />
        </div>
      </div>
      <div>
        <div className="font-bold">Your representative is {dtsiPersonFullName(person)}</div>
        <div className="text-fontcolor-muted">
          {convertDTSIStanceScoreToCryptoSupportLanguageSentence(person)}
        </div>
      </div>
    </div>
  )
}
