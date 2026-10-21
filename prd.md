# Make My Marriage â€” Product Requirements Document (PRD)

**Product Name:** Make My Marriage  
**Product Type:** Personal Wedding Planning Web Application  
**Document Version:** 1.0  
**Project Status:** Initial Development  
**Primary User:** Wedding owner  
**Technology Stack:** React, Tailwind CSS, Supabase  
**Design Direction:** Premium, elegant, minimal â€” Ivory, Forest Green and Muted Gold

---

# 1. Product Overview

## 1.1 Vision

Make My Marriage is a personal wedding planning application designed to manage all wedding-related information in one organized place.

The application will help the wedding owner track expenses, organize wedding functions, create digital invitations, coordinate with family members and manage all wedding preparations through a single dashboard.

The first version is specifically intended for one personal wedding. It is not a public multi-customer SaaS platform.

The application must be simple enough for non-technical family members to use while maintaining a premium, polished interface.

## 1.2 Problem Statement

Wedding preparation involves many different activities, including:
- Tracking expenses and payments.
- Managing budgets across multiple functions.
- Remembering important tasks and deadlines.
- Sharing invitations with guests.
- Coordinating responsibilities among family members.
- Keeping important wedding information organized.

These activities are often spread across spreadsheets, messaging applications, notes and paper documents.

Make My Marriage will centralize these activities into one private wedding workspace.

## 1.3 Product Goals

1. Track the complete wedding budget and expenses.
2. Organize all wedding functions and related tasks.
3. Create and share digital wedding invitations.
4. Coordinate wedding preparations with family members.
5. Provide a secure, centralized wedding dashboard.
6. Deliver a responsive experience on mobile, tablet and desktop.
7. Keep the first version lightweight, maintainable and easy to extend.

## 1.4 Non-Goals

The first version will not include:
- A public wedding marketplace.
- Vendor discovery or booking.
- Online payment processing.
- AI wedding planning.
- Video calling.
- Live location tracking.
- Native Android or iOS applications.
- Multiple wedding workspaces.
- Advanced analytics.
- Automated bulk messaging through the WhatsApp Business API.

---

# 2. Technology Stack

Use the following technology stack unless the existing project requires a compatible adjustment.

| Layer | Technology |
|---|---|
| Frontend | React |
| Styling | Tailwind CSS |
| Routing | React Router |
| Icons | Lucide React |
| Backend | Supabase |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Security | PostgreSQL Row Level Security (RLS) |
| Language | JavaScript, unless TypeScript is already configured |
| Build Tool | Preserve the existing build tool, such as Vite |
| Version Control | Git, if configured |
| Deployment | A suitable static frontend hosting provider and Supabase |

## Technical Instructions

- Inspect the existing repository before modifying files.
- Reuse the current React, Tailwind CSS and routing setup.
- Do not recreate or replace a working project unnecessarily.
- Avoid installing duplicate dependencies.
- Do not migrate to another framework without a compelling technical reason.
- Keep Supabase credentials in environment variables.
- Never expose a Supabase service-role key in browser code.

---

# 3. Application Structure

The application must have exactly five primary navigation sections.

1. Dashboard
2. Expenses
3. Functions
4. Invitations
5. Family & Settings

Authentication and initial wedding setup are separate onboarding screens and must not appear as additional primary navigation items.

## 3.1 Shared Layout

Implement:
- A desktop sidebar.
- A mobile-friendly navigation menu.
- A top bar with the current page title.
- A wedding profile or workspace indicator.
- A profile menu with account actions.
- Consistent content spacing.
- Reusable page headers and action buttons.
- Responsive cards, tables and forms.
- Loading, error and empty states.

The navigation must highlight the active section and preserve a consistent layout across all authenticated pages.

---

# 4. Design System

## 4.1 Brand Identity

The application must feel like a premium wedding product rather than a generic corporate dashboard.

Use an elegant, warm and understated design.

### Color Palette

| Token | Color | Purpose |
|---|---|---|
| Primary | `#244C3A` | Primary buttons, active navigation and headings |
| Background | `#FAF8F2` | Main page background |
| Surface | `#FFFFFF` | Cards, dialogs and form surfaces |
| Gold | `#B89A59` | Small highlights and decorative details |
| Text Primary | `#292D29` | Main content |
| Text Secondary | `#73766F` | Supporting text |
| Border | `#E8E4DA` | Dividers, inputs and card borders |
| Success | `#3F7652` | Completed and paid statuses |
| Warning | `#B58236` | Upcoming or partially paid statuses |
| Error | `#B54C48` | Errors and destructive actions |

