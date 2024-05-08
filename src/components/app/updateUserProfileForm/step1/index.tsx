import { ExperimentsTesting } from '@/components/ui/experimentsTesting'
import { hasCompleteUserProfile } from '@/utils/web/hasCompleteUserProfile'

import { UpdateUserProfileForm as Control } from './control'
import { UpdateUserProfileForm as Variant } from './variant'

export function UpdateUserProfileFormExperimentTesting(props: Parameters<typeof Control>[0]) {
  if (hasCompleteUserProfile(props.user)) return <Control {...props} />

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
