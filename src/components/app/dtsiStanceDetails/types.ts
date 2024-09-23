import {
  DTSI_Bill,
  DTSI_BillPersonRelationship,
  DTSI_Person,
  DTSI_PersonStance,
  DTSI_PersonStanceDetailsFragment,
  DTSI_PersonStanceQuote,
  DTSI_PersonStanceType,
  DTSI_Tweet,
  DTSI_TweetMedia,
  DTSI_TwitterAccount,
} from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { PartialButDefined } from '@/types'

export type DTSIStanceDetailsQuoteProp = {
  stanceType: DTSI_PersonStanceType.QUOTE
  quote: Pick<DTSI_PersonStanceQuote, 'richTextDescription' | 'sourceUrl'>
}

export type DTSIStanceDetailsTweetProp = {
  stanceType: DTSI_PersonStanceType.TWEET
  tweet: Pick<DTSI_Tweet, 'datetimeCreatedOnTwitter' | 'entities' | 'id' | 'text'> & {
    twitterAccount: Pick<DTSI_TwitterAccount, 'id' | 'username' | 'personId'>
    tweetMedia: Pick<DTSI_TweetMedia, 'url' | 'id' | 'width' | 'height'>[]
  }
}

export type DTSIStanceDetailsBillRelationshipProp = {
  stanceType: DTSI_PersonStanceType.BILL_RELATIONSHIP
  billRelationship: Pick<DTSI_BillPersonRelationship, 'id' | 'relationshipType'> & {
    bill: Pick<
      DTSI_Bill,
      'id' | 'summary' | 'title' | 'shortTitle' | 'status' | 'computedStanceScore' | 'slug'
    >
  }
}

export type DTSIStanceDetailsStanceProp<
  D =
    | DTSIStanceDetailsQuoteProp
    | DTSIStanceDetailsTweetProp
    | DTSIStanceDetailsBillRelationshipProp,
> = Pick<DTSI_PersonStance, 'id' | 'dateStanceMade' | 'computedStanceScore'> & D

export type DTSIStanceDetailsStancePassedProp = Pick<
  DTSI_PersonStanceDetailsFragment,
  'id' | 'dateStanceMade' | 'stanceType' | 'computedStanceScore' | 'analysis' | 'additionalAnalysis'
> &
  Omit<PartialButDefined<DTSIStanceDetailsQuoteProp>, 'stanceType'> &
  Omit<PartialButDefined<DTSIStanceDetailsTweetProp>, 'stanceType'> &
  Omit<PartialButDefined<DTSIStanceDetailsBillRelationshipProp>, 'stanceType'>

export type DTSIStanceDetailsPersonProp = Pick<
  DTSI_Person,
  | 'profilePictureUrlDimensions'
  | 'firstName'
  | 'firstNickname'
  | 'lastName'
  | 'nameSuffix'
  | 'profilePictureUrl'
  | 'id'
>

export type IStanceDetailsProps = {
  locale: SupportedLocale
  person: DTSIStanceDetailsPersonProp
  stance: DTSIStanceDetailsStancePassedProp
  className?: string
  bodyClassName?: string
  hideImages?: boolean
}