Define these colors as reusable design tokens.

## 4.2 Typography

- Use an elegant serif font for selected page headings and wedding-related titles.
- Use a highly readable sans-serif font for body text, inputs, tables and controls.
- Maintain clear text hierarchy.
- Avoid excessively large headings.
- Use consistent font weights and line heights.

## 4.3 Components

Create reusable components for:
- Buttons.
- Form inputs.
- Select fields.
- Date pickers.
- Status badges.
- Summary cards.
- Data tables.
- Dialogs and confirmation modals.
- Dropdown menus.
- Toast notifications.
- Empty states.
- Loading skeletons.
- Pagination, if required.
- Budget progress indicators.
- Page headers.

## 4.4 Animation

Use subtle, purposeful animations for:
- Page transitions.
- Dropdowns and dialogs.
- Hover states.
- Progress indicators.
- Small card interactions.

Avoid excessive animations, distracting gradients, heavy visual effects and unnecessary decorative elements.

Respect reduced-motion preferences.

## 4.5 Responsive Design

The application must work on:
- Desktop.
- Laptop.
- Tablet.
- Mobile phones.

On mobile:
- Convert wide tables into responsive layouts or compact card views.
- Prevent horizontal overflow.
- Use appropriately sized buttons.
- Keep forms readable.
- Ensure navigation remains accessible.
- Make digital invitations suitable for mobile sharing.

---

# 5. Authentication and Onboarding

## 5.1 Signup

Allow the owner to create an account using:
- Name.
- Email address.
- Password.

Use Supabase Auth for account creation.

Validate the form and display clear success and error messages.

## 5.2 Login

Include:
- Email.
- Password.
- Show/hide password.
- Login button.
- Link to password recovery.
- Link to signup.

## 5.3 Password Recovery

Use Supabase's password recovery flow.

Handle invalid links, expired recovery sessions and successful password updates.

## 5.4 Authentication State

- Restore valid sessions after page refresh.
- Show a loading state while checking the session.
- Protect private application routes.
- Redirect unauthenticated users to login.
- Provide logout functionality.
- Clear or refresh local application state appropriately after logout.

## 5.5 Wedding Setup

After the first successful signup, show a simple wedding setup screen.

Fields:
- Wedding name.
- Bride's name.
- Groom's name.
- Wedding date.
- Estimated wedding budget.
- Currency, defaulting to INR (â‚¹).

Optional fields:
- Wedding description.
- Main venue.

The setup process should be short and beginner-friendly.

After successful setup:
1. Create the owner's profile.
2. Create the personal wedding workspace.
3. Register the owner as the workspace owner.
4. Redirect to the dashboard.

Prevent accidental duplicate workspace creation during retries.

If setup is incomplete, direct the user back to the setup screen rather than displaying an empty dashboard.

---

# 6. Module One: Dashboard

## 6.1 Purpose

The dashboard provides a complete overview of wedding preparation.

## 6.2 Summary Cards

Display:
- Total Wedding Budget.
- Total Expenses.
- Budget Remaining.
- Outstanding Payments.

Additional summary:
- Total Functions.
- Upcoming Functions.
- Pending Tasks.
- Completed Tasks.

## 6.3 Calculations

Use actual database records.

**Total Expenses**

Sum all expense amounts recorded for the wedding.

**Budget Remaining**

Total Wedding Budget minus Total Expenses.

**Outstanding Payments**

Sum the unpaid portion of every expense.

For each expense:

`Outstanding = Expense Amount - Amount Paid`

**Task Completion**

Display completed tasks compared with the total number of tasks.

Exclude cancelled tasks from the completion denominator if a cancelled status is introduced.

Do not store derived dashboard totals as independent values when they can be reliably calculated from source records.

## 6.4 Upcoming Functions

Display upcoming functions with:
- Function name.
- Date and time.
- Venue.
- Function status.

Allow the user to open the function details.

## 6.5 Pending Tasks

Display:
- Task title.
- Assigned member.
- Deadline.
- Current status.

Allow authorized users to update task status.

## 6.6 Recent Activity

Show a simple activity feed for relevant events, such as:
- Expense created or updated.
- Function added.
- Task completed.
- Invitation updated.
- Family member invited.

Do not introduce a complex notification system in the initial release.

## 6.7 Quick Actions

Provide quick actions for:
- Add Expense.
- Add Function.
- Create Invitation.
- Add Task.

## 6.8 Empty State

When the workspace contains no records, show a welcoming message and helpful next steps.

Do not display fabricated financial figures.

---

# 7. Module Two: Expenses

