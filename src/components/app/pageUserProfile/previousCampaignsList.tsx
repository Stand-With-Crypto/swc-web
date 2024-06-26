import { SensitiveDataClientUserAction } from '@/clientModels/clientUserAction/sensitiveDataClientUserAction'
import { DISABLED_USER_ACTION_CAMPAIGNS } from '@/components/app/pageUserProfile/disabledUserActionCampaigns'
import { NextImage } from '@/components/ui/image'

interface PreviousCampaignsListProps {
  userActions: SensitiveDataClientUserAction[]
}

export function PreviousCampaignsList({ userActions }: PreviousCampaignsListProps) {
  return (
    <div className="flex flex-col gap-4">
      {userActions.map(action => (
        <CampaignCard action={action} key={action.id} />
      ))}
    </div>
  )
}

function CampaignCard({ action }: { action: SensitiveDataClientUserAction }) {
  const campaignsFromActionType = DISABLED_USER_ACTION_CAMPAIGNS[action.actionType]

  if (!campaignsFromActionType) return null

  const { title, subtitle } =
    campaignsFromActionType[action.campaignName as keyof typeof campaignsFromActionType] || {}

  if (!title || !subtitle) {
    throw new Error(
      `No title or subtitle found for campaign: ${action.campaignName}, in DISABLED_USER_ACTION_CAMPAIGNS`,
    )
  }

  return (
    <div className="flex w-full items-center gap-6 rounded-3xl bg-secondary p-4 text-left lg:px-8 lg:py-11">
      <NextImage alt={'Action complete'} height={24} src={'/misc/checkedCircle.svg'} width={24} />
      <div className="flex flex-col">
        <div className="mb-1 text-base font-bold lg:text-2xl">{title}</div>
        <div className="text-sm text-gray-500 lg:text-xl">{subtitle}</div>
      </div>
    </div>
  )
}
