import type { Meta } from '@storybook/react'

import { DTSIStanceDetails } from '@/components/app/dtsiStanceDetails'
import { StanceDetailsProps } from '@/components/app/dtsiStanceDetails/types'
import { DTSI_PersonDetailsQuery, DTSI_PersonStanceType } from '@/data/dtsi/generated'
import { dtsiPersonDetailsQueryString } from '@/data/dtsi/queries/queryDTSIPersonDetails/dtsiPersonDetailsQueryString'
import { queryDTSIMockSchema } from '@/mocks/dtsi/queryDTSIMockSchema'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const meta = {
  title: 'App/DTSIStanceDetails',
  component: DTSIStanceDetails,
  parameters: {
    options: { showPanel: false },
  },
  render: (args, { loaded }) => (
    <div className="mx-auto max-w-2xl">
      <DTSIStanceDetails {...args} {...loaded} />
    </div>
  ),
} satisfies Meta<typeof DTSIStanceDetails>

export default meta

const getProps =
  (transform = (props: StanceDetailsProps) => props) =>
  () =>
    queryDTSIMockSchema<DTSI_PersonDetailsQuery>(dtsiPersonDetailsQueryString).then(data => {
      const person = data.people[0]
      const stance = person.stances[0]
      return transform({ person, stance, countryCode: SupportedCountryCodes.US })
    })

export const Quote = {
  loaders: [
    getProps(props => {
      props.stance.stanceType = DTSI_PersonStanceType.QUOTE
      return props
    }),
  ],
}
export const TweetFromPerson = {
  loaders: [
    getProps(props => {
      props.stance.stanceType = DTSI_PersonStanceType.TWEET
      props.stance.tweet!.twitterAccount.personId = props.person.id
      return props
    }),
  ],
}
export const TweetAboutPerson = {
  loaders: [
    getProps(props => {
      props.stance.stanceType = DTSI_PersonStanceType.TWEET
      props.stance.tweet!.twitterAccount.personId = null
      return props
    }),
  ],
}
export const BillRelationship = {
  loaders: [
    getProps(props => {
      props.stance.stanceType = DTSI_PersonStanceType.BILL_RELATIONSHIP
      return props
    }),
  ],
}
