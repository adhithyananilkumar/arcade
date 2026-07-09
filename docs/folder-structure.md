# Folder Structure

This document explains every top-level folder and what belongs inside it.

- **app/**: Next.js App Router pages and layouts. Organized by route groups (e.g., `(public)`, `(auth)`, `(authenticated)`).
- **components/**: Shared reusable UI components that are feature-agnostic.
- **features/**: Business features and modules (e.g., `auth/`, `users/`, `courses/`). Each feature encapsulates its own components, hooks, and utils when they are not shared globally.
- **lib/**: Utilities, API client configuration, and helper functions.
- **hooks/**: Shared React hooks used across multiple features.
- **types/**: Global TypeScript types and interfaces.
- **assets/**: Images, icons, and fonts.
- **styles/**: Global CSS styling and design tokens.
- **config/**: Configuration files and global constants.
- **docs/**: Project documentation (the single source of truth).
