import { UserActionFormClaimNFTDialog } from '@/components/app/userActionFormClaimNFT/dialog'
import { getEmailActionWrapperComponentByCampaignName } from '@/components/app/userActionFormEmailCongressperson/getWrapperComponentByCampaignName'
import { Button } from '@/components/ui/button'
import { PageLayout } from '@/components/ui/pageLayout'
import { NFTSlug } from '@/utils/shared/nft'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

import { ActionCheckbox } from './actionCheckbox'

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

export function PageDayOfAction() {
  const EmailActionWrapper = getEmailActionWrapperComponentByCampaignName({
    countryCode,
    campaignName: USUserActionEmailCampaignName.CLARITY_ACT_HOUSE_JUN_13_2025,
  })

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
          <ActionCheckbox
            completed={false}
            description="Stand With Crypto, alongside partners from across the country, are hosting a livestream on X and YouTube throughout the day."
            title="Tuning in to the Crypto Day of Action livestream"
          />
          <EmailActionWrapper>
            <ActionCheckbox
              completed={true}
              description="Send an email to your members of Congress and let them know why common-sense pro-crypto policies are important"
              title="Emailing your member of Congress"
            />
          </EmailActionWrapper>
          <ActionCheckbox
            completed={true}
            description="Ask your social network to participate in the Crypto Day of Action throughout the day. Don’t forget to use #CryptoDayofAction to help spread the word."
            title="Spreading the word"
          />
          <ActionCheckbox
            completed={false}
            description="Add a Crypto Day of Action banner to your profile and a shield emoji 🛡️ in your bio."
            title="Updating your profile"
          />
        </div>
      </section>

      <section className="flex w-full max-w-3xl flex-col items-center gap-2">
        <PageLayout.Title as="h2" size="sm">
          And then...
        </PageLayout.Title>

        <UserActionFormClaimNFTDialog countryCode={countryCode} nftSlug={NFTSlug.GENIUS_ACT_2025}>
          <Button>Claim your NFT</Button>
        </UserActionFormClaimNFTDialog>
      </section>
    </PageLayout>
  )
}
