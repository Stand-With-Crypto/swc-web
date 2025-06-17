import { ReactNode } from 'react'
import Balancer from 'react-wrap-balancer'
import Link from 'next/link'

import { CheckIcon } from '@/components/app/userActionGridCTAs/icons/checkIcon'
import { UserActionGridCTACampaign } from '@/components/app/userActionGridCTAs/types'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useCountryCode } from '@/hooks/useCountryCode'
import { useDialog } from '@/hooks/useDialog'
import {
  getUserActionDeeplink,
  UserActionTypesWithDeeplink,
} from '@/utils/shared/urlsDeeplinkUserActions'
import { cn } from '@/utils/web/cn'
import { useSuccessScreenDialogContext } from '@/hooks/useSuccessScreenDialogContext'

interface UserActionGridCampaignsDialogProps {
  children: ReactNode
  title: string
  description: string
  campaigns: Array<UserActionGridCTACampaign>
  performedUserActions: Record<string, any>
  shouldOpenDeeplink?: boolean
}

export function UserActionGridCampaignsDialog(props: UserActionGridCampaignsDialogProps) {
  const dialogProps = useDialog({ analytics: 'Grid CTA Campaign Dialog' })

  return (
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent a11yTitle={props.title} className="max-w-xl">
        <UserActionGridCampaignsDialogContent {...props} />
      </DialogContent>
    </Dialog>
  )
}

export function UserActionGridCampaignsDialogContent({
  title,
  description,
  campaigns,
  performedUserActions,
  shouldOpenDeeplink,
}: Omit<UserActionGridCampaignsDialogProps, 'children'>) {
  const countryCode = useCountryCode()
  const { shouldCloseSuccessScreenDialog } = useSuccessScreenDialogContext()

  const activeCampaigns = campaigns.filter(campaign => campaign.isCampaignActive)
  const completedInactiveCampaigns = campaigns.filter(
    campaign =>
      !campaign.isCampaignActive &&
      performedUserActions[`${campaign.actionType}-${campaign.campaignName}`],
  )

  return (
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
            const url = shouldOpenDeeplink
              ? getUserActionDeeplink({
                  actionType: campaign.actionType as UserActionTypesWithDeeplink,
                  config: {
                    countryCode,
                  },
                  campaign: campaign.campaignName,
                })
              : null

            if (url) {
              return (
                <Link href={url} key={campaignKey}>
                  <CampaignCard
                    onClick={shouldCloseSuccessScreenDialog}
                    description={campaign.description}
                    isCompleted={isCompleted}
                    isReadOnly
                    title={campaign.title}
                  />
                </Link>
              )
            }

            if (!WrapperComponent) {
              return (
                <CampaignCard
                  description={campaign.description}
                  isCompleted={isCompleted}
                  key={campaignKey}
                  title={campaign.title}
                />
              )
            }

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
                const url = shouldOpenDeeplink
                  ? getUserActionDeeplink({
                      actionType: campaign.actionType as UserActionTypesWithDeeplink,
                      config: {
                        countryCode,
                      },
                      campaign: campaign.campaignName,
                    })
                  : null

                const WrapperComponent = campaign.WrapperComponent
                const campaignKey = `${campaign.actionType}-${campaign.campaignName}`
                const isCompleted = !!performedUserActions[campaignKey]

                if (url) {
                  return (
                    <Link href={url} key={campaignKey} onClick={shouldCloseSuccessScreenDialog}>
                      <CampaignCard
                        description={campaign.description}
                        isCompleted={isCompleted}
                        isReadOnly
                        title={campaign.title}
                      />
                    </Link>
                  )
                }

                if (!WrapperComponent) {
                  return (
                    <CampaignCard
                      description={campaign.description}
                      isCompleted={isCompleted}
                      isReadOnly
                      key={campaignKey}
                      title={campaign.title}
                    />
                  )
                }

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
  onClick?: () => void
}) {
  return (
    <button
      {...rest}
      className={cn(
        'flex w-full items-center justify-between rounded-2xl bg-backgroundAlternate p-6',
        isReadOnly && 'pointer-events-none cursor-default',
      )}
    >
      <div className="flex w-full flex-col items-start">
        <strong className="text-left">{title}</strong>
        <p className="text-left text-muted-foreground">{description}</p>
      </div>
      <div className="relative h-8 w-8">
        <CheckIcon completed={isCompleted} index={0} />
      </div>
    </button>
  )
}
