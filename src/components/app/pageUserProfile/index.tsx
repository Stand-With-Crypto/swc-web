import { UserActionType } from '@prisma/client'
import { sumBy, uniq } from 'lodash-es'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { NFTDisplay } from '@/components/app/nftHub/nftDisplay'
import { PageUserProfileUser } from '@/components/app/pageUserProfile/getAuthenticatedData'
import { PreviousCampaignsList } from '@/components/app/pageUserProfile/previousCampaignsList'
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
import { getUserActionsProgress } from '@/utils/shared/getUserActionsProgress'
import { pluralize } from '@/utils/shared/pluralize'
import {
  USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP,
  USER_ACTIONS_WITH_ADDITIONAL_CAMPAIGN,
} from '@/utils/shared/userActionCampaigns'
import { hasCompleteUserProfile } from '@/utils/web/hasCompleteUserProfile'
import { getSensitiveDataUserDisplayName } from '@/utils/web/userUtils'

import { UserReferralUrl } from './userReferralUrl'

interface PageUserProfile extends PageProps {
  user: PageUserProfileUser
}

export function PageUserProfile({ params, user }: PageUserProfile) {
  const { locale } = params

  const { userActions } = user
  const performedUserActionTypes = uniq(
    userActions.map(x => ({ actionType: x.actionType, campaignName: x.campaignName })),
  )
  const { progressValue, numActionsCompleted, numActionsAvailable, excludeUserActionTypes } =
    getUserActionsProgress({
      userHasEmbeddedWallet: user.hasEmbeddedWallet,
      performedUserActionTypes,
    })

  const userActionsFromPreviousCampaigns = userActions.filter(
    action =>
      action.campaignName !== USER_ACTION_TO_CAMPAIGN_NAME_DEFAULT_MAP[action.actionType] &&
      !USER_ACTIONS_WITH_ADDITIONAL_CAMPAIGN[action.actionType]?.includes(action.campaignName),
  )

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
          <div>
            <LoginDialogWrapper
              authenticatedContent={<EditProfileButton user={user} />}
              subtitle="Confirm your email address or connect a wallet to receive your NFT."
              title="Claim your free NFT"
              useThirdwebSession
            >
              <Button>Claim my NFTs</Button>
            </LoginDialogWrapper>
          </div>
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
      <section>
        <PageTitle className="mb-4" size="sm">
          Your advocacy progress
        </PageTitle>
        <PageSubTitle className="mb-5">
          You've completed {numActionsCompleted} out of {numActionsAvailable} active campaigns. Keep
          going!
        </PageSubTitle>
        <div className="mx-auto mb-10 max-w-xl">
          <Progress value={progressValue} />
        </div>
        <UserActionRowCTAsList
          excludeUserActionTypes={Array.from(excludeUserActionTypes)}
          performedUserActionTypes={performedUserActionTypes}
        />
      </section>
      {userActionsFromPreviousCampaigns.length > 0 && (
        <section>
          <PageTitle className="mb-4" size="sm">
            Previous campaigns
          </PageTitle>
          <PageSubTitle className="mb-5">
            Nice work. You completed {userActionsFromPreviousCampaigns.length} previous{' '}
            {pluralize({ singular: 'campaign', count: userActionsFromPreviousCampaigns.length })}.
          </PageSubTitle>

          <PreviousCampaignsList userActions={userActionsFromPreviousCampaigns} />
        </section>
      )}

      <section>
        <a className="mt-[-72px] h-0 pt-[72px]" id="nfts" />
        <PageTitle className="mb-4" size="sm">
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

function EditProfileButton({ user }: { user: PageUserProfileUser }) {
  return (
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
  )
}
