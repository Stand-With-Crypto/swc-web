import { CampaignsDialog } from '@/components/app/userActionGridCTAs/campaignsDialog'
import { CheckIcon } from '@/components/app/userActionGridCTAs/checkIcon'
import { UserActionGridCTACampaign } from '@/components/app/userActionGridCTAs/types'
import { NextImage } from '@/components/ui/image'
import { cn } from '@/utils/web/cn'

interface UserActionCardProps {
  title: string
  description: string
  campaignsModalDescription: string
  image: string
  campaignsLength: number
  completedCampaigns: number
  campaigns: Array<UserActionGridCTACampaign>
  link?: (args: { children: React.ReactNode }) => React.ReactNode
  performedUserActions: Record<string, any>
}

export function UserActionGridCTA(props: UserActionCardProps) {
  if (props.link) {
    // If the link property is present, the CTA will function as a link, even if there are multiple campaigns.
    const LinkComponent = props.link
    return (
      <LinkComponent>
        <UserActionCard {...props} />
      </LinkComponent>
    )
  }

  // If there is only one campaign, clicking the CTA will trigger the WrapperComponent for that campaign.
  const shouldUseFirstCampaignWrapperComponent =
    props.campaignsLength === 1 &&
    props.campaigns[0].isCampaignActive &&
    props.campaigns[0].canBeTriggeredMultipleTimes

  if (shouldUseFirstCampaignWrapperComponent) {
    const WrapperComponent = props.campaigns[0].WrapperComponent
    return (
      <WrapperComponent>
        <UserActionCard {...props} />
      </WrapperComponent>
    )
  }

  return (
    <CampaignsDialog
      {...props}
      description={props.campaignsModalDescription}
      performedUserActions={props.performedUserActions}
    >
      <UserActionCard {...props} />
    </CampaignsDialog>
  )
}

function UserActionCard({
  title,
  image,
  description,
  completedCampaigns,
  campaignsLength,
  campaigns,
  ...rest
}: Omit<UserActionCardProps, 'WrapperComponent'>) {
  const isReadOnly = campaignsLength === 1 && !campaigns[0]?.canBeTriggeredMultipleTimes

  const getProgressText = () => {
    if (campaignsLength === 1) {
      return completedCampaigns === 1 ? 'Complete' : 'Not complete'
    }

    return `${completedCampaigns}/${campaignsLength} complete`
  }

  return (
    <button
      {...rest}
      className={cn(
        'flex h-full w-full cursor-pointer flex-row-reverse rounded-3xl transition-shadow hover:shadow-lg lg:max-w-96 lg:flex-col',
        isReadOnly && 'pointer-events-none cursor-default',
      )}
    >
      <div className="flex h-full min-h-36 min-w-32 max-w-32 items-center justify-center rounded-br-3xl rounded-tr-3xl bg-[radial-gradient(74.32%_74.32%_at_50.00%_50.00%,#F0E8FF_8.5%,#6B28FF_89%)] px-5 py-9 lg:h-auto lg:min-h-56 lg:w-full lg:max-w-full lg:rounded-br-none lg:rounded-tl-3xl">
        <NextImage alt={title} className="hidden lg:block" height={150} src={image} width={150} />
        <NextImage alt={title} className="h-20 w-20 lg:hidden" height={80} src={image} width={80} />
      </div>
      <div className="flex h-full w-full flex-col items-start justify-between gap-3 rounded-bl-3xl rounded-tl-3xl bg-muted px-4 py-4 lg:rounded-br-3xl lg:rounded-tl-none lg:px-10 lg:py-8">
        <strong className="text-left font-sans text-sm font-bold lg:text-xl">{title}</strong>
        <p className="text-left text-sm text-muted-foreground lg:text-base">{description}</p>

        <div className="mt-auto flex items-center gap-4 pt-5">
          <div
            className="relative h-8"
            style={{
              width:
                campaignsLength === 1 ? `${campaignsLength * 24}px` : `${campaignsLength * 19}px`,
            }}
          >
            {Array.from({ length: campaignsLength }, (_, index) => (
              <CheckIcon
                completed={index <= completedCampaigns && completedCampaigns > 0}
                index={index}
                key={index}
              />
            ))}
          </div>
          <span className="text-xs lg:text-base">{getProgressText()}</span>
        </div>
      </div>
    </button>
  )
}
