import { RecentActivityRowMainText } from '@/components/app/recentActivityRow/mainText'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { AUUserActionViewKeyPageCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import { CAUserActionViewKeyPageCampaignName } from '@/utils/shared/userActionCampaigns/ca/caUserActionCampaigns'
import { GBUserActionViewKeyPageCampaignName } from '@/utils/shared/userActionCampaigns/gb/gbUserActionCampaigns'
import { USUserActionViewKeyPageCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'

interface ViewKeyPageRecentActivityRowProps {
  campaignName: string
  countryCode: SupportedCountryCodes
}

type ViewKeyPageCampaignName =
  | USUserActionViewKeyPageCampaignName
  | CAUserActionViewKeyPageCampaignName
  | AUUserActionViewKeyPageCampaignName
  | GBUserActionViewKeyPageCampaignName

export function viewKeyPageRecentActivityRow({
  campaignName,
  countryCode,
}: ViewKeyPageRecentActivityRowProps) {
  const urls = getIntlUrls(countryCode)

  const CAMPAIGN_NAME_TO_TITLE_MAP: Record<
    ViewKeyPageCampaignName,
    {
      children: React.ReactNode
      onFocusContent?: React.ComponentType
    }
  > = {
    [USUserActionViewKeyPageCampaignName.DEFAULT]: {
      children: <RecentActivityRowMainText>Someone viewed a key page</RecentActivityRowMainText>,
    },
    [CAUserActionViewKeyPageCampaignName.CA_Q2_2025_ELECTION]: {
      children: <RecentActivityRowMainText>Someone emailed their MP</RecentActivityRowMainText>,
      onFocusContent: () => (
        <InternalLink className="block" href={urls.newmodeElectionAction()}>
          <Button>Email yours</Button>
        </InternalLink>
      ),
    },
    [AUUserActionViewKeyPageCampaignName.AU_Q2_2025_ELECTION]: {
      children: <RecentActivityRowMainText>Someone emailed their MP</RecentActivityRowMainText>,
      onFocusContent: () => (
        <InternalLink className="block" href={urls.newmodeElectionAction()}>
          <Button>Email yours</Button>
        </InternalLink>
      ),
    },
    [GBUserActionViewKeyPageCampaignName.NEWMODE_EMAIL_ACTION]: {
      children: <RecentActivityRowMainText>Someone emailed their MP</RecentActivityRowMainText>,
      // TODO: uncomment when the debanking action is live
      // onFocusContent: () => (
      //   <InternalLink className="block" href={urls.newmodeDebankingAction()}>
      //     <Button>Email yours</Button>
      //   </InternalLink>
      // ),
    },
  }

  return (
    CAMPAIGN_NAME_TO_TITLE_MAP[campaignName as ViewKeyPageCampaignName] ??
    CAMPAIGN_NAME_TO_TITLE_MAP.DEFAULT
  )
}
