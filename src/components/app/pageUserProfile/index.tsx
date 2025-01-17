'use client'

import { UserActionType } from '@prisma/client'
import { sumBy, uniq } from 'lodash-es'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { NFTDisplay } from '@/components/app/nftHub/nftDisplay'
import { PageUserProfileUser } from '@/components/app/pageUserProfile/getAuthenticatedData'
import { UpdateUserProfileFormDialog } from '@/components/app/updateUserProfileForm/dialog'
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
import { PageProps } from '@/types'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { getUserActionsProgress } from '@/utils/shared/getUserActionsProgress'
import { hasCompleteUserProfile } from '@/utils/web/hasCompleteUserProfile'
import { getSensitiveDataUserDisplayName } from '@/utils/web/userUtils'

import { UserReferralUrl } from './userReferralUrl'

type PageUserProfile = { params: Awaited<PageProps['params']> } & {
  user: PageUserProfileUser
}

export function PageUserProfile({ params, user }: PageUserProfile) {
  const { locale } = params

  const isMobile = useIsMobile({
    defaultState: true,
  })

  const { data } = useApiResponseForUserFullProfileInfo()

  const { userActions: userActionsFromLoadedUserInServerSide } = user

  const userActions = data?.user?.userActions ?? userActionsFromLoadedUserInServerSide

  const performedUserActionTypes = uniq(
    userActions.map(x => ({ actionType: x.actionType, campaignName: x.campaignName })),
  )
  const { progressValue, numActionsCompleted, numActionsAvailable } = getUserActionsProgress({
    userHasEmbeddedWallet: user.hasEmbeddedWallet,
    performedUserActionTypes,
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
                  locale={locale}
                />
              </div>
            </div>
          </div>

          {!isMobile && <ProfileAndNFTButtons user={user} />}
        </div>
        <div className="grid grid-cols-3 rounded-3xl bg-secondary p-3 text-center sm:p-6">
          {[
            {
              label: 'Actions',
              value: <FormattedNumber amount={numActionsCompleted} locale={locale} />,
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

      {isMobile && <ProfileAndNFTButtons user={user} />}

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
        <PageTitle className="mb-4" size="md">
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

function ProfileAndNFTButtons({ user }: { user: PageUserProfileUser }) {
  return (
    <div className="flex items-center gap-4">
      <LoginDialogWrapper
        authenticatedContent={null}
        subtitle="Confirm your email address or connect a wallet to receive your NFT."
        title="Claim your free NFT"
        useThirdwebSession
      >
        <Button className="w-full lg:w-auto">Claim my NFTs</Button>
      </LoginDialogWrapper>

      <EditProfileButton user={user} />
    </div>
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
