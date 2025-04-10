import dynamic from 'next/dynamic'

import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { gracefullyError } from '@/utils/shared/gracefullyError'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const USUserActionFormJoinSWCSuccess = dynamic(
  () => import('./us/success').then(module => module.USUserActionFormJoinSWCSuccess),
  {
    loading: () => <UserActionFormSuccessScreenFeedback.Skeleton />,
  },
)

const AUUserActionFormJoinSWCSuccess = dynamic(
  () => import('./au/success').then(module => module.AUUserActionFormJoinSWCSuccess),
  {
    loading: () => <UserActionFormSuccessScreenFeedback.Skeleton />,
  },
)

const CAUserActionFormJoinSWCSuccess = dynamic(
  () => import('./ca/success').then(module => module.CAUserActionFormJoinSWCSuccess),
  {
    loading: () => <UserActionFormSuccessScreenFeedback.Skeleton />,
  },
)

const GBUserActionFormJoinSWCSuccess = dynamic(
  () => import('./gb/success').then(module => module.GBUserActionFormJoinSWCSuccess),
  {
    loading: () => <UserActionFormSuccessScreenFeedback.Skeleton />,
  },
)

export const UserActionFormJoinSWCSuccess = ({
  countryCode,
}: {
  countryCode: SupportedCountryCodes
}) => {
  switch (countryCode) {
    case SupportedCountryCodes.US:
      return <USUserActionFormJoinSWCSuccess />
    case SupportedCountryCodes.AU:
      return <AUUserActionFormJoinSWCSuccess />
    case SupportedCountryCodes.CA:
      return <CAUserActionFormJoinSWCSuccess />
    case SupportedCountryCodes.GB:
      return <GBUserActionFormJoinSWCSuccess />
    default:
      return gracefullyError({
        msg: `Country implementation not found for UserActionFormJoinSWCSuccess`,
        fallback: null,
        hint: {
          level: 'error',
          tags: {
            domain: 'UserActionFormJoinSWCSuccess',
          },
          extra: {
            countryCode,
          },
        },
      })
  }
}
