'use client'

import { UserActionType } from '@prisma/client'
import { sumBy, uniq } from 'lodash-es'
import dynamic from 'next/dynamic'

import { SensitiveDataClientUserAction } from '@/clientModels/clientUserAction/sensitiveDataClientUserAction'
import { ANALYTICS_NAME_USER_ACTION_SUCCESS_JOIN_SWC } from '@/components/app/authentication/constants'
import { NFTDisplay } from '@/components/app/nftHub/nftDisplay'
import { CommunicationsPreferenceForm } from '@/components/app/pageUserProfile/common/communicationsPreferenceForm'
import { EmailSubscriptionForm } from '@/components/app/pageUserProfile/common/emailSubscriptionForm'
import { PageUserProfileUser } from '@/components/app/pageUserProfile/common/getAuthenticatedData'
import { SMSSubscriptionForm } from '@/components/app/pageUserProfile/common/smsSubscriptionForm'
import { UpdateUserProfileFormDialog } from '@/components/app/updateUserProfileForm/dialog'
import { Refer } from '@/components/app/userActionFormRefer/common/sections/refer'
import { UserActionGridCTAs } from '@/components/app/userActionGridCTAs'
import { UserAvatar } from '@/components/app/userAvatar'
import { Button } from '@/components/ui/button'
import { FormattedCurrency } from '@/components/ui/formattedCurrency'
import { FormattedDatetime } from '@/components/ui/formattedDatetime'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Progress } from '@/components/ui/progress'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useDialog } from '@/hooks/useDialog'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useSession } from '@/hooks/useSession'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { getUserActionsProgress } from '@/utils/shared/getUserActionsProgress'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { hasCompleteUserProfile } from '@/utils/web/hasCompleteUserProfile'
import { getSensitiveDataUserDisplayName } from '@/utils/web/userUtils'

const UserActionFormJoinSWCSuccessDialog = dynamic(
  () =>
    import('@/components/app/userActionFormJoinSWC/successDialog').then(
      module => module.UserActionFormJoinSWCSuccessDialog,
    ),
  {
    loading: () => <LoadingOverlay />,
  },
)

export interface PageUserProfileProps {
  user: PageUserProfileUser
  hideUserMetrics?: boolean
  countryCode: SupportedCountryCodes
}

