import { getAuthenticatedData } from '@/app/[locale]/profile/getAuthenticatedData'
import { SensitiveDataClientUserAction } from '@/clientModels/clientUserAction/sensitiveDataClientUserAction'
import { UserActionRowCTA } from '@/components/app/userActionRowCTA'
import { USER_ACTION_ROW_CTA_INFO } from '@/components/app/userActionRowCTA/userActionRowCTAConstants'
import { UserAvatar } from '@/components/app/userAvatar'
import { Button } from '@/components/ui/button'
import { FormattedCurrency } from '@/components/ui/formattedCurrency'
import { FormattedDatetime } from '@/components/ui/formattedDatetime'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { PageTitle } from '@/components/ui/pageTitleText'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { Progress } from '@/components/ui/progress'
import { PageProps } from '@/types'
import { SupportedCryptoCurrencyCodes, SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { getIntlUrls } from '@/utils/shared/urls'
import { getUserDisplayName } from '@/utils/web/userUtils'
import { UserAction, UserActionType } from '@prisma/client'
import _ from 'lodash'

export const dynamic = 'force-dynamic'

// TODO metadata

export default async function Profile({ params }: PageProps) {
  const { locale } = params
  const urls = getIntlUrls(locale)
  const user = await getAuthenticatedData()
  if (!user) {
    // TODO UX
    return <div>Not logged in</div>
  }
  const { userActions } = user
  const userActionsByType: Partial<Record<UserActionType, typeof userActions>> = _.groupBy(
    userActions,
    x => x.actionType,
  )
  return (
    <div className="container">
      <div className="mb-6 flex items-center justify-between md:mx-4">
        <div className="flex items-center gap-2">
          <UserAvatar size={60} user={user} />
          <div>
            <div className="text-lg font-bold">{getUserDisplayName(user)}</div>
            <div className="text-sm text-gray-500">
              Joined{' '}
              <FormattedDatetime date={user.datetimeCreated} dateStyle="medium" locale={locale} />
            </div>
          </div>
        </div>
        <div>
          <Button>TODO</Button>
        </div>
      </div>
      <div className="mb-14 grid grid-cols-4 rounded-lg bg-blue-50 p-6 text-center">
        {[
          {
            label: 'Actions',
            value: <FormattedNumber amount={userActions.length} locale={locale} />,
          },
          {
            label: 'Donated',
            value: (
              <FormattedCurrency
                locale={locale}
                currencyCode={SupportedFiatCurrencyCodes.USD}
                amount={_.sumBy(userActions, x => {
                  if (x.actionType === UserActionType.DONATION) {
                    return x.amountUsd.toNumber()
                  }
                  return 0
                })}
              />
            ),
          },
          {
            label: 'Leaderboard',
            value: <>TODO</>,
          },
          {
            label: 'NFTs',
            value: (
              <FormattedNumber
                amount={userActions.filter(action => action.nftMint).length}
                locale={locale}
              />
            ),
          },
        ].map(({ label, value }) => (
          <div key={label}>
            <div className="text-gray-700">{label}</div>
            <div className="text-xl font-bold">{value}</div>
          </div>
        ))}
      </div>
      <PageTitle className="mb-4">Your advocacy progress</PageTitle>
      <PageSubTitle className="mb-5">
        You've completed {Object.keys(userActionsByType).length} out of{' '}
        {Object.values(UserActionType).length} actions. Keep going!
      </PageSubTitle>
      <div className="mx-auto mb-5 max-w-xl">
        <Progress
          value={
            (Object.keys(userActionsByType).length / Object.values(UserActionType).length) * 100
          }
        />
      </div>
      <div className="space-y-4">
        {USER_ACTION_ROW_CTA_INFO.map(({ actionType, ...rest }) => (
          <UserActionRowCTA
            key={actionType}
            state={userActionsByType[actionType]?.length ? 'complete' : 'incomplete'}
            {...{ actionType, ...rest }}
          />
        ))}
      </div>
    </div>
  )
}
