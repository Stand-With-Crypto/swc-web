# Stand With Crypto

## Getting Started

- Install node v20.10.0 ([nvm](https://github.com/nvm-sh/nvm) is recommended)
- Run `npm install`
- Run `cp .env.example .env`. Open the newly generated files and update the environment variables based off the comment instructions
- Run `npx prisma generate` - Generates [Prisma ORM](https://www.prisma.io/) typescript definitions from `prisma/prisma.schema`
- Run `npm run intl:extract-compile` - generates initial translation files
- Run `npm run codegen` - generates typescript definitions for any graphql operations we have defined in our codebase
- Run `npm run db:seed` - Resets your database and populates it with seed data
- Run `npm run dev` - runs dev server
- In a separate tab run `npm run inngest` - runs [Inngest](https://www.inngest.com/)
- Open [http://localhost:3000](http://localhost:3000) with your browser to see the result

## Next Steps

- Read `docs/Leveraging Modern NextJS Features.md` for an overview on the new Next.js features, React Server Components and Server Actions, being leveraged in this repo. If you this is your first time working with these technologies, take the time to read the linked-to blog posts
- Read `docs/Coding Conventions.md` for an overview of coding conventions encouraged for this project
- Read `docs/Contributing.md` for information on submitting PRs
- After getting the app running, visit [http://localhost:3000/en-US/sample-architecture-patterns](http://localhost:3000/en-US/sample-architecture-patterns)
- Read ["What is Prisma"](https://www.prisma.io/docs/orm/overview/introduction/what-is-prisma) and ["Why Prisma"](https://www.prisma.io/docs/orm/overview/introduction/why-prisma) to learn about the ORM we use to query our database.
- Watch [this video](https://www.youtube.com/watch?v=CQuTF-bkOgc) for a great overview of the tradeoffs between the UI library/framework options that exist for frontend development and why we decided to use TailwindCSS + Radix UI as our template
- Read ["Connection Pooling with Serverless Functions"](https://vercel.com/guides/connection-pooling-with-serverless-functions#modern-databases-with-high-connection-limits) to learn about the architecture tradeoffs of connecting to SQL database in serverless environments and why we decided to leverage the robust scalability architecture inherent in [PlanetScale](https://planetscale.com/features)
- Read the [Inngest docs](https://www.inngest.com/docs/quick-start) to learn more about how to leverage the tool to build resilient workflows

## Useful Local Development Tips

- Run `npx prisma studio` to get a full database UI
- If any of the graphql schemas change for our 3rd party API partners (like dotheysupportit.com), run `npm run codegen:schemas` to pull in the latest
- To audit your code before committing changes:
  - `npm run lint` - audits code against eslint and prettier
  - `npm run typecheck` - audits code against typescript
  - `npm run test` - execute jest tests
  - `npm run storybook` - run and view isolated [storybook stories](https://storybook.js.org/)
