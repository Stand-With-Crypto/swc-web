'use client'

import { UserActionFormActionUnavailable } from '@/components/app/userActionFormCommon/actionUnavailable'
import { AUUserActionFormShareOnTwitter } from '@/components/app/userActionFormShareOnTwitter/au'
import { CAUserActionFormShareOnTwitter } from '@/components/app/userActionFormShareOnTwitter/ca'
import { UserActionFormShareOnTwitterProps } from '@/components/app/userActionFormShareOnTwitter/common/types'
import { UKUserActionFormShareOnTwitter } from '@/components/app/userActionFormShareOnTwitter/uk'
import { USUserActionFormShareOnTwitter } from '@/components/app/userActionFormShareOnTwitter/us'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

export function UserActionFormShareOnTwitter(props: UserActionFormShareOnTwitterProps) {
  const { countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE } = props

  switch (countryCode) {
    case SupportedCountryCodes.US:
      return <USUserActionFormShareOnTwitter {...props} />
    case SupportedCountryCodes.GB:
      return <UKUserActionFormShareOnTwitter {...props} />
    case SupportedCountryCodes.CA:
      return <CAUserActionFormShareOnTwitter {...props} />
    case SupportedCountryCodes.AU:
      return <AUUserActionFormShareOnTwitter {...props} />
    default:
      return gracefullyError({
        msg: `Country implementation not found for UserActionFormShareOnTwitter`,
        fallback: <UserActionFormActionUnavailable />,
        hint: {
          level: 'error',
          tags: {
            domain: 'UserActionFormShareOnTwitter',
          },
          extra: {
            countryCode,
          },
        },
      })
  }
}
