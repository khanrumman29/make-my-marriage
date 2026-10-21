# Make My Marriage — Database Design & Backend Specification

## 1. Purpose

This document defines the database architecture for **Make My Marriage**, a private wedding-planning web application for one couple and their invited family members. Use it alongside `PRD.md` and `design.md`.

## 2. Technology Stack

- Frontend: existing React + Tailwind CSS application.
- Backend: Node.js + Express REST API.
- Database: MongoDB Atlas (or local MongoDB during development).
- ODM: Mongoose.
- Authentication: server-side authentication using securely hashed passwords and HTTP-only cookie sessions, or short-lived access tokens with secure refresh and revocation.
- Validation: validate every request body, path parameter, and query on the server.
- File storage: use dedicated object storage for uploaded files; store only URLs/keys and metadata in MongoDB.
- Secrets: `.env` locally, `.env.example` with placeholders, secrets configured in deployment.

**Security rule:** React must never connect directly to MongoDB. All database access goes through Express. Never expose the MongoDB URI, session secret, signing secret, or privileged credentials to browser code.

## 3. Architecture

```text
React + Tailwind (browser)
          |
          | HTTPS / JSON API
          v
Node.js + Express
  - Authentication middleware
  - Input validation
  - Authorization checks
  - Business rules
  - Mongoose models
          |
          v
MongoDB Atlas
```

The backend is the security boundary. Hiding a button in React is not authorization: every protected endpoint must verify the authenticated user, wedding membership, and role.

## 4. Core Data Model

Use separate collections for users, weddings, memberships, expenses, functions, tasks, invitations, and messages. Use Mongoose schemas with timestamps and appropriate indexes.

Relationships:
- A `User` can belong to one or more `Weddings`.
- A `Wedding` is the private planning workspace.
- `WeddingMember` connects a user to a wedding and defines their role.
- A wedding has many `Expenses`, `Functions`, `Tasks`, `Invitations`, and `Messages`.
- A function can have tasks and optional expenses linked to it.
- A published invitation is public only through a dedicated safe endpoint.

Do not embed unlimited expenses, tasks, messages, or activity records in the Wedding document. Keep growing collections separate for pagination and to avoid oversized documents.

## 5. Collections and Fields

### 5.1 `users`

Purpose: account identity and login.

- `_id`: ObjectId
- `name`: required trimmed string
- `email`: required lowercase normalized string, unique
- `passwordHash`: required if password authentication is used
- `avatarUrl`: optional string
- `isEmailVerified`: boolean, default false
- `status`: `active | disabled`, default `active`
- `lastLoginAt`: optional Date
- `createdAt`, `updatedAt`: Mongoose timestamps

Rules:
- Never store plaintext passwords.
- Exclude `passwordHash` from normal query/API responses.
- Normalize emails before saving and querying; create a unique index.
- Rate-limit authentication endpoints and use generic login/reset messages.
- If password reset or email verification is added, store hashed, expiring, single-use tokens, never raw reset tokens.

### 5.2 `weddings`

Purpose: wedding workspace and shared configuration.

- `_id`: ObjectId
- `name`: required string, e.g. “Ayesha & Rumman”
- `ownerId`: required ObjectId ref `User`
- `weddingDate`: optional Date
- `timezone`: valid timezone identifier
- `currency`: string, default `INR`
- `budgetPaise`: nonnegative integer, default `0`
- `partnerNames`: optional array of strings
- `venueSummary`: optional string
- `settings`: object for workspace preferences
- `createdAt`, `updatedAt`: timestamps

Rules:
- For INR, store money as integer paise consistently: ₹500.00 = `50000` paise. Name fields explicitly (`amountPaise`, `budgetPaise`) and format as rupees in the UI.
- Validate date, timezone, currency, and nonnegative budget.
- Verify membership for every workspace API request; `ownerId` alone is not enough.

### 5.3 `weddingMembers`

Purpose: connect users to a wedding and assign a role.

- `_id`: ObjectId
- `weddingId`: required ObjectId ref `Wedding`
- `userId`: required ObjectId ref `User`
- `role`: `owner | admin | member | viewer`
- `status`: `active | invited | removed`, default `active`
- `invitedBy`: optional ObjectId ref `User`
- `invitedAt`, `joinedAt`: optional Dates
- `createdAt`, `updatedAt`: timestamps

