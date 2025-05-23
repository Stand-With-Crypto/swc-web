# Access Location & International Redirects

## Overview

This document describes how the SWC platform handles international access, country-specific redirections, and user location management. The system uses a combination of cookies and geolocation to provide country-specific experiences while maintaining user preferences.

## Core Concepts

### Cookies

The system relies on two primary cookies:

1. `USER_ACCESS_LOCATION`

   - Purpose: Stores the user's actual geographic location
   - Format: Country code in lower case (e.g., 'us', 'ca', 'au')
   - Expiration: 24 hours
   - Example: `USER_ACCESS_LOCATION=ca`

2. `USER_SELECTED_COUNTRY`
   - Purpose: Stores the user's preferred country for browsing
   - Format: Country code
   - Set when: User selects a country from navbar or during first visit
   - Example: `USER_SELECTED_COUNTRY=au`

### Location Detection

#### Geolocation Process

1. The `getUserAccessLocation` function attempts to determine the user's country through IP geolocation
2. If geolocation fails, the system falls back to the country code from the accessed URL
   ```typescript
   // Example URL: https://standwithcrypto.com/ca
   // Falls back to: 'ca'
   ```

## Redirection Logic

The system implements smart redirection based on the following criteria:

```typescript
// Redirection occurs in two cases:

1. User has previously selected a country (USER_SELECTED_COUNTRY cookie exists):
   - User is accessing US homepage (standwithcrypto.com/)
   - USER_SELECTED_COUNTRY is a supported country code
   - USER_SELECTED_COUNTRY is not the default country code (US)

2. First-time visitor:
   - User is accessing US homepage (standwithcrypto.com/)
   - USER_ACCESS_LOCATION is a supported country code
   - USER_ACCESS_LOCATION is not the default country code (US)
   - USER_ACCESS_LOCATION cookie is not set

// Examples:
// Case 1: Returning user
// User previously selected AU
// Accessing: standwithcrypto.com/
// Redirected to: standwithcrypto.com/au

// Case 2: First-time visitor
// User from Canada accessing: standwithcrypto.com/
// Redirected to: standwithcrypto.com/ca
```

### Development Override

For development and testing purposes, the redirection can be bypassed by setting the environment variable:

```bash
BYPASS_INTERNATIONAL_REDIRECT=true
```

## Cookie Usage Scenarios

### User Creation

- Uses `USER_SELECTED_COUNTRY` to associate user with specific country
- Example:
  ```typescript
  // User joins SWC while on Australian site
  USER_SELECTED_COUNTRY = au // This value is stored with the user in countryCode column
  ```

### Login Behavior

Initially, we were updating `USER_ACCESS_LOCATION` on login to allow users to continue performing actions on their respective SWC website, even if they were not in their home country at that moment. The problem with this approach is that it completely bypassed the geogate logic. Since accounts are created based on the country code of the page, whenever users logged in, the current IP access location would be overridden by the one associated with their account, resulting in a poor UX.

Another possibility would be to update `USER_SELECTED_COUNTRY` on login. However, since this wouldn’t allow users to complete any actions until they update their access location and address on the profile page, adding this logic at the current state would unnecessarily increase code and application complexity without significant impact.

With that in mind, we’ve decided not to implement anything new on login to reduce the number of edge cases we need to handle and remain conscious of.

### Geogate

- Uses `USER_ACCESS_LOCATION` for geographic restrictions
- Example:
  ```typescript
  // User accessing Canadian action
  if (USER_ACCESS_LOCATION === 'ca') {
    // Allow access
  } else {
    // Restrict access
  }
  ```

### Analytics & Actions

- `USER_SELECTED_COUNTRY` determines analytics country attribution
- Ensures accurate tracking regardless of physical location
- Example:
  ```typescript
  // User physically in US, browsing AU site
  analyticsCountry = USER_SELECTED_COUNTRY // 'AU'
  ```

## Testing & Development

### Overriding Location Detection

Use `OVERRIDE_USER_ACCESS_LOCATION` cookie for testing:

```bash
# Test as Canadian user
curl -X GET 'http://localhost:3000/ca' \
-H 'cookie: OVERRIDE_USER_ACCESS_LOCATION=ca'
```

### Testing Different Scenarios

1. First Visit:

```bash
# Clear cookies
# Access: standwithcrypto.com
# If detected location is CA, will redirect to /ca
```

2. Returning User:

```bash
# Set cookie
document.cookie = "USER_SELECTED_COUNTRY=au"
# Access: standwithcrypto.com
# Will redirect to /au
```

## Technical Details

### Bypass Mode - Env

- Set `BYPASS_INTERNATIONAL_REDIRECT=true` env to disable redirects
- Useful for testing and development

### URL Pattern Matching

```typescript
// Country code pattern
enum SupportedCountryCodes {
  US = 'us',
  GB = 'gb',
  CA = 'ca',
  AU = 'au',
}

const COUNTRY_CODE_REGEX_PATTERN = new RegExp(
  `^(${Object.values(SupportedCountryCodes).join('|')})$`,
)
```

---

## Edge cases

| Case                                                                                     | Access Location Cookie                                      | Behavior                                                                         |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------- |
| User from a supported country accessing their website while in another supported country | Cookie is set                                               | User can complete actions normally.                                              |
| User from a supported country accessing their website while in another supported country | Cookie not set                                              | The user should see a banner: "Actions only for users in [Supported Country]".   |
| User from a supported country accessing their website while in a non-supported country   | Cookie is set                                               | User can complete actions normally.                                              |
| User from a supported country accessing their website while in a non-supported country   | Cookie not set                                              | The user should see a banner: "Actions only for users in [Supported Country]".   |
| User from a non-supported country traveling to a supported country                       | Cookie is set                                               | The user should see the banner: "Actions only for users in [Supported Country]". |
| User from a non-supported country traveling to a supported country                       | Cookie not set and the visiting country matches the website | The user is allowed to complete actions.                                         |
| User from a non-supported country traveling to another non-supported country             | Cookie is set or not                                        | The user will see the banner: "Actions only for users in [Supported Country]"    |
