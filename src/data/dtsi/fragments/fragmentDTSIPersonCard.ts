export const fragmentDTSIPersonCard = /* GraphQL */ `
  fragment PersonCard on Person {
    id
    slug
    firstName
    lastName
    firstNickname
    nameSuffix
    politicalAffiliationCategory
    computedStanceScore
    computedSumStanceScoreWeight
    manuallyOverriddenStanceScore
    profilePictureUrl
    profilePictureUrlDimensions
    promotedPositioning
    stanceCount(verificationStatusIn: APPROVED)
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
    twitterAccounts {
      accountType
      id
      personId
      state
      username
    }
  }
`
