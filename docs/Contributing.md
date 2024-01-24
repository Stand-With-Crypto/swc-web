# Contributing Guide

To ensure we continue to ship maintainable, performant, and bug-free code, all new contributions should be reviewed and approved by _at least one_ core contributor.

## When do I need to get a code review?

Generally, you'll want to request a code review once your branch is feature-complete and has passed all CI checks. If the feature you're working on has architectural complexity, and if you would like feedback before finishing the work, then you can also request a review sooner to get additional guidance.

If you're working on a change that is time sensitive (_e.g._ production is down) and/or you have a very high degree of confidence in what your shipping (_e.g._ there's a misspelled word, or you're adding logs), core contributors can merge without review. _However, this should be an exception, not the norm_.

## Who do I request a review from?

You'll generally want to try to solicit a review from whoever has the most context about the domain your working on. If you're unsure who has the most context, you can check the Git history or ask one of the core contributors for assistance. You can include others on the PR as "assignees" to solicit additional feedback and encourage others working on the codebase to learn by reviewing your code.

If you've been requested as a reviewer, but you don't think you have sufficient context or you think there's someone else on the team that would provide more value, feel free to reassign to someone else with an explanation.

## What do I need to include in my PR when I open it?

Outside the obvious bits (you need to include the actual code changes), the main thing to include is context:

- If the PR is related to a GitHub issue, make sure you reference that issue in the PR.
- If there are specific sections you have concerns about, include commentary describing the things you'd like the reviewers to consider.
- If there are areas that don't need review (large whitespace diffs, file structure refactors), feel free to call that out as well to guide the reviewer.
  - HINT: if you're code involves a bunch of cosmetic refactors (renames, pulling code in to new files, folder structure updates), you might want to merge a separate PR that does all those changes first, so that it's clear what logic changes you made in the actual final PR.

## I've been assigned code to review - what now?

Once you've gone through the PR, adding any comments/questions you might have, you can "Submit Review" with one of the following values:

- "Request Changes" - Use this when you have comments that need to be addressed before the code can be merged.
- "Approve" - Ship it. If there are minor edits you'd suggest making, but you don't believe those necessitate another round of review, you can approve the PR with your comments.

## My code has been approved - what now?

The author of the PR can merge (squash if appropriate), close the PR, and delete the branch after they have approvals from reviewers.

## I need to make database schema changes/migrations as part of my PR - what now?

We use PlanetScale as our database host provider. They have a number of [GitHub actions](https://planetscale.com/blog/announcing-the-planetscale-github-actions) that should simplify our CI process for database migrations, but until they're fully implemented in our codebase, below are some process steps when updating our database schema.

NOTE: these steps will only work for core contributors currently - if you need access to Vercel, then reach out to a core contributor:

### Fixing your Vercel PR branch

If you have schema changes/migrations to make, then your Vercel preview branch will need to be pointing to _your_ PlanetScale development database branch that you used for local development (_e.g._ the PlanetScale branch that you've run `npx prisma db push` on) via updating the `DATABASE_URL`. To update this environment variable:

- _This step only needs to be done once_:
  - Install the [Vercel CLI](https://vercel.com/docs/cli) locally.
  - Run `vercel login --github` to login to our instance. Ensure that the authentication proceeds with the correct email address.
  - `cd` into your local swc-web repository.
  - Run `vercel link`.
    - Say "y" to the set up.
    - Select "Stand With Crypto" as the scope containing the project.
    - Say "y" to the "stand-with-crypto/swc-web" project.
- Run `vercel env add DATABASE_URL preview [name-of-your-branch]`, and supply your development database URL.
  - This will update your preview branch's `DATABASE_URL` environment variable in Vercel.
  - Afterwards, you can redeploy your preview branch in Vercel, and your branch should pick up your custom `DATABASE_URL`.
  - Alternatively you can run `sh ./bin/add_preview_database_url_env.sh`. This will automatically use the `DATABASE_URL` from your local `.env` file.
- Once your preview branch has been merged to main, please clean up your branch-specific `DATABASE_URL` by running `sh ./bin/remove_preview_database_url_env.sh`.

At any point, if you want an additional sanity check for the existence of your environment variable, you can log into the Vercel website and check for your environment variable.

### Updating the PlanetScale schema

The process for merging schema changes to the `testing` PlanetScale database schema will vary whether you have breaking changes for our schema in your merged PR. If you're unsure if your changes are breaking, run `npx prisma db push` against _your_ PlanetScale developer database branch with your new schema changes. If the schema updates without prompting you with conflicts, then there are no issues:

- If your schema updates do not have any breaking changes, then Vercel will automatically run `npx prisma db push` on deploy to the `testing` PlanetScale database. All good!
- If your changes do break existing schema rules, then you'll need to run `npm run db:seed` against the `testing` PlanetScale database with your changes after you merge your PR (before Vercel tries to build the application). This will wipe the `testing` database and repopulate the database with seeded information.
  - NOTE: This should only be done while we're pre-go-live. After we start deploying to production, we'll need to ensure all changes don't break the schema and leverage one-off bin scripts to migrate data as needed.

For now, we aren't deploying any changes to production in PlanetScale, so you can stop here.