export function PageUserProfile({
  user,
  hideUserMetrics = false,
  countryCode,
}: PageUserProfileProps) {
  const session = useSession()

  const successDialogProps = useDialog({
    analytics: ANALYTICS_NAME_USER_ACTION_SUCCESS_JOIN_SWC,
  })

  const { data } = useApiResponseForUserFullProfileInfo()
  const { userActions: userActionsFromLoadedUserInServerSide } = user

  const userActions = filterUserActionsByCountry(
    data?.user?.userActions ?? userActionsFromLoadedUserInServerSide,
    countryCode,
  )

  const performedUserActionTypes = uniq(
    userActions.map(x => ({ actionType: x.actionType, campaignName: x.campaignName })),
  )

  const { progressValue, numActionsCompleted, numActionsAvailable } = getUserActionsProgress({
    userHasEmbeddedWallet: user.hasEmbeddedWallet,
    performedUserActionTypes: [
      ...performedUserActionTypes,
      { actionType: UserActionType.OPT_IN, campaignName: 'DEFAULT' },
    ],
    countryCode,
  })

  const onEditProfileSuccess = () => {
    if (session.user?.primaryUserCryptoAddress?.wasRecentlyUpdated) {
      successDialogProps.onOpenChange(true)
    }
  }

  return (
    <div className="standard-spacing-from-navbar container space-y-10 lg:space-y-16">
      {successDialogProps.open ? (
        <UserActionFormJoinSWCSuccessDialog {...successDialogProps} />
      ) : null}

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
                  locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
                />
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <EditProfileButton onSuccess={onEditProfileSuccess} user={user} />
          </div>
        </div>

        {!hideUserMetrics && (
          <div className="grid grid-cols-4 rounded-3xl bg-secondary p-3 text-center sm:p-6">
            {[
              {
                label: 'Actions',
                value: (
                  <FormattedNumber
                    amount={numActionsCompleted}
                    locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
                  />
                ),
              },
              {
                label: 'Donated',
                value: (
                  <FormattedCurrency
                    amount={sumBy(userActions, x => {
                      if (x.actionType === UserActionType.DONATION) {
                        return x.amountUsd
                      }
                      if (x.actionType === UserActionType.NFT_MINT) {
                        return x.nftMint.costAtMintUsd
                      }
                      return 0
                    })}
                    currencyCode={SupportedFiatCurrencyCodes.USD}
                    locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
                  />
                ),
              },
              {
                label: 'NFTs',
                value: (
                  <FormattedNumber
                    amount={userActions.filter(action => action.nftMint).length}
                    locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
                  />
                ),
              },
              {
                label: 'Referrals',
                value: (
                  <FormattedNumber
                    amount={
                      userActions.find(action => action.actionType === UserActionType.REFER)
                        ?.referralsCount ?? 0
                    }
                    locale={COUNTRY_CODE_TO_LOCALE[countryCode]}
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
        )}
      </section>

      <div className="flex items-center gap-4 md:hidden">
        <EditProfileButton onSuccess={onEditProfileSuccess} user={user} />
      </div>

      <section>
        <PageTitle className="mb-4" size="md">
          Your advocacy progress
        </PageTitle>
        <PageSubTitle className="mb-5">
          You've completed {numActionsCompleted} out of {numActionsAvailable} campaigns.{' '}
          {numActionsCompleted === numActionsAvailable ? 'Great job!' : 'Keep going!'}
        </PageSubTitle>
        <div className="mx-auto mb-10 max-w-xl">
          <Progress value={progressValue} />
        </div>

        <UserActionGridCTAs />
      </section>

      <section>
        <a className="mt-[-72px] h-0 pt-[72px]" id="nfts" />
        <PageTitle className="mb-4" size="md">
          Your NFTs
        </PageTitle>
        <PageSubTitle className="mb-5">
          You will receive free NFTs for completing advocacy-related actions.
        </PageSubTitle>
        <div>
          <NFTDisplay userActions={userActions} />
        </div>
      </section>

      <section>
        <Refer>
          <PageTitle size="md">Invite a friend to join Stand With Crypto</PageTitle>
          <PageSubTitle>
            Send friends your unique referral code to encourage them to sign up and take action.
          </PageSubTitle>
          <Refer.ReferralCode />
        </Refer>
      </section>

      <section>
        <PageTitle className="mb-4" size="md">
          Communication Preferences
        </PageTitle>
        <PageSubTitle className="mb-5">
          Choose how you'd like to stay informed about our campaigns and important news.
        </PageSubTitle>
        <CommunicationsPreferenceForm>
          <EmailSubscriptionForm user={user} />
          <SMSSubscriptionForm countryCode={countryCode} user={user} />
        </CommunicationsPreferenceForm>
      </section>
    </div>
  )
}

function filterUserActionsByCountry(
  userActions: SensitiveDataClientUserAction[],
  countryCode: SupportedCountryCodes,
) {
  return userActions.filter(
    action => action.countryCode === countryCode || action.actionType === UserActionType.OPT_IN,
  )
}

function EditProfileButton({
  user,
  onSuccess,
}: {
  user: PageUserProfileUser
  onSuccess?: () => void
}) {
  const session = useSession()
  const hasHydrated = useHasHydrated()

  if (!hasHydrated) {
    return null
  }

  return (
    <UpdateUserProfileFormDialog onSuccess={onSuccess} user={user}>
      {hasCompleteUserProfile(user) ? (
        <Button className="w-full lg:w-auto" variant="secondary">
          Edit <span className="mx-1 hidden sm:inline-block">your</span> profile
        </Button>
      ) : (
        <Button
          className="w-full lg:w-auto"
          variant={session.isLoggedInThirdweb ? 'default' : 'secondary'}
        >
          Finish <span className="mx-1 hidden sm:inline-block">your</span> profile
        </Button>
      )}
    </UpdateUserProfileFormDialog>
  )
}
