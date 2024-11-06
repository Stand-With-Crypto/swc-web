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
`
