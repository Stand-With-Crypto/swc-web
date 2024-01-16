# Contributing Guide

To ensure we continue to ship maintainable, performant, bug-free code, all new contributions should be reviewed and approved by at least one core contributor.

## When do I need to get a code review?

Generally you'll want to request a code review once your branch is feature-complete and has passed all CI checks. If the feature you're working on has architectural complexity that you'd like feedback on before finishing the work, you can also request a review sooner to get additional guidance.

If you're working on a change that is time sensitive (ex: production is down) and/or you have a very high degree of confidence in what your shipping (ex: there's a misspelled word, you're adding logs), core contributors can merge without review. This should be an exception not the norm.

## Who do I request a review from?

You'll generally want to try to solicit a review from whoever has the most context about the domain your working on. If you're unsure who has the most context, you can check the git history or ask one of the core contributors for assistance. You can include others on the PR as "assignees" to solicit additional feedback and encourage others working on the codebase to learn by reviewing your code.

If you've been requested as a reviewer and you don't think you have sufficient context/think there's someone else on the team that would provide more value, feel free to reassign to someone else with an explanation.

## What do I need to include in my PR when I open it?

Outside the obvious bits (you need to include the actual code changes), the main thing to include is context:

- If the PR is related to a github issue, make sure you reference that issue in the PR:
- If there are specific sections you have concerns about, include commentary describing the things you'd like the reviewers to consider
- If there are areas that don't need review (large whitespace diffs, file structure refactors), feel free to call that out as well to guide the reviewer
  - hint: if you're code involves a bunch of cosmetic refactors (renames, pulling code in to new files, folder structure updates), you might want to merge a separate PR that does all those changes first, so that it's clear what logic changes you made in the actual final PR

## I've been assigned code to review, what now?

Once you've gone through the PR, adding any comments/questions you might have, you can "Submit Review" with one of the following values:

- "Request Changes" - Use this when you have comments that need to be addressed before the code can be merged
- "Approve" - Ship it. If there are minor edits you'd suggest making, but you don't believe those necessitate another round of review, you can approve the PR with your comments.

## My code has been approved, what now?

The author of the PR can merge (squashing if appropriate), close the PR, and delete the branch after they have approvals from reviewers.

## I need to make database migrations as part of my PR, what now?

We use PlanetScale as our database host provider. They have a number of [github actions](https://planetscale.com/blog/announcing-the-planetscale-github-actions) that should simplify our CI process for database migrations, but until they're fully implemented in our codebase, below are some process steps when updating our database schema. NOTE: these steps will only work for core contributors currently:

- If you have migrations to make, your vercel preview branch will fail by default because it's pointing to the testing db, and testing doesn't have the schema changes from your branch. You can change the database URL your preview branch is pointing to by logging in to Vercel and updating the DATABASE_URL environment variable for the "Preview" environment of your branch. Make sure you press "Select custom branch" and only update the Preview env var for your specific vercel branch.
- Once your change has been merged to testing, run one of the following against the testing database (you can get credentials in the PlanetScale admin panel):
  - If your changes do not break any existing schema rules: `npx prisma db push` will update testing db with your schema changes
  - If your changes break existing schema rules: `npm run db:seed` will wipe and reset testing database with your schema changes. NOTE: This should only be done while we're pre-go-live. After we start deploying to production, we'll need to ensure all changes don't break the schema and leverage one-off bin scripts to migrate data as needed
- For now, we aren't deploying any changes to production in PlanetScale so you can stop here
