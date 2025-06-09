# Contributing Guide

- [Questions](#questions)
- [Reporting Issues](#reporting-issues)
- [Suggesting new features](#suggesting-new-features)
- [Development](#development)
  - [Knowledge pre-requisites](#knowledge-pre-requisites)
  - [Required tools](#required-tools)
  - [Developing your feature/fix](#developing-your-featurefix)
  - [Pre-commit audits & testing](#pre-commit-audits--testing)
  - [Useful development tips](#useful-development-tips)
  - [Updating the database schema](#updating-the-database-schema)
  - [Running One Time Scripts in Testing or Production Environment](#running-one-time-scripts-in-testing-or-production-environment)
- [Pull requests](#pull-requests)
- [Inngest functions](#inngest-functions)
- [Other links](#other-links)

## Questions

If you have questions about implementation details, help, or support, then please use our dedicated community forum at [GitHub Discussions](https://github.com/Stand-With-Crypto/swc-web/discussions). PLEASE NOTE: If you choose to instead open an issue for your question, your issue will be immediately closed and redirected to the forum.

## Reporting Issues

If you have found what you think is a bug, please [file an issue](https://github.com/Stand-With-Crypto/swc-web/issues/new). PLEASE NOTE: Issues that are identified as implementation questions or non-issues will be immediately closed and redirected to [GitHub Discussions](https://github.com/Stand-With-Crypto/swc-web/discussions).

## Suggesting new features

If you are here to suggest a feature, first [create an issue](https://github.com/Stand-With-Crypto/swc-web/issues/new) if it does not already exist. From there, we will discuss use-cases for the feature and then finally discuss how it could be implemented.

## Development

### Knowledge pre-requisites

Below is a list of suggested documentation to read through if you aren't already familiar with the technologies used in this repository:

- Read [Leveraging Modern NextJS Features](<./Leveraging Modern NextJS Features.md>) for an overview on the new Next.js features and React Server Components + Server Actions being leveraged in this repo
  - If this is your first time working with these technologies, please take the time to read the linked-to blog posts
- Read [Coding Conventions](<./Coding Conventions.md>) for an overview of coding conventions encouraged for this project
- Read ["What is Prisma"](https://www.prisma.io/docs/orm/overview/introduction/what-is-prisma) and ["Why Prisma"](https://www.prisma.io/docs/orm/overview/introduction/why-prisma) to learn about the ORM we use to query our database
- Watch [this YouTube video](https://www.youtube.com/watch?v=CQuTF-bkOgc) for a great overview of the tradeoffs between the UI library/framework options that exist for frontend development, and why we decided to use TailwindCSS + Radix UI as our template
- Read Vercel's guide on ["Connection Pooling with Serverless Functions"](https://vercel.com/guides/connection-pooling-with-serverless-functions#modern-databases-with-high-connection-limits) to learn about the architecture tradeoffs of connecting to SQL database in serverless environments, and why we decided to leverage the robust scalability architecture inherent in [PlanetScale](https://planetscale.com/features)
- Read the [Inngest docs](https://www.inngest.com/docs/quick-start) to learn more about how to leverage the tool to build resilient workflows

### Required tools

Make sure you have the following tools installed before proceeding:

- [nvm](https://github.com/nvm-sh/nvm)
- [docker](https://docs.docker.com/compose/install/)
- [docker-compose](https://docs.docker.com/compose/install/#scenario-two-install-the-compose-plugin)
- [MySQL](https://www.mysql.com/) (on Mac you can install [Homebrew](https://brew.sh/) and run `brew install mysql`)

### Developing your feature/fix

If you have been assigned to fix an issue or develop a new feature, please follow these steps to get started:

- Fork this repository
  - If you are a core contributors clone it instead
- Install dependencies by running `$ npm install`
  - We use npm for managing dependencies
  - We use [nvm](https://github.com/nvm-sh/nvm) to manage node versions - please use the version mentioned in `.nvmrc` (run `$ nvm use`)
- Create a `.env` file based on `.env.example` (run `$ cp .env.example .env`)
  - If you are a core contributor you can install [Vercel CLI](https://vercel.com/docs/cli) and run `$ vercel link` and then `$ vercel env pull .env`
- Open the `.env` file and fill all the blank values that are not bellow the `OPTIONAL` title. Follow the commented instructions for each one
- Start the local db by running `$ docker-compose -f dev.docker-compose.yml up -d`
  - We use docker-compose to run services both in local dev and in e2e testing
- Run `$ npm run initial`, this includes all setup commands for first-time local development
- In different terminal tabs, run `$ npm run dev` and `$ npm run inngest`
  - Both the development server AND Inngest are required for a fully functional website
- Open [http://localhost:3000](http://localhost:3000) with your browser to see the results
- Implement your changes, tests and documentations
- Commit your changes
- Submit your PR for review

### Pre-commit audits & testing

- Before committing changes, please audit your code locally:

  - `npm run lint` - audits code against ESLint and Prettier
  - `npm run typecheck` - audits code against TypeScript
  - `npm run test` - executes Jest tests
  - `npm run audit` - executes all 3 commands above concurrently
    - If `audit` fails, your PR will not pass GitHub CI

- Likewise, test E2E flows as necessary:
  - run `npm run build` to build the next.js app locally (and run it after all code changes before re-running e2e tests)
    - `npm run e2e:run` - starts up [Cypress](https://www.cypress.io/) UI
      - With the UI, you can run individual E2E tests under "Specs" and visually follow the flows
    - `npm run e2e:run-headless` - runs all our E2E tests consecutively via Cypress CLI
    - Refer to `docs/Coding Conventions.md/Testing` for more information

### Useful development tips

- `npm run db:generate` - generates [Prisma ORM](https://www.prisma.io/) TypeScript definitions (_i.e._ DB client code) based on `prisma/prisma.schema`
  - Whenever you make Prisma schema changes, you should run the generate command
- `npx prisma studio` - spins up a full database UI for the database you are connected to
- `npm run db:seed` - resets the database you are connected to, then populates it with seed data
  - The database will be based on the `DATABASE_URL` provided in your local `.env` file - we will refer to this as "the database you are connected to"
- `npm run codegen` - generates TypeScript definitions for any GraphQL operations we have defined in our codebase
  - Whenever you make GraphQL query updates (_e.g._ our DTSI integration), you should run this command to update your TypeScript definitions
- `npm run codegen:schemas` - if any of the GraphQL schemas change for our 3rd-party API partners (_e.g._ https://www.dotheysupportit.com/), run this command to pull in the latest updates
- `npm run intl:extract-compile` - generates initial translation files
- `npm run storybook` - view isolated [storybook stories](https://storybook.js.org/)
- `npm run newbranch` - A useful command to run after checking out a newbranch or pulling the latest from `main` to ensure your local environment is configured correctly
- To measure how long database queries are taking to execute, you can easily do this by adding the `LOG_DATABASE=true` environment variable and restarting the development server. After that, you'll be able to see the query information in your terminal.

### Updating the database schema

If you are not a core contributor, reach out to one to make any DB schema updates your PR needs. If you're a core contributor, follow these steps whenever you need to make Prisma Schema changes.

> Before anything, keep in mind to always have PlanetScale's PR merged before Github's.

> Be mindful of merging schema changes to `testing` and `production` as it affects directly other developers, so try as much as possible to keep in sync with the work of the team.

1. First of all you should change `schema.prisma` with the database changes you want to make
2. Run `npm run db:generate`, that will generate updated TypeScript definitions for your local env
3. With the `DATABASE_URL` env configured to your personal PlanetScale branch, run `npx prisma db push`, that will push the new schema to your DB
4. Run `npm run db:seed` to fill the preview database with mocked data
5. When testing your feature in preview, you should link your preview env to your personal database branch. To do that do the following
   1. Go to `Vercel > Settings > Environment Variables`
   2. In the "Create New" form, uncheck `Production` and `Development` and in "Select custom branch", search and select your gh branch
   3. Add a `DATABASE_URL` variable with the same value you're using locally
   4. You might need to redeploy your preview env after doing this
6. When you're ready to go you'll create a PlanetScale PR from your branch to `testing` before going live, that is to ensure testing is never behind production for any reason
7. If you want you can take this time to test your changes on `testing.standwithcrypto.org`, that preview is using the `testing` db and the codebase from `main`
8. When the `testing` PR is closed, you should open another one from `testing` to `production`, that should be closed before you trigger your production deploy

### Running One Time Scripts in Testing or Production Environment

In our testing or production environment, it is recommended to run a script through the Inngest admin dashboard:

- Select the function you want to run
- Click the invoke button in the top right corner
- Update the data fields to pass any data needed by the script
- Click "Invoke Function"

## Pull requests

Maintainers merge pull requests by squashing all commits and editing the commit message if necessary using the GitHub user interface.

## Inngest functions

1. Create a function

- Place the file under `src/inngest/functions` with a meaningful name. You can use this [Inngest Function](../src/inngest/functions/user/deleteUserActions.ts) as an example.

2. Create its typings

- When creating new functions on Inngest, don't forget to export its correct typings to add under Inngest schemas at [Inngest types](../src/inngest/types.ts#L62) so that every Inngest method has type inference, e.g. `createFunction` and `send`. More info at [Inngest event payload types](https://www.inngest.com/docs/reference/client/create#defining-event-payload-types).

3. Add the function to the route file [here](../src/app/api/inngest/route.ts#L48)

4. Now the function is available to test at http://localhost:8288 by running `npm run inngest`.

5. PS.: Always add `persist?: boolean` on the event payload and the function logic.

## Other links

- [Add new user action](<./Add a new user action.md>)
- [Verified SWC Partner Guide](<./Verified SWC Partner Guide.md>)
- [Working with Farcaster Frames](<./Working with Farcaster Frames.md>)
- [Working with multiple campaigns](<./Working with two or more campaigns active.md>)
- [Third Party Attribution Best Practices](<./Third Party Attribution Best Practices.md>)