## 7.1 Purpose

Provide a reliable way to manage wedding expenses and payment obligations.

## 7.2 Expense Fields

Each expense should support:
- Expense ID.
- Wedding ID.
- Expense title.
- Category.
- Amount.
- Amount Paid.
- Expense date.
- Function association, optional.
- Vendor or recipient name, optional.
- Paid By member, optional.
- Description, optional.
- Payment status.
- Created By.
- Created At.
- Updated At.

Use an exact numeric database type for money rather than floating-point storage.

Store the currency consistently as INR for the initial version.

## 7.3 Expense Categories

Provide default categories:
- Venue.
- Catering.
- Decoration.
- Clothing.
- Jewellery.
- Photography and Videography.
- Makeup.
- Transportation.
- Gifts.
- Invitations.
- Accommodation.
- Miscellaneous.

Allow categories to be selected from a dropdown.

Do not build a complex category management system in the first release.

## 7.4 Expense Operations

Implement:
- Add expense.
- View expense details.
- Edit expense.
- Delete expense with confirmation.
- Search by expense title or vendor.
- Filter by category.
- Filter by function.
- Filter by payment status.
- Filter by date range.
- Sort by date, amount and title.

Use pagination if the number of records becomes large.

## 7.5 Payment Status

Support:
- Pending.
- Partially Paid.
- Paid.

Calculate the status consistently from the amount and amount paid, or validate the selected status against those amounts.

Rules:
- Amount Paid = 0: Pending.
- Amount Paid greater than 0 but less than Amount: Partially Paid.
- Amount Paid equal to Amount: Paid.

Prevent negative amounts and prevent Amount Paid from exceeding the total amount unless a deliberate refund or adjustment feature is introduced later.

## 7.6 Expense Summary

Display:
- Total expense amount.
- Total amount paid.
- Total amount outstanding.
- Expense count.

Update the dashboard after a successful database operation.

## 7.7 Validation

- Expense title is required.
- Amount must be greater than zero.
- Amount Paid cannot be negative.
- Amount Paid cannot exceed the amount.
- Expense date must be valid.
- Associated functions must belong to the current wedding.
- Invalid submissions must show clear errors.

## 7.8 Expense Deletion

Before deleting an expense:
- Show a confirmation dialog.
- Clearly identify the expense.
- Explain that the operation removes the record.
- Update the interface only after the operation succeeds.

Handle related records and database constraints appropriately.

---

# 8. Module Three: Functions

## 8.1 Purpose

Organize wedding ceremonies, celebrations and related preparation tasks.

## 8.2 Function Fields

Each function should support:
- Function ID.
- Wedding ID.
- Function name.
- Date.
- Start time.
- Optional end time.
- Venue.
- Description.
- Planned budget.
- Status.
- Created At.
- Updated At.

## 8.3 Example Functions

Users may create functions such as:
- Engagement.
- Mehndi.
- Haldi.
- Nikah.
- Wedding Ceremony.
- Reception.
- Walima.

These are examples, not mandatory events.

## 8.4 Function Operations

Implement:
- Add function.
- View function details.
- Edit function.
- Delete function with confirmation.
- View upcoming functions.
- View completed functions.
- Sort by date.
- Search by name.
- Display function-specific tasks.
- Display expenses associated with the function.

## 8.5 Function Budget

Each function may have its own planned budget.

Display:
- Planned Budget.
- Actual Expenses.
- Remaining Function Budget.

Calculate:

`Function Budget Remaining = Planned Budget - Linked Expense Total`

Use only expenses linked to that function.

An expense without a function association should contribute to the overall wedding expenses but not to any individual function's totals.

A negative remaining budget should be displayed clearly as an over-budget condition.

## 8.6 Function Status

Support:
- Upcoming.
- In Progress.
- Completed.
- Cancelled, if needed.

Do not infer completion solely from the passage of the function date. Let the user manage the status explicitly.

## 8.7 Function Details Page

Include:
- Function information.
- Planned budget.
- Linked expenses.
- Related tasks.
- Invitation details, if available.
- Edit action.

---

# 9. Tasks and To-Do Management

Tasks should be available within the Functions module and on the Dashboard.

## 9.1 Task Fields

Each task should include:
- Task ID.
- Wedding ID.
- Optional Function ID.
- Task title.
- Description.
- Assigned Member.
- Due Date.
- Status.
- Created By.
- Created At.
- Updated At.

## 9.2 Task Statuses

Support:
- To Do.
- In Progress.
- Completed.

## 9.3 Task Features

