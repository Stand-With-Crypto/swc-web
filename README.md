# Stand With Crypto

## Getting Started

- Install node v20.10.0 ([nvm](https://github.com/nvm-sh/nvm) is recommended)
- Run `npm install`
- Run `cp .env.example .env && cp .env.local.example .env.local`. Open the newly generated files and update the environment variables based off the comment instructions
- Run `npx prisma migrate dev`
- Run `npm run dev`
- Open [http://localhost:3000](http://localhost:3000) with your browser to see the result

## Learn More

- Read `docs/Leveraging Modern NextJS Features.md` for an overview on the new Next.js features, React Server Components and Server Actions, being leveraged in this repo
- After getting the app running, visit [http://localhost:3000/en-US/sample-architecture-patterns](http://localhost:3000/en-US/sample-architecture-patterns)
