## Development Rules

Please follow these rules when contributing code:

### General

- Only create an abstraction when it's actually needed.
- Prefer clear function/variable names over inline comments.
- Avoid helper functions when a simple inline expression would suffice.
- Don't use emojis.
- The `gh` cli is installed, use it.
- Always use `alembic revision --autogenerate` to make migrations and then review the generated file before applying it. Never manually create a migration file.

### React

- Avoid massive JSX blocks and compose smaller components.
  Colocate code that changes together.
- Avoid `useEffect` unless absolutely necessary.

### Tailwind

- Mostly use built-in values, occasionally allow dynamic values, rarely globals.
- Always use v4 + global CSS file format + shadcn/ui

### TypeScript

- Don't unnecessarily add `try`/`catch` blocks.
- Don't cast `any`

### Other

- This project uses pnpm, not npm or yarn.