Implement:
- Create task.
- Edit task.
- Delete task.
- Assign task to an authorized family member.
- Change task status.
- Set or update deadline.
- Filter by status.
- Filter by assigned member.
- Show overdue tasks.
- Display task completion progress.

Validate that assigned users belong to the current wedding workspace.

Use clear status indicators without excessive colors.

---

# 10. Module Four: Digital Invitations

## 10.1 Purpose

Allow the wedding owner to create a beautiful digital invitation and share it with guests.

## 10.2 Initial Scope

Implement one polished, responsive invitation template.

Do not create a full drag-and-drop invitation editor in the first version.

## 10.3 Invitation Fields

Support:
- Invitation title.
- Bride's name.
- Groom's name.
- Function association, optional.
- Event date.
- Event time.
- Venue name.
- Venue address, optional.
- Invitation message.
- Host names, optional.
- Public sharing identifier.
- Publication status.
- Created At.
- Updated At.

Allow invitation details to be edited after creation.

## 10.4 Invitation Design

The template should use:
- Ivory background.
- Muted gold decorative details.
- Elegant typography.
- Subtle floral or ornamental elements.
- Clean layout.
- Mobile-friendly spacing.

Use an appropriate date and time format.

Keep the invitation visually distinct from the administrative dashboard.

## 10.5 Invitation Builder

Implement:
- Create invitation.
- Edit invitation.
- Preview invitation.
- Save invitation.
- Publish or unpublish invitation.
- Copy invitation link.
- Share using the device's supported sharing options or a WhatsApp share URL.
- Show a helpful message when sharing is unavailable.

The preview should update when invitation fields change.

## 10.6 Public Invitation Page

A published invitation should be accessible through a unique, unguessable public identifier.

Guests should be able to view:
- Names.
- Event information.
- Venue details.
- Invitation message.
- Optional directions link.

The page must be mobile-friendly and must not require guests to create an account.

## 10.7 Invitation Privacy

Public invitation pages must never expose:
- Wedding expenses.
- Family conversations.
- Member information.
- Private task lists.
- Internal workspace IDs or private records.

Unpublished invitations must not be publicly accessible.

Implement public access through a carefully designed database query, server-side mechanism or restricted database view. Do not expose broad private-table permissions to anonymous users.

Do not use sequential database IDs as public invitation tokens.

## 10.8 Invitation Editing

When an invitation is updated, the published page should display the latest saved details.

Unpublishing an invitation should make its public page unavailable.

---

# 11. Module Five: Family & Settings

This section must contain two internal tabs:

1. Family.
2. Settings.

Do not create additional primary navigation items.

## 11.1 Family Members

Allow the owner to:
- View current members.
- Invite a family member.
- Assign an appropriate role.
- View invitation or membership status.
- Change a member's role when authorized.
- Remove a member when authorized.

Use Supabase Auth and an appropriate invitation mechanism.

Do not automatically grant access merely because someone knows a wedding URL.

## 11.2 Roles and Permissions

### Owner
- Full control over the personal wedding workspace.
- Manage wedding settings.
- Manage membership and permissions.
- Access and manage wedding records.
- Transfer ownership only if a secure ownership-transfer feature is deliberately implemented later.

### Admin
- Manage permitted wedding information.
- Manage expenses, functions and tasks.
- Assist with member management if authorized.
- Cannot override the owner's protected privileges.

### Family Member
- View permitted wedding information.
- Add or update expenses according to assigned permissions.
- Manage assigned tasks.
- Participate in family conversations.

### Viewer
- Read only the wedding information they are authorized to see.
- Cannot modify expenses, functions, tasks, settings or membership.
- Access to private information must be explicitly controlled.

Implement authorization in the database, not just in React components.

For the initial personal wedding, the signup user becomes the Owner. Additional roles are available when family members are invited.

## 11.3 Family Conversation

Implement a simple group conversation interface.

Features:
- View recent messages.
- Send a text message.
- Show sender name.
- Show message timestamp.
- Display messages in chronological order.
- Provide a loading indicator.
- Handle message submission errors.
- Support pagination or loading older messages if required.

Use a `messages` database table.

Real-time updates through Supabase Realtime may be added if they can be implemented securely without unnecessary complexity. Otherwise, use a simple refresh or controlled polling strategy.

Do not add file attachments, voice calls, video calls or complex chat features in the initial version.

## 11.4 Wedding Settings

Allow the owner or authorized admin to update:
- Wedding name.
- Bride's name.
- Groom's name.
- Wedding date.
- Estimated budget.
- Main venue.
- Description.
- Currency preference, restricted to supported currencies.

