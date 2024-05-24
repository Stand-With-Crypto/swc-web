import { ExperimentsTesting } from '@/components/ui/experimentsTesting'
import { useApiResponseForUserClaimedOptInNft } from '@/hooks/useApiResponseForUserClaimedOptInNft'
import { hasCompleteUserProfile } from '@/utils/web/hasCompleteUserProfile'

import { UpdateUserProfileForm as Control } from './control'
import { UpdateUserProfileForm as Variant } from './variant'

export function UpdateUserProfileFormExperimentTesting(props: Parameters<typeof Control>[0]) {
  const { data: claimedOptInNft } = useApiResponseForUserClaimedOptInNft({
    suspense: true,
    revalidateOnMount: false,
  })

  // We must check if the user has already claimed the opt-in NFT or has a complete user profile because there
  // are cases where the NFT is not minted right away because the transaction fee is higher than the threshold

  // If the user is in the variant of the experiment and has not claimed the opt-in NFT because of it
  // we should still render the Control Form if he has already completed his profile
  if (claimedOptInNft || hasCompleteUserProfile(props.user)) return <Control {...props} />

  return (
    <ExperimentsTesting
      experimentName="gh02_SWCSignUpFlowExperiment"
      variants={{
        control: <Control {...props} />,
        variant: <Variant {...props} />,
      }}
    />
  )
}
