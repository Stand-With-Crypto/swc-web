'use client'
import { ReactNode, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserActionType } from '@prisma/client'
import { Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { actionUpdateUserProfile } from '@/actions/actionUpdateUserProfile'
import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { GetUserPerformedUserActionTypesResponse } from '@/app/api/identified-user/performed-user-action-types/route'
import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY } from '@/components/app/updateUserProfileForm/queryParamConfig'
import { getNextAction } from '@/components/app/userActionFormSuccessScreen/getNextAction'
import { HasOptedInToMembershipForm } from '@/components/app/userActionFormSuccessScreen/hasOptedInToMembershipForm'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormErrorMessage,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { NextImage } from '@/components/ui/image'
import { Input } from '@/components/ui/input'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Skeleton } from '@/components/ui/skeleton'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { useSession } from '@/hooks/useSession'
import { TURN_OFF_NFT_MINT } from '@/utils/shared/killSwitches'
import { trackFormSubmissionSyncErrors, triggerServerActionForForm } from '@/utils/web/formUtils'
import { hasCompleteUserProfile } from '@/utils/web/hasCompleteUserProfile'
import { NFTClientMetadata } from '@/utils/web/nft'
import { zodUpdateUserProfileWithRequiredFormFields } from '@/validation/forms/zodUpdateUserProfile/zodUpdateUserProfileFormFields'

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

const FORM_NAME = 'User phone number'

interface UserActionFormSuccessScreenMainCTAProps {
  children: ReactNode
  nftWhenAuthenticated?: NFTClientMetadata
  data:
    | {
        user: GetUserFullProfileInfoResponse['user']
        performedUserActionTypes: GetUserPerformedUserActionTypesResponse['performedUserActionTypes']
      }
    | undefined
  onClose: () => void
}

export function UserActionFormSuccessScreenMainCTA({
  children,
  nftWhenAuthenticated,
  data,
  onClose,
}: UserActionFormSuccessScreenMainCTAProps) {
  const router = useRouter()
  const session = useSession()

  const form = useForm({
    resolver: zodResolver(zodUpdateUserProfileWithRequiredFormFields),
    defaultValues: {
      phoneNumber: '',
    },
  })

  /**
   * TODO: Check auth state & phone number
   */

  return (
    <div className="w-full space-y-6 text-center">
      <PageTitle size={'md'}>Nice work!</PageTitle>
      <PageSubTitle size={'md'}>
        This is an important year for crypto. Sign up for occasional text updates on important
        legislation, elections, and events in your area.
      </PageSubTitle>
      <Form {...form}>
        <form
          className="flex h-full flex-col space-y-6"
          onSubmit={form.handleSubmit(async values => {
            const result = await triggerServerActionForForm(
              {
                form,
                formName: FORM_NAME,
                payload: { ...values, hasOptedInToSms: !!values.phoneNumber },
              },
              payload => actionUpdateUserProfile(payload),
            )
            if (result.status === 'success') {
              router.refresh()
              toast.success('Profile updated', { duration: 5000 })
            }
          }, trackFormSubmissionSyncErrors(FORM_NAME))}
        >
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Phone number" {...field} />
                </FormControl>
                <FormErrorMessage />
              </FormItem>
            )}
          />
          <div className="space-y-4">
            <p className="text-sm text-fontcolor-muted">
              By clicking Get updates, I consent to receive recurring texts from Stand with Crypto.
              You can reply STOP to stop receiving texts. Message and data rates may apply.
            </p>
            <Button
              className="w-full md:w-1/2"
              disabled={form.formState.isSubmitting}
              size="lg"
              type="submit"
            >
              Get updates
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )

  return children

  const urls = useIntlUrls()
  const [hasOptedInToMembershipState, setHasOptedInToMembershipState] = useState<
    'hidden' | 'visible' | 'submitted'
  >('hidden')

  if (!data || session.isLoading) {
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

  const receivedAnNft = nftWhenAuthenticated ? (
    <>
      <PageTitle size="sm">Nice work! You earned a new NFT.</PageTitle>
      {TURN_OFF_NFT_MINT && session.isLoggedInThirdweb ? (
        <p className="mt-2 text-sm font-bold">
          It will be sent to your connected wallet in the next few days.
        </p>
      ) : null}
    </>
  ) : (
    <PageTitle size="sm">Nice work!</PageTitle>
  )

  const { user, performedUserActionTypes } = data
  const hasOptedInToMembership = performedUserActionTypes.some(
    performedAction => performedAction.actionType === UserActionType.OPT_IN,
  )

  if (nftWhenAuthenticated && session.isLoggedIn && !session.isLoggedInThirdweb) {
    return (
      <Container>
        <RedeemedNFTImage nft={nftWhenAuthenticated} />
        {receivedAnNft}
        <PageSubTitle size={'md'}>You’ve earned an NFT for completing this action.</PageSubTitle>

        <LoginDialogWrapper
          forceUnauthenticated
          subtitle="Confirm your email address or connect a wallet to receive your NFT."
          title="Claim your free NFT"
          useThirdwebSession
        >
          <Button>Claim free NFT</Button>
        </LoginDialogWrapper>
      </Container>
    )
  }

  if (!user || !hasOptedInToMembership) {
    if (nftWhenAuthenticated) {
      return (
        <Container>
          <NFTImage nft={nftWhenAuthenticated} />
          {receivedAnNft}
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
        {receivedAnNft}
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
            {receivedAnNft}
            <PageTitle size="sm">Continue the fight - become a {'501(c)4'} member.</PageTitle>
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
        {receivedAnNft}
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
      {receivedAnNft}
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
