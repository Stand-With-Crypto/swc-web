import { getAuthenticatedData } from '@/components/app/pageUserProfile/getAuthenticatedData'
import { UpdateUserProfileFormDialog } from '@/components/app/updateUserProfileForm/dialog'
import { hasAllFormFieldsOnUserForUpdateUserProfileForm } from '@/components/app/updateUserProfileForm/hasAllFormFieldsOnUser'
import { UserActionRowCTAsList } from '@/components/app/userActionRowCTA/userActionRowCTAsList'
import { SensitiveDataUserAvatar } from '@/components/app/userAvatar'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { FormattedCurrency } from '@/components/ui/formattedCurrency'
import { FormattedDatetime } from '@/components/ui/formattedDatetime'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Progress } from '@/components/ui/progress'
import { PageProps } from '@/types'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { getIntlUrls } from '@/utils/shared/urls'
import { getSensitiveDataUserDisplayName } from '@/utils/web/userUtils'
import { UserActionType } from '@prisma/client'
import _ from 'lodash'
import { AlertCircle } from 'lucide-react'

export function PageUserProfile({
  params,
  user,
}: PageProps & { user: Awaited<ReturnType<typeof getAuthenticatedData>> }) {
  const { locale } = params
  const urls = getIntlUrls(locale)
  if (!user) {
    // TODO UX
    return <div>Not logged in</div>
  }
  const { userActions } = user
  const performedUserActionTypes = _.uniq(userActions.map(x => x.actionType))
  return (
    <div className="container">
      {user.mergeAlerts.length && (
        <div className="mb-6 space-y-2">
          {user.mergeAlerts.map(mergeAlert => (
            <Alert key={mergeAlert.id}>
              <AlertCircle />
              <AlertTitle>Looks like you have multiple users!</AlertTitle>
            </Alert>
          ))}
        </div>
      )}

      <div className="mb-6 flex items-center justify-between md:mx-4">
        <div className="flex items-center gap-2">
          <SensitiveDataUserAvatar size={60} user={user} />
          <div>
            <div className="text-lg font-bold">{getSensitiveDataUserDisplayName(user)}</div>
            <div className="text-sm text-gray-500">
              Joined{' '}
              <FormattedDatetime date={user.datetimeCreated} dateStyle="medium" locale={locale} />
            </div>
          </div>
        </div>
        <div>
          <UpdateUserProfileFormDialog user={user}>
            {hasAllFormFieldsOnUserForUpdateUserProfileForm(user) ? (
              <Button variant="secondary">Edit your profile</Button>
            ) : (
              <Button>Finish your profile</Button>
            )}
          </UpdateUserProfileFormDialog>
        </div>
      </div>
      <div className="mb-14 grid grid-cols-4 rounded-lg bg-blue-50 p-3 text-center sm:p-6">
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
                    return x.amountUsd
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
            <div className="text-xs text-gray-700 sm:text-sm md:text-base">{label}</div>
            <div className="text-sm font-bold sm:text-base md:text-xl">{value}</div>
          </div>
        ))}
      </div>
      <PageTitle className="mb-4">Your advocacy progress</PageTitle>
      <PageSubTitle className="mb-5">
        You've completed {performedUserActionTypes.length} out of{' '}
        {Object.values(UserActionType).length} actions. Keep going!
      </PageSubTitle>
      <div className="mx-auto mb-5 max-w-xl">
        <Progress
          value={(performedUserActionTypes.length / Object.values(UserActionType).length) * 100}
        />
      </div>
      <div className="mb-14 space-y-4">
        <UserActionRowCTAsList
          performedUserActionTypes={performedUserActionTypes}
          className="mb-14"
        />
      </div>
      <PageTitle className="mb-4">Your NFTs</PageTitle>
      <PageSubTitle className="mb-5">
        You will receive free NFTs for completing advocacy-related actions.
      </PageSubTitle>
      <p className="text-center">TODO</p>
    </div>
  )
}
