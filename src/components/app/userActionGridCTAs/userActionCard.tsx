import { CampaignsDialog } from '@/components/app/userActionGridCTAs/campaignsDialog'
import { UserActionGridCTACampaign } from '@/components/app/userActionGridCTAs/types'
import { NextImage } from '@/components/ui/image'

interface UserActionCardProps {
  title: string
  description: string
  image: string
  campaignsLength: number
  completedCampaigns: number
  campaigns: Array<UserActionGridCTACampaign>
  link?: (args: { children: React.ReactNode }) => React.ReactNode
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
    <CampaignsDialog>
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
}: Omit<UserActionCardProps, 'WrapperComponent'>) {
  const getProgressText = () => {
    if (campaignsLength === 1) {
      return completedCampaigns === 1 ? 'Complete' : 'Not complete'
    }

    return `${completedCampaigns}/${campaignsLength} complete`
  }

  return (
    <button className="flex h-full w-full flex-row-reverse rounded-3xl transition-shadow hover:shadow-lg lg:max-w-96 lg:flex-col">
      <div className="flex h-full min-h-36 min-w-32 max-w-32 items-center justify-center rounded-br-3xl rounded-tr-3xl bg-[radial-gradient(74.32%_74.32%_at_50.00%_50.00%,#F0E8FF_8.5%,#6B28FF_89%)] px-5 py-9 lg:h-auto lg:min-h-56 lg:w-full lg:max-w-full lg:rounded-br-none lg:rounded-tl-3xl">
        <NextImage className="hidden lg:block" alt={title} height={150} src={image} width={150} />
        <NextImage className="h-20 w-20 lg:hidden" alt={title} height={80} src={image} width={80} />
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
              <CheckIcon completed={index <= completedCampaigns} index={index} key={index} />
            ))}
          </div>
          <span className="text-xs lg:text-base">{getProgressText()}</span>
        </div>
      </div>
    </button>
  )
}

function CheckIcon({ completed, index }: { completed?: boolean; index: number }) {
  return (
    <svg
      className="absolute bottom-0 top-0 rounded-full border-2 border-muted bg-muted"
      style={{ left: index > 0 ? `${index * 16}px` : 0, zIndex: index }}
      fill="none"
      height="32"
      viewBox="0 0 32 32"
      width="32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="16"
        cy="16"
        fill="#BFC4CF"
        r="15"
        stroke={completed ? 'var(--primary)' : 'var(--muted-foreground)'}
        strokeWidth="2"
      />
      <path
        d="M21.7869 12.5436L13.787 21.1768L9.61328 16.6726L10.7869 15.5851L13.787 18.8228L20.6133 11.4561L21.7869 12.5436Z"
        fill="white"
      />
    </svg>
  )
}
