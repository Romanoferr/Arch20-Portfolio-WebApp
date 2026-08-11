# Project Instructions

## Project

This is a portfolio website for an architect.

The project is a production React application and should be treated as an existing
codebase, not as a greenfield project.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- Supabase
- Lucide React

## General Rules

- Use TypeScript.
- Do not use `any` unless absolutely necessary.
- Prefer existing components over creating duplicates.
- Reuse existing utilities and hooks.
- Do not install new dependencies unless necessary.
- Do not modify unrelated files.
- Keep components focused and maintainable.
- Preserve the existing visual identity.
- Maintain responsive behavior for desktop and mobile.
- Do not remove existing functionality unless explicitly requested.

## Styling

- Follow the existing Tailwind configuration.
- Reuse existing design tokens.
- Reuse existing colors, fonts, spacing and animations.
- Do not introduce a new design system.
- Do not replace existing styling architecture.

## Architecture

Before implementing a significant feature:

1. Inspect the existing architecture.
2. Identify the relevant files.
3. Explain the proposed approach.
4. Reuse existing patterns whenever possible.
5. Make the smallest reasonable change.

## Supabase

- Never expose service_role credentials in frontend code.
- Never hardcode secrets.
- Use environment variables.
- Respect Supabase Row Level Security.
- Do not modify database schema without explaining the required migration.
- Do not disable RLS as a workaround.

## Git

- Do not modify unrelated files.
- Do not reset, revert or delete user changes.
- Do not create commits unless explicitly requested.

## Validation

After significant changes:

1. Run the appropriate tests.
2. Run the TypeScript/build validation.
3. Check for lint errors if configured.
4. Report what was changed and what was validated.

## Communication

Before making significant changes, briefly explain the plan.

When finished, summarize:

- Files changed
- What changed
- Tests/build executed
- Any remaining concerns