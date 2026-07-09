# Arcade Content Architecture & Platform Plan

## 1. Platform overview
Arcade is an educational platform where anyone can register as a learner, while organizations and individuals can be approved as content creators. The platform manages learning, assessments, certifications, and creator publishing end to end.
The design principle guiding this plan is to keep the platform simple, scalable, and maintainable — avoiding unnecessary complexity in user roles, content structure, and workflows.

## 2. User model
There is a single base `User` entity. A user is not permanently “typed” as one role — instead, roles are memberships and grants attached to the user. The same person can simultaneously be a learner, a member of one or more organizations, an independent content creator, and (if invited) a platform administrator.

### 2.1 Public users (learners)
Anyone can register as a public user. No approval is required to become a learner.
Public users can:
- Browse public content
- Enroll in courses
- Register for workshops and webinars
- Attend sessions online or in person
- Take assessments and certification exams
- Receive certificates
- View their own learning history
- Maintain a public learner profile

### 2.2 Administration
Administration covers everyone with elevated, platform-level or org-level authority. It splits into two functionally distinct groups: Platform Administration and Content Creators.

#### 2.2.1 Platform administration
These are the owners and operators of Arcade itself — not content creators.
Roles include:
- Platform Owner
- Platform Administrators
- Moderators
- Reviewers (future)

**Responsibilities:**
- Managing the platform overall
- Inviting organizations onto the platform
- Inviting individual creators onto the platform
- Managing platform administrators and their permissions
- Approving organizations
- Approving content before public release
- Managing platform-wide policies
- Monitoring platform activity

*Design implication:* the Platform Owner can create administrators with different, customized permission sets and split responsibilities freely. This requires a real permission/role system underneath — not a single `is_admin` flag.

#### 2.2.2 Content creators
A content creator can be an Organization or an Individual Creator.
- Organizations (e.g. “Amal Jyothi College”) exist as entities inside Arcade and are onboarded at the top level by platform administration.
- An organization can onboard its own members (faculty, students, staff) as creators — the organization knows its own people and manages this internally.
- An organization may have its own internal admin-like roles for managing its members, separate from Arcade’s platform admins.
- Individual educators can publish independently, without belonging to any organization.
- A single user may belong to multiple organizations at the same time, publish under an organization, and/or publish independently under their own profile — all simultaneously.

## 3. Content ownership model
This was identified as a decision worth locking in early, since it directly shapes the data model. The confirmed rule:

| Concept | Definition | Owner |
|---------|------------|-------|
| **Owner** | The organization (if created under an org) or the individual (if published independently). The owner controls the content long-term. | Organization or Individual |
| **Authors** | The user(s) who actually created the content. This is credit, not control. | Users |

**Confirmed behaviors:**
- When a user creates content while part of an organization, the user is listed as author but the organization is the owner.
- Once a course is published, it belongs to the organization permanently — ownership does not change even if the author later leaves the organization.
- Authorship credit is historical and persists: the former member’s name still appears as author on the org’s published course, and the course still appears on that person’s own public profile, even after they leave.
- Edit rights, however, do not persist. After leaving the organization, the former member can no longer edit the content. The organization retains full edit rights, since it is the owner.

**Resulting minimal data shape:**
```json
Content { 
  owner_type: "org" | "user",  
  owner_id: "string",  
  authors: ["user_id", "…"] 
}
```
Authors remain listed independently of current org membership — the `authors` array is a permanent historical record, not a live membership lookup.

## 4. Content system
The content system is intentionally kept simple, with four top-level content types:
- Course (static/self-paced or live/scheduled)
- Workshop / Bootcamp
- Webinar
- Article

The internal structure of each type stays flexible. Content can combine any mix of: text, images, videos, audio, code snippets, graphs, resources, quizzes, assignments, and certification exams.
Courses support a structured learning flow (modules and sub-content) while remaining flexible — not every course needs the same number of modules or sections, but any expansion follows the same defined structural format. Workshops, webinars, and articles use the same underlying building blocks rather than separate content systems.

## 5. Content approval workflow
Content is never published directly. The workflow is:
1. Creator prepares content (draft)
2. Creator submits content for review
3. Platform administration reviews the submission
4. Content is approved or sent back with feedback
5. Only approved content becomes visible to learners

This approval pipeline applies uniformly across all four content types.

## 6. Assessment system
Content may include assessments. Supported assessment types:
- Quizzes
- Assignments
- Certification exams
- Manual reviews (future)

Assignments may require file uploads, written responses, or form-based submissions.
Courses with certification maintain their own question bank. The examination system selects questions from that bank according to predefined weight-distribution rules, rather than presenting the whole bank to every learner.

## 7. Examination system
Arcade includes a secure examination module supporting multiple evaluation methods:
- Online certification exams
- Scheduled examinations
- Manual evaluation
- Reviewer-based evaluation, for projects or internal assessments

The online exam experience emphasizes academic integrity through browser restrictions, tab-switch detection, and other anti-cheating mechanisms.

## 8. Certificates
Learners receive certificates after successfully completing eligible content and its associated assessments. Certificates are generated by the platform and remain independently verifiable.

## 9. Public profiles
- Learners have public profiles showing their learning achievements and certificates.
- Content creators have public profiles showcasing their published courses, workshops, webinars, and articles — functioning like a channel.
- Organizations have public pages representing the institution and everything published under it.

## 10. Open items for schema design
| Question | Why it matters |
|----------|----------------|
| Can an org hold an internal “admin” role for managing its own members, distinct from Arcade platform admins? | Affects whether org-level permissions are a lightweight sub-system or reuse the platform permission model. |
| Does every edit to already-published content require re-approval, or only the initial publish? | Determines whether “approved” is a one-time gate or a recurring state tied to content versions. |
| Is a certificate tied to (learner, content, exam attempt), or does it need to reference a specific content version? | Matters if courses can be revised after learners have already completed and certified on an earlier version. |
| If a user publishes independently first and later joins an org, does that content stay personally owned, or is there an explicit transfer-to-org action? | Assumed: stays personal unless explicitly transferred. Confirm before building the ownership-transfer logic (or deciding not to build it). |
