'use client'

import { UserActionType } from '@prisma/client'
import { Check } from 'lucide-react'

import { actionCreateUserActionTweet } from '@/actions/actionCreateUserActionTweet'
import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { getUserActionTweetContentByCountry } from '@/components/app/userActionFormShareOnTwitter/common/getUserActionContentByCountry'
import { ShareOnXSectionProps } from '@/components/app/userActionFormShareOnTwitter/common/types'
import { Button } from '@/components/ui/button'
import { openWindow } from '@/utils/shared/openWindow'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { toastGenericError } from '@/utils/web/toastUtils'

export function CommonShareSection<T extends string>(props: ShareOnXSectionProps<T>) {
  const { goToSection, countryCode } = props
  const config = getUserActionTweetContentByCountry(countryCode)

  const handleFollowClick = () => {
    void triggerServerActionForForm(
      {
        formName: 'User Action Tweet',
        analyticsProps: {
          'User Action Type': UserActionType.TWEET,
        },
        payload: undefined,
        onError: toastGenericError,
      },
      () => actionCreateUserActionTweet(),
    ).then(result => {
      if (result.status === 'success') goToSection(config.sections[1] as T)
    })

    openWindow(config.meta.followUrl, '_blank', 'noopener')
  }

  return (
    <UserActionFormLayout>
      <UserActionFormLayout.Container className="h-auto items-center justify-between">
        <UserActionFormLayout.Heading subtitle={config.meta.subtitle} title={config.meta.title} />

        <div>
          <p className="mb-4">By following Stand With Crypto, you are:</p>

          <ul className="space-y-2">
            {config.meta.benefits.map((info: string) => (
              <li className="flex items-center gap-4" key={info}>
                <Check size={20} />
                <span>{info}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button className="w-full max-w-[450px]" onClick={handleFollowClick} size="lg">
          {config.meta.followText}
        </Button>
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}