Indexes:
- Unique compound index `{ weddingId: 1, userId: 1 }`
- `{ userId: 1, status: 1 }`
- `{ weddingId: 1, status: 1 }`

Rules:
- Only one membership record per user per wedding.
- Do not allow the final active owner to remove or downgrade themselves.
- Owner transfer must be explicit and atomic.
- Only authorized owners/admins can manage membership.
- Pending email invitations should use expiring, single-use invite tokens. An email string alone does not establish membership.

### 5.4 `expenses`

Purpose: wedding expenses and payment state.

- `_id`: ObjectId
- `weddingId`: required ObjectId ref `Wedding`
- `title`: required trimmed string with max length
- `category`: `venue | catering | clothing | decoration | photography | makeup | transport | invitations | gifts | other`
- `amountPaise`: required nonnegative integer
- `paidPaise`: nonnegative integer, default `0`
- `currency`: normally inherited from wedding currency
- `paymentStatus`: `unpaid | partially_paid | paid`, derived on server
- `dueDate`: optional Date
- `paidAt`: optional Date
- `paidByUserId`: optional ObjectId ref `User`
- `vendorName`: optional string
- `functionId`: optional ObjectId ref `Function`
- `notes`: optional string
- `createdBy`: required ObjectId ref `User`
- `updatedBy`: optional ObjectId ref `User`
- `createdAt`, `updatedAt`: timestamps

Indexes:
- `{ weddingId: 1, createdAt: -1 }`
- `{ weddingId: 1, paymentStatus: 1 }`
- `{ weddingId: 1, category: 1 }`
- Optional `{ weddingId: 1, dueDate: 1 }`

Rules:
- `amountPaise` and `paidPaise` must be nonnegative integers.
- `paidPaise` must not exceed `amountPaise`.
- Derive status on the server: zero paid → `unpaid`; paid amount equals the positive total → `paid`; otherwise → `partially_paid`.
- Define a consistent rule for zero-value expenses.
- Do not trust client-provided status if it conflicts with amounts.
- Verify any linked function belongs to the same wedding.
- Calculate dashboard totals from authorized database records, not client-submitted data.

### 5.5 `functions`

Purpose: events such as Mehndi, Haldi, and the wedding ceremony.

- `_id`: ObjectId
- `weddingId`: required ObjectId ref `Wedding`
- `name`: required string
- `description`: optional string
- `dateTime`, `endDateTime`: optional Dates
- `timezone`: optional valid timezone; otherwise use wedding timezone
- `venueName`, `venueAddress`: optional strings
- `budgetPaise`: optional nonnegative integer
- `status`: `planning | confirmed | completed | cancelled`, default `planning`
- `createdBy`: required ObjectId ref `User`
- `createdAt`, `updatedAt`: timestamps

Indexes:
- `{ weddingId: 1, dateTime: 1 }`
- `{ weddingId: 1, status: 1 }`

Rules:
- `endDateTime` cannot precede `dateTime`.
- Store dates as UTC Date values and preserve a timezone identifier for display.
- Any linked task/expense must belong to the same wedding.

### 5.6 `tasks`

Purpose: planning checklist items, optionally tied to a function.

- `_id`: ObjectId
- `weddingId`: required ObjectId ref `Wedding`
- `functionId`: optional ObjectId ref `Function`
- `title`: required string
- `description`: optional string
- `status`: `todo | in_progress | done`, default `todo`
- `priority`: `low | medium | high`, default `medium`
- `dueDate`: optional Date
- `assignedToUserId`: optional ObjectId ref `User`
- `createdBy`: required ObjectId ref `User`
- `completedAt`: optional Date
- `createdAt`, `updatedAt`: timestamps

Indexes:
- `{ weddingId: 1, status: 1, dueDate: 1 }`
- `{ weddingId: 1, functionId: 1 }`
- `{ weddingId: 1, assignedToUserId: 1, status: 1 }`

Rules:
- Linked functions and assigned users must belong to the same wedding.
- Maintain `completedAt` consistently with status.
- Enforce role permissions for create, update, assignment, and deletion.

### 5.7 `invitations`

Purpose: digital invitation editor and publishing.

