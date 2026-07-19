# Future Expansion Roadmap

This document outlines the planned locations for future modules within the Arcade repository to prevent the need for future reorganizations.

## Future Domains (Business Capabilities)
These modules will reside in `/domains/`:
- `payments/` (Stripe integration, invoicing, billing)
- `certificates/` (Certificate issuance and verification)
- `notifications/` (In-app notifications, email templates)
- `analytics/` (User engagement metrics, event tracking)
- `search/` (Global Algolia/Elastic search integrations)
- `media/` (Video processing, CDN interactions)
- `ai/` (LLM wrappers, content generation)
- `live/` (WebRTC, webinars, live-streaming)
- `proctoring/` (Identity verification and anti-cheat)
- `reports/` (Export generation, PDF rendering)

## Future Apps (User Experiences)
These modules will reside in `/apps/`:
- `mobile/` (React Native BFF and mobile-specific views)
- `partner/` (B2B integrations portal)
- `admin/` (Super-admin global view)
- `teacher/` (Dedicated instructor grading view)
- `organization/` (B2B management dashboard)

## Future Infrastructure (Technical Systems)
These modules will reside in `/infrastructure/`:
- `storage/` (S3 bindings, file upload clients)
- `events/` (WebSocket connections, Pub/Sub)
- `logging/` (Datadog/Sentry abstractions)
- `observability/` (OpenTelemetry tracing)
- `queue/` (Background job definitions)
- `feature-flags/` (LaunchDarkly/Statsig integrations)
