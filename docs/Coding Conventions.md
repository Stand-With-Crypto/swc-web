# Coding Conventions

Below is a non-exhaustive list of coding conventions that we try to follow. This list is ever evolving and suggestions submitted via PR are highly encouraged!

## General

- If a convention can be programmatically audited/enforced with a tool like eslint and prettier, we should leverage that tool.
- Avoid export default unless required by the framework (for example Next.js App Router pages). Named exports make auto-importing in IDEs like VSCode easier.

## TypeScript

- Avoid using `any`. if it's needed, add a comment explaining why if it's not self-evident
- Code should be camelCase by default
- Constants should be ALL_UPPER_SNAKE_CASE
  - When defining a constant array, add `readonly` to prevent unexpected mutations
- variables that are booleans should be prefixed with a descriptor that implies a yes or no answer. Examples of prefixes include `has`, `is`, `should`, `can`, etc

## Validation

- Always validate/sanitize server-side input
- For client-side and server-side input validation, leverage [zod](https://github.com/colinhacks/zod)
- When using zod for client-side validation, do not import `z` from the library as this prevents tree-shaking from removing unused portions of the library. Instead import the individual methods (`object`, `string`, etc) from the package.
- when you need field-level errors to be returned to the client, make sure to return them in an object structure as `{ errors: validatedFields.error.flatten().fieldErrors }` so they can successfully be used by client side functions like `triggerServerActionForForm`

## UI Development

- Whenever possible, try and use TailwindCSS and Radix UI as the core primitives for building UI
- When tasked with building out a new base-level UI primitive (a checkbox component for example), consider checking [shadcn](https://ui.shadcn.com/docs/components/), a CLI tool that aides in the rapid development of TailwindCSS/Radix UI components, to see if there's any prebuilt examples that we can use as a starting point. Because shadcn [is not a component library](https://ui.shadcn.com/docs), we get all the benefits of bootstrapping the UI with some best practices, and none of the downsides of getting locked in to opinionated component libraries that are hard to customize.
- When building forms that require best-in-class UX practices (field-level error validation for example), consider leveraging `react-hook-form` and the corresponding pre-built components in `src/components/ui/form`.
- For standalone header text, consider using [react-wrap-balancer](https://react-wrap-balancer.vercel.app/) to aide it's responsiveness. See our `PageH1` and `PageH2` components
- Use the `container` class to define standard page breakpoints, unless UX calls for something else.
  - An example of when not to use `container` - you have a sideways scrolling list that extends beyond the viewport and want to make sure elements go "off the edge of the screen" to the user
- Avoid using javascript-defined styles over CSS-defined styles (like change UX based off screen size) unless it's not possible to achieve the desired effect with CSS. Defining responsive design in css is more SEO/user friendly. It prevents unwanted flickers and reduces the need for client components.
- If you are building a UI element with a lot of different possible UI permutations, consider creating a [storybook](https://storybook.js.org/) file (`.stories.tsx`) to help other developers view all the possible UI states.
  - A good example of when it makes sense is `src/components/app/dtsiStanceDetails/dtsiStanceDetails.stories.tsx`
- Consider whether `flex` or `grid` styles make the most sense for positioning the UI you're building. For example, if you need a 3, even width, columns layout that collapses down to one on mobile, this is a perfect candidate for a grid (`grid grid-cols-1 md:grid-cols-3`). If you need a layout where theres two pieces of content in a row that should be set as far apart as possible, this is a perfect use case for flex (`flex justify-between`).
- Unless there's a specific reason not to (like you're sharing a large complex string of classes between multiple UI elements), prefer to write your tailwind classes inline, rather than defining them elsewhere and referencing via variable.
  - if you are defining tailwind classes outside a className prop, make sure you wrap them in `cn()` or `twNoop()` to ensure our linters and IDE plugins know the string is composed of tailwind classes
- when developing new pages, add a new folder to `src/components/app/pageNameOfYourPage` that contains all page-specific UI files. For example, the "About" page components would be in `src/components/app/pageAbout`

## Backend Development

- Leverage our [Inngest](https://www.inngest.com) integration when dealing with business logic that needs resilient workflow functionality. See [here](https://www.inngest.com/patterns) for some examples. Avoid using Inngest for basic backend logic that doesn't require this additional complexity/functionality

## Security

- Follow [Next.js security best practices](https://nextjs.org/blog/security-nextjs-server-components-actions)
- When returning database models to the client, make sure to run them through the respective "client" parser found in the `/src/clientModels` folder to ensure we strip out any sensitive data
- Never have react components accept database models directly. They should always accept the `Client` variant of the model

## Database

- Because of [weird quirks with db column name case sensitivity](https://stackoverflow.com/questions/2009005/are-column-and-table-name-case-sensitive-in-mysql) all database column names should be `snake_case`. See our `prisma/prisma.schema` file for how we map from snake_case to camelCase for TypeScript using `@map`.
- Column names for datetime types should be prefixed with `datetime`
- Column names for date types should be prefixed with `date`
- Column names for monetary (and crypto) amounts should include the kind of currency being tracked, unless there is a separate column on the table that includes the monetary type. Examples include `amountUsd`, `valueBTC`, etc
- Column names for boolean types should be prefixed with a descriptor that implies a yes or no answer. Examples of prefixes include `has`, `is`, `should`, `can`, etc
- String columns that can possibly be submitted with an empty string (form inputs, etc) should be set to default to "" and should not be nullable. This ensures that there can't be two "falsy" states (null, and empty string). For string columns that can not ever be submitted with an empty string (a string id column for example), use nullable instead of empty string.

## Data Fetching/Rendering

- Prefer static/cached pages and API endpoints, unless there are product requirements that necessitate otherwise
- For static/cached pages, always explicitly set `export const dynamic = 'error'` (see [docs](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamic)) to prevent future code changes that accidentally make the page dynamic/slow
- Use the App Router API directory over Page Router API directory whenever possible
  - Examples of when to use the Page Router include when dealing with libraries that have not been upgraded to fully support the App Router yet
- Don't use Client Components unless you need client-side interactivity. When developing larger Client Components, consider if some of the logic could be decoupled in to a Server Component for the non-dynamic portions. Server Components have a much smaller bundle size footprint.
- If you need client-side data fetching in addition to or instead of rendering via RSCs ("Load More" actions, realtime updating data, user-specific data being fetch on a page you'd like to be largely cached, etc), use the [swr](https://swr.vercel.app/) library from Vercel unless product requirements demand something more custom
