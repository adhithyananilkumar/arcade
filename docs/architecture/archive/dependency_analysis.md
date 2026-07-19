# Phase 2.2: Dependency Analysis
## Pass 1: Dependency Graph
### Assessments
 - **Infrastructure**: `http` (1 imports)

### Channels
 - **Infrastructure**: `http` (2 imports)
 - **Infrastructure**: `auth` (1 imports)
 - **Shared**: `design-system` (1 imports)

### Community
 - **Infrastructure**: `http` (1 imports)
 - **Infrastructure**: `auth` (10 imports)

### Courses
 - **Domains**: `roadmaps` (1 imports)
 - **Domains**: `assessments` (1 imports)
 - **Shared**: `types` (1 imports)
 - **Shared**: `contexts` (1 imports)

### Identity
 - **Infrastructure**: `http` (3 imports)
 - **Infrastructure**: `auth` (2 imports)

### Learning
 - **Domains**: `courses` (1 imports)
 - **Domains**: `assessments` (1 imports)
 - **Infrastructure**: `http` (3 imports)
 - **Infrastructure**: `auth` (1 imports)
 - **Shared**: `types` (4 imports)
 - **Shared**: `contexts` (1 imports)

### Organizations
 - **Infrastructure**: `http` (1 imports)

### Publishing
 - **Infrastructure**: `http` (1 imports)
 - **Shared**: `types` (1 imports)

### Roadmaps
 - **Infrastructure**: `http` (4 imports)

## Pass 3: Architectural Metrics
| Domain | Incoming | Outgoing | Shared | Infrastructure | Status |
|--------|---------:|---------:|-------:|---------------:|--------|
| Assessments | 2 | 0 | 0 | 1 | Healthy |
| Channels | 0 | 0 | 1 | 3 | Isolated |
| Community | 0 | 0 | 0 | 11 | Isolated |
| Courses | 1 | 2 | 2 | 0 | Healthy |
| Identity | 0 | 0 | 0 | 5 | Isolated |
| Learning | 0 | 2 | 5 | 4 | Healthy |
| Organizations | 0 | 0 | 0 | 1 | Isolated |
| Publishing | 0 | 0 | 1 | 1 | Isolated |
| Roadmaps | 1 | 0 | 0 | 4 | Healthy |

## Pass 2: Cross-Domain Edge Classification (Draft)
We need to classify each cross-domain dependency as:
1. **Valid collaboration**: Legitimate use of public API.
2. **Shared concern**: Should move to `shared` or `infrastructure`.
3. **Leaky abstraction**: Exposing implementation details.
4. **Ownership mistake**: Code belongs in another domain.

- **courses** → **roadmaps**
  - File: `domains/courses/blocks/roadmap/index.ts`
  - Import: `import { RoadmapNode } from "@/domains/roadmaps"`
  - Classification: [PENDING]

- **courses** → **assessments**
  - File: `domains/courses/blocks/quiz/QuizBlockRender.tsx`
  - Import: `import { QuizPlayer } from "@/domains/assessments"`
  - Classification: [PENDING]

- **learning** → **courses**
  - File: `domains/learning/delivery/components/TiptapContentView.tsx`
  - Import: `import { getBlockRenderer } from "@/domains/courses"`
  - Classification: [PENDING]

- **learning** → **assessments**
  - File: `domains/learning/delivery/components/CourseRenderer.tsx`
  - Import: `import { QuizPlayer, type QuizStatsResponse } from "@/domains/assessments"`
  - Classification: [PENDING]