Changes must be saved to the database and reflected across the application.

## 11.5 Profile Settings

Include:
- User name.
- Account email display.
- Password recovery.
- Logout.

Email changes should use Supabase's supported verification process where applicable.

---

# 12. Database Schema

Create version-controlled SQL migrations under the `supabase/migrations/` directory.

Use UUID primary keys where appropriate, foreign keys, timestamps, indexes and constraints.

All private records must be associated with the correct wedding workspace.

## 12.1 profiles

Suggested fields:
- `id`: UUID, references `auth.users`.
- `full_name`: text.
- `created_at`: timestamp.
- `updated_at`: timestamp.

The profile ID should correspond to the authenticated user ID.

## 12.2 weddings

Suggested fields:
- `id`: UUID primary key.
- `owner_id`: UUID referencing the owner.
- `wedding_name`: text.
- `bride_name`: text.
- `groom_name`: text.
- `wedding_date`: date, nullable until provided.
- `budget`: exact numeric type.
- `currency`: text, default INR.
- `venue`: text, optional.
- `description`: text, optional.
- `created_at`: timestamp.
- `updated_at`: timestamp.

## 12.3 wedding_members

Suggested fields:
- `id`: UUID primary key.
- `wedding_id`: UUID.
- `user_id`: UUID.
- `role`: constrained text or enum.
- `membership_status`: constrained text or enum.
- `created_at`: timestamp.

Add appropriate unique constraints to prevent duplicate membership records.

Invitation handling should support pending invitations without prematurely granting workspace access.

## 12.4 expenses

Suggested fields:
- `id`: UUID primary key.
- `wedding_id`: UUID.
- `function_id`: UUID, nullable.
- `title`: text.
- `category`: text.
- `amount`: exact numeric type.
- `amount_paid`: exact numeric type.
- `expense_date`: date.
- `vendor_name`: text, optional.
- `paid_by`: UUID, optional.
- `description`: text, optional.
- `created_by`: UUID.
- `created_at`: timestamp.
- `updated_at`: timestamp.

Add database constraints ensuring:
- Amount is greater than zero.
- Amount Paid is not negative.
- Amount Paid does not exceed Amount.

Derive payment status consistently from payment amounts, or enforce equivalent consistency if status is stored.

## 12.5 functions

Suggested fields:
- `id`: UUID primary key.
- `wedding_id`: UUID.
- `name`: text.
- `event_date`: date.
- `start_time`: time, optional.
- `end_time`: time, optional.
- `venue`: text, optional.
- `description`: text, optional.
- `planned_budget`: exact numeric type.
- `status`: constrained text or enum.
- `created_at`: timestamp.
- `updated_at`: timestamp.

## 12.6 tasks

Suggested fields:
- `id`: UUID primary key.
- `wedding_id`: UUID.
- `function_id`: UUID, nullable.
- `title`: text.
- `description`: text, optional.
- `assigned_to`: UUID, nullable.
- `due_date`: date, nullable.
- `status`: constrained text or enum.
- `created_by`: UUID.
- `created_at`: timestamp.
- `updated_at`: timestamp.

## 12.7 invitations

Suggested fields:
- `id`: UUID primary key.
- `wedding_id`: UUID.
- `function_id`: UUID, nullable.
- `title`: text.
- `bride_name`: text.
- `groom_name`: text.
- `event_date`: date.
- `event_time`: time, nullable.
- `venue_name`: text, optional.
- `venue_address`: text, optional.
- `invitation_message`: text, optional.
- `host_names`: text, optional.
- `public_token`: securely generated unique identifier.
- `is_published`: boolean.
- `created_at`: timestamp.
- `updated_at`: timestamp.

Protect public identifiers and avoid exposing private database records.

## 12.8 messages

Suggested fields:
- `id`: UUID primary key.
- `wedding_id`: UUID.
- `sender_id`: UUID.
- `message_text`: text.
- `created_at`: timestamp.

Validate message length and require membership before allowing access.

## 12.9 Database Relationships

- One wedding has multiple expenses.
- One wedding has multiple functions.
- One function can have multiple expenses.
- One function can have multiple tasks.
- One wedding has multiple tasks.
- One wedding has multiple members.
- One wedding has multiple invitations.
- One wedding has multiple messages.
- One authenticated user may be associated with a profile.
- Tasks may be assigned to authorized wedding members.

Use database constraints and indexes to preserve data integrity.

Where appropriate, use composite foreign keys or equivalent constraints to ensure that linked functions, tasks, members and expenses belong to the same wedding.

---

# 13. Supabase Security Requirements