- `_id`: ObjectId
- `weddingId`: required ObjectId ref `Wedding`
- `title`: required string
- `slug`: required unique public identifier
- `templateKey`: required string; initially support one template
- `content`: validated object containing names, greeting, event schedule, venue text, and any intentionally public contact details
- `coverImageUrl`: optional string
- `status`: `draft | published | archived`, default `draft`
- `publishedAt`: optional Date
- `createdBy`: required ObjectId ref `User`
- `updatedBy`: optional ObjectId ref `User`
- `createdAt`, `updatedAt`: timestamps

Indexes:
- Unique `{ slug: 1 }`
- `{ weddingId: 1, status: 1 }`

Rules:
- Validate and sanitize all invitation content on the server.
- Public access only for published invitations through `GET /api/public/invitations/:slug`.
- Return only safe invitation fields. Never expose the whole Wedding document, member list, expenses, messages, account details, or internal records.
- Only owners/admins can edit/publish by default.
- Validate slug format and uniqueness.
- Do not publish private venue/contact information unless the owner intentionally includes it.

### 5.8 `messages`

Purpose: basic family group chat.

- `_id`: ObjectId
- `weddingId`: required ObjectId ref `Wedding`
- `senderId`: required ObjectId ref `User`
- `body`: required trimmed string, max length e.g. 3000 characters
- `editedAt`: optional Date
- `deletedAt`: optional Date for soft deletion
- `createdAt`, `updatedAt`: timestamps

Index:
- `{ weddingId: 1, createdAt: -1 }`

Rules:
- Only active wedding members can read/send messages.
- Use pagination; never fetch the entire conversation at once.
- Do not allow arbitrary HTML in messages.
- If real-time chat is added later, enforce authorization at the server/socket layer too.

### 5.9 Optional `activityLogs`

Use only if the MVP includes a recent activity feed.

- `_id`: ObjectId
- `weddingId`: required ObjectId ref `Wedding`
- `actorId`: required ObjectId ref `User`
- `action`: controlled values such as `expense.created`, `task.completed`, `function.updated`, `member.invited`
- `entityType`: string
- `entityId`: optional ObjectId
- `summary`: short safe description
- `createdAt`: timestamp

Index: `{ weddingId: 1, createdAt: -1 }`

Do not log passwords, tokens, private message bodies, or unnecessary sensitive data. If not needed for MVP, defer it.

## 6. Role-Based Authorization

Enforce roles in backend middleware and route handlers, not just in the UI.

| Action | Owner | Admin | Member | Viewer |
|---|---|---|---|---|
| View private wedding data | Yes | Yes | Yes | Yes |
| Edit wedding details/budget | Yes | Yes, if enabled | No | No |
| Create/edit expenses | Yes | Yes | Yes, if enabled | No |
| Delete expenses | Yes | Yes | No by default | No |
| Manage functions/tasks | Yes | Yes | Yes, if enabled | No |
| Publish/edit invitation | Yes | Yes | No by default | No |
| Invite/remove members | Yes | Yes, with safeguards | No | No |
| Read/send family messages | Yes | Yes | Yes | Read-only or disabled per product decision |
| Transfer ownership | Yes, explicit workflow | No | No | No |

If a permission is unclear, use the least-privileged behavior.

## 7. Authentication and Session Security

- Hash passwords with Argon2id or bcrypt using a secure cost factor.
- Prefer secure HTTP-only `SameSite` cookies for browser sessions when deployment allows; use `Secure` in production and CSRF protection where needed.
- If using access tokens, keep them short-lived and implement refresh-token rotation/revocation. Avoid long-lived tokens in local storage.
- Rate-limit login, registration, password reset, and invitation acceptance.
- Validate credentials on the server; use generic password-reset responses.
- Implement logout/session invalidation.
- Prevent NoSQL injection: never pass raw client objects directly into MongoDB queries; whitelist fields and validate ObjectIds.
- Use HTTPS in production and restrict CORS to the known frontend origin.
- Never log passwords, tokens, cookies, or secrets.

## 8. API Routes

Use a versioned REST API under `/api`. Names can be adjusted to match existing conventions, but preserve authorization and functionality.

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Wedding workspace
- `GET /api/weddings`
- `POST /api/weddings`
- `GET /api/weddings/:weddingId`
- `PATCH /api/weddings/:weddingId`

### Members
- `GET /api/weddings/:weddingId/members`
- `POST /api/weddings/:weddingId/invitations-to-join`
- `PATCH /api/weddings/:weddingId/members/:memberId`
- `DELETE /api/weddings/:weddingId/members/:memberId`

