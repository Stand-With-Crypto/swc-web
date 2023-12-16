export const queryDoTheySupportItPresidentialCandidates = /* GraphQL */ `
  query PresidentialCandidates {
    people(limit: 100, offset: 0, grouping: RUNNING_FOR_PRESIDENT) {
      id
      firstName
      lastName
      firstNickname
      nameSuffix
      politicalAffiliationCategory
      computedStanceScore
      profilePictureUrl
    }
  }
`