Security is a core requirement, not an optional enhancement.

## 13.1 Authentication

Use Supabase Auth for:
- Signup.
- Login.
- Logout.
- Password recovery.
- Session management.

## 13.2 Row Level Security

Enable RLS on all tables containing private information.

Create policies for:
- Reading permitted wedding data.
- Creating records within the correct wedding.
- Updating authorized records.
- Deleting records only when permitted.
- Managing membership.
- Accessing family messages.
- Reading published public invitations safely.

## 13.3 Authorization

Every database operation must verify:
- The user is authenticated when required.
- The user belongs to the relevant wedding.
- The user's role permits the operation.
- Related records belong to the same wedding.
- The requested action does not exceed the user's permissions.

Prevent users from changing protected ownership fields or granting themselves higher roles.

Do not trust role values supplied by the browser.

Use carefully designed security-definer functions only when necessary, with a fixed search path and restricted execution permissions.

## 13.4 Secret Management

- Never expose a service-role key in frontend code.
- Never commit `.env.local` to version control.
- Provide `.env.example` with placeholder values.
- Use the public publishable key only for intended client-side use.
- Keep privileged operations on a trusted backend when needed.

## 13.5 Public Invitation Security

Public guests should have access only to the information required to display a published invitation.

Do not grant anonymous access to all records in the invitations table or the wedding table.

## 13.6 Authorization Testing

Test that:
- An unauthenticated user cannot access private records.
- A viewer cannot create or modify expenses.
- A family member cannot change their own role to Owner.
- An unauthorized user cannot manage membership.
- Users cannot access another workspace's data.
- Anonymous users cannot access unpublished invitations.
- A public invitation does not reveal private wedding information.

---

# 14. Application Architecture

Use a clean, maintainable folder structure that matches the existing repository.

Recommended structure:

```text
make-my-marriage/
â”œâ”€â”€ public/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ assets/
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ ui/
â”‚   â”‚   â”œâ”€â”€ forms/
â”‚   â”‚   â”œâ”€â”€ dashboard/
â”‚   â”‚   â”œâ”€â”€ expenses/
â”‚   â”‚   â”œâ”€â”€ functions/
â”‚   â”‚   â””â”€â”€ invitations/
â”‚   â”œâ”€â”€ layouts/
â”‚   â”‚   â”œâ”€â”€ AppLayout.jsx
â”‚   â”‚   â””â”€â”€ AuthLayout.jsx
â”‚   â”œâ”€â”€ pages/
â”‚   â”‚   â”œâ”€â”€ Dashboard.jsx
â”‚   â”‚   â”œâ”€â”€ Expenses.jsx
â”‚   â”‚   â”œâ”€â”€ Functions.jsx
â”‚   â”‚   â”œâ”€â”€ Invitations.jsx
â”‚   â”‚   â”œâ”€â”€ FamilySettings.jsx
â”‚   â”‚   â”œâ”€â”€ Login.jsx
â”‚   â”‚   â”œâ”€â”€ Signup.jsx
â”‚   â”‚   â”œâ”€â”€ ResetPassword.jsx
â”‚   â”‚   â”œâ”€â”€ WeddingSetup.jsx
â”‚   â”‚   â””â”€â”€ PublicInvitation.jsx
â”‚   â”œâ”€â”€ hooks/
â”‚   â”œâ”€â”€ contexts/
â”‚   â”œâ”€â”€ lib/
â”‚   â”‚   â””â”€â”€ supabase.js
â”‚   â”œâ”€â”€ services/
â”‚   â”œâ”€â”€ utils/
â”‚   â”œâ”€â”€ App.jsx
â”‚   â”œâ”€â”€ main.jsx
â”‚   â””â”€â”€ index.css
â”œâ”€â”€ supabase/
â”‚   â””â”€â”€ migrations/
â”œâ”€â”€ .env.example
â”œâ”€â”€ .gitignore
â”œâ”€â”€ PRD.md
â””â”€â”€ README.md
```

This is a recommended structure, not a requirement to recreate every file immediately.

## Architecture Guidelines

- Keep database operations separate from UI components.
- Use reusable hooks for common data operations.
- Avoid duplicating calculation logic.
- Centralize formatting for dates, currency and payment statuses.
- Keep components small and understandable.
- Use React state appropriately.
- Avoid unnecessary state management libraries.
- Use a clear loading and error strategy.
- Preserve working code in the existing project.

---

# 15. Application Routes

Suggested routes:

