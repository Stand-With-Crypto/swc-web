import { UserActionType } from '@prisma/client'
import { sumBy, uniq } from 'lodash-es'
import { redirect, RedirectType } from 'next/navigation'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { NFTDisplay } from '@/components/app/nftHub/nftDisplay'
import { PageUserProfileUser } from '@/components/app/pageUserProfile/getAuthenticatedData'
import { UpdateUserProfileFormDialog } from '@/components/app/updateUserProfileForm/dialog'
import { OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY } from '@/components/app/updateUserProfileForm/queryParamConfig'
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
import { getSearchParam, setCallbackQueryString } from '@/utils/server/searchParams'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'
import { USER_ACTION_DEEPLINK_MAP } from '@/utils/shared/urlsDeeplinkUserActions'
import { hasCompleteUserProfile } from '@/utils/web/hasCompleteUserProfile'
import { getSensitiveDataUserDisplayName } from '@/utils/web/userUtils'

import { UserReferralUrl } from './userReferralUrl'

const USER_ACTIONS_AVAILABLE_FOR_CTA: Record<UserActionType, boolean> = {
  [UserActionType.CALL]: true,
  [UserActionType.EMAIL]: true,
  [UserActionType.DONATION]: true,
  [UserActionType.NFT_MINT]: true,
  [UserActionType.OPT_IN]: true,
  [UserActionType.TWEET]: true,
  [UserActionType.VOTER_REGISTRATION]: true,
  [UserActionType.LIVE_EVENT]: false,
  [UserActionType.TWEET_AT_PERSON]: false,
}

const USER_ACTIONS_EXCLUDED_FROM_CTA = Object.entries(USER_ACTIONS_AVAILABLE_FOR_CTA)
  .filter(([_, value]) => !value)
  .map(([key, _]) => key as UserActionType)

interface PageUserProfile extends PageProps {
  user: PageUserProfileUser | null
}

export function PageUserProfile({ params, searchParams, user }: PageUserProfile) {
  const { locale } = params
  if (!user) {
    // For now the only authenticated page we have is /profile,
    // so we don't need to dynamically pass the redirect path to login
    // If we add more authenticated pages, we'll need to make this dynamic
    const { value } = getSearchParam({
      searchParams,
      queryParamKey: OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY,
    })

    redirect(
      USER_ACTION_DEEPLINK_MAP[UserActionType.OPT_IN].getDeeplinkUrl({
        locale,
        queryString: setCallbackQueryString({
          destination: value === 'true' ? 'updateProfile' : null,
        }),
      }),
      RedirectType.replace,
    )
  }
  const { userActions } = user
  const performedUserActionTypes = uniq(userActions.map(x => x.actionType))
  const excludeUserActionTypes = user.hasEmbeddedWallet
    ? [UserActionType.NFT_MINT, ...USER_ACTIONS_EXCLUDED_FROM_CTA]
    : USER_ACTIONS_EXCLUDED_FROM_CTA
  const numActionsCompleted = performedUserActionTypes.filter(
    action => !excludeUserActionTypes.includes(action),
  ).length
  const numActionsAvailable = Object.values(UserActionType).length - excludeUserActionTypes.length

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
          You've completed {numActionsCompleted} out of {numActionsAvailable} actions. Keep going!
        </PageSubTitle>
        <div className="mx-auto mb-10 max-w-xl">
          <Progress value={(numActionsCompleted / numActionsAvailable) * 100} />
        </div>
        <UserActionRowCTAsList
          excludeUserActionTypes={excludeUserActionTypes}
          performedUserActionTypes={performedUserActionTypes}
        />
      </section>
      <section>
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
