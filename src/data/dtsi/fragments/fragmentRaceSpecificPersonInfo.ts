export const fragmentRaceSpecificPersonInfo = /* GraphQL */ `
  fragment RaceSpecificPersonInfo on Person {
    id
    slug
    firstName
    lastName
    firstNickname
    nameSuffix
    politicalAffiliationCategory
    computedStanceScore
    manuallyOverriddenStanceScore
    profilePictureUrl
    profilePictureUrlDimensions
    promotedPositioning
    stanceCount(verificationStatusIn: APPROVED)
    roles {
      id
      primaryDistrict
      primaryState
      roleCategory
      status
      group {
        id
        category
        groupInstance
      }
    }
  }
`
