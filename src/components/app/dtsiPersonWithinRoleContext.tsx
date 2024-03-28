import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { DTSI_PersonCardFragment } from '@/data/dtsi/generated'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryDisplayName,
} from '@/utils/dtsi/dtsiPersonUtils'

export function DTSIPersonCardForLocation({ person }: { person: DTSI_PersonCardFragment }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-row items-center gap-3">
        <DTSIAvatar person={person} size={120} />
        <div>
          <div className="font-bold">{dtsiPersonFullName(person)} </div>
          {person.politicalAffiliationCategory && (
            <div className="text-fontcolor-muted">
              {dtsiPersonPoliticalAffiliationCategoryDisplayName(
                person.politicalAffiliationCategory,
              )}
            </div>
          )}
        </div>
      </div>
      {/* <div>
        <DTSIFormattedLetterGrade person={person} size={40} />
      </div> */}
    </div>
  )
}
