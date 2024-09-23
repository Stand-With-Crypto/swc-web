# Third Party Attribution Best Practices

- [UTM parameters](#utm-parameters)
  - [Formatting](#formatting)
  - [utm_source](#utm_source)
  - [utm_medium](#utm_medium)
  - [utm_campaign](#utm_campaign)

To ensure that we can properly track the source of new advocates signing up for Stand With Crypto, we encourage product/marketing teams from other companies that would like to link to SWC to follow the attribution best practices below:

## UTM parameters

Links should include `utm_source`, `utm_medium`, and `utm_campaign` query params that identify the source of the link. Additional utm parameters (`utm_content`) can optionally be included as well but won't be tracked by SWC. an example url structure could look like `https://www.standwithcrypto.org?utm_source=coinbase&utm_medium=verified-partner&utm_campaign=native-app-big-blue-cta`

### Formatting

All utm parameters should be formatted in an all-lower-case-dash format (commonly referred to as a "slug"). For example, if a company would like to pass the phrase "Some Important Phrase" to the url, they should change the wording to `some-important-phrase`.

### utm_source

The UTM source should be the name of the source. For example, if the organization "Blockchain Fan Club" wanted to send SWC traffic, the utm source they use could be `blockchain-fan-club`. If the SWC facebook group includes a link to the site, we the source should be `facebook`. It's important that this word stays consistent once it is initially used to ensure SWC can properly track users coming from the source over time.

### utm_medium

The UTM medium should be the kind of relationship the referrer has with SWC. Below is a list of common medium categories:

- `paid-ad`: used when the link is from a paid ad source (facebook ads, google ads, etc).
- `social`: used when the link is from a non-paid social source (facebook group, tweeted link, etc).
- `news`: used when the link is from a news article
- `partner`: used when a partner (like coinbase) sends users to SWC
- `referral`: used for URLs that are generated and sent to users to refer friends and family to SWC

_Important note:_ there are cases where different links from the same source might have different mediums. An example is a paid facebook ad link would have a utm_medium of `paid-ad`, but a link on a facebook user page might have a utm medium of `social`.

### utm_campaign

The UTM campaign is a source-specific identifier that describes where the link to SWC was placed. For example, if the link is from an email blast the partner sends out to all their customers, the utm_campaign might be `june-2023-newsletter-update`. If the link is from a promotional CTA on the site, the utm_campaign might be `big-blue-banner-takeover-v3`.
