# Frontend Guidelines

Frontend development practices for Arcade.

## Component Organization
- Keep components small and focused.
- Favor feature-scoped components over global components if they are only used in one feature.

## State Management
- Use React state (`useState`, `useReducer`) for local state.
- Lift state up or use Context only when necessary.
- Server state should be managed via API clients (e.g., React Query or SWR) when appropriate.

## API Usage
- All API calls should be routed through the configured API client in `lib/`.
- Handle loading, error, and success states comprehensively.

## Error Handling
- Use Error Boundaries for unexpected errors.
- Display user-friendly error messages.

## Loading States
- Always provide feedback when data is being fetched or actions are processing (e.g., skeletons, spinners).
