'use client'

import { useMemo } from 'react'
import { UserActionType } from '@prisma/client'
import { uniqBy } from 'lodash-es'
import Link from 'next/link'

import { CampaignsDialog } from '@/components/app/userActionGridCTAs/campaignsDialog'
import { USER_ACTION_CTAS_FOR_GRID_DISPLAY } from '@/components/app/userActionGridCTAs/constants'
import { UserActionGridCTACampaign } from '@/components/app/userActionGridCTAs/types'
import { UserActionCardProps } from '@/components/app/userActionGridCTAs/userActionCard'
import { useLocale } from '@/hooks/useLocale'
import {
  getUserActionDeeplink,
  UserActionTypesWithDeeplink,
} from '@/utils/shared/urlsDeeplinkUserActions'
import { cn } from '@/utils/web/cn'
import { NextImage } from '@/components/ui/image'
import { CheckIcon } from '@/components/app/userActionGridCTAs/checkIcon'

interface UserActionGridCTAsForSuccessScreenProps {
  excludeUserActionTypes?: UserActionType[]
  performedUserActionTypes: {
    actionType: UserActionType
    campaignName: string
  }[]
}

export function UserActionGridCTAsForSuccessScreen({
  excludeUserActionTypes,
  performedUserActionTypes,
}: UserActionGridCTAsForSuccessScreenProps) {
  const performeduserActionObj = useMemo(() => {
    return performedUserActionTypes.length
      ? performedUserActionTypes.reduce(
          (acc, performedUserAction) => {
            acc[`${performedUserAction.actionType}-${performedUserAction.campaignName}`] =
              performedUserAction
            return acc
          },
          {} as Record<string, any>,
        )
      : {}
  }, [performedUserActionTypes])

  const ctas = excludeUserActionTypes
    ? Object.entries(USER_ACTION_CTAS_FOR_GRID_DISPLAY)
        .filter(([key, _]) => !excludeUserActionTypes?.includes(key))
        .map(([_, value]) => value)
    : Object.values(USER_ACTION_CTAS_FOR_GRID_DISPLAY)

  const orderedCTAs = useMemo(() => {
    const result: {
      title: string
      description: string
      mobileCTADescription?: string
      campaignsModalDescription: string
      link?: (args: { children: React.ReactNode }) => React.ReactNode
      image: string
      campaigns: Array<UserActionGridCTACampaign>
    }[] = []

    // adding ctas that are not completed as top priority
    ctas.map(cta => {
      if (cta.campaigns.length === 1) {
        const key = `${cta.campaigns[0].actionType}-${cta.campaigns[0].campaignName}`
        if (!performeduserActionObj[key]) {
          return result.push(cta)
        }
      }

      let completedCampaigns = 0

      cta.campaigns.map(campaign => {
        const key = `${campaign.actionType}-${campaign.campaignName}`
        if (performeduserActionObj[key]) {
          completedCampaigns++
        }
      })

      const filteredCampaigns = cta.campaigns.filter(campaign => {
        const key = `${campaign.actionType}-${campaign.campaignName}`
        return campaign.isCampaignActive || !!performeduserActionObj[key]
      })

      if (completedCampaigns < filteredCampaigns.length) {
        result.push(cta)
      }
    })

    // adding ctas that are completed as second priority
    ctas.map(cta => {
      if (cta.campaigns.length === 1) {
        const key = `${cta.campaigns[0].actionType}-${cta.campaigns[0].campaignName}`
        if (performeduserActionObj[key]) {
          return result.push(cta)
        }
      }

      let completedCampaigns = 0

      cta.campaigns.map(campaign => {
        const key = `${campaign.actionType}-${campaign.campaignName}`
        if (performeduserActionObj[key]) {
          completedCampaigns++
        }
      })

      const filteredCampaigns = cta.campaigns.filter(campaign => {
        const key = `${campaign.actionType}-${campaign.campaignName}`
        return campaign.isCampaignActive || !!performeduserActionObj[key]
      })

      if (completedCampaigns === filteredCampaigns.length) {
        result.push(cta)
      }
    })

    return uniqBy(result, cta => `${cta.title}-${cta.description}`)
  }, [ctas, performeduserActionObj])

  return (
    <div className="flex flex-col gap-[18px]">
      {orderedCTAs.map(cta => {
        const completedCampaigns = cta.campaigns.reduce((acc, campaign) => {
          const key = `${campaign.actionType}-${campaign.campaignName}`
          return performeduserActionObj[key] ? acc + 1 : acc
        }, 0)
        const filteredCampaigns = cta.campaigns.filter(campaign => {
          const key = `${campaign.actionType}-${campaign.campaignName}`
          return campaign.isCampaignActive || !!performeduserActionObj[key]
        })

        return (
          <UserActionGridCTA
            campaigns={filteredCampaigns}
            campaignsLength={
              completedCampaigns > filteredCampaigns.length
                ? completedCampaigns
                : filteredCampaigns.length
            }
            campaignsModalDescription={cta.campaignsModalDescription}
            completedCampaigns={completedCampaigns}
            description={cta.description}
            image={cta.image}
            key={cta.title + cta.description}
            link={cta.link}
            mobileCTADescription={cta.mobileCTADescription}
            performedUserActions={performeduserActionObj}
            title={cta.title}
          />
        )
      })}
    </div>
  )
}

