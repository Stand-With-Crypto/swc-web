# Working with Farcaster Frames

- [Resources](#resources)
- [Development](#development)
  - [Local Frames Tooling](#local-frames-tooling)
  - [Development Tooling](#development-tooling)

## Resources

Before working with Frames in this repository, you should have a basic understanding of how Frames work. Here are some resources we recommend:

- [Farcaster Getting Started documentation](https://docs.farcaster.xyz/) if you do not know what is Farcaster
  - Would like to emphasize that each Farcaster account has a Farcaster custody wallet address, but a user can add (_e.g._ validate) their own wallet addresses to their Farcaster account
- [5-minute Frames 101 video](https://www.youtube.com/watch?v=rp9X8rAPzPM) by the Farcaster team
- [onchainkit.xyz documentation](https://onchainkit.xyz/frame/introduction), a package which we use to cleanly initialize Frames and receive/parse a validated Frames
- [Open Graph (OG) Image Generation](https://vercel.com/docs/functions/og-image-generation), another package which we use to generate PNG images from HTML and CSS
- [a-frame-in-100-lines](https://github.com/Zizzamia/a-frame-in-100-lines), an example project that uses onchainkit to create a set of Frames. Things to observe:
  - See how the initial Frame is initialized as metadata on a standard app router page
  - See where subsequent Frame(s) are fetched
  - See how a basic on-chain mint transaction is structured and sent
- [farcaster-transaction-frame-youtube](https://github.com/thirdweb-example/farcaster-transaction-frame-youtube), another example project that uses ThirdWeb to assist in structuring the on-chain mint (`claim`) transaction
  - Highly recommend skimming through [their tutorial video](https://www.youtube.com/watch?v=j7U97ZgnDts)

## Development

Here are some basic guidelines when developing Frames in this repository:

- Frames live in `src/app/api/public/frames/...`
  - See `src/app/api/public/frames/register-to-vote/` directory for an example of building Frames.
- You can add a Frame to an existing page by exporting Frames metadata as OpenGraph tags. See `src/app/[locale]/vote/page.tsx` for an example.

### Local Frames Tooling

Use the [local debugger CLI](https://framesjs.org/guides/debugger#local-debugger-cli) or [Framegear](https://github.com/coinbase/onchainkit/tree/main/framegear) to test frames locally.

NOTE: Testing Frames locally is broken - local Frames do not have `state`, and parsing validated Frames does not work either. You can use local Frames when developing the HTML + CSS for the OG images and also for basic Frame interactions, but anything involve Frame state should be tested via a deployment. See below.

### Development Tooling

Use the [Warpcast Frames Validator](https://warpcast.com/~/developers/frames) to test your frames that are deployed on Vercel.
