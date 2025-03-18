'use client'

import { ShareOnXSectionProps } from 'src/components/app/userActionFormShareOnTwitter/common/types'

import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { UKSectionNames } from '@/components/app/userActionFormShareOnTwitter/uk'
import { Button } from '@/components/ui/button'

export function UKInfoSection(props: ShareOnXSectionProps<UKSectionNames>) {
  const { goToSection } = props

  return (
    <UserActionFormLayout>
      <UserActionFormLayout.Container className="h-auto items-center justify-between">
        <UserActionFormLayout.Heading
          subtitle="Learn why following crypto advocates matters in the UK"
          title="Why Follow Crypto Advocates?"
        />

        <div className="space-y-4">
          <p>
            Following crypto advocates on social media helps you stay informed about UK crypto
            policies and regulatory developments.
          </p>
          <p>
            The UK is developing its approach to crypto regulation, and your voice can make a
            difference.
          </p>
        </div>

        <Button
          className="w-full max-w-[450px]"
          onClick={() => goToSection(UKSectionNames.SHARE)}
          size="lg"
        >
          Continue
        </Button>
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}
