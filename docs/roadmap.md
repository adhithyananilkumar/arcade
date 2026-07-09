# Roadmap & Development Plan

Arcade is split by business capabilities, not by backend/frontend or technical layers. Each team owns a complete feature area from UI to database. This minimizes merge conflicts and allows parallel development.

## Business Capabilities (Teams)

### Team 1 — Identity & User Management
- **Scope:** Authentication, Registration, Login, User profiles, Public profiles, Account settings, Roles & permissions, Platform administration, User invitations.
- **Dependencies:** None (foundation module).

### Team 2 — Organizations & Creators
- **Scope:** Organization management, Organization profiles, Organization members, Organization administrators, Individual creator profiles, Content ownership, Author management.
- **Depends on:** Identity

### Team 3 — Content Management
*This is the largest module.*
- **Scope:** Content creation, Courses, Workshops / Bootcamps, Webinars, Articles, Content editor, Modules & sections, Scheduling, Publishing, Draft management, Media attachments.
- **Depends on:** Identity, Organizations

### Team 4 — Content Review & Publishing
- **Scope:** Submission workflow, Review queue, Content approval, Content rejection, Reviewer comments, Publish workflow, Content moderation.
- **Depends on:** Content Management

### Team 5 — Learning Experience
*Everything learners interact with after content is published.*
- **Scope:** Browse content, Search, Enrollments, Learning dashboard, Continue learning, Progress tracking, Completion tracking, Live session attendance.
- **Depends on:** Content, Review

### Team 6 — Assessment & Examination
*Keep these together since they are tightly related.*
- **Scope:** Quizzes, Assignments, Question bank, Certification exams, Exam scheduling, Exam attempts, Evaluation, Results, Anti-cheat integration, Manual reviews.
- **Depends on:** Content

### Team 7 — Certificates
- **Scope:** Certificate generation, Certificate templates, Verification, Public verification page, Certificate history.
- **Depends on:** Assessment

### Team 8 — Public Platform
*Everything visible without logging in.*
- **Scope:** Landing pages, Public course catalog, Creator profiles, Organization profiles, Public learner profiles, Search engine optimization, Discovery pages.
- **Depends on:** Content, Organizations, Certificates

---

## Overall Dependency Graph

```text
Identity
    │
    ▼
Organizations & Creators
    │
    ▼
Content Management
    │
    ├────────► Review & Publishing
    │                 │
    ▼                 ▼
Learning Experience   Public Platform
    │
    ▼
Assessment & Examination
    │
    ▼
Certificates
```

---

## Parallel Development Plan

Once **Identity** reaches a usable state (authentication, users, and basic roles), development can branch out:
1. **Team 2** builds Organizations & Creators.
2. **Team 3** builds Content Management.
3. **Team 8** builds the Public Platform using mock content if needed.

When **Team 3** has the core content model ready:
4. **Team 4** starts Review & Publishing.
5. **Team 5** starts the Learning Experience.
6. **Team 6** builds Assessments & Examinations.

Finally:
7. **Team 7** builds Certificates once assessment outcomes are available.

This organization keeps dependencies straightforward and enables most teams to work in parallel without waiting on unrelated features.
