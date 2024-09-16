import { ReactNode } from 'react'
import Balancer from 'react-wrap-balancer'

import { CheckIcon } from '@/components/app/userActionGridCTAs/checkIcon'
import { UserActionGridCTACampaign } from '@/components/app/userActionGridCTAs/types'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useDialog } from '@/hooks/useDialog'
import { cn } from '@/utils/web/cn'

interface CampaignsDialogProps {
  children: ReactNode
  title: string
  description: string
  image: string
  campaignsLength: number
  completedCampaigns: number
  campaigns: Array<UserActionGridCTACampaign>
  link?: (args: { children: React.ReactNode }) => React.ReactNode
  performedUserActions: Record<string, any>
}

export function CampaignsDialog({
  title,
  description,
  campaigns,
  performedUserActions,
  children,
}: CampaignsDialogProps) {
  const dialogProps = useDialog({ analytics: 'Grid CTA Campaign Dialog' })

  const activeCampaigns = campaigns.filter(campaign => campaign.isCampaignActive)
  const completedInactiveCampaigns = campaigns.filter(
    campaign =>
      !campaign.isCampaignActive &&
      performedUserActions[`${campaign.actionType}-${campaign.campaignName}`],
  )

  return (
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent a11yTitle="ABC debate email" className="max-w-xl">
        <div className="flex flex-col items-center gap-2 pb-4">
          <h3 className="font-sans text-xl font-bold">
            <Balancer>{title}</Balancer>
          </h3>
          <p className="text-center font-mono text-base text-muted-foreground">
            <Balancer>{description}</Balancer>
          </p>

          <ScrollArea className="w-full">
            <div className="mt-6 flex w-full flex-col gap-4 px-8 lg:max-h-80">
              {activeCampaigns.map(campaign => {
                const WrapperComponent = campaign.WrapperComponent
                const campaignKey = `${campaign.actionType}-${campaign.campaignName}`
                const isCompleted = !!performedUserActions[campaignKey]

                return (
                  <WrapperComponent key={campaignKey}>
                    <CampaignCard
                      description={campaign.description}
                      isCompleted={isCompleted}
                      title={campaign.title}
                    />
                  </WrapperComponent>
                )
              })}
            </div>

            <ScrollBar />
          </ScrollArea>

          {completedInactiveCampaigns.length > 0 && (
            <>
              <h4 className="pt-6 font-sans text-lg font-semibold">Past completed campaigns</h4>

              <ScrollArea className="w-full">
                <div className="mt-6 flex w-full flex-col gap-4 px-8 lg:max-h-80">
                  {completedInactiveCampaigns.map(campaign => {
                    const WrapperComponent = campaign.WrapperComponent
                    const campaignKey = `${campaign.actionType}-${campaign.campaignName}`
                    const isCompleted = !!performedUserActions[campaignKey]

                    return (
                      <WrapperComponent key={campaignKey}>
                        <CampaignCard
                          description={campaign.description}
                          isCompleted={isCompleted}
                          isReadOnly
                          title={campaign.title}
                        />
                      </WrapperComponent>
                    )
                  })}
                </div>

                <ScrollBar />
              </ScrollArea>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CampaignCard({
  title,
  description,
  isCompleted,
  isReadOnly,
  ...rest
}: {
  title: string
  description: string
  isCompleted: boolean
  isReadOnly?: boolean
}) {
  return (
    <button
      {...rest}
      className={cn(
        'flex items-center justify-between rounded-2xl bg-backgroundAlternate p-6',
        isReadOnly && 'pointer-events-none cursor-default',
      )}
    >
      <div className="flex flex-col items-start">
        <strong className="text-left">{title}</strong>
        <p className="text-left text-muted-foreground">{description}</p>
      </div>
      <div className="relative h-8 w-8">
        <CheckIcon completed={isCompleted} index={0} />
      </div>
    </button>
  )
}
