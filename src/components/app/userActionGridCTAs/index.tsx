import { USER_ACTION_CTAS_FOR_GRID_DISPLAY } from '@/components/app/userActionGridCTAs/constants'
import { UserActionGridCTA } from '@/components/app/userActionGridCTAs/userActionCard'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'

export function UserActionGridCTAs() {
  // const { data } = useApiResponseForUserPerformedUserActionTypes()
  const ctas = Object.values(USER_ACTION_CTAS_FOR_GRID_DISPLAY)

  // console.log(data)

  return (
    <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-3">
      {ctas.map(cta => (
        <UserActionGridCTA
          campaignsLength={cta.campaigns.length}
          completedCampaigns={0}
          description={cta.description}
          image={cta.image}
          key={cta.title + cta.description}
          title={cta.title}
          campaigns={cta.campaigns}
          link={cta.link}
        />
      ))}
    </div>
  )
}
