import { UserActionType } from '@prisma/client'
import { sumBy, uniq } from 'lodash-es'
import { redirect, RedirectType } from 'next/navigation'

import { PageUserProfileUser } from '@/components/app/pageUserProfile/getAuthenticatedData'
import { UpdateUserProfileFormDialog } from '@/components/app/updateUserProfileForm/dialog'
import { UserActionRowCTAsList } from '@/components/app/userActionRowCTA/userActionRowCTAsList'
import { UserAvatar } from '@/components/app/userAvatar'
import { Button } from '@/components/ui/button'
import { FormattedCurrency } from '@/components/ui/formattedCurrency'
import { FormattedDatetime } from '@/components/ui/formattedDatetime'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Progress } from '@/components/ui/progress'
import { PageProps } from '@/types'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { USER_ACTION_DEEPLINK_MAP } from '@/utils/shared/urlsDeeplinkUserActions'
import { hasCompleteUserProfile } from '@/utils/web/hasCompleteUserProfile'
import { getSensitiveDataUserDisplayName } from '@/utils/web/userUtils'

import { UserReferralUrl } from './userReferralUrl'

export function PageUserProfile({
  params,
  user,
}: PageProps & { user: PageUserProfileUser | null }) {
  const { locale } = params
  if (!user) {
    // For now the only authenticated page we have is /profile,
    // so we don't need to dynamically pass the redirect path to login
    // If we add more authenticated pages, we'll need to make this dynamic
    redirect(
      USER_ACTION_DEEPLINK_MAP[UserActionType.OPT_IN].getDeeplinkUrl({
        locale,
      }),
      RedirectType.replace,
    )
  }
  const { userActions } = user
  const performedUserActionTypes = uniq(userActions.map(x => x.actionType))
  const excludeUserActionTypes = user.hasEmbeddedWallet ? [UserActionType.NFT_MINT] : []
  return (
    <div className="container space-y-10 lg:space-y-16">
      {/* LATER-TASK enable this feature */}
      {/* {!!user.mergeAlerts.length && (
        <div className="mb-6 space-y-2">
          {user.mergeAlerts.map(mergeAlert => (
            <MergeAlertCTA key={mergeAlert.id} user={user} mergeAlert={mergeAlert} />
          ))}
        </div>
      )} */}

      <section>
        <div className="mb-6 flex items-center justify-between md:mx-4">
          <div className="flex items-center gap-2">
            <UserAvatar size={48} user={user} />
            <div>
              <div className="max-w-[120px] truncate text-lg font-bold md:max-w-md">
                {getSensitiveDataUserDisplayName(user)}
              </div>
              <div className="text-sm text-gray-500">
                Joined{' '}
                <FormattedDatetime
                  date={new Date(user.datetimeCreated)}
                  dateStyle="medium"
                  locale={locale}
                />
              </div>
            </div>
          </div>
          <div>
            <UpdateUserProfileFormDialog user={user}>
              {hasCompleteUserProfile(user) ? (
                <Button variant="secondary">
                  Edit <span className="mx-1 hidden sm:inline-block">your</span> profile
                </Button>
              ) : (
                <Button>
                  Finish <span className="mx-1 hidden sm:inline-block">your</span> profile
                </Button>
              )}
            </UpdateUserProfileFormDialog>
          </div>
        </div>
        <div className="grid grid-cols-3 rounded-3xl bg-blue-50 p-3 text-center sm:p-6">
          {[
            {
              label: 'Actions',
              value: <FormattedNumber amount={userActions.length} locale={locale} />,
            },
            {
              label: 'Donated',
              value: (
                <FormattedCurrency
                  amount={sumBy(userActions, x => {
                    if (x.actionType === UserActionType.DONATION) {
                      return x.amountUsd
                    }
                    return 0
                  })}
                  currencyCode={SupportedFiatCurrencyCodes.USD}
                  locale={locale}
                />
              ),
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
      </section>
      <section>
        <PageTitle className="mb-4" size="sm">
          Your advocacy progress
        </PageTitle>
        <PageSubTitle className="mb-5">
          You've completed {performedUserActionTypes.length} out of{' '}
          {Object.values(UserActionType).length - excludeUserActionTypes.length} actions. Keep
          going!
        </PageSubTitle>
        <div className="mx-auto mb-10 max-w-xl">
          <Progress
            value={(performedUserActionTypes.length / Object.values(UserActionType).length) * 100}
          />
        </div>
        <UserActionRowCTAsList
          excludeUserActionTypes={excludeUserActionTypes}
          performedUserActionTypes={performedUserActionTypes}
        />
      </section>
      {/* hiding nft section until bugs are resolved */}
      {/* <section>
        <PageTitle className="mb-4" size="sm">
          Your NFTs
        </PageTitle>
        <PageSubTitle className="mb-5">
          You will receive free NFTs for completing advocacy-related actions.
        </PageSubTitle>
        <div>
          <NFTDisplay userActions={userActions} />
        </div>
      </section> */}
      <section>
        <PageTitle className="mb-4" size="sm">
          Refer Your Friends
        </PageTitle>
        <PageSubTitle className="mb-5">
          Send friends your unique referral code to encourage them to sign up and take action.
        </PageSubTitle>
        <UserReferralUrl referralId={user.referralId} />
      </section>
    </div>
  )
}