Member invites must use expiring, single-use tokens and secure acceptance if implemented.

### Expenses
- `GET /api/weddings/:weddingId/expenses`
- `POST /api/weddings/:weddingId/expenses`
- `GET /api/weddings/:weddingId/expenses/:expenseId`
- `PATCH /api/weddings/:weddingId/expenses/:expenseId`
- `DELETE /api/weddings/:weddingId/expenses/:expenseId`

Support validated pagination, search, category, status, and date filters.

### Functions
- `GET /api/weddings/:weddingId/functions`
- `POST /api/weddings/:weddingId/functions`
- `GET /api/weddings/:weddingId/functions/:functionId`
- `PATCH /api/weddings/:weddingId/functions/:functionId`
- `DELETE /api/weddings/:weddingId/functions/:functionId`

### Tasks
- `GET /api/weddings/:weddingId/tasks`
- `POST /api/weddings/:weddingId/tasks`
- `PATCH /api/weddings/:weddingId/tasks/:taskId`
- `DELETE /api/weddings/:weddingId/tasks/:taskId`

### Invitations
- `GET /api/weddings/:weddingId/invitations`
- `POST /api/weddings/:weddingId/invitations`
- `PATCH /api/weddings/:weddingId/invitations/:invitationId`
- `POST /api/weddings/:weddingId/invitations/:invitationId/publish`
- `POST /api/weddings/:weddingId/invitations/:invitationId/unpublish`
- `GET /api/public/invitations/:slug`

### Messages
- `GET /api/weddings/:weddingId/messages?cursor=...`
- `POST /api/weddings/:weddingId/messages`

### Dashboard
- `GET /api/weddings/:weddingId/dashboard`

Return calculated totals, upcoming functions, pending tasks, recent expenses, and authorized recent activity. Scope every result to the wedding and authenticated user.

## 9. Response and Error Format

Success response example:

```json
{
  "data": {},
  "meta": {}
}
```

Error response example:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check the highlighted fields."
  }
}
```

Use appropriate status codes: `400` invalid request, `401` unauthenticated, `403` forbidden, `404` not found, `409` conflict, and `500` unexpected server error. Never return stack traces, raw database errors, secrets, or internal implementation details. Use a centralized error handler.

## 10. Dashboard Calculations

Calculate totals from database records instead of storing duplicate values that may become inconsistent.

- `totalBudgetPaise`: wedding's configured budget.
- `totalExpensePaise`: sum of expense amounts (committed expense).
- `totalPaidPaise`: sum of `paidPaise`.
- `remainingBudgetPaise`: `totalBudgetPaise - totalExpensePaise`; may be negative if over budget.
- `paymentsDuePaise`: sum of `amountPaise - paidPaise` for eligible expenses.
- `upcomingFunctions`: next non-cancelled/non-completed functions ordered by date.
- `pendingTasks`: incomplete tasks ordered by priority and due date.
- `recentExpenses`: newest expenses, with a sensible limit.
- `recentActivity`: only safe activity visible to active wedding members.

Use MongoDB aggregation or efficient indexed queries. Never calculate totals from client-submitted data.

## 11. Validation, Consistency, Indexing

- Use Mongoose schemas with required fields, enums, trimming, max lengths, and validation.
- Validate critical multi-document business rules in service logic as well.
- Validate every ObjectId and whitelist update, filter, and sort fields.
- Paginate list endpoints and messages.
- Add indexes based on real query patterns; do not index every field.
- Use transactions for multi-document changes that must succeed together, such as ownership transfer, where supported.
- Use clear deletion and recovery rules.
- Configure backups and test restoration for production data.

## 12. Environment Variables

Create `.env.example` with placeholders only:

```dotenv
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb_connection_string_here
CLIENT_ORIGIN=http://localhost:5173
SESSION_SECRET=replace_with_a_long_random_secret
```

Adapt variables to the selected authentication approach. Keep real secrets in `.env` or deployment secret settings; add `.env` to `.gitignore`.

Never put `MONGODB_URI`, `SESSION_SECRET`, or other secrets in `VITE_` variables because frontend-exposed variables are public.

## 13. Suggested Backend Structure

Adapt to the existing repository; do not duplicate an existing client folder or replace working configuration unnecessarily.

```text
project-root/
├── PRD.md
├── design.md
├── database.md
├── src/                         # existing React app, if at root
│   └── ...
└── server/
    ├── src/
    │   ├── config/db.js
    │   ├── models/
    │   │   ├── User.js
    │   │   ├── Wedding.js
    │   │   ├── WeddingMember.js
    │   │   ├── Expense.js
    │   │   ├── Function.js
    │   │   ├── Task.js
    │   │   ├── Invitation.js
    │   │   ├── Message.js
    │   │   └── ActivityLog.js
    │   ├── middleware/
    │   │   ├── authenticate.js
    │   │   ├── authorizeWeddingRole.js
    │   │   ├── validateRequest.js
    │   │   └── errorHandler.js
    │   ├── routes/
    │   ├── controllers/
    │   ├── services/
    │   ├── validators/
    │   ├── app.js
    │   └── server.js
    ├── package.json
    └── .env.example
