# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack
- `npm run inngest` - Start Inngest function runner (required alongside dev server)
- `npm run initial` - Initial setup command for new development (includes db:generate, codegen, db:seed)
- `npm run newbranch` - Run after checking out new branch or pulling latest from main

### Database Operations
- `npm run db:generate` - Generate Prisma TypeScript definitions from schema
- `npm run db:seed` - Reset and populate database with seed data
- `npm run db:start-dev` - Start development database (Docker)
- `npm run db:stop-dev` - Stop development database
- `npm run db:studio` - Open Prisma Studio for database management

### Code Generation
- `npm run codegen` - Generate TypeScript definitions for GraphQL operations (DTSI integration)
- `npm run codegen:schemas` - Pull latest GraphQL schema updates from 3rd-party APIs

### Quality & Testing
- `npm run audit` - Run all pre-commit checks (lint, typecheck, test, prettier)
- `npm run lint` - ESLint and Prettier checks
- `npm run typecheck` - TypeScript compilation check
- `npm run test` - Run Jest tests
- `npm run build` - Production build

### E2E Testing
- `npm run e2e:run` - Start Cypress UI for E2E testing
- `npm run e2e:run-headless` - Run all E2E tests via CLI

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router and Server Components
- **Database**: MySQL with Prisma ORM, PlanetScale hosting
- **Styling**: TailwindCSS + Radix UI components
- **Authentication**: NextAuth.js with Web3 integration (Thirdweb)
- **Background Jobs**: Inngest for workflows and cron jobs
- **Analytics**: Mixpanel, Sentry for error tracking
- **Deployment**: Vercel

### Project Structure
- `src/app/` - Next.js App Router pages with country-specific routing (`[countryCode]/`)
- `src/components/` - Reusable UI components (`ui/`) and app-specific components (`app/`)
- `src/actions/` - Server Actions for form handling and user actions
- `src/data/` - Data fetching functions, DTSI GraphQL queries, database aggregations
- `src/inngest/` - Background job functions for workflows and cron jobs
- `src/utils/` - Utilities split by environment: `shared/`, `server/`, `web/`, `edge/`
- `src/hooks/` - React hooks for client-side state and API interactions
- `src/validation/` - Zod schemas for form and API validation
- `prisma/` - Database schema and migrations

### Key Features
- **Multi-country Support**: Routes structured as `[countryCode]/` for US, CA, AU, GB
- **User Actions**: Email congresspeople, voter registration, NFT minting, referrals
- **Political Data**: Integration with DoTheySupport.it (DTSI) API for politician information
- **Real-time Updates**: Inngest handles background processing for user communications
- **Web3 Integration**: NFT minting, crypto address management via Thirdweb

### Database Schema
Uses Prisma with MySQL. Key models:
- `User` - User profiles with crypto addresses and communication preferences
- `UserAction*` - Various user action types (email, call, vote, etc.)
- `Address` - Normalized address storage for electoral district mapping
- `NFTMint` - Web3 NFT minting records

### Environment Setup Requirements
1. Copy `.env.example` to `.env` and configure required variables
2. Start local MySQL with `npm run db:start-dev`
3. Run `npm run initial` for first-time setup
4. Start both `npm run dev` and `npm run inngest` for full functionality

### Testing Strategy
- Jest for unit tests
- Cypress for E2E testing with dedicated test database
- Storybook for component development and testing
- Pre-commit hooks run full audit suite

### Important Notes
- Database schema changes require PlanetScale branch workflow (testing → production)
- DTSI integration provides politician data - run `npm run codegen` after GraphQL changes
- Inngest functions handle user communication workflows and background processing
- Multi-country routing affects all page structures and requires country-specific components