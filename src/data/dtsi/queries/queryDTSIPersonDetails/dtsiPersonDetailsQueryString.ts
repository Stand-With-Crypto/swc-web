export const dtsiPersonDetailsQueryString = /* GraphQL */ `
  query PersonDetails($slugIn: [String!]) {
    people(limit: 1, offset: 0, slugIn: $slugIn) {
      id
      twitterAccounts {
        id
        state
        username
      }
      suffixName
      slug
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
      donationUrl
      firstName
      firstNickname
      gender
      lastName
      manuallyOverriddenStanceScore
      middleName
      nameSuffix
      nameUniquenessModifier
      officialUrl
      phoneNumber
      politicalAffiliationCategory
      politicalAffiliation
      computedStanceScore
      manuallyOverriddenStanceScore
      stances(verificationStatusIn: APPROVED) {
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
      profilePictureUrl
      profilePictureUrlDimensions
    }
  }
`