| Route | Access |
|---|---|
| `/login` | Public |
| `/signup` | Public |
| `/reset-password` | Authentication flow |
| `/setup` | Authenticated owner completing setup |
| `/dashboard` | Authorized workspace member |
| `/expenses` | Authorized workspace member |
| `/functions` | Authorized workspace member |
| `/invitations` | Authorized workspace member |
| `/family-settings` | Authorized workspace member, with role-based controls |
| `/invite/:token` | Public only for published invitations |

Use protected routes and appropriate authorization checks.

A route being hidden from navigation is not a security boundary.

---

# 16. Functional Requirements

The application must satisfy the following core workflows.

## Workflow A: First-Time Setup

1. User signs up.
2. User verifies their email if required by the configured Supabase Auth settings.
3. User logs in.
4. User enters wedding details.
5. Application creates the wedding workspace and owner membership.
6. Dashboard displays the newly created wedding.
7. Empty states guide the user to add their first function or expense.

## Workflow B: Record an Expense

1. User opens Expenses.
2. User clicks Add Expense.
3. User enters expense information.
4. Application validates the fields.
5. Application saves the record to Supabase.
6. Expense list refreshes.
7. Dashboard totals update.
8. The expense remains saved after refreshing the page.

## Workflow C: Create a Function

1. User opens Functions.
2. User creates a function.
3. User enters date, venue and planned budget.
4. Application saves the function.
5. The function appears in the list and Dashboard.
6. User can add tasks and link expenses to the function.

## Workflow D: Create an Invitation

1. User opens Invitations.
2. User creates an invitation.
3. User enters event details.
4. Preview updates.
5. User saves the invitation.
6. User publishes it.
7. Application provides a shareable link.
8. A guest opens the link and sees only public invitation information.

## Workflow E: Family Collaboration

1. Owner invites a family member.
2. The invited person accepts the invitation through the configured authentication flow.
3. The application associates the account with the wedding.
4. The member receives the assigned role.
5. Authorized users can coordinate tasks and send messages.
6. Unauthorized actions are rejected by the database.

## Workflow F: Payment Tracking

1. User records an expense amount.
2. User records the amount paid.
3. Application calculates the outstanding balance.
4. Payment status is updated consistently.
5. Dashboard totals update.
6. Changes persist after a new session.

---

# 17. Error Handling and User Experience

Provide clear handling for:
- Invalid form input.
- Network failures.
- Authentication failures.
- Expired sessions.
- Permission errors.
- Database constraint violations.
- Duplicate submission attempts.
- Empty data sets.
- Failed file or invitation operations, if applicable.

Use:
- Loading indicators.
- Disabled submission buttons while requests are in progress.
- Success and error notifications.
- Confirmation dialogs for destructive actions.
- Helpful empty-state messages.
- Appropriate retry actions.

Do not display raw database errors or sensitive server details to users.

Do not show success messages before the underlying operation succeeds.

---

# 18. Accessibility and Performance

## Accessibility

- Use semantic HTML.
- Provide labels for all form controls.
- Ensure keyboard navigation.
- Provide visible focus states.
- Maintain readable color contrast.
- Use accessible dialog behaviour.
- Do not communicate status through color alone.
- Support reduced motion.

## Performance

- Avoid unnecessary dependencies.
- Keep bundle size reasonable.
- Avoid unnecessary re-renders.
- Use pagination or efficient queries for growing datasets.
- Load only the data required by the current screen.
- Add database indexes for common query patterns.
- Avoid repeated network requests for the same information.

---

# 19. Features Explicitly Deferred

Do not implement these in the initial release:

- Multiple wedding workspaces.
- Guest list and RSVP management.
- Vendor marketplace.
- Online payment gateway.
- AI wedding assistant.
- Advanced analytics.
- Automated bulk WhatsApp messaging.
- Push notifications.
- Native mobile apps.
- Receipt scanning.
- PDF or Excel exports.
- Multiple invitation themes.
- Drag-and-drop invitation designer.
- Video or voice calls.
- Complex calendar integrations.

The architecture may remain extensible, but deferred features must not delay the core application.

---

# 20. Implementation Roadmap

Build the application in small, verifiable phases.

## Phase 0: Repository Inspection

- Inspect the current repository.
- Identify the framework and dependencies.
- Review routing and existing components.
- Check Tailwind CSS configuration.
- Identify existing Supabase integration.
- Propose any necessary file changes.
- Preserve existing working code.

Deliverable: Inspection report and implementation plan.

## Phase 1: Design System and UI

