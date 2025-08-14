'use client'

import * as React from 'react'
import { UserActionType } from '@prisma/client'

import { PartnerGrid } from '@/components/app/pagePartners/partnerGrid'
import { UserActionFormClaimNFTDialog } from '@/components/app/userActionFormClaimNFT/dialog'
import { PageLayout } from '@/components/ui/pageLayout'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { NFTSlug } from '@/utils/shared/nft'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import {
  USUserActionClaimNftCampaignName,
  USUserActionEmailCampaignName,
  USUserActionViewKeyPageCampaignName,
} from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { createTweetLink } from '@/utils/web/createTweetLink'

import { ActionCheckbox, EmailActionCheckbox, ViewKeyPageActionCheckbox } from './actionCheckbox'
import { DAY_OF_ACTION_2025_08_14_PARTNERS } from './partners'

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

interface ActionConfig {
  actionType: UserActionType
  campaignName: string
}

const ACTION_CONFIG_BY_CAMPAIGN_NAME: Record<string, ActionConfig> = {
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
  [USUserActionEmailCampaignName.DAY_OF_ACTION_AUG_14_2025]: {
    actionType: UserActionType.EMAIL,
    campaignName: USUserActionEmailCampaignName.DAY_OF_ACTION_AUG_14_2025,
  },
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

  return (
    <PageLayout className="flex flex-col items-center gap-8">
      <section className="text-center">
        <small className="text-sm text-gray-500">Stand With Crypto Presents</small>
        <PageLayout.Title>Crypto Day of Action</PageLayout.Title>
        <PageLayout.Subtitle>
          Thursday, August 14 will mark two years of Stand With Crypto advocates uniting to advance
          pro-crypto legislation that will make the United States into the Crypto Capital of the
          World. To commemorate this anniversary, the progress we’ve secured, and the work ahead,
          crypto advocates from across the country are uniting to participate in a Crypto Day of
          Action. Together, we are making sure crypto voters’ voices are being heard and encouraging
          lawmakers in Washington, D.C. to prioritize common-sense policies that will allow crypto
          to thrive long into the future.
        </PageLayout.Subtitle>
      </section>

      <section className="w-full max-w-3xl">
        <PageLayout.Title as="h2" size="sm">
          Get involved on August 14 by:
        </PageLayout.Title>

        <div className="flex w-full flex-col gap-8">
          <ViewKeyPageActionCheckbox
            campaignName={USUserActionViewKeyPageCampaignName.DAY_OF_ACTION_LIVESTREAM}
            description="Stand With Crypto, alongside partners from across the country, are hosting a livestream on X throughout the day."
            isCompleted={hasCompletedAction(
              ACTION_CONFIG_BY_CAMPAIGN_NAME[
                USUserActionViewKeyPageCampaignName.DAY_OF_ACTION_LIVESTREAM
              ],
            )}
            path="https://x.com/standwithcrypto/status/1955970196939923521"
            title="Tuning in to the Crypto Day of Action livestream"
          />

          <EmailActionCheckbox
            campaignName={USUserActionEmailCampaignName.DAY_OF_ACTION_AUG_14_2025}
            description="Send an email to your members of Congress and let them know why common-sense pro-crypto policies are important"
            isCompleted={hasCompletedAction(
              ACTION_CONFIG_BY_CAMPAIGN_NAME[
                USUserActionEmailCampaignName.DAY_OF_ACTION_AUG_14_2025
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
              message: `I’m taking action with @standwithcrypto to protect the future of digital innovation.\n\nEmail your members of Congress. Join the livestream. Post with #CryptoDayofAction 🛡️.\n\nJoin us at: https://www.standwithcrypto.org/cryptodayofaction`,
            })}
            title="Spreading the word"
          />

          <ViewKeyPageActionCheckbox
            campaignName={USUserActionViewKeyPageCampaignName.DAY_OF_ACTION_UPDATE_X_PROFILE}
            description={
              <>
                Add a Crypto Day of Action banner and a shield emoji 🛡️ to your profile.
                <br />
                Download banner images{' '}
                <span
                  className="inline text-primary-cta underline"
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    window.open(
                      'https://fgrsqtudn7ktjmlh.public.blob.vercel-storage.com/public/day-of-action/day-of-action-banners.zip',
                    )
                  }}
                  role="link"
                >
                  here
                </span>
                .
              </>
            }
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

      <section className="flex w-full max-w-3xl flex-col items-center">
        <PageLayout.Title as="h2" size="sm">
          And then...
        </PageLayout.Title>

        <UserActionFormClaimNFTDialog
          campaignName={USUserActionClaimNftCampaignName.DAY_OF_ACTION_2025_08_14}
          countryCode={countryCode}
          nftSlug={NFTSlug.DAY_OF_ACTION_2025_08_14}
        >
          <ActionCheckbox
            description="Claim your NFT to commemorate your participation in the Crypto Day of Action."
            isCompleted={hasCompletedAction({
              actionType: UserActionType.CLAIM_NFT,
              campaignName: USUserActionClaimNftCampaignName.DAY_OF_ACTION_2025_08_14,
            })}
            title="Claim your NFT"
          />
        </UserActionFormClaimNFTDialog>
      </section>

      <section className="mt-8 flex w-full max-w-3xl flex-col items-center">
        <PageLayout.Title as="h2" size="md">
          Partners
        </PageLayout.Title>

        <PartnerGrid partners={DAY_OF_ACTION_2025_08_14_PARTNERS} />
      </section>
    </PageLayout>
  )
}
