# Git Workflow

Branch strategy and commit standards.

## Branch Strategy
- `main`: Production-ready code.
- `develop`: Pre-production / integration branch.
- `feature/*`: New features (e.g., `feature/user-auth`).
- `bugfix/*`: Bug fixes (e.g., `bugfix/login-crash`).
- `hotfix/*`: Urgent fixes in production (e.g., `hotfix/security-patch`).

## Commit Message Format
- Use conventional commits: `type(scope): description`.
- Example: `feat(auth): add login form`, `fix(api): handle 401 error gracefully`.
