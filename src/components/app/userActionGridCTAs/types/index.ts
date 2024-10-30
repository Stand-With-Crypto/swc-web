import { UserActionType } from '@prisma/client'

import { UserActionCampaignName } from '@/utils/shared/userActionCampaigns'

export interface UserActionGridCTACampaign {
  actionType: UserActionType
  campaignName: UserActionCampaignName
  /**
   * CTA title.
   */
  title: string
  /**
   * CTA description.
   */
  description: string
  /**
   * This flag determines whether the user can click to open the campaign dialog if it is already completed.
   */
  canBeTriggeredMultipleTimes: boolean
  /**
   * This flag determines whether the campaign should be included in the progress calculation. If set to false, the campaign will still appear in the campaigns modal but will be excluded from the progress calculation.
   */
  isCampaignActive: boolean
  /**
   * The component that will be activated when the CTA is clicked
   */
  WrapperComponent: null | ((args: { children: React.ReactNode }) => React.ReactNode)
}

export type UserActionGridCTA = Record<
  string,
  {
    title: string
    description: string
    /**
     * This is optional and should be used when we want to have a smaller description on mobile to prevent increase in height on CTA. If it is not set, we use the description itself.
     */
    mobileCTADescription?: string
    /**
     * This is used as the description for the campaigns modal.
     */
    campaignsModalDescription: string
    /**
     * This property enables the CTA to function as a link, even if there are multiple campaigns. In short, it bypasses the check on the number of campaigns to determine whether to use the first campaign's WrapperComponent or to open the campaigns dialog.
     */
    link?: (args: { children: React.ReactNode }) => React.ReactNode
    /**
     * The image path for the CTA.
     */
    image: string
    /**
     * A list of campaigns linked to this CTA.
     *
     * - If there is only one campaign, clicking the CTA will trigger the WrapperComponent for that campaign.
     * - If there are multiple campaigns, a dialog will display all the campaigns in the order they appear in the array, with inactive campaigns shown at the end. Clicking on a campaign will trigger the WrapperComponent for that selected campaign.
     */
    campaigns: Array<UserActionGridCTACampaign>
  }
>

export interface UserActionCardProps {
  title: string
  description: string
  mobileCTADescription?: string
  campaignsModalDescription: string
  image: string
  campaignsLength: number
  completedCampaigns: number
  campaigns: Array<UserActionGridCTACampaign>
  link?: (args: { children: React.ReactNode }) => React.ReactNode
  performedUserActions: Record<string, any>
}
