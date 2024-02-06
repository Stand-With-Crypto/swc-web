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
      roles {
        dateEnd
        dateStart
        group {
          id
          category
          displayName
          dateStart
          dateEnd
          primaryCity
          primaryCountryCode
          primaryDistrict
          primaryState
          parentGroup {
            id
            category
            displayName
            dateStart
            dateEnd
            primaryCity
            primaryCountryCode
            primaryDistrict
            primaryState
            parentGroup {
              id
              displayName
              dateStart
              dateEnd
              primaryCity
              primaryCountryCode
              primaryDistrict
              primaryState
              category
            }
          }
        }
        id
        isPubliclyVisible
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
