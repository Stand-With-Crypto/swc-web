export const fragmentDTSIBillAnalysis = /* GraphQL */ `
  fragment BillAnalysis on BillAnalysis {
    id
    internalNotes
    isPrimaryAnalysis
    richTextCommentary
  }
`

export const fragmentDTSIBillRelationships = /* GraphQL */ `
  fragment BillRelationships on BillPersonRelationship {
    id
    relationshipType
    person {
      id
      firstName
      firstNickname
      lastName
      nameSuffix
      profilePictureUrl
      profilePictureUrlDimensions
      slug
    }
  }
`

export const dtsiBillDetailsQueryString = /* GraphQL */ `
  query BillDetails($id: String!) {
    bill(id: $id) {
      title
      summary
      computedStanceScore
      status
      govTrackUrl
      congressDotGovUrl
      dateIntroduced
      datetimeCreated
      datetimeUpdated
      datetimeTweetedByDoTheySupportIt
      slug
      formattedSlug

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
