const fragmentDTSIBillAnalysis = /* GraphQL */ `
  fragment BillAnalysis on BillAnalysis {
    id
    internalNotes
    isPrimaryAnalysis
    richTextCommentary
  }
`

const fragmentDTSIBillPerson = /* GraphQL */ `
  fragment BillPerson on Person {
    id
    firstName
    firstNickname
    lastName
    nameSuffix
    slug
    profilePictureUrl
    profilePictureUrlDimensions
    politicalAffiliationCategory
    computedStanceScore
    manuallyOverriddenStanceScore
    computedSumStanceScoreWeight
    primaryRole {
      roleCategory
      primaryCountryCode
      status
    }
  }
`

export const dtsiBillDetailsQueryString = /* GraphQL */ `
  query BillDetails($id: String!) {
    bill(id: $id) {
      id
      slug
      title
      shortTitle
      summary
      computedStanceScore
      status
      govTrackUrl
      congressDotGovUrl
      dateIntroduced
      datetimeCreated
      analysis {
        ...BillAnalysis
      }

      sponsorshipRelationships {
        person {
          ...BillPerson
        }
        relationshipType
      }

      latestVotes {
        personPositions {
          person {
            ...BillPerson
          }
          positionType
        }
      }
    }
  }
  ${fragmentDTSIBillAnalysis}
  ${fragmentDTSIBillPerson}
`
