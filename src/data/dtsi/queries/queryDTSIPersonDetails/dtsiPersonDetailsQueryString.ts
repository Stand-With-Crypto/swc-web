import { fragmentDTSIPersonStanceDetails } from '@/data/dtsi/fragments/fragmentDTSIPersonStanceDetails'

export const dtsiPersonDetailsQueryString = /* GraphQL */ `
  query PersonDetails($slugIn: [String!]) {
    people(limit: 1, offset: 0, slugIn: $slugIn) {
      id
      twitterAccounts {
        id
        state
        username
      }
      suffixName
      slug
      primaryRole {
        dateEnd
        dateStart
        id
        primaryCity
        primaryCountryCode
        primaryDistrict
        primaryState
        roleCategory
        status
        title
      }
      donationUrl
      firstName
      firstNickname
      gender
      lastName
      manuallyOverriddenStanceScore
      middleName
      nameSuffix
      nameUniquenessModifier
      officialUrl
      phoneNumber
      politicalAffiliationCategory
      politicalAffiliation
      computedStanceScore
      computedSumStanceScoreWeight
      manuallyOverriddenStanceScore
      stances(verificationStatusIn: APPROVED) {
        ...PersonStanceDetails
      }
      profilePictureUrl
      profilePictureUrlDimensions
      roles {
        id
        status
        primaryCity
        primaryCountryCode
        primaryDistrict
        primaryState
        roleCategory
        title
        group {
          category
          dateEnd
          dateStart
          datetimeCreated
          datetimeUpdated
          displayName
          groupInstance
          id
          officialUrl
          primaryCity
          primaryCountryCode
          primaryDistrict
          primaryState
          proPublicaId
        }
      }
    }
  }
  ${fragmentDTSIPersonStanceDetails}
`