Build:
- Shared application layout.
- Sidebar and mobile navigation.
- Dashboard.
- Expenses page.
- Functions page.
- Invitations page.
- Family & Settings page.
- Login and signup screens.
- Wedding setup screen.
- Public invitation page layout.
- Reusable UI components.
- Responsive styling and empty states.

Temporary demo data may be used for visual development, but it must be clearly separated from real application data.

Deliverable: Complete responsive UI with functional navigation and form interactions.

## Phase 2: Supabase Foundation

Build:
- Supabase client.
- Environment configuration.
- Authentication.
- Session persistence.
- Protected routes.
- Database migrations.
- Core tables and relationships.
- RLS policies.
- Owner workspace creation.
- Wedding setup persistence.

Deliverable: Securely authenticated application with a real wedding workspace.

## Phase 3: Core Wedding Management

Build:
- Expense CRUD.
- Function CRUD.
- Task management.
- Payment tracking.
- Function-specific expense summaries.
- Dashboard calculations.
- Search, filters and sorting.

Deliverable: Working wedding budget and planning management.

## Phase 4: Invitations and Family

Build:
- Invitation editor and preview.
- Published invitation links.
- Restricted public invitation access.
- Family member invitations.
- Role-based access.
- Basic group messaging.
- Settings updates.

Deliverable: Working invitations and family collaboration.

## Phase 5: Verification and Deployment

Test:
- Authentication.
- Database operations.
- Budget calculations.
- Task assignments.
- Invitation privacy.
- Membership permissions.
- Mobile responsiveness.
- Error states.
- Production build.

Document:
- Environment configuration.
- Database migrations.
- Supabase setup.
- Local development commands.
- Deployment instructions.

Deliverable: Tested application ready for deployment.

---

# 21. Acceptance Criteria

The project is considered ready for its initial release only when the following criteria are met.

### Authentication
- Users can sign up, log in and log out.
- Sessions persist appropriately.
- Private routes are protected.
- Password recovery works.

### Wedding Setup
- The owner can create and update wedding details.
- Data is stored in Supabase.
- Reloading the application preserves saved details.

### Dashboard
- Financial figures are calculated from database records.
- Remaining budget is accurate.
- Upcoming functions and pending tasks reflect real data.
- Empty states are displayed when there is no data.

### Expenses
- Authorized users can add, edit and delete expenses.
- Payment amounts are validated.
- Outstanding payments are calculated correctly.
- Filters work.
- Changes persist after reload.

### Functions
- Users can create and update functions.
- Function budgets and linked expenses are displayed accurately.
- Tasks can be assigned and updated.

### Invitations
- Users can create and edit invitations.
- Preview reflects saved information.
- Published invitation links work.
- Unpublished invitations are inaccessible publicly.
- Public pages do not expose private information.

### Family & Settings
- The owner can manage authorized members.
- Role restrictions work at the database level.
- Authorized users can send and read messages.
- Settings persist after updates.

### Security
- RLS is enabled on private tables.
- Unauthorized database operations are rejected.
- Users cannot access unrelated wedding data.
- Privileged keys are never exposed in frontend code.

### Design
- All five primary navigation sections work.
- Layout is responsive.
- Forms are accessible.
- Loading, success, empty and error states are present.
- The premium ivory, forest green and muted gold design is consistent.

### Deployment
- The production build succeeds.
- Environment variables are documented.
- Database migrations are version-controlled.
- Setup instructions are documented.

---

# 22. Instructions for Antigravity

Follow these rules throughout development:

1. Read this PRD before implementing features.
2. Inspect the existing project before modifying code.
3. Implement the application incrementally.
4. Do not rewrite working files unnecessarily.
5. Do not add unrequested features.
6. Do not replace real application data with hardcoded demo data after backend integration.
7. Do not claim that Supabase is configured until the project is connected and verified.
8. Do not disable RLS to make a feature work.
9. Do not solve permission errors by granting broad database access.
10. Keep all private data scoped to the authorized wedding workspace.
11. Validate calculations using realistic test cases.
12. Run available build and lint checks after meaningful changes.
13. Report errors honestly and explain any remaining manual setup.
14. Ask before performing destructive database operations.
15. Keep documentation updated.
16. Prefer simple, maintainable solutions over unnecessary abstractions.
17. Do not expose secrets in code, logs or documentation.

## First Action

Start with Phase 0: inspect the existing repository and provide a concise report of its current structure, dependencies, routing and Supabase configuration.

Then propose the exact files that should be created or modified for Phase 1.

Do not start a full rewrite. Preserve existing working code and wait for the appropriate implementation instruction.

The goal is to build a polished, secure and genuinely functional personal wedding planning application â€” not merely a beautiful static dashboard.
