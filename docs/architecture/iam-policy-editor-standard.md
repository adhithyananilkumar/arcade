# Arcade Policy Editor UI Redesign (AWS IAM Inspired)

Redesign the Arcade Policy Editor to be a professional, enterprise-grade permission management interface inspired by AWS IAM, GitHub Enterprise, Azure RBAC, and Google Cloud IAM.

This is **not** a simple checkbox list. It should be a scalable permission management system capable of handling hundreds or thousands of permissions across Platform, Publisher, and Channel scopes.

## Core Design Principles

* Enterprise-grade
* Clean and modern
* Scalable to thousands of permissions
* Fast to navigate
* Beginner-friendly
* Powerful for advanced administrators
* Zero permission ambiguity
* Excellent accessibility
* Responsive layout
* Keyboard shortcuts supported

---

## Information Architecture

Replace the flat checkbox list with multiple sections.

```text
Policy
│
├── Overview
├── Managed Policy Bundles
├── Custom Permissions
├── Permission Tree
├── Permission Details
├── Dependency Validation
├── Included Permissions
├── Effective Permissions Preview
└── Save
```

---

## 1. Policy Overview

Display:

* Policy Name
* Description
* Scope
  * Platform
  * Publisher
  * Channel
* Risk Level
* Created By
* Last Updated
* Number of Permissions
* Number of Bundles Included

---

## 2. Managed Policy Bundles (Primary Method)

Show cards similar to AWS Managed Policies.

Examples:

```text
AdministratorAccess
Full administrative control.
```

```text
PlatformOperationsAccess
Platform operational management.
```

```text
ChannelAdministratorAccess
Full control over one channel.
```

```text
ChannelManagerAccess
Manage courses, staff and content.
```

```text
ContentCreatorAccess
Create and edit learning content.
```

```text
ReviewerAccess
Review and approve submissions.
```

```text
ReadOnlyAccess
Read-only permissions.
```

Each bundle should display:

* Description
* Included permissions count
* Expand button
* Search
* Documentation link

---

## 3. Custom Permission Builder

Below the bundles provide:

```text
Switch to Advanced Mode
```

Only advanced administrators should use raw permissions.

---

## 4. Permission Tree

Use an expandable tree instead of a long checkbox list.

Example:

```text
Platform
    Analytics
        View
        Export

    Billing
        View
        Manage

    Channels
        View
        Create
        Update
        Delete
        Archive

    Roles
        View
        Create
        Update
        Delete
        Assign

Publisher

Channel

Courses

Roadmaps

Assessments

Community

Storage

Certificates

Payments

Settings
```

Every node supports:

* Expand
* Collapse
* Select All
* Partial Selection
* Search
* Filter

---

## 5. Permission Details Panel

When clicking a permission, show a right-side details panel.

Display:

* Permission Name
* Description
* Scope
* Risk Level
* Dependencies
* Parent Permission
* Child Permissions
* Used By Bundles
* Related Permissions
* Affected Resources
* API Permissions
* Audit Information

---

## 6. Dependency Engine

If an administrator selects:

```text
Delete Channel
```

without:

```text
View Channel
```

show:

```text
Delete Channel requires:
✔ View Channel
✔ Update Channel

Add them automatically?
[Add Required]
```

Never silently add permissions.
Always explain why.

---

## 7. Validation Panel

Show live validation.

Example:

```text
✔ No duplicate permissions
✔ Dependencies satisfied
⚠ Dangerous permissions detected
✔ Scope valid
✔ Policy complete
```

---

## 8. Effective Permissions

Show the final permission list after bundles are expanded.

Example:

```text
Bundles
✔ ChannelAdministratorAccess

Expanded Permissions
channel.view
channel.update
channel.members.manage
channel.roles.manage
course.publish
course.review
```

This allows administrators to understand exactly what a bundle grants.

---

## 9. Search

Global search.

Supports:

* Permission name
* Description
* Bundle name
* API name
* Scope
* Resource

---

## 10. Filters

Filter by:

* Platform
* Publisher
* Channel
* High Risk
* Recently Added
* Custom
* Managed
* Unused

---

## 11. Risk Indicators

Every permission has a badge.

Examples:

```text
🟢 Low
🟡 Medium
🟠 High
🔴 Critical
```

Example:

```text
Delete Platform
Critical
```

---

## 12. Warning Dialogs

If dangerous permissions are selected, show:

```text
This policy grants the ability to delete channels.
This action may permanently remove data.

Continue?
```

---

## 13. Bundle Builder

Allow administrators to create reusable managed bundles.

Example:

```text
Create Bundle

Name
Description
Permissions
Dependencies
Preview
Save
```

---

## 14. Effective Access Preview

Before saving, show:

```text
This user will receive
42 Permissions
3 Bundles
Platform Scope
Channel Scope
Inherited Permissions
Dependent Permissions
```

---

## 15. Audit Support

Every permission should expose:

* Created
* Modified
* Used By
* Assigned Users
* Assigned Roles
* Affected APIs
* Audit Logs

---

## 16. Responsive Layout

Desktop:

```text
Left Sidebar
Permission Tree

Center
Permission List

Right Sidebar
Permission Details
```

Tablet:
Two-column layout.

Mobile:
Drawer-based navigation.

---

## 17. UX Enhancements

Support:

* Multi-select
* Shift-click selection
* Keyboard shortcuts
* Breadcrumb navigation
* Favorites
* Recently used permissions
* Expand/Collapse All
* Copy policy
* Clone policy
* Compare policies
* Import/Export policies
* Dark mode

---

## Final Goal

Build a policy editor that feels comparable to **AWS IAM**, **Azure RBAC**, and **Google Cloud IAM**, while remaining tailored to Arcade's multi-tenant architecture (Platform → Publisher → Channel). The default experience should encourage administrators to use **managed policy bundles**, with an advanced mode exposing a **hierarchical permission tree**, **dependency validation**, **effective permission preview**, and **detailed permission metadata** for precise access control.
