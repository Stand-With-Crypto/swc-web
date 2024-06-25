import { UserActionType } from '@prisma/client'

import { SensitiveDataClientUserAction } from '@/clientModels/clientUserAction/sensitiveDataClientUserAction'
import { NextImage } from '@/components/ui/image'
import {
  UserActionCallCampaignName,
  UserActionCampaigns,
  UserActionEmailCampaignName,
  UserActionTweetAtPersonCampaignName,
} from '@/utils/shared/userActionCampaigns'

type DisabledUserActionCampaigns = {
  [K in keyof UserActionCampaigns]?: {
    [Key in UserActionCampaigns[K]]?: {
      title: string
      subtitle: string
    }
  }
}

const DISABLED_USER_ACTION_CAMPAIGNS: DisabledUserActionCampaigns = {
  [UserActionType.EMAIL]: {
    [UserActionEmailCampaignName.FIT21_2024_04]: {
      title: 'FIT21 Email Campaign',
      subtitle: 'You emailed your representative and asked them to vote YES on FIT21.',
    },
    [UserActionEmailCampaignName.CNN_PRESIDENTIAL_DEBATE_2024]: {
      title: 'CNN Presidential Debate 2024',
      subtitle: "You emailed CNN and asked them to include the candidates' stance on crypto.",
    },
  },
  [UserActionType.TWEET_AT_PERSON]: {
    [UserActionTweetAtPersonCampaignName['2024_05_22_PIZZA_DAY']]: {
      title: 'Pizza Day 2024',
      subtitle: 'You tweeted your representative for pizza day.',
    },
  },
  [UserActionType.CALL]: {
    [UserActionCallCampaignName.FIT21_2024_04]: {
      title: 'FIT21 Call Campaign',
      subtitle: 'You called your representative and asked them to vote YES on FIT21.',
    },
  },
}

interface PreviousCampaignsListProps {
  userActions: SensitiveDataClientUserAction[]
}

export function PreviousCampaignsList({ userActions }: PreviousCampaignsListProps) {
  return (
    <div>
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
