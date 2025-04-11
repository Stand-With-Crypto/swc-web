'use client'

import { UserActionType } from '@prisma/client'
import { sumBy, uniq } from 'lodash-es'

import { SensitiveDataClientUserAction } from '@/clientModels/clientUserAction/sensitiveDataClientUserAction'
import { NFTDisplay } from '@/components/app/nftHub/nftDisplay'
import { PageUserProfileUser } from '@/components/app/pageUserProfile/common/getAuthenticatedData'
import { UpdateUserProfileFormDialog } from '@/components/app/updateUserProfileForm/dialog'
import { Refer } from '@/components/app/userActionFormRefer/common/sections/refer'
import { UserActionGridCTAs } from '@/components/app/userActionGridCTAs'
import { UserAvatar } from '@/components/app/userAvatar'
import { Button } from '@/components/ui/button'
import { FormattedCurrency } from '@/components/ui/formattedCurrency'
import { FormattedDatetime } from '@/components/ui/formattedDatetime'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Progress } from '@/components/ui/progress'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useSession } from '@/hooks/useSession'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { getUserActionsProgress } from '@/utils/shared/getUserActionsProgress'
import { COUNTRY_CODE_TO_LOCALE, SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { hasCompleteUserProfile } from '@/utils/web/hasCompleteUserProfile'
import { getSensitiveDataUserDisplayName } from '@/utils/web/userUtils'

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
  const isMobile = useIsMobile({
    defaultState: true,
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

  return (
    <div className="standard-spacing-from-navbar container space-y-10 lg:space-y-16">
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

          {!isMobile && (
            <div className="flex items-center gap-4">
              <EditProfileButton user={user} />
            </div>
          )}
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

      {isMobile && (
        <div className="flex items-center gap-4">
          <EditProfileButton user={user} />
        </div>
      )}

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

function EditProfileButton({ user }: { user: PageUserProfileUser }) {
  const session = useSession()
  const hasHydrated = useHasHydrated()

  if (!hasHydrated) {
    return null
  }

  return (
    <UpdateUserProfileFormDialog user={user}>
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
