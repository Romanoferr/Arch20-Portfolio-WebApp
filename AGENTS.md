# AI Agent Instructions

## IMPORTANT

This is an existing production project.

Do not assume that a file, component, function, route,
database table, database column, API or dependency exists.

Always inspect the repository before making claims about it.

If information cannot be verified from the available project
context, explicitly say so.

Never invent implementation details.

---

# Project

This is a portfolio website for an architect.

The application has a public-facing portfolio and administrative
functionality.

The project must preserve its existing visual identity and behavior.

---

# Technology

The actual technologies used by the project must always be verified
against package.json and the source code.

Do not assume a dependency is installed simply because it is common
for React applications.

Known technologies include:

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase

Verify the exact versions and additional dependencies before using them.

---

# General Development Rules

1. Inspect before modifying.
2. Prefer existing patterns.
3. Make the smallest change necessary.
4. Do not modify unrelated files.
5. Do not introduce dependencies without justification.
6. Do not duplicate existing functionality.
7. Do not rewrite working code unnecessarily.
8. Preserve existing behavior unless explicitly asked to change it.

---

# Context Rules

Before implementing a feature:

1. Identify the relevant files.
2. Read the relevant code.
3. Identify dependencies between components.
4. Identify existing types and interfaces.
5. Identify existing hooks and services.
6. Identify relevant Supabase queries if applicable.
7. Explain the implementation plan.

If there is insufficient information:

STOP and state what information is missing.

Do not fill missing information with assumptions.

---

# React

- Use TypeScript.
- Prefer existing components.
- Reuse existing hooks.
- Reuse existing utility functions.
- Do not create duplicate components.
- Follow existing component conventions.
- Preserve responsive behavior.

---

# Styling

Use the existing styling architecture.

Before adding styles, inspect:

- Tailwind configuration
- global CSS
- existing design tokens
- existing components

Reuse existing colors, fonts, spacing and visual patterns.

Do not introduce a new design system.

---

# Supabase

Supabase-related implementation must be verified against
the actual project configuration.

Never assume the database schema.

Before modifying database-related functionality:

1. Inspect existing Supabase queries.
2. Inspect available types.
3. Inspect migrations if available.
4. Identify the relevant table.
5. Identify relevant columns.
6. Identify RLS policies if available.

Never expose service_role credentials in frontend code.

Never disable RLS as a workaround.

Never hardcode secrets.

---

# Environment Variables

Never invent environment variables.

Inspect the existing .env.example, configuration files,
and source code before referring to environment variables.

Never expose secret credentials.

---

# Git

Never:

- git reset --hard
- git checkout -- .
- delete unrelated files
- rewrite history
- force push

Do not create commits unless explicitly requested.

---

# Testing

After meaningful changes:

1. Run the relevant tests.
2. Run TypeScript/build validation.
3. Run lint if configured.
4. Report the commands executed and their results.

Never claim that a test passed unless it was actually executed.

---

# Agent Behavior

Before significant modifications:

1. Explain what you found.
2. Explain what you intend to change.
3. List the files you expect to modify.

Then implement the smallest reasonable solution.

After implementation:

- summarize modified files
- summarize behavior changes
- report tests/build performed
- report anything that could not be verified

---

# Communication

Be explicit about uncertainty.

Use statements such as:

"I could not verify this from the repository."

"The repository does not appear to contain this information."

"I need to inspect X before determining this."

Never fabricate missing information.

# Language

Always respond to the user in Brazilian Portuguese (pt-BR).

Use English only when:
- writing code, variable names, function names, commit messages, or technical identifiers;
- the user explicitly asks for English;
- English is required by a tool, API, library, or external service.

All explanations, reasoning summaries, questions, warnings, and status updates must be written in Brazilian Portuguese.