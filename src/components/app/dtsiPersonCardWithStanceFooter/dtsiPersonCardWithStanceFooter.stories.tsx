import type { Meta, StoryObj } from '@storybook/react'

import { DtsiPersonCardWithStanceFooter } from '@/components/app/dtsiPersonCardWithStanceFooter/dtsiPersonCardWithStanceFooter'
import {
  DTSI_PersonPoliticalAffiliationCategory,
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleStatus,
  DTSI_TwitterAccountState,
  DTSI_TwitterAccountType,
} from '@/data/dtsi/generated'

const getDefaultProps = () => {
  const props: React.ComponentProps<typeof DtsiPersonCardWithStanceFooter> = {
    person: {
      id: 'fakeId',
      slug: 'joseph---biden',
      firstName: 'Joseph',
      lastName: 'Biden',
      firstNickname: 'Joe',
      nameSuffix: '',
      politicalAffiliationCategory: DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT,
      computedStanceScore: 0,
      manuallyOverriddenStanceScore: undefined,
      profilePictureUrl:
        'https://db0prh5pvbqwd.cloudfront.net/admin-uploads/production/person_profile_picture_urls/Joe_Biden_presidential_portrait.jpg',
      profilePictureUrlDimensions: { width: 220, height: 275 },
      promotedPositioning: undefined,
      primaryRole: {
        dateEnd: undefined,
        dateStart: '2021-01-20',
        id: 'fakeId',
        primaryCity: '',
        primaryCountryCode: 'US',
        primaryDistrict: 'CA',
        primaryState: 'CA',
        roleCategory: DTSI_PersonRoleCategory.SENATE,
        status: DTSI_PersonRoleStatus.HELD,
        title: 'President',
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
  title: 'App/DTSIPersonCardWithStanceFooter',
  component: DtsiPersonCardWithStanceFooter,
  tags: ['autodocs'],
  args: getDefaultProps(),
} satisfies Meta<typeof DtsiPersonCardWithStanceFooter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
