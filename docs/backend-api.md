# Backend API

How the frontend communicates with the Spring Boot backend.

## API Conventions
- Base URL is determined by environment variables.
- All endpoints follow RESTful principles.

## Authentication Flow
- Authentication relies on tokens (JWT).
- Tokens should be passed in the `Authorization` header as a Bearer token.
- Refresh token flow must be implemented for session continuation.

## Response Format
- Standardized response envelopes (e.g., `{ data, message, status }`).

## Error Format
- Standardized error envelopes with appropriate HTTP status codes and user-facing error messages.
