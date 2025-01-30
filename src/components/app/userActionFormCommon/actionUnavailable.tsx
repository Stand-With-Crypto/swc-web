import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useEffectOnce } from '@/hooks/useEffectOnce'
import { AnalyticActionType, AnalyticComponentType } from '@/utils/shared/sharedAnalytics'
import { trackClientAnalytic } from '@/utils/web/clientAnalytics'
import { trackPrimitiveComponentAnalytics } from '@/utils/web/primitiveComponentAnalytics'

const ANALYTICS_NAME_USER_ACTION_FORM_UNAVAILABLE = 'User Action Form Unavailable'

interface UserActionFormActionUnavailableProps {
  onConfirm?: () => void
  countryCode?: string
}

export const UserActionFormActionUnavailable = ({
  onConfirm,
  countryCode,
}: UserActionFormActionUnavailableProps) => {
  useEffectOnce(() => {
    trackPrimitiveComponentAnalytics(
      ({ properties, args }) => {
        trackClientAnalytic('User Action Unavailable', {
          action: AnalyticActionType.view,
          component: AnalyticComponentType.text,
          ...properties,
          ...args,
        })
      },
      {
        args: {
          ...(countryCode ? { 'Country Code': countryCode } : {}),
        },
        analytics: ANALYTICS_NAME_USER_ACTION_FORM_UNAVAILABLE,
      },
    )
  })

  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center space-y-8">
      <PageTitle size="sm">Action unavailable</PageTitle>
      <PageSubTitle>
        We've detected that you may not be located in the United States. Certain actions and tools
        on SWC are intended only for American advocates.
      </PageSubTitle>
      <Button asChild onClick={onConfirm}>
        <InternalLink href="/">Back to Home</InternalLink>
      </Button>
    </div>
  )
}
