### Implementation Plan: COLLABS Professional Organization Management Platform

#### Title & Summary
Transform the existing collaboration website into a premium, modern SaaS-style platform for managing schools, teams, volunteers, events, tasks, and certificates. This upgrade establishes a centralized Admin Dashboard as the primary command center for all organizational operations.

#### User Review & Critical Decisions

> [!IMPORTANT]
> The platform scope is now confirmed based on the Master Prompt. The primary focus is building a robust Admin Dashboard as the first phase of this transformation.

-   **Visual Aesthetic**: Modern, clean, professional SaaS style (inspired by Linear/Notion).
-   **Dashboard Priority**: The Admin Dashboard will serve as the central hub for all operations and analytics.
-   **Core Modules**: Volunteer Management, Team Management (with School Directory), Task Assignment Workflow, Event Hub, and Certificate Issuance/Verification.
-   **Tech Stack**: Leveraging existing Firebase/React architecture, adopting shadcn/ui for professional components, and Recharts for data visualization.

---

### 1. Overview & Core Concept

-   **What It Does**: A centralized management platform for volunteer-driven organizations, bridging schools, volunteers, and project coordinators.
-   **Target Audience**: Organization admins, school coordinators, team leaders, and volunteers.
-   **Key Value**: Streamlines operational workflows, improves data visibility, enhances volunteer engagement, and automates administrative tasks (QR code check-ins, certificate generation, reporting).

### 2. User Experience & Visual Design

-   **Aesthetic Direction**: Minimalist, clean, and highly functional. Emphasize information density without overcrowding.
-   **Design System**: 
    -   *Theme*: Clean neutral background (`slate-50`), professional dark sidebar, sharp typography (`Inter` or `Plus Jakarta Sans`).
    -   *Components*: Utilizing `shadcn/ui` for high-quality, accessible interactive controls (modals, data tables, navigation sidebar).
    -   *Dark/Light Mode*: Full support toggled by user preference.
-   **Interactive Feedback**: Meaningful hover states, loading skeletons for data-heavy views, and professional toast notifications (via `sonner`).

### 3. Key Product Decisions & Trade-Offs

-   **Decision 1: Centralized Admin Dashboard (Sidebar-first)**
    -   *Approach*: Moving from basic navigation to a robust sidebar-navigated dashboard application.
    -   *Why*: Required for scaling and managing a complex feature set (10+ modules) without losing context.
-   **Decision 2: Relational Data Mapping (Firestore)**
    -   *Approach*: Using Firebase Firestore with hardened, role-based access control (RBAC).
    -   *Why*: Ensures secure multi-user access (Admin vs School Coordinator vs Volunteer) and data integrity across related entities (e.g., School -> Team -> Members -> Tasks).

### 4. Technical Architecture & Data Strategy

```text
┌─────────────────────────────────────────────────────────────┐
│                       Client Frontend                       │
│ (React + Vite + Tailwind + shadcn/ui + Recharts + QRCode)   │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌───────────────────────────┐  ┌──────────────────────────────┐
│       Firebase Auth       │  │      Firestore Database      │
│ (Multi-role RBAC Enforce) │  │ (Security Rules Enforced)    │
└───────────────────────────┘  └──────────────┬───────────────┘
                                              │
      ┌───────────────────────────────────────┴──────────────────────┐
      │ Entities: Schools, Teams, Volunteers, Tasks, Events, Certs   │
      └──────────────────────────────────────────────────────────────┘
```

-   **Data Model & State**:
    -   *Entities*: Schools (id, name, campus), Teams (id, schoolId, leaderId), Volunteers (id, profile, role), Tasks (id, status, assigneeId), Events, Certificates.
    -   *State Management*: React context/hooks for auth, and direct Firestore hooks (`onSnapshot`) for real-time dashboard updates.
-   **Key Sequences**: Admin actions (Create Task) -> Firestore Write -> Server-side Security Rule Validation -> Real-time Notification -> UI Update.
