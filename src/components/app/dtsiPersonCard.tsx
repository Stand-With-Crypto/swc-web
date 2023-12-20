import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { NextImage } from '@/components/ui/image'
import { DTSI_Person, DTSI_PersonCardFragment } from '@/data/dtsi/generated'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryAbbreviation,
} from '@/utils/dtsi/dtsiPersonUtils'

export function DTSIPersonCard({ person }: { person: DTSI_PersonCardFragment }) {
  return (
    <div className="rounded-md border bg-gray-100 p-5">
      <div className="flex flex-row items-center gap-3">
        <DTSIAvatar person={person} size={40} />
        <div className="font-bold">
          {dtsiPersonFullName(person)}{' '}
          {person.politicalAffiliationCategory
            ? `(${dtsiPersonPoliticalAffiliationCategoryAbbreviation(
                person.politicalAffiliationCategory,
              )})`
            : ''}
        </div>
      </div>
    </div>
  )
}
