import { faker } from '@faker-js/faker'
import { UserActionType } from '@prisma/client'
import type { Meta, StoryObj } from '@storybook/react'
import { X } from 'lucide-react'

import { TopLevelClientLogic } from '@/app/[locale]/topLevelClientLogic'
import { getClientAddress } from '@/clientModels/clientAddress'
import { getSensitiveDataClientUser } from '@/clientModels/clientUser/sensitiveDataClientUser'
import { UserActionFormSuccessScreenContent } from '@/components/app/userActionFormSuccessScreen'
import { UserActionFormSuccessScreenMainCTA } from '@/components/app/userActionFormSuccessScreen/userActionFormSuccessScreenMainCTA'
import {
  dialogCloseStyles,
  dialogContentPaddingStyles,
  dialogContentStyles,
  dialogOverlayStyles,
} from '@/components/ui/dialog/styles'
import { SupportedLocale } from '@/intl/locales'
import { mockAddress } from '@/mocks/models/mockAddress'
import { mockUser } from '@/mocks/models/mockUser'
import { mockUserCryptoAddress } from '@/mocks/models/mockUserCryptoAddress'
import { mockUserEmailAddress } from '@/mocks/models/mockUserEmailAddress'
import { NFTSlug } from '@/utils/shared/nft'
import { cn } from '@/utils/web/cn'
import { NFT_CLIENT_METADATA } from '@/utils/web/nft'
import { USER_ACTION_TYPE_CTA_PRIORITY_ORDER } from '@/utils/web/userActionUtils'

export type Props = React.ComponentPropsWithoutRef<typeof UserActionFormSuccessScreenMainCTA>

function UserActionFormSuccessScreenStory(props: Props) {
  return (
    <TopLevelClientLogic locale={SupportedLocale.EN_US}>
      <div className={cn(dialogOverlayStyles)}>
        <div className={cn(dialogContentStyles, dialogContentPaddingStyles, 'max-w-3xl')}>
          <UserActionFormSuccessScreenContent {...props} />
          <div className={dialogCloseStyles}>
            <X size={20} />
            <span className="sr-only">Close</span>
          </div>
        </div>
      </div>
    </TopLevelClientLogic>
  )
}

const meta = {
  title: 'App/UserActionFormSuccessScreen',
  component: UserActionFormSuccessScreenStory,
  parameters: {
    layout: 'centered',
    nextjs: {
      appDirectory: true,
    },
  },
  // decorators: [NextRouterDecorator],
} satisfies Meta<typeof UserActionFormSuccessScreenStory>

export default meta

type Story = StoryObj<typeof meta>

const getDefault = () => {
  return {
    onClose: () => {},
    data: {
      performedUserActionTypes: [UserActionType.OPT_IN],
      user: {
        ...getSensitiveDataClientUser({
          ...mockUser(),
          address: mockAddress(),
          primaryUserCryptoAddress: mockUserCryptoAddress(),
          primaryUserEmailAddress: mockUserEmailAddress(),
          hasOptedInToMembership: true,
        }),
        address: getClientAddress(mockAddress()),
      },
    },
  } satisfies Props
}

const getProps = (fn?: (props: ReturnType<typeof getDefault>) => Props) => {
  faker.seed(1)
  const defaultProps = getDefault()
  if (fn) {
    return fn(defaultProps)
  }
  return defaultProps
}

export const NotSignedUp: Story = {
  args: getProps(props => ({
    ...props,
    data: { ...props.data, performedUserActionTypes: [] },
  })),
}

export const NotSignedUpWithNFT: Story = {
  args: getProps(props => ({
    ...props,
    data: { ...props.data, performedUserActionTypes: [] },
    nftWhenAuthenticated: NFT_CLIENT_METADATA[NFTSlug.CALL_REPRESENTATIVE_SEPT_11],
  })),
}

export const Loading: Story = {
  args: getProps(props => ({
    ...props,
    data: undefined,
    nftWhenAuthenticated: NFT_CLIENT_METADATA[NFTSlug.CALL_REPRESENTATIVE_SEPT_11],
  })),
}

export const HasNotCompletedUserProfile: Story = {
  args: getProps(props => ({
    ...props,
    data: { ...props.data, user: { ...props.data.user, firstName: '' } },
  })),
}

export const HasNotOptedInToMembership: Story = {
  args: getProps(props => ({
    ...props,
    data: { ...props.data, user: { ...props.data.user, hasOptedInToMembership: false } },
  })),
}

export const HasNotOptedInToMembershipWithNFT: Story = {
  args: getProps(props => ({
    ...props,
    data: {
      ...props.data,
      user: { ...props.data.user, hasOptedInToMembership: false },
    },
    nftWhenAuthenticated: NFT_CLIENT_METADATA[NFTSlug.CALL_REPRESENTATIVE_SEPT_11],
  })),
}

export const WithAdditionalActionsToTake: Story = {
  args: getProps(),
}

export const WithoutAdditionalActionsToTake: Story = {
  args: getProps(props => ({
    ...props,
    data: {
      ...props.data,
      performedUserActionTypes: [...USER_ACTION_TYPE_CTA_PRIORITY_ORDER],
    },
  })),
}
