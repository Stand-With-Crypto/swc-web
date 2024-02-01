# Stand With Crypto

## Local Development

### Knowledge pre-requisites

- Read `docs/Leveraging Modern NextJS Features.md` for an overview on the new Next.js features and React Server Components + Server Actions being leveraged in this repo
  - If you this is your first time working with these technologies, please take the time to read the linked-to blog posts
- Read `docs/Coding Conventions.md` for an overview of coding conventions encouraged for this project

### Development pre-requisites

- Install [Node](https://nodejs.org/en) v20.10.0 ([nvm](https://github.com/nvm-sh/nvm) is recommended for installing Node)
- Clone this repository to your local machine (forking is disabled)
  - If you using SSH to clone, but you do not have a public SSH key for your GitHub account (which will prevent cloning), follow the [GitHub SSH guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) to set up SSH authentication and signing
- `cd` into your local swc-web repository
- Run `npm install`
- Run `cp .env.example .env`
  - This will generate a new `.env` file in your local repository; this will store all your local environment variables
- Open the `.env` file with your favorite text editor, and update the environment variables based off the commented instructions
  - **Updating your `.env` is VERY important, so do that before moving on**
- Run `npm run initial` which includes all required set-up commands for first-time local development

### Start the server

- `npm run dev` - runs the development server locally
- In a separate terminal tab, `npm run inngest` - runs [Inngest](https://www.inngest.com/)
  - Both the development server AND Inngest are required for a fully functional website
- Open [http://localhost:3000](http://localhost:3000) with your browser to see the results

### Useful development tips

- `npx prisma generate` - generates [Prisma ORM](https://www.prisma.io/) TypeScript definitions (_i.e._ DB client code) based on `prisma/prisma.schema`
  - Whenever you make Prisma schema changes, you should run the generate command
- `npx prisma studio` - spins up a full database UI for the database you are connected to
- `npm run db:seed` - resets _your_ [PlanetScale](https://planetscale.com/) database, then populates the PlanetScale database with seed data
  - The database will be based on the `DATABASE_URL` provided in your local `.env` file - we will refer to this as "the database you are connected to"
- `npm run codegen` - generates TypeScript definitions for any GraphQL operations we have defined in our codebase
  - Whenever you make GraphQL query updates (_e.g._ our DTSI integration), you should run this command to update your TypeScript definitions
- `npm run codegen:schemas` - if any of the GraphQL schemas changed for our 3rd-party API partners (_e.g._ https://www.dotheysupportit.com/), run this command to pull in the latest schemas
- `npm run intl:extract-compile` - generates initial translation files
- `npm run storybook` - view isolated [storybook stories](https://storybook.js.org/)
- When checking out someone else's branch with changes - if you encounter TypeScript errors, run `npm run newbranch` to execute several common commands that may fix these errors

### Updating the database schema

Whenever you make Prisma schema changes (or pulling commits from `main` that includes Prisma schema changes), run the following commands:

- `npx prisma generate` - updates your Prisma TypeScript definitions
- Then, depending on your situation, run either of the following:
  - `npx prisma db push` - if your changes are _not_ breaking and you want to maintain the values in your database, then run this command; this will simply push the schema changes to the database instance you are connected to
  - `npm run db:seed` - if you do have breaking changes, or if you just want to reset your database values, then run this command; this command force-pushes the schema updates to the database instance you are connected to, wiping all existing information and freshly populating the database with seed data

## Contributing to this project

### Pre-commit audits & testing

- Before committing changes, please audit your code locally:

  - `npm run lint` - audits code against ESLint and Prettier
  - `npm run typecheck` - audits code against TypeScript
  - `npm run test` - execute Jest tests
  - `npm run precheck` - executes all 3 commands above concurrently
    - If `precheck` fails, then it is very likely that your PR will not pass GitHub CI

- Likewise, test E2E flows as necessary:
  - `npm run e2e:run` - starts up [Cypress](https://www.cypress.io/) UI
    - With the UI, you can run individual E2E tests under "Specs" and visually follow the flows
  - `npm run e2e:run-headless` - runs all our E2E tests consecutively via Cypress CLI
    - Currently, this command only executes when new comments are made to main branch because of database dependencies - this may change in the future
  - Refer to `docs/Coding Conventions.md/Testing` for more information

### Contribution guide

- Read `docs/Contributing.md` for information on submitting PRs, including database migration steps related to your PR

## Next Steps

Before proceeding with anything, **PLEASE** take time to review the [Knowledge pre-requisites](#knowledge-pre-requisites).

- Read ["What is Prisma"](https://www.prisma.io/docs/orm/overview/introduction/what-is-prisma) and ["Why Prisma"](https://www.prisma.io/docs/orm/overview/introduction/why-prisma) to learn about the ORM we use to query our database
- Watch [this YouTube video](https://www.youtube.com/watch?v=CQuTF-bkOgc) for a great overview of the tradeoffs between the UI library/framework options that exist for frontend development, and why we decided to use TailwindCSS + Radix UI as our template
- Read Vercel's guide on ["Connection Pooling with Serverless Functions"](https://vercel.com/guides/connection-pooling-with-serverless-functions#modern-databases-with-high-connection-limits) to learn about the architecture tradeoffs of connecting to SQL database in serverless environments, and why we decided to leverage the robust scalability architecture inherent in [PlanetScale](https://planetscale.com/features)
- Read the [Inngest docs](https://www.inngest.com/docs/quick-start) to learn more about how to leverage the tool to build resilient workflows
