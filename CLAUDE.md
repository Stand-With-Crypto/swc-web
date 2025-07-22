# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Stand With Crypto (SWC) is a Next.js 15 web application that enables crypto advocacy through user actions, NFT minting, political engagement, and community building. It's a React Server Components app with internationalization support for US, AU, CA, and GB markets.

## Development Commands

### Initial Setup

- `npm run initial` - Complete first-time setup (database generate, codegen, seed)
- `npm run newbranch` - Setup after checking out new branch or pulling main

### Development Servers

- `npm run dev` - Start Next.js development server with Turbopack (required)
- `npm run inngest` - Start Inngest background job processor (required for full functionality)
- Both must run concurrently for complete local development

### Database Operations

- `npm run db:generate` - Generate Prisma TypeScript definitions (run after schema changes)
- `npm run db:seed` - Reset and populate database with test data
- `npm run db:seed-swc-civic` - Reset and seed SWC Civic database (PostgreSQL)
- `npm run db:start-dev` - Start local MySQL container
- `npm run db:stop-dev` - Stop local MySQL container
- `npm run db:studio` - Open Prisma Studio database UI
- `npm run db:check` - Check for database schema drift

### Code Quality & Testing

- `npm run audit` - Run all checks (lint, typecheck, test) concurrently - **required before commits**
- `npm run lint` - ESLint + Prettier checks
- `npm run lint:cypress` - ESLint checks specifically for Cypress tests
- `npm run typecheck` - TypeScript compilation check
- `npm run test` - Jest unit tests
- `npm run build` - Production build (required before E2E tests)

### E2E Testing

- `npm run e2e:run` - Open Cypress UI for interactive testing
- `npm run e2e:run-headless` - Run all E2E tests via CLI

### Code Generation

- `npm run codegen` - Generate TypeScript from GraphQL operations (DTSI integration)
- `npm run codegen:schemas` - Update GraphQL schemas from 3rd-party APIs

### Development Tools

- `npm run storybook` - Start Storybook component development server
- `npm run build-storybook` - Build Storybook for deployment
- `npm run email:dev` - Start React Email development server
- `npm run prettier` - Auto-format code with Prettier
- `npm run ts` - Run TypeScript files with proper configuration
- `npm run start` - Start production server

## Architecture Overview

### Database Architecture

**Dual Schema Setup:**

- **Main (MySQL/PlanetScale)**: User data, actions, campaigns, NFTs
- **SWC Civic (PostgreSQL/Neon/PostGIS)**: Geospatial electoral district data

**Key Models:**

- `User` - Central user entity with flexible auth (crypto addresses, email, sessions)
- `UserAction` - Polymorphic system for 18+ action types (EMAIL, CALL, DONATION, NFT_MINT, etc.)
- `Address` - Global address format with electoral zone mapping
- `NFTMint` - NFT minting with blockchain transaction tracking

### Application Structure

**App Router with Internationalization:**

```
src/app/
├── [countryCode]/           # US market (main)
├── au/, ca/, gb/           # International markets
├── (builder)/              # Builder.io CMS integration
├── embedded/               # Embeddable components
└── api/                    # API routes & webhooks
```

**Key Directories:**

- `src/actions/` - Server Actions for form submissions and data mutations
- `src/components/app/` - Page-specific React components
- `src/components/ui/` - Reusable UI components (Radix UI + Tailwind)
- `src/data/` - Data fetching layer with Prisma queries and DTSI GraphQL
- `src/hooks/` - Custom React hooks for client-side functionality
- `src/utils/` - Utilities split by environment (server/web/shared/edge)
- `src/inngest/` - Background job functions for workflows and cron jobs
- `src/validation/` - Zod schemas for form and API validation
- `src/mocks/` - Mock data for testing and development
- `src/bin/` - Script files for database seeding and maintenance

### Technology Stack

- **Framework**: Next.js 15 with App Router and React Server Components
- **Database**: Prisma ORM with MySQL (PlanetScale) + PostgreSQL (Neon)
- **Styling**: Tailwind CSS + Radix UI components + shadcn/ui component patterns
- **Authentication**: Thirdweb for Web3 wallets + traditional email
- **Background Jobs**: Inngest for resilient workflows
- **Analytics**: Mixpanel, Google Analytics
- **Monitoring**: Sentry error tracking
- **CMS**: Builder.io for content management
- **Email**: React Email + SendGrid
- **Testing**: Jest + Cypress + Storybook
- **Deployment**: Vercel

