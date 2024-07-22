import { UserActionType } from '@prisma/client'
import { Check } from 'lucide-react'

import { actionCreateUserActionTweet } from '@/actions/actionCreateUserActionTweet'
import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { SECTIONS_NAMES } from '@/components/app/userActionFormShareOnTwitter/constants'
import { Button } from '@/components/ui/button'
import { UseSectionsReturn } from '@/hooks/useSections'
import { openWindow } from '@/utils/shared/openWindow'
import { triggerServerActionForForm } from '@/utils/web/formUtils'

interface ShareOnXProps extends UseSectionsReturn<SECTIONS_NAMES> {}

export function ShareOnX(props: ShareOnXProps) {
  const { goToSection } = props

  const handleFollowClick = () => {
    void triggerServerActionForForm(
      {
        formName: 'User Action Tweet',
        analyticsProps: {
          'User Action Type': UserActionType.TWEET,
        },
        payload: undefined,
      },
      () => actionCreateUserActionTweet(),
    )

    goToSection(SECTIONS_NAMES.SUCCESS)

    openWindow('https://x.com/standwithcrypto', undefined, `noopener`)
  }

  return (
    <UserActionFormLayout>
      <UserActionFormLayout.Container className="h-auto items-center justify-between">
        <UserActionFormLayout.Heading
          subtitle="Follow Stand With Crypto and stay up to date on crypto policy"
          title="Follow us on X"
        />

        <div>
          <p className="mb-4">By following Stand With Crypto, you are:</p>

          <ul className="space-y-2">
            {[
              'Helping influence policymakers and decision makers',
              'Staying informed on everything crypto policy related',
              'Joining a community of like-minded individuals focused on keeping crypto in America',
            ].map(info => (
              <li className="flex items-center gap-4" key={info}>
                <Check size={20} />
                <span>{info}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button className="w-full max-w-[450px]" onClick={handleFollowClick} size="lg">
          Follow @StandWithCrypto
        </Button>
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}
