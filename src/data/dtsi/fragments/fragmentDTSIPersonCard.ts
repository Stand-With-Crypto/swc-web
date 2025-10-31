export const fragmentDTSIPersonCard = /* GraphQL */ `
  fragment PersonCard on Person {
    id
    slug
    firstName
    lastName
    firstNickname
    nameSuffix
    politicalAffiliation
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
      group {
        id
        category
        groupInstance
      }
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

export const fragmentDTSIPersonCardWithRoles = /* GraphQL */ `
  fragment PersonCardWithRoles on Person {
    ...PersonCard
    roles {
      id
      primaryDistrict
      primaryState
      roleCategory
      status
      dateStart
      group {
        id
        category
        groupInstance
      }
    }
  }

  ${fragmentDTSIPersonCard}
`
