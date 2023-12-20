# Stand With Crypto

## Getting Started

- Install node v20.10.0 ([nvm](https://github.com/nvm-sh/nvm) is recommended)
- Install the [pscale cli](https://github.com/planetscale/cli#installation)
- Run `npm install`
- Run `cp .env.example .env`. Open the newly generated files and update the environment variables based off the comment instructions
- Run `npx prisma generate` - Generates [Prisma ORM](https://www.prisma.io/) typescript definitions from `prisma/prisma.schema`
- Run `npm run intl:extract-compile` - generates initial translation files
- Run `npm run codegen:schemas` - pulls in the latest graphql schemas of our 3rd party API partners (like dotheysupportit.com)
- Run `npm run codegen` - generates typescript definitions for any graphql operations we have defined in our codebase
- Run `pscale login` - logs you in to the PlanetScale CLI for our organization.
  - Core StandWithCrypto collaborators should reach out to one of the lead contributors for access to the organization's PlanetScale account
  - Not a core contributor? Not worries! You can [create your own free account](https://auth.planetscale.com/sign-up).
- Run `pscale connect NAME_OF_DATABASE NAME_OF_BRANCH` - this will create a secure connection to PlanetScale. Keep this process running as you move on to the next steps
  - For core StandWithCrypto contributors, this will be `pscale connect swc-web testing --org stand-with-crypto`
- Run `npm run db:seed` - Resets your database and populates it with seed data
- Run `npm run dev` - runs dev server
- Open [http://localhost:3000](http://localhost:3000) with your browser to see the result

## Useful Local Development Tips

- Run `npx prisma studio` to get a full database UI

## Learn More

- Read `docs/Leveraging Modern NextJS Features.md` for an overview on the new Next.js features, React Server Components and Server Actions, being leveraged in this repo
- Read `docs/Coding Conventions.md` for an overview of coding conventions encouraged for this project
- After getting the app running, visit [http://localhost:3000/en-US/sample-architecture-patterns](http://localhost:3000/en-US/sample-architecture-patterns)
