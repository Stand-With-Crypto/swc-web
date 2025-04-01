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

### First Visit Redirection

The system implements smart redirection for first-time visitors based on the following criteria:

```typescript
// Redirection occurs when ALL conditions are met:
1. User is accessing a country-specific homepage
2. USER_SELECTED_COUNTRY cookie is not set
3. USER_ACCESS_LOCATION is a supported country
4. Current homepage != USER_ACCESS_LOCATION country

// Example:
// User from Canada accessing https://standwithcrypto.com/au
// Will be redirected to https://standwithcrypto.com/ca
```

### Search Engine Redirection

For returning users accessing through search engines:

```typescript
// Redirection occurs when:
1. User accesses US homepage (standwithcrypto.com/)
2. USER_SELECTED_COUNTRY exists and is not 'us'

// Example:
// User previously selected AU
// Accessing from Google: standwithcrypto.com/
// Redirected to: standwithcrypto.com/au
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

```typescript
// On login:
if (user.countryCode !== USER_SELECTED_COUNTRY) {
  USER_SELECTED_COUNTRY = user.countryCode
}

// Then, the page is refreshed after the login is completed to match the new selected country
```

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
