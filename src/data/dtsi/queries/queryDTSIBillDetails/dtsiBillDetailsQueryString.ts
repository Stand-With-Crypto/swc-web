const fragmentDTSIBillAnalysis = /* GraphQL */ `
  fragment BillAnalysis on BillAnalysis {
    id
    internalNotes
    isPrimaryAnalysis
    richTextCommentary
  }
`

const fragmentDTSIBillRelationships = /* GraphQL */ `
  fragment BillRelationships on BillPersonRelationship {
    id
    relationshipType
    person {
      id
      firstName
      firstNickname
      lastName
      nameSuffix
      primaryRole {
        status
        roleCategory
        title
        primaryState
        dateStart
        dateEnd
        group {
          id
          category
          groupInstance
        }
      }
      profilePictureUrl
      profilePictureUrlDimensions
      politicalAffiliationCategory
      slug
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
      relationships {
        ...BillRelationships
      }
    }
  }
  ${fragmentDTSIBillAnalysis}
  ${fragmentDTSIBillRelationships}
`