### International Support

- **Country Routing**: `[countryCode]` dynamic segments (us, au, ca, gb)
- **Localized Actions**: Country-specific user actions and politicians
- **Geographic Data**: PostGIS for electoral boundaries and district mapping
- **Content Adaptation**: Country-specific branding and messaging

### Web3 Integration

- **Wallet Connection**: Thirdweb SDK for multiple wallet types
- **NFT Minting**: On-chain NFT creation for user achievements
- **Crypto Addresses**: First-class support for Ethereum addresses as user identity
- **ENS Resolution**: Automatic ENS name resolution for crypto addresses

## Development Workflow

### Making Database Changes

1. Update `prisma/schema.prisma`
2. Run `npm run db:generate`
3. Push to personal PlanetScale branch: `npx prisma db push`
4. Run `npm run db:seed` to populate with test data
5. Create PlanetScale PR: personal branch → testing → production
6. Merge PlanetScale PR before GitHub PR

### Adding New User Actions

1. Add new `UserActionType` enum value to Prisma schema
2. Create specific action model (e.g., `UserActionNewType`)
3. Add relationship to `UserAction` model
4. Implement server action in `src/actions/`
5. Create UI components in `src/components/app/`
6. Add to action routing in `src/utils/shared/urlsDeeplinkUserActions.ts`

### Working with GraphQL (DTSI Integration)

- **DTSI**: "Do They Support It" API for politician stance data
- After modifying GraphQL queries: `npm run codegen`
- Schema updates: `npm run codegen:schemas`
- Generated files in `src/data/dtsi/generated.ts`

## Important Patterns

### Server Actions

Use server actions for all form submissions and data mutations:

```typescript
// src/actions/actionCreateUserAction*.ts
export async function actionCreateUserAction(data: FormData) {
  // Validation, authentication, database operations
}
```

### Error Handling

- Use `gracefullyError()` for user-facing error handling
- All errors automatically sent to Sentry
- Server actions return `{ errors?: string[] }` objects

### Authentication

- Crypto-first: Users identified by wallet address primarily
- Email fallback for traditional users
- Session-based anonymous user tracking
- User merging system for multiple identity methods

### Internationalization

- Country-specific routing with `[countryCode]` segments
- Geo-gating for certain features (US-only vs international)
- Address normalization supporting global formats

### CTA Creation Pattern

Country-specific Call-to-Action (CTA) configuration follows a structured pattern:

- **Main CTA Config**: `src/components/app/userActionGridCTAs/constants/ctas.tsx` imports country-specific CTAs
- **Country Files**: Each country has its own CTA file (e.g., `us/usCtas.tsx`, `au/auCtas.tsx`, `ca/caCtas.tsx`, `gb/gbCtas.tsx`)
- **Structure**: Each CTA defines:
  - `UserActionType` mapping with title, description, image
  - Multiple campaigns per action type with active/inactive states
  - `WrapperComponent` for dialog handling and authentication
  - Country-specific campaign names and messaging
- **Usage**: CTAs are retrieved via `getUserActionCTAsByCountry(countryCode)` with graceful fallback to US config

## Testing Strategy

- **Unit Tests**: Jest for utility functions and components
- **E2E Tests**: Cypress with dedicated test database
- **Database Tests**: Separate test database with consistent seed data
- **Type Safety**: Comprehensive TypeScript coverage with strict mode
- **Component Tests**: Storybook for UI component development and testing

## Additional Notes

- **Sitemap Generation**: Automatically generated via `next-sitemap` after build
- **Bundle Analysis**: Available via `@next/bundle-analyzer`
- **Rate Limiting**: Implemented with Upstash Redis
- **Email Templates**: Built with React Email in `src/utils/server/email/templates`
- **Feature Flags**: Experiment system in `src/utils/shared/experiments.ts`
- **Image Optimization**: Next.js Image component with fallback handling
- **SEO**: Comprehensive meta tag generation and Open Graph image creation
