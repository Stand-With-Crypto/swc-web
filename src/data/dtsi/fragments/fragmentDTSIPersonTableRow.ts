export const fragmentDTSIPersonTableRow = /* GraphQL */ `
  fragment PersonTableRow on Person {
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
  }
`
