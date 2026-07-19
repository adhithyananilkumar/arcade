import os

headers = {
    "app/layout.tsx": """/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: App
 * Type: Root Layout
 *
 * Purpose:
 * Declarative global HTML layout and Next.js root metadata.
 *
 * Rules:
 * - Do not place business logic here.
 * - Delegate to GlobalProviders in apps/core for React Context.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */
""",
    "apps/public/orchestrators/AuthOrchestrator.tsx": """/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Public
 * Type: Orchestrator
 *
 * Purpose:
 * Connects the pure UI AuthForm to API services and Next.js routing.
 *
 * Rules:
 * - Handles all side-effects (fetching, navigation, cookies).
 * - Delegates rendering to pure domain components.
 * - Never export this component back to domains/.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */
""",
    "apps/creator/orchestrators/CourseEditorOrchestrator.tsx": """/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Creator
 * Type: Orchestrator
 *
 * Purpose:
 * Composes Courses, Learning, and Publishing domains into the rich text editor.
 *
 * Rules:
 * - The supreme authority for the course authoring state.
 * - Handles complex cross-domain interactions.
 * - Keep domain UI pure.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */
""",
    "infrastructure/http/api.ts": """/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Infrastructure
 * Module: HTTP
 *
 * Purpose:
 * The single source of truth for all outgoing HTTP requests.
 *
 * Rules:
 * - Must remain agnostic to Arcade business domains.
 * - Exposes generic methods (get, post, put, delete).
 * - Do not import anything from domains/ or apps/.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */
""",
    "shared/design-system/ui/button.tsx": """/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Shared
 * Subsystem: Design System
 *
 * Purpose:
 * Highly reusable, generic button component.
 *
 * Rules:
 * - Never mention business models (e.g. "Course", "Quiz").
 * - Must not have external side-effects.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */
""",
    "shared/contexts/BlockStateContext.tsx": """/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Shared
 * Module: Contexts
 *
 * Purpose:
 * Framework-agnostic React Context for managing rich text block state.
 *
 * Rules:
 * - Must not contain domain-specific business logic.
 * - Safe to be used by any domain.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */
""",
    "apps/core/Providers.tsx": """/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Core
 *
 * Purpose:
 * Wraps the application in necessary global contexts (React Query, Theme, etc).
 *
 * Rules:
 * - Keep as minimal as possible.
 * - Do not place business logic here.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */
""",
    "apps/core/layout/ProtectedLayout.tsx": """/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Core
 *
 * Purpose:
 * Route guard layout ensuring a user is authenticated.
 *
 * Rules:
 * - Handles redirects to /sign.
 * - Delegates rendering to nested children.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */
"""
}

# Domains
domains = [
    "identity", "channels", "publishing", "assessments", 
    "courses", "roadmaps", "organizations", "learning", "community"
]

for d in domains:
    headers[f"domains/{d}/index.ts"] = f"""/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: {d.capitalize()}
 *
 * Purpose:
 * Exposes the public API for the {d.capitalize()} domain.
 *
 * Rules:
 * - Export only stable public APIs.
 * - Never export internal helpers.
 * - Never import from apps/.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */
"""

for filepath, header in headers.items():
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Don't add if already exists
        if "Arcade Frontend Architecture" not in content:
            # Check for "use client" or similar directives at the very top
            lines = content.splitlines()
            directive_lines = []
            rest = []
            
            for line in lines:
                if line.startswith('"use client"') or line.startswith("'use client'"):
                    directive_lines.append(line)
                else:
                    rest.append(line)
            
            new_content = ""
            if directive_lines:
                new_content += "\n".join(directive_lines) + "\n\n"
            new_content += header + "\n" + "\n".join(rest)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Added header to {filepath}")
        else:
            print(f"Header already exists in {filepath}")
    else:
        print(f"File not found: {filepath}")
