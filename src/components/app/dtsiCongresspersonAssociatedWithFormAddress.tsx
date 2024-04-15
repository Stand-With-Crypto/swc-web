'use client'
import { useEffect } from 'react'
import { z } from 'zod'

import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { Skeleton } from '@/components/ui/skeleton'
import {
  formatGetDTSIPeopleFromAddressNotFoundReason,
  useGetDTSIPeopleFromAddress,
} from '@/hooks/useGetDTSIPeopleFromAddress'
import { getDTSIPersonRoleCategoryDisplayName } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import {
  getYourPoliticianCategoryDisplayName,
  YourPoliticianCategory,
} from '@/utils/shared/yourPoliticianCategory'
import { zodGooglePlacesAutocompletePrediction } from '@/validation/fields/zodGooglePlacesAutocompletePrediction'

export function DTSICongresspersonAssociatedWithFormAddress({
  address,
  onChangeDTSISlug,
  currentDTSISlugValue,
  politicianCategory,
}: {
  politicianCategory: YourPoliticianCategory
  address?: z.infer<typeof zodGooglePlacesAutocompletePrediction>
  currentDTSISlugValue: string[]
  onChangeDTSISlug: (slugs: string[]) => void
}) {
  const res = useGetDTSIPeopleFromAddress(address?.description || '', politicianCategory)
  useEffect(() => {
    if (
      res.data &&
      'dtsiPeople' in res.data &&
      res.data.dtsiPeople.some((person, index) => person.slug !== currentDTSISlugValue[index])
    ) {
      onChangeDTSISlug(res.data.dtsiPeople.map(person => person.slug))
    } else if (currentDTSISlugValue && !res.data) {
      onChangeDTSISlug([])
    }
  }, [currentDTSISlugValue, onChangeDTSISlug, res.data])
  const categoryDisplayName = getYourPoliticianCategoryDisplayName(politicianCategory)
  if (!address || res.isLoading) {
    return (
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 flex-shrink-0" />
        <div className="text-sm md:text-base">
          <p className="bold">Your {categoryDisplayName}</p>
          <p className="text-fontcolor-muted">
            {res.isLoading ? 'Loading...' : 'This will show up after you enter your address'}
          </p>
        </div>
      </div>
    )
  }
  if (!res.data || 'notFoundReason' in res.data) {
    return <div>{formatGetDTSIPeopleFromAddressNotFoundReason(res.data)}</div>
  }
  const people = res.data.dtsiPeople
  return (
    <div className="space-y-6">
      {people.map(person => (
        <div className="flex w-full justify-between gap-4" key={person.id}>
          <div className="flex items-center gap-4 text-sm md:text-base">
            <div className="flex-shrink-0">
              <DTSIAvatar person={person} size={60} />
            </div>
            <div>
              <div className="font-bold">{dtsiPersonFullName(person)}</div>
              <div className="text-fontcolor-muted">
                Your{' '}
                {person.primaryRole
                  ? getDTSIPersonRoleCategoryDisplayName(person.primaryRole).toLowerCase()
                  : gracefullyError({
                      msg: 'No primary role found',
                      fallback: 'representative',
                      hint: { extra: { person } },
                    })}
              </div>
            </div>
          </div>
          <div>
            <DTSIFormattedLetterGrade person={person} size={60} />
          </div>
        </div>
      ))}
    </div>
  )
}
