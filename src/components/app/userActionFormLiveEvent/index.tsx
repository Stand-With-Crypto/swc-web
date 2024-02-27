'use client'

import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import {
  ANALYTICS_NAME_USER_ACTION_FORM_LIVE_EVENT,
  MESSAGES,
  SectionNames,
} from '@/components/app/userActionFormLiveEvent/constants'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { Button } from '@/components/ui/button'
import { useSections } from '@/hooks/useSections'
import { NFTSlug } from '@/utils/shared/nft'
import { UserActionLiveEventCampaignName } from '@/utils/shared/userActionCampaigns'
import { NFT_CLIENT_METADATA } from '@/utils/web/nft'

export type UserActionFormLiveEventProps = {
  slug: UserActionLiveEventCampaignName
  onClose: () => void
  isLoggedIn: boolean
}

export function UserActionFormLiveEvent({
  slug,
  isLoggedIn,
  onClose,
}: UserActionFormLiveEventProps) {
  const sectionProps = useSections<SectionNames>({
    sections: Object.values(SectionNames),
    initialSectionId: SectionNames.LANDING,
    analyticsName: ANALYTICS_NAME_USER_ACTION_FORM_LIVE_EVENT,
  })
  const { currentSection: currentTab, onSectionNotFound: onTabNotFound } = sectionProps

  switch (currentTab) {
    case SectionNames.LANDING:
      return (
        <UserActionFormLayout>
          <UserActionFormLayout.Container>
            <div className="flex h-full  flex-col items-center justify-center gap-4">
              <UserActionFormLayout.Heading
                subtitle={MESSAGES[slug][isLoggedIn ? 'signedInSubtitle' : 'signedOutSubtitle']}
                title={MESSAGES[slug].title}
              />
              <Button onClick={() => sectionProps.goToSection(SectionNames.SUCCESS)}>
                {isLoggedIn ? 'Claim NFT' : 'Sign in to claim'}
              </Button>
            </div>
          </UserActionFormLayout.Container>
        </UserActionFormLayout>
      )
    case SectionNames.SUCCESS:
      return (
        <UserActionFormSuccessScreen
          // Replace with real NFT
          nftWhenAuthenticated={NFT_CLIENT_METADATA[NFTSlug.CALL_REPRESENTATIVE_SEPT_11]}
          onClose={onClose}
        />
      )
    default:
      onTabNotFound()
      return null
  }
}
