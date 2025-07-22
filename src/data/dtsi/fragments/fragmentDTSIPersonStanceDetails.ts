export const fragmentDTSIPersonStanceDetails = /* GraphQL */ `
  fragment PersonStanceDetails on PersonStance {
    computedStanceScore
    dateStanceMade
    id
    stanceType
    billRelationship {
      id
      relationshipType
      bill {
        id
        title
        summary
        status
        slug
        shortTitle
        formattedSlug
        dateIntroduced
        computedStanceScore
        votes {
          voteType
          significanceDescription
        }
      }
    }
    quote {
      richTextDescription
      sourceUrl
    }
    tweet {
      datetimeCreatedOnTwitter
      entities
      id
      twitterAccount {
        datetimeCreated
        id
        username
        state
        personId
      }
      tweetMedia {
        height
        id
        originalUrl
        url
        width
      }
      text
    }
  }
`
