'use client'

import * as React from 'react'
import { UserActionType } from '@prisma/client'

import { UserActionFormClaimNFTDialog } from '@/components/app/userActionFormClaimNFT/dialog'
import { Button } from '@/components/ui/button'
import { PageLayout } from '@/components/ui/pageLayout'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { NFTSlug } from '@/utils/shared/nft'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import {
  USUserActionEmailCampaignName,
  USUserActionViewKeyPageCampaignName,
} from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { createTweetLink } from '@/utils/web/createTweetLink'

import { EmailActionCheckbox, ViewKeyPageActionCheckbox } from './actionCheckbox'

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

const ACTION_CONFIG_BY_CAMPAIGN_NAME = {
  [USUserActionViewKeyPageCampaignName.DAY_OF_ACTION_LIVESTREAM]: {
    actionType: UserActionType.VIEW_KEY_PAGE,
    campaignName: USUserActionViewKeyPageCampaignName.DAY_OF_ACTION_LIVESTREAM,
  },
  [USUserActionViewKeyPageCampaignName.DAY_OF_ACTION_SHARE_ON_X]: {
    actionType: UserActionType.VIEW_KEY_PAGE,
    campaignName: USUserActionViewKeyPageCampaignName.DAY_OF_ACTION_SHARE_ON_X,
  },
  [USUserActionViewKeyPageCampaignName.DAY_OF_ACTION_UPDATE_X_PROFILE]: {
    actionType: UserActionType.VIEW_KEY_PAGE,
    campaignName: USUserActionViewKeyPageCampaignName.DAY_OF_ACTION_UPDATE_X_PROFILE,
  },
  [USUserActionEmailCampaignName.CLARITY_ACT_HOUSE_JUN_13_2025]: {
    actionType: UserActionType.EMAIL,
    campaignName: USUserActionEmailCampaignName.CLARITY_ACT_HOUSE_JUN_13_2025,
  },
}

interface ActionConfig {
  actionType: UserActionType
  campaignName: string
}

export function PageDayOfAction() {
  const { data } = useApiResponseForUserPerformedUserActionTypes()
  const performedUserActionTypes = React.useMemo(() => data?.performedUserActionTypes ?? [], [data])

  const hasCompletedAction = React.useCallback(
    ({ actionType, campaignName }: ActionConfig) => {
      return performedUserActionTypes.some(
        x => x.actionType === actionType && x.campaignName === campaignName,
      )
    },
    [performedUserActionTypes],
  )

  const hasCompletedAllActions = React.useMemo(() => {
    return Object.values(ACTION_CONFIG_BY_CAMPAIGN_NAME).every(actionConfig =>
      hasCompletedAction(actionConfig),
    )
  }, [hasCompletedAction])

  return (
    <PageLayout className="flex flex-col items-center gap-16">
      <section className="text-center">
        <small className="text-sm text-gray-500">Stand With Crypto Presents</small>
        <PageLayout.Title>Crypto Day of Action</PageLayout.Title>
        <PageLayout.Subtitle>
          Thursday, August 14 will mark two years of Stand With Crypto advocates uniting to advance
          pro-crypto legislation that will make the crypto capital of the world. To commemorate this
          anniversary, the progress we've secured, and the work ahead, crypto advocates from across
          the country are uniting to participate in a Crypto Day of Action. Together, we are making
          sure crypto voters' voices are being heard and encouraging lawmakers in Washington, D.C.
          to prioritize common-sense policies that will allow crypto to thrive long into the future.
        </PageLayout.Subtitle>
      </section>

      <section className="w-full max-w-3xl">
        <PageLayout.Title as="h2" size="sm">
          Get involved on August 14 by:
        </PageLayout.Title>

        <div className="flex w-full flex-col gap-8">
          <ViewKeyPageActionCheckbox
            campaignName={USUserActionViewKeyPageCampaignName.DAY_OF_ACTION_LIVESTREAM}
            description="Stand With Crypto, alongside partners from across the country, are hosting a livestream on X and YouTube throughout the day."
            isCompleted={hasCompletedAction(
              ACTION_CONFIG_BY_CAMPAIGN_NAME[
                USUserActionViewKeyPageCampaignName.DAY_OF_ACTION_LIVESTREAM
              ],
            )}
            path="https://x.com/StandWithCrypto/status/1814000000000000000"
            title="Tuning in to the Crypto Day of Action livestream"
          />
          <EmailActionCheckbox
            campaignName={USUserActionEmailCampaignName.CLARITY_ACT_HOUSE_JUN_13_2025}
            description="Send an email to your members of Congress and let them know why common-sense pro-crypto policies are important"
            isCompleted={hasCompletedAction(
              ACTION_CONFIG_BY_CAMPAIGN_NAME[
                USUserActionEmailCampaignName.CLARITY_ACT_HOUSE_JUN_13_2025
              ],
            )}
            title="Emailing your member of Congress"
          />
          <ViewKeyPageActionCheckbox
            campaignName={USUserActionViewKeyPageCampaignName.DAY_OF_ACTION_SHARE_ON_X}
            description="Ask your social network to participate in the Crypto Day of Action throughout the day. Don't forget to use #CryptoDayofAction to help spread the word."
            isCompleted={hasCompletedAction(
              ACTION_CONFIG_BY_CAMPAIGN_NAME[
                USUserActionViewKeyPageCampaignName.DAY_OF_ACTION_SHARE_ON_X
              ],
            )}
            path={createTweetLink({
              message:
                'lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. #CryptoDayofAction',
            })}
            title="Spreading the word"
          />
          <ViewKeyPageActionCheckbox
            campaignName={USUserActionViewKeyPageCampaignName.DAY_OF_ACTION_UPDATE_X_PROFILE}
            description="Add a Crypto Day of Action banner to your profile and a shield emoji 🛡️ in your bio."
            isCompleted={hasCompletedAction(
              ACTION_CONFIG_BY_CAMPAIGN_NAME[
                USUserActionViewKeyPageCampaignName.DAY_OF_ACTION_UPDATE_X_PROFILE
              ],
            )}
            path="https://x.com/settings/profile"
            title="Updating your profile"
          />
        </div>
      </section>

      <section className="flex w-full max-w-3xl flex-col items-center gap-2">
        <PageLayout.Title as="h2" size="sm">
          And then...
        </PageLayout.Title>

        <UserActionFormClaimNFTDialog countryCode={countryCode} nftSlug={NFTSlug.GENIUS_ACT_2025}>
          <Button disabled={!hasCompletedAllActions}>Claim your NFT</Button>
        </UserActionFormClaimNFTDialog>
      </section>
    </PageLayout>
  )
}
