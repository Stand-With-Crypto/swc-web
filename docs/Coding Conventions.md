# Coding Conventions

Below is a non-exhaustive list of coding conventions that we try to follow. This list is ever evolving and suggestions submitted via PR are highly encouraged!

## General

- Whenever possible, favor rules that can be programmatically audited/enforced. Tools like eslint and prettier help enforce convention with minimal friction

## TypeScript

- Avoid using `any`. if it's needed, add a comment explaining why
- Code should be camelCase by default
- Constants should be ALL_UPPER_CASE_SNAKE_CASE
- When defining a constant that can be mutated (like arrays or objects), add `readonly` to prevent unexpected mutations

## Validation

- Always validate/sanitize server-side input
- For client-side and server-side input validation, leverage [zod](https://github.com/colinhacks/zod)
- When using zod for client-side validation, do not import `z` from the library as this prevents tree-shaking from removing unused portions of the library. Instead import the individual methods (`object`, `string`, etc) from the package.

## UI Development

- When tasked with building out a new base-level UI primitive (a checkbox component for example), consider checking [shadcn](https://ui.shadcn.com/docs/components/) to see if there's any prebuilt examples that we can use as a starting point. Because shadcn [is not a component library](https://ui.shadcn.com/docs), we get all the benefits of bootstrapping the UI with some best practices, and none of the downsides of getting locked in to opinionated component libraries that are hard to customize.
- Utilize tailwind (the the `cn` tailwind utility function) to style components.
