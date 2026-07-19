# Coding Standards

Project coding rules to maintain a consistent and clean codebase.

## TypeScript Rules
- Enable strict mode.
- Avoid using `any`; define precise types or use `unknown`.

## File Organization
- One component per file (typically).
- Colocate related tests, styles, and types when applicable.

## Import Order
1. External libraries (e.g., `react`, `next`)
2. Internal aliases/modules
3. Relative imports

## Comments
- Explain *why*, not *what*. Code should be self-documenting as much as possible.

## Formatting
- Use Prettier and ESLint. Run formatters before committing.
