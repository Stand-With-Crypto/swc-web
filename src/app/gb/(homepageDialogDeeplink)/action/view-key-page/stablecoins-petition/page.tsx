import { GBHomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout/gb'
import { GbUserActionViewKeyPageDeeplinkWrapper } from '@/components/app/userActionViewKeyPageDeeplinkWrapper/gb'
import { GBUserActionViewKeyPageCampaignName } from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'

export const dynamic = 'error'

export default async function UserActionViewKeyPageDeepLinkForStablecoinsPetition() {
  const searchParams = {
    campaignName: GBUserActionViewKeyPageCampaignName.UK_STABLE_COINS_PETITION_JUN_2025,
  }

  return (
    <GBHomepageDialogDeeplinkLayout hidePseudoDialog>
      <GbUserActionViewKeyPageDeeplinkWrapper searchParams={searchParams} />
    </GBHomepageDialogDeeplinkLayout>
  )
}
