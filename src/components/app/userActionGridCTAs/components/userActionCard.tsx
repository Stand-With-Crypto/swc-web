import { forwardRef } from 'react'

import { UserActionCardProps } from '@/components/app/userActionGridCTAs/types'
import { NextImage } from '@/components/ui/image'
import { cn } from '@/utils/web/cn'

import { CampaignsCheckmarks } from './campaignsCheckmarks'

export const UserActionCard = forwardRef<
  HTMLButtonElement,
  Omit<UserActionCardProps, 'WrapperComponent'>
>(
  (
    {
      title,
      image,
      description,
      completedCampaigns,
      campaignsLength,
      campaigns,
      performedUserActions,
      mobileCTADescription,
      link: _link,
      campaignsModalDescription: _campaignsModalDescription,
      ...rest
    },
    ref,
  ) => {
    const isReadOnly = campaigns.every(
      campaign =>
        !campaign.canBeTriggeredMultipleTimes &&
        performedUserActions[`${campaign.actionType}-${campaign.campaignName}`],
    )

    const getProgressText = () => {
      if (campaignsLength === 1) {
        return completedCampaigns === 1 ? 'Complete' : 'Not complete'
      }

      return `${completedCampaigns}/${campaignsLength} Complete`
    }

    const isPrepareToVoteAction = campaigns.some(
      campaign => campaign.actionType === 'VOTING_INFORMATION_RESEARCHED',
    )

    return (
      <button
        className={cn(
          'grid h-full w-full cursor-pointer rounded-3xl shadow-md transition-shadow hover:shadow-xl max-lg:grid-cols-[1fr_128px] lg:max-w-96 lg:grid-rows-[200px_1fr]',
          isReadOnly && 'pointer-events-none cursor-default',
        )}
        ref={ref}
        {...rest}
      >
        <div className="flex h-full w-full items-center justify-center rounded-br-3xl rounded-tr-3xl bg-[radial-gradient(74.32%_74.32%_at_50.00%_50.00%,#F0E8FF_8.5%,#6B28FF_89%)] px-5 py-9 max-lg:order-2 lg:h-auto lg:min-h-48 lg:max-w-full lg:rounded-br-none lg:rounded-tl-3xl">
          <NextImage
            alt={title}
            className="hidden lg:block"
            height={isPrepareToVoteAction ? 166 : 120}
            src={image}
            width={isPrepareToVoteAction ? 166 : 120}
          />
          <NextImage
            alt={title}
            className="h-20 w-20 lg:hidden"
            height={80}
            src={image}
            width={80}
          />
        </div>
        <div className="flex h-auto w-full flex-col items-start justify-between rounded-bl-3xl rounded-tl-3xl border-t border-muted lg:h-full lg:rounded-br-3xl lg:rounded-tl-none lg:border-none">
          <div className="flex flex-col gap-1 p-4 lg:gap-4 lg:p-6">
            <strong className="text-left font-sans text-sm font-bold lg:text-2xl lg:leading-none lg:-tracking-[0.24px]">
              {title}
            </strong>
            <p className="hidden text-left text-sm text-muted-foreground lg:block lg:text-base">
              {description}
            </p>
            <p className="text-left text-sm text-muted-foreground lg:hidden lg:text-base">
              {mobileCTADescription ?? description}
            </p>
          </div>

          <div className="mt-auto flex w-full items-center gap-2 border-t-0 p-4 lg:gap-4 lg:border-t-[1px] lg:border-t-muted lg:p-6">
            <CampaignsCheckmarks
              campaignsLength={campaignsLength}
              completedCampaigns={completedCampaigns}
            />
            <span className="text-xs lg:text-base">{getProgressText()}</span>
          </div>
        </div>
      </button>
    )
  },
)

UserActionCard.displayName = 'UserActionCard'
