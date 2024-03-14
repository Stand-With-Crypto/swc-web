# Contributing Guide

## Questions

If you have questions about implementation details, help or support, then please use our dedicated community forum at [GitHub Discussions](https://github.com/Stand-With-Crypto/swc-web/discussions) PLEASE NOTE: If you choose to instead open an issue for your question, your issue will be immediately closed and redirected to the forum.

## Reporting Issues

If you have found what you think is a bug, please [file an issue](https://github.com/Stand-With-Crypto/swc-web/issues/new). PLEASE NOTE: Issues that are identified as implementation questions or non-issues will be immediately closed and redirected to [GitHub Discussions](https://github.com/Stand-With-Crypto/swc-web/discussions)

## Suggesting new features

If you are here to suggest a feature, first [create an issue](https://github.com/Stand-With-Crypto/swc-web/issues/new) if it does not already exist. From there, we will discuss use-cases for the feature and then finally discuss how it could be implemented.

## Development

If you have been assigned to fix an issue or develop a new feature, please follow these steps to get started:

- Fork this repository
  - If you are a core contributors clone it instead
- Install dependencies by running `$ npm install`
  - We use npm for managing dependencies
  - We use [nvm](https://github.com/nvm-sh/nvm) to manage node versions - please use the version mentioned in `.nvmrc` (run `$ nvm use`)
- Create a `.env` file based on `.env.example` (run `$ cp .env.example .env`)
  - If you are a core contributor you can install [Vercel CLI](https://vercel.com/docs/cli) and run `$ vercel link` and then `$ vercel env pull .env`
- Open the `.env` file and update the values if needed based on the commented instructions
- Start the local db by running `$ docker-compose -f dev.docker-compose.yml up -d`
  - We use docker-compose to run services both in local dev and in e2e testing
- Run `$ npm run initial`, that includes all setup commands for first-time local development
- In different terminal tabs, run `$ npm run dev` and `$ npm run inngest`
  - Both the development server AND Inngest are required for a fully functional website
- Open [http://localhost:3000](http://localhost:3000) with your browser to see the results
- Implement your changes, tests and documentations
- Commit your changes
- Submit your PR for review
