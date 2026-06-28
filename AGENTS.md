## Project

Tech stack:

- TanStack Start
- React
- TypeScript (strict)
- TanStack Router
- Tailwind CSS
- Supabase
- Vite
- pnpm

---

## General Principles

- Follow official documentation.
- Prefer simple solutions.
- Avoid over-engineering.
- Keep code maintainable.
- Keep code scalable.
- Keep code reusable.
- Maintain strict type safety.

---

## Before Making Changes

Always:

- Understand the architecture.
- Understand the routing flow.
- Understand authentication.
- Understand existing conventions.
- Read related files before editing.

Never modify code blindly.

---

## When Implementing Features

Features must:

- integrate with the existing architecture
- follow project conventions
- include proper error handling
- be fully typed
- be responsive when applicable
- be accessible when applicable
- avoid duplicate code

Do not implement the minimum amount of code just to satisfy the request.

---

## React

- Prefer composition.
- Extract reusable logic into hooks when appropriate.
- Avoid unnecessary state.
- Avoid unnecessary effects.
- Avoid premature memoization.

---

## TanStack Start

Always follow official patterns for:

- routing
- layouts
- beforeLoad
- loaders
- route context
- server functions
- pending UI
- error boundaries

Do not introduce patterns from other frameworks unless necessary.

---

## TypeScript

- Avoid any.
- Avoid unsafe assertions.
- Prefer inference.
- Keep types close to their domain.
- Reuse types whenever appropriate.

---

## Supabase

- Keep authentication secure.
- Handle sessions correctly.
- Handle query errors.
- Use generated database types when possible.

---

## Code Quality

Always prefer:

- Clean Code
- DRY
- KISS
- SOLID where appropriate
- Separation of Concerns

---

## Validation

Before considering any task complete:

- TypeScript passes.
- Lint passes.
- Build succeeds.
- No broken imports.
- No obvious regressions.

If your changes introduce build, lint, or runtime errors, continue fixing them until the project is stable.

Never leave the repository in a broken state.