```

## 14. Implementation Order

### Phase 1 — Backend foundation
1. Inspect the current repository and existing PRD/design.
2. Confirm Node.js version and project structure.
3. Create Express backend and connect to MongoDB using `MONGODB_URI`.
4. Add environment validation, CORS, JSON parsing, safe request logging, and centralized error handling.
5. Create User, Wedding, and WeddingMember models and indexes.
6. Implement secure register, login, logout, and current-user endpoints.
7. Add authentication and role authorization middleware.

### Phase 2 — Core planning data
1. Create Expense, Function, and Task models.
2. Add schema and service-level validation.
3. Implement authorized CRUD endpoints.
4. Add filtering, pagination, and indexes.
5. Test that one wedding's members cannot access another wedding's data.

### Phase 3 — Dashboard and collaboration
1. Implement dashboard calculations and endpoint.
2. Add Invitation and Message models/endpoints.
3. Implement safe public access for published invitations.
4. Add member invitations and role management only with secure invite acceptance.
5. Add activity logs only if needed for the agreed MVP.

### Phase 4 — Frontend integration
1. Replace sample dashboard data with API responses.
2. Add loading, empty, error, and success states.
3. Connect forms to validated endpoints.
4. Format integer paise correctly as rupees for INR.
5. Test desktop, tablet, and mobile UI against `design.md`.

## 15. Required Security Tests

- [ ] Unauthenticated users cannot access private wedding endpoints.
- [ ] Changing `weddingId` in a URL cannot expose another wedding's data.
- [ ] A member cannot escalate their own role.
- [ ] Viewers cannot perform write operations.
- [ ] Public invitation endpoints expose only published invitation content.
- [ ] Public invitation endpoints never expose members, messages, expenses, or account data.
- [ ] Password hashes and secrets are never returned to the frontend.
- [ ] Invalid ObjectIds and malformed input return safe errors.
- [ ] Paid amounts cannot exceed expense totals.
- [ ] Linked functions, tasks, expenses, and assignees belong to the same wedding.
- [ ] Pagination limits prevent unbounded requests.
- [ ] Authentication endpoints are rate-limited.
- [ ] No database URI or secret is committed to source control.

## 16. Instructions for Antigravity

Read `PRD.md`, `design.md`, and this `database.md` before implementation.

1. Inspect the existing repository and report the current structure before modifying files.
2. Preserve the existing React + Tailwind UI and the five primary navigation items: Dashboard, Expenses, Functions, Invitations, Family & Settings.
3. Use MongoDB with Mongoose through Node.js/Express. Do not use Supabase.
4. Implement in small, testable phases. Do not create unconnected placeholder files.
5. Keep authentication, validation, business rules, database queries, and authorization on the server.
6. Apply wedding scope and role rules to every protected endpoint.
7. Do not expose credentials to the browser or commit `.env`.
8. Write and run tests for critical authorization and business rules.
9. Isolate mock data and replace it with API data during integration.
10. If a design detail conflicts with the PRD, preserve the PRD scope and ask for clarification rather than inventing features.
11. Document setup, environment variables, MongoDB setup, index creation, and commands to run the client and server.
12. Do not claim a feature is complete unless its model, endpoint, authorization, validation, and relevant UI integration work.

**Definition of done:** The app connects to MongoDB through Express, users can securely sign in, each wedding's data is isolated by authorization, core planning data can be managed according to roles, and the dashboard shows server-calculated data.
