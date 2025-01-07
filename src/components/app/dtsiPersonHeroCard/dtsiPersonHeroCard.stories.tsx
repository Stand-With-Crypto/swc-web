import type { Meta, StoryObj } from '@storybook/react'

import { DTSIPersonHeroCard } from '@/components/app/dtsiPersonHeroCard'
import { Button } from '@/components/ui/button'
import {
  DTSI_PersonPoliticalAffiliationCategory,
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleStatus,
  DTSI_TwitterAccountState,
  DTSI_TwitterAccountType,
} from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'

const getDefaultProps = () => {
  const props: React.ComponentProps<typeof DTSIPersonHeroCard> = {
    subheader: 'role',
    locale: SupportedLocale.EN_US,
    person: {
      id: 'fakeId',
      slug: 'joseph---biden',
      firstName: 'Joseph',
      lastName: 'Biden',
      firstNickname: 'Joe',
      nameSuffix: '',
      politicalAffiliationCategory: DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT,
      computedStanceScore: 0,
      computedSumStanceScoreWeight: 5,
      manuallyOverriddenStanceScore: undefined,
      profilePictureUrl:
        'https://db0prh5pvbqwd.cloudfront.net/admin-uploads/production/person_profile_picture_urls/Joe_Biden_presidential_portrait.jpg',
      profilePictureUrlDimensions: { width: 220, height: 275 },
      promotedPositioning: undefined,
      stanceCount: 2,
      primaryRole: {
        dateEnd: undefined,
        dateStart: '2021-01-20',
        id: 'fakeId',
        primaryCity: '',
        primaryCountryCode: 'US',
        primaryDistrict: '',
        primaryState: '',
        roleCategory: DTSI_PersonRoleCategory.PRESIDENT,
        status: DTSI_PersonRoleStatus.HELD,
        title: 'President',
        group: null,
      },
      twitterAccounts: [
        {
          accountType: DTSI_TwitterAccountType.PROFESSIONAL,
          id: '',
          personId: '',
          state: DTSI_TwitterAccountState.VISIBLE,
          username: 'xHandle',
        },
      ],
    },
  }
  return props
}

const meta = {
  title: 'App/DTSIPersonHeroCard',
  component: DTSIPersonHeroCard,
  tags: ['autodocs'],
  args: getDefaultProps(),
} satisfies Meta<typeof DTSIPersonHeroCard>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {
  args: {},
}

export const SomeWhatSupportive: Story = {
  args: { person: { ...getDefaultProps().person, computedStanceScore: 75 } },
}

export const Recommended: Story = {
  args: { isRecommended: true },
}

export const NoProfilePicture: Story = {
  args: { person: { ...getDefaultProps().person, profilePictureUrl: '' } },
}

export const WithCustomFooter: Story = {
  args: {
    footer: (
      <div className="sm:p-4">
        <Button className="sm:w-full" variant="secondary">
          Donate
        </Button>
      </div>
    ),
  },
}
