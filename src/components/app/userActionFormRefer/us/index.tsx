'use client'

import {
  ANALYTICS_NAME_USER_ACTION_FORM_REFER,
  SectionNames,
} from '@/components/app/userActionFormRefer/common/constants'
import { Refer } from '@/components/app/userActionFormRefer/common/sections/refer'
import { SuccessSection } from '@/components/app/userActionFormRefer/common/sections/success'
import { UserActionFormReferProps } from '@/components/app/userActionFormRefer/common/types'
import { useSections } from '@/hooks/useSections'

export function USUserActionFormRefer({ onClose }: UserActionFormReferProps) {
  const sectionProps = useSections({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.REFER,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_REFER,
  })

  switch (sectionProps.currentSection) {
    case SectionNames.REFER:
      return (
        <Refer>
          <Refer.Heading description="Send friends your unique referral code to encourage them to sign up and take action." />

          <Refer.ReferralCode />

          <Refer.Counter className="flex-col md:flex-row">
            <Refer.Counter.UserReferralsCount />
            <Refer.Counter.UserDistrictRanking />
          </Refer.Counter>
        </Refer>
      )
    case SectionNames.SUCCESS:
      return <SuccessSection onClose={onClose} />
    default:
      sectionProps.onSectionNotFound()
      return null
  }
}
