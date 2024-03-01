'use client'
import { useState } from 'react'
import { UserActionType } from '@prisma/client'
import { Check } from 'lucide-react'

import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { GetUserPerformedUserActionTypesResponse } from '@/app/api/identified-user/performed-user-action-types/route'
import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY } from '@/components/app/updateUserProfileForm/queryParamConfig'
import { getNextAction } from '@/components/app/userActionFormSuccessScreen/getNextAction'
import { HasOptedInToMembershipForm } from '@/components/app/userActionFormSuccessScreen/hasOptedInToMembershipForm'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Skeleton } from '@/components/ui/skeleton'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { hasCompleteUserProfile } from '@/utils/web/hasCompleteUserProfile'
import { NFTClientMetadata } from '@/utils/web/nft'

const NFTImage = ({ nft }: { nft: NFTClientMetadata }) => (
  <NextImage
    alt={nft.image.alt}
    className="inline-block rounded-lg"
    height={nft.image.height}
    sizes="300px"
    src={nft.image.url}
    width={nft.image.width}
  />
)

const RedeemedNFTImage = ({ nft }: { nft: NFTClientMetadata }) => (
  <div>
    <NFTImage nft={nft} />
    <p className="mt-2 font-bold">You’ve earned a new NFT</p>
  </div>
)

function Container({ children }: { children: React.ReactNode }) {
  return <div className="w-full space-y-6 text-center">{children}</div>
}

export function UserActionFormSuccessScreenMainCTA({
  nftWhenAuthenticated,
  data,
  onClose,
}: {
  nftWhenAuthenticated?: NFTClientMetadata
  data?: {
    user: GetUserFullProfileInfoResponse['user']
    performedUserActionTypes: GetUserPerformedUserActionTypesResponse['performedUserActionTypes']
  }
  onClose: () => void
}) {
  const urls = useIntlUrls()
  const [hasOptedInToMembershipState, setHasOptedInToMembershipState] = useState<
    'hidden' | 'visible' | 'submitted'
  >('hidden')
  if (!data) {
    return (
      <Container>
        <PageTitle size="sm">
          <Skeleton>Nice work!</Skeleton>
        </PageTitle>
        <PageSubTitle>
          <Skeleton>
            Join to unlock rewards, see your activities and get personalized contents.
          </Skeleton>
        </PageSubTitle>
        <Button variant="secondary">
          <Skeleton>Join Stand With Crypto</Skeleton>
        </Button>
      </Container>
    )
  }
  const { user, performedUserActionTypes } = data
  const hasOptedInToMembership = performedUserActionTypes.find(
    action => action === UserActionType.OPT_IN,
  )
  if (!user || !hasOptedInToMembership) {
    if (nftWhenAuthenticated) {
      return (
        <Container>
          <NFTImage nft={nftWhenAuthenticated} />
          <PageTitle size="sm">Nice work!</PageTitle>
          <PageSubTitle size={'md'}>
            You’ve earned an NFT for completing this action. Join Stand With Crypto to claim your
            NFT, see your activities, and get personalized content.
          </PageSubTitle>
          <LoginDialogWrapper>
            <Button variant="secondary">Join To Claim NFT</Button>
          </LoginDialogWrapper>
        </Container>
      )
    }
    return (
      <Container>
        <PageTitle size="sm">Nice work!</PageTitle>
        <PageSubTitle size={'md'}>
          Join Stand With Crypto to claim exclusive NFTs, see your activity, and get personalized
          content.
        </PageSubTitle>
        <LoginDialogWrapper>
          <Button variant="secondary">Join Stand With Crypto</Button>
        </LoginDialogWrapper>
      </Container>
    )
  }
  if (!hasCompleteUserProfile(user)) {
    return (
      <Container>
        {nftWhenAuthenticated && <RedeemedNFTImage nft={nftWhenAuthenticated} />}
        <PageTitle size="sm">Nice work!</PageTitle>
        <PageSubTitle size={'md'}>
          Finish setting up your profile to unlock rewards, see your activities, and get
          personalized content.
        </PageSubTitle>
        <Button asChild variant="secondary">
          <InternalLink
            href={`${urls.profile()}?${OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY}=true`}
          >
            Finish my profile
          </InternalLink>
        </Button>
      </Container>
    )
  }
  if (!user.hasOptedInToMembership) {
    switch (hasOptedInToMembershipState) {
      case 'hidden':
        return (
          <Container>
            {nftWhenAuthenticated && <RedeemedNFTImage nft={nftWhenAuthenticated} />}
            <PageTitle size="sm">
              Nice work! Continue the fight - become a {'501(c)4'} member.
            </PageTitle>
            <PageSubTitle size={'md'}>
              Become a member of our nonprofit. It’s free to join and you’ll receive exclusive
              benefits that normal Stand With Crypto members won’t get.
            </PageSubTitle>
            <Button onClick={() => setHasOptedInToMembershipState('visible')} variant="secondary">
              Learn More
            </Button>
          </Container>
        )
      case 'visible':
        return (
          <HasOptedInToMembershipForm
            onCancel={() => setHasOptedInToMembershipState('hidden')}
            onSuccess={() => setHasOptedInToMembershipState('submitted')}
          />
        )
      case 'submitted':
        return (
          <Container>
            <div>
              <div className="inline-block rounded-full bg-green-600 p-1 text-white">
                <Check className="h-6 w-6" />
              </div>
            </div>
            <PageTitle size="sm">You’re now a 501(c)4 member of Stand With Crypto.</PageTitle>
            <PageSubTitle size={'md'}>
              You made history by joining the largest pro-crypto organization in the U.S. Don’t stop
              here - continue the fight for crypto.
            </PageSubTitle>
          </Container>
        )
    }
  }
  const nextAction = getNextAction(performedUserActionTypes)
  if (nextAction) {
    return (
      <Container>
        {nftWhenAuthenticated && <RedeemedNFTImage nft={nftWhenAuthenticated} />}
        <PageTitle size="sm">Nice work!</PageTitle>
        <PageSubTitle size={'md'}>
          You’ve done your part to save crypto, but the fight isn’t over yet. Keep the momentum
          going by completing the next action below.
        </PageSubTitle>
      </Container>
    )
  }
  return (
    <Container>
      {nftWhenAuthenticated && <RedeemedNFTImage nft={nftWhenAuthenticated} />}
      <PageTitle size="sm">Nice work!</PageTitle>
      <PageSubTitle size={'md'}>
        You’ve done your part to save crypto, but the fight isn’t over yet. We’ll be in touch when
        there’s more actions to complete.
      </PageSubTitle>
      <Button onClick={() => onClose()} variant="secondary">
        Done
      </Button>
    </Container>
  )
}