function UserActionGridCTA(props: UserActionCardProps) {
  const locale = useLocale()

  if (props.link) {
    const LinkComponent = props.link
    return (
      <LinkComponent>
        <UserActionCard {...props} />
      </LinkComponent>
    )
  }

  if (props.campaignsLength === 1) {
    const campaign = props.campaigns[0]

    const url = getUserActionDeeplink({
      actionType: campaign.actionType as UserActionTypesWithDeeplink,
      config: {
        locale,
      },
      campaign: campaign.campaignName as any,
    })

    return (
      <Link href={url}>
        <UserActionCard {...props} />
      </Link>
    )
  }

  return (
    <CampaignsDialog
      {...props}
      description={props.campaignsModalDescription}
      performedUserActions={props.performedUserActions}
      shouldOpenDeeplink={true}
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
  performedUserActions,
  mobileCTADescription,
  link: _link,
  campaignsModalDescription: _campaignsModalDescription,
  ...rest
}: Omit<UserActionCardProps, 'WrapperComponent'>) {
  const isReadOnly =
    campaignsLength === 1 &&
    !campaigns[0]?.canBeTriggeredMultipleTimes &&
    performedUserActions[`${campaigns[0]?.actionType}-${campaigns[0]?.campaignName}`]

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
        'flex w-full cursor-pointer flex-row-reverse rounded-3xl transition-shadow hover:shadow-lg',
        isReadOnly && 'pointer-events-none cursor-default',
      )}
    >
      <div className="flex min-h-36 min-w-32 max-w-32 items-center justify-center rounded-br-3xl rounded-tr-3xl bg-[radial-gradient(74.32%_74.32%_at_50.00%_50.00%,#F0E8FF_8.5%,#6B28FF_89%)] px-5 py-9">
        <NextImage
          className="h-full w-full object-contain"
          alt={title}
          height={80}
          src={image}
          width={80}
        />
      </div>
      <div className="flex w-full flex-col items-start justify-between gap-3 rounded-bl-3xl rounded-tl-3xl bg-muted px-4 py-4">
        <strong className="text-left font-sans text-sm font-bold lg:text-xl">{title}</strong>
        <p className="hidden text-left text-sm text-muted-foreground lg:block lg:text-base">
          {description}
        </p>
        <p className="text-left text-sm text-muted-foreground lg:hidden lg:text-base">
          {mobileCTADescription ?? description}
        </p>

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
                completed={index < completedCampaigns && completedCampaigns > 0}
                index={index}
                key={index}
                svgClassname="border-2 border-muted bg-muted"
              />
            ))}
          </div>
          <span className="text-xs lg:text-base">{getProgressText()}</span>
        </div>
      </div>
    </button>
  )
}
