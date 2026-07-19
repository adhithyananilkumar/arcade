# Architecture Principles

This document defines the timeless "constitution" of the Arcade frontend architecture. 
These principles must be upheld across all future development.

## 1. Backend is the Source of Truth
The frontend only renders data and orchestrates user interaction. It must **never** duplicate backend logic.
The backend exclusively owns:
- Permissions and policies
- Authorization and business rules
- Data validation and integrity
- Pricing and workflows
- State transitions and ownership

## 2. Frontend Never Owns Permissions
Never hardcode permissions, roles, policies, course states, feature flags, or pricing logic in the frontend. All authorization checks and navigation decisions based on permissions must be driven by the backend.

## 3. No Hardcoded Business Rules
Business decisions belong to the server. The frontend must never invent data, fabricate permissions, or simulate backend behavior.

## 4. Business Capabilities Determine Folder Structure
Every new feature MUST belong to an existing domain. 
- Organize around business capability, **never** around pages, screens, or UI.
- If a feature genuinely does not fit an existing domain, ONLY THEN create a new domain.
- Prefer extending existing domains over creating new ones.

## 5. Architecture Changes Require Explicit Approval
The architecture is considered STABLE. 
- Do not introduce new architectural patterns, dependency directions, or abstractions.
- Never "fix" architecture based on personal preference.
- Any change that alters the architecture requires explicit approval from the project owner.
