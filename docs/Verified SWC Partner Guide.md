# Verified SWC Partner Guide

- [API Response Structure](#api-response-structure)
- [Structuring Deep Links from API responses](#structuring-deep-links-from-api-responses)
- [Current Endpoints](#current-endpoints)
  - [/api/verified-swc-partner/user-action-opt-in](#apiverified-swc-partneruser-action-opt-in)

For verified partners, Stand With Crypto provides APIs that allow you to programmatically subscribe and perform actions on behalf of users. See the `/src/app/api/verified-swc-partner` folder for all available API endpoints.

Interested in integrating this flow in to your product? [Reach out to our team](https://forms.gle/cGwyA3Yx2A42GaAY9) for additional information.

## API Response Structure

All successful API responses will return a `VerifiedSWCPartnerApiResponse` that has the following shape:

```
export type VerifiedSWCPartnerApiResponse<ResultOptions extends string> = {
  result: ResultOptions;
  resultOptions: ResultOptions[];
  sessionId: string;
  userId: string;
}
```

The `result` string will be an endpoint-specific string that describes the result of the action and the `resultOptions` will describe all possible successful response results the API endpoint returns.

## Structuring Deep Links from API responses

After an API request is triggered, the partner may wish to deeplink the user in to Stand With Crypto for future actions. All URL deep links should include the returned `sessionId` and `userId` as query params in the url. For example, if the partner wanted to redirect the user to the Stand With Crypto homepage, the URL structure would be `https://www.standwithcrypto.org?userId=[the returned user id]&sessionId=[the returned session id]`. Passing these query params ensures that we can correctly identify the user as they land on standwithcrypto.org.

## Current Endpoints

### /api/verified-swc-partner/user-action-opt-in

This API endpoint allows verified partners to sign their users up to become members of Stand With Crypto programmatically from their own application.

### /api/verified-swc-partner/view-key-races

This API endpoint adds an user action of type VIEW_KEY_RACES alongside some metadata whenever a signed in user who has at least OPT_IN view certain pages, e.g. /races on the web and a View Key Races CTA on the app.
