# React Server Components At Scale with Next.js App Router

1. [Introduction](#introduction)
2. [RSC Empowers Front End Engineers To Own The Entire Stack](#rsc-empowers-front-end-engineers-to-own-the-entire-stack)
3. [APIs As Needed](#apis-as-needed)

## Introduction

[In 2020](https://react.dev/blog/2020/12/21/data-fetching-with-react-server-components) the React core team announced React Server Components (RSC). Rather than attempt to document what this new architecture unlocks, I’ll link to a bunch blog posts that do an excellent job of explaining not just what RSC are, but why they’re a massive user-experience and developer productivity improvement compared to the current way web apps are built today:

- [Making Sense of React Server Components](https://www.joshwcomeau.com/react/server-components/) - (if you prefer video, [t3.gg has an excellent breakdown](https://www.youtube.com/watch?v=VIwWgV3Lc6s) of this blog post)

- [Vercel: Understanding React Server Components](https://vercel.com/blog/understanding-react-server-components)

If you’re unfamiliar with the paradigm shift this new technology enables, these blog posts are highly recommended intros.

With the [announcement of Next 13 in October 2022](https://nextjs.org/blog/next-13#new-app-directory-beta), RSC gained the battle-tested framework support of Next.js. Since then the functionality has gone from beta to production-ready and the Vercel team now [strongly recommends](https://nextjs.org/docs/app) that green field projects leverage (and legacy next.js projects should migrate to) the new App Router (RSC-powered) design pattern for building Next.js apps.

## RSC Empowers Front End Engineers To Own The Entire Stack

The long term roadmap for React, Next.js, and RSC has implications for the way companies think about structuring their engineering teams. In the past, teams have been composed of Frontend Engineers, who focus on building out robust UI interfaces, and backend engineers who own providing APIs and services that the front end consumes to build great user experiences.

With Next.js and RSC the clearly defined line that previously existed between these delegated domains is blurring. Teams building with a modern Next.js architecture have Product Engineers who own the frontend and backend of their web app. For distinct backend services that need to decouple from the serverless architecture of Next.js for organization/security/performance/domain-specific reasons, having backend-only focused teams also makes sense. Like all engineering decisions, this decoupling has velocity/complexity tradeoffs.

# APIs As Needed

The usage of Next.js (and the recently introduced [Server Actions](https://nextjs.org/docs/app/api-reference/functions/server-actions) design pattern) reduces the overall need for exposed HTTP API endpoints. In a legacy [Single Page Application](https://developer.mozilla.org/en-US/docs/Glossary/SPA) architecture, JavaScript is sent to the client browser, parsed, and then API requests are made to fulfill the non-static data requirements of the view. With frameworks like Next.js, the initial data requirements for the page can be shipped to the client browser on pageload, alongside the javascript needed to bootstrap site interactivity. Not only does this approach massively improve the site’s [Core Web Vitals](https://web.dev/explore/learn-core-web-vitals), but it reduces the boilerplate code that teams need to implement to power their site.

There are many instances where building out exposed HTTP API endpoints still makes sense:

- If the underlying backend logic needs to be decoupled from the Next.js application for organization/security/performance/domain-specific reasons

- If the Next.js app domain logic will be used to power other clients like iOS/Android apps

- If the product requirements for the client include dynamically fetching additional information after page load based off user interactions, like infinite scroll lists or fetching dynamic user-specific data on a cached static page

Oftentimes what teams end up doing is leveraging Next.js’ native React Server Component tooling when possible, and exposing API endpoints as needed for instances where the product requirements demand it (The Next.js team has an [excellent blog post](https://nextjs.org/blog/security-nextjs-server-components-actions) on security best practices for data handling).
