import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useEffectOnce } from '@/hooks/useEffectOnce'
import {
  COUNTRY_CODE_TO_DEMONYM,
  COUNTRY_CODE_TO_DISPLAY_NAME_WITH_PREFIX,
} from '@/utils/shared/intl/displayNames'
import { AnalyticActionType, AnalyticComponentType } from '@/utils/shared/sharedAnalytics'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { trackClientAnalytic } from '@/utils/web/clientAnalytics'
import { cn } from '@/utils/web/cn'
import { trackPrimitiveComponentAnalytics } from '@/utils/web/primitiveComponentAnalytics'

const ANALYTICS_NAME_USER_ACTION_FORM_UNAVAILABLE = 'User Action Form Unavailable'

interface UserActionFormActionUnavailableProps {
  onConfirm?: () => void
  countryCode: SupportedCountryCodes
  className?: string
  hideTitle?: boolean
}

export const UserActionFormActionUnavailable = ({
  onConfirm,
  countryCode,
  className,
  hideTitle = false,
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
    <div
      className={cn('flex min-h-[500px] flex-col items-center justify-center space-y-8', className)}
    >
      {!hideTitle && <PageTitle size="sm">Action unavailable</PageTitle>}
      <PageSubTitle>
        We've detected that you may not be located in{' '}
        {COUNTRY_CODE_TO_DISPLAY_NAME_WITH_PREFIX[countryCode]}. Certain actions and tools on SWC
        are intended only for {COUNTRY_CODE_TO_DEMONYM[countryCode]} advocates.
      </PageSubTitle>
      <Button asChild onClick={onConfirm}>
        <InternalLink href="/">Back to Home</InternalLink>
      </Button>
    </div>
  )
}
