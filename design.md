# Make My Marriage — Design System

## 1. Product & Design Direction

**Product:** Make My Marriage  
**Purpose:** A private, collaborative wedding-planning workspace for a couple and their family.  
**Design keywords:** Elegant, warm, editorial, calm, premium, trustworthy, personal, minimal.

The interface should feel like a refined wedding journal combined with a modern planning dashboard. It must not look like a generic SaaS admin template, a wedding marketplace, or a loud wedding invitation website.

### Core design principles
- **Clarity first:** show the most useful wedding information at a glance.
- **Elegant restraint:** use color, borders, shadows, and decorative elements sparingly.
- **Personal warmth:** use short, friendly copy and subtle wedding-inspired details.
- **Practical over decorative:** every card or visual element must support a real planning task.
- **Responsive by default:** desktop should feel spacious; mobile should remain clear and easy to use.
- **Accessible:** maintain readable contrast, visible focus states, keyboard access, and comfortable touch targets.

## 2. Brand Foundation

### Brand personality
- Sophisticated, not flashy
- Romantic, not overly ornamental
- Organized, not corporate
- Premium, but approachable

### Color tokens

Use these as the source of truth. Keep the canvas warm rather than pure white.

| Token | Hex | Usage |
|---|---|---|
| `canvas` | `#F8F6F0` | Main page background |
| `surface` | `#FFFFFF` | Cards, dialogs, popovers |
| `surface-soft` | `#F1EFE7` | Secondary panels and subtle fills |
| `forest` | `#24483F` | Primary brand color, active navigation, primary buttons |
| `forest-hover` | `#1B3932` | Hover/pressed state |
| `forest-tint` | `#E8EFEB` | Soft selected states and badges |
| `gold` | `#B79A62` | Fine accents, small icons, decorative lines |
| `gold-tint` | `#F3EBDD` | Subtle highlights only |
| `ink` | `#252923` | Main text |
| `muted` | `#73776F` | Supporting text |
| `border` | `#E7E4DB` | Card outlines and dividers |
| `success` | `#39765A` | Paid/completed status |
| `warning` | `#A56A2A` | Due/attention status |
| `danger` | `#B64C48` | Errors and destructive actions |
| `info` | `#466A86` | Informational states |

Do not use gold for long text or large backgrounds. Avoid gradients except for a very subtle decorative treatment where genuinely useful. Do not use pure black as the default text color.

### Typography
Use a refined serif for prominent headings and a clean sans-serif for UI text.

- **Display/headings:** `DM Serif Display` or `Playfair Display`
- **Body/UI:** `Inter` or `Manrope`
- **Fallbacks:** `Georgia, serif` for headings; `system-ui, sans-serif` for UI.

Suggested hierarchy:
- Page title: 30–36px desktop, 26–30px mobile; serif, regular weight.
- Section title: 17–20px; sans-serif, semibold.
- Card title: 14–16px; sans-serif, semibold.
- Body: 14–16px; comfortable line-height.
- Supporting labels: 12–13px; muted color.
- Small status labels: 11–12px; medium weight.

Use serif typography selectively. Most tables, labels, buttons, and data should use sans-serif for clarity.

## 3. Layout & Spacing

### Desktop shell
- Left sidebar: 248px wide, full viewport height.
- Main content: flexible, max content width around 1440px.
- Main page padding: 32px desktop, 24px medium screens, 16px mobile.
- Header height: approximately 72px.
- Use a 12-column grid where helpful; cards should align cleanly.
- Standard card radius: 16px.
- Small control radius: 10–12px.
- Pill radius: 999px for compact badges only.
- Card border: 1px solid `border`.
- Shadows: extremely subtle, mostly for floating elements. Prefer borders over heavy shadows.
- Standard spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px.

### Sidebar
- Brand lockup: small, elegant monogram or line-art ring/flower mark plus “Make My Marriage”.
- Use a quiet `canvas` or `surface` background with a fine right border.
- Exactly five primary navigation items, in this order:
  1. Dashboard
  2. Expenses
  3. Functions
  4. Invitations
  5. Family & Settings
- Use Lucide icons, 18–20px, with consistent stroke width.
- Active item: soft `forest-tint` background, forest text/icon, and a subtle left indicator if it improves clarity.
- Inactive items: muted text; clear hover state.
- At the bottom: current wedding/workspace switcher or wedding name, plus profile avatar and role. Keep secondary actions visually quiet.
- On mobile, replace the sidebar with a compact top bar and a mobile navigation pattern that remains accessible; do not shrink the desktop sidebar into a cramped column.

### Content rhythm
- Every page starts with a clear title and concise subtitle or context.
- Keep consistent alignment between page headings, cards, tables, and section labels.
- Avoid crowded card grids, oversized empty spaces, and excessive nested cards.
- Use whitespace to establish hierarchy rather than decorative lines everywhere.

## 4. Component Styling

### Buttons
**Primary:** forest background, white text, medium/semibold weight, 44–48px height, 10–12px radius.  
**Secondary:** white or transparent background, ink text, subtle border.  
**Tertiary/ghost:** no visible border until hover.  
**Destructive:** danger color, with confirmation for irreversible actions.

Include clear hover, focus-visible, active, loading, and disabled states. Buttons must have meaningful labels, not icon-only controls unless the icon is familiar and has an accessible label.

### Cards
- White surface on warm canvas.
- Fine neutral border.
- 16px radius.
- 20–24px internal padding.
- Titles and values aligned consistently.
- Avoid heavy shadows and decorative gradients.
- Use a small icon only when it improves scanning.

### Inputs
- White background, 1px neutral border, 10–12px radius.
- Height 44–48px.
- Clear labels above fields; placeholders are examples, not labels.
- Visible focus ring using a soft forest tint.
- Inline validation text should explain how to fix the issue.

### Badges & status
Use compact, lightly tinted badges with text labels:
- Paid/Completed: green tint.
- Pending/Upcoming: warm gold tint.
- Overdue/Action required: pale red tint.
- Draft: neutral gray.
Do not rely on color alone; always include status text.

### Tables and lists
- Use comfortable row height, aligned currency values, clear column labels, and quiet dividers.
- On mobile, transform dense tables into stacked summary rows or cards.
- Always include empty, loading, error, and populated states.

### Dialogs, drawers, and menus
- White surfaces, rounded corners, restrained shadow, clear title and close control.
- Use dialogs for short focused tasks; use drawers for longer forms on desktop where appropriate.
- Preserve entered form values when validation fails.

### Icons
Use **Lucide React** consistently. Avoid mixing icon families, emojis as UI icons, and decorative icon styles.

## 5. Dashboard Homepage — First Screen

The dashboard is the first page after successful onboarding. It should immediately communicate the wedding overview and the next useful actions.

### Top header
- Greeting: “Your wedding, beautifully organized.”
- Supporting copy: “One place for your plans, people, and special moments.”
- Wedding name/date context if configured, for example “Ayesha & Rumman” and a date label. Use realistic sample data only in the design prototype; the actual app must use saved user data.
- Primary CTA: **Add expense**.
- Secondary CTA: **Add function** or a compact “Quick add” menu.
- Keep the header refined, not oversized.

### Overview cards
Show four compact, equal-height cards:
1. **Total budget** — configured wedding budget.
2. **Spent so far** — sum of recorded expenses.
3. **Remaining** — budget minus spent.
4. **Payments due** — outstanding/unpaid amounts.

Each card should have a small contextual label, a prominent amount, and a concise secondary indicator. Do not fabricate a misleading chart or claim financial data is live when it is only sample data. Use sample values only in the Stitch mockup and clearly replace them with real calculations in implementation.

### Main content grid
Use a balanced 2-column layout on desktop:

**Left / wider column**
- **Budget overview:** a simple progress bar showing spent versus total budget, with a clear percentage and amount remaining. Avoid a complex chart in the MVP.
- **Upcoming functions:** show the next 2–3 events with date, function name, venue if available, and a small task/progress indicator.
- **Recent expenses:** show a short list of recent transactions with category icon, description, payer or vendor if available, date, amount, and payment status.

**Right / narrower column**
- **Your next steps:** a checklist of actionable tasks with due dates and completion states. Include a clear “View all tasks” action.
- **Family activity:** a small recent-activity feed such as a family member adding an expense or updating a task. Keep it compact and privacy-conscious.
- A discreet **Invite family** action may appear here if the workspace has not yet invited collaborators.

### Dashboard content rules
- The first viewport must show the title, primary CTA, and budget summary without scrolling on a typical laptop.
- Prioritize useful information over illustration.
- Do not show all app modules in their entirety on the dashboard.
- Keep sample content believable, restrained, and easy to scan.
- Use a tasteful, small wedding-themed visual accent only if it does not compete with the data.
- Include helpful empty states when the user has not set a budget, added expenses, created functions, or invited family.

## 6. Navigation & Page Consistency

Maintain the same shell and component language across these five primary pages:
- **Dashboard:** overview, budget, upcoming functions, tasks, recent expenses/activity.
- **Expenses:** searchable/filterable expense list, totals, create/edit form, payment status.
- **Functions:** function cards/list, dates, venues, budget, tasks and progress.
- **Invitations:** invitation editor, live preview, published state, share/copy-link/WhatsApp actions.
- **Family & Settings:** members, roles, access, wedding details, account settings, and group chat if enabled.

Authentication and onboarding are separate flows, but they must use the same colors, typography, and button/input styling.

## 7. Responsive Behavior

### Desktop (1280px and wider)
- Fixed sidebar.
- Spacious header.
- Four overview cards in one row.
- Two-column dashboard content.

### Tablet (768–1279px)
- Sidebar can collapse to an icon rail if labels remain accessible.
- Overview cards can use a 2×2 grid.
- Main dashboard can become one column if the two-column layout gets too tight.

### Mobile (under 768px)
- Use a mobile-first content layout with 16px side padding.
- Stack dashboard sections vertically.
- Overview cards may use a 2-column grid; avoid horizontal overflow.
- Use full-width primary actions when needed.
- Keep buttons/touch targets around 44px or larger.
- Ensure dialogs/forms fit the viewport and can scroll.
- Tables must become compact rows/cards or use a deliberate responsive pattern.
- Do not hide critical amounts, payment status, or primary actions.

## 8. Motion & Interaction

Motion should feel calm and purposeful:
- 150–220ms transitions for hover/focus and small state changes.
- Small fade/slide-in for initial dashboard sections only if it stays subtle.
- Progress bars animate gently when data loads; avoid distracting loops.
- Buttons have restrained hover feedback.
- Respect `prefers-reduced-motion`.
- No parallax, bouncy transitions, autoplay carousels, or excessive scroll animations.

## 9. Accessibility & UX Requirements

- Semantic headings in correct order.
- Keyboard navigable controls and menus.
- Visible `focus-visible` outlines.
- WCAG AA contrast for normal text wherever possible.
- Statuses must include text, not just color.
- Inputs have associated labels and helpful error messages.
- Use accessible names for icon-only controls.
- Provide loading, empty, error, success, and disabled states.
- Confirm destructive actions such as deleting expenses or removing a family member.
- Avoid layout shifts when data loads.

## 10. Data Integrity & UI State

The visual design must reflect the actual product behavior:
- Currency defaults to INR (₹), formatted using Indian grouping (e.g. ₹1,25,000) and the wedding's saved currency setting if supported.
- Total spent = sum of recorded expenses according to the agreed product logic.
- Remaining budget = total budget − spent; handle a zero or unset budget gracefully.
- Payments due = unpaid or partially paid amounts according to the expense/payment model.
- Do not show hardcoded sample values after backend integration.
- Distinguish loading, empty, error, and real-data states.
- Keep all private wedding data behind authenticated access and the application's authorization rules.

## 11. Frontend Implementation Notes

- Use the existing React + Tailwind project. Inspect its current structure before changing configuration or replacing files.
- Prefer reusable components: `AppShell`, `Sidebar`, `PageHeader`, `Button`, `Card`, `StatusBadge`, `ProgressBar`, `EmptyState`, `ExpenseRow`, `FunctionCard`, and `TaskItem`.
- Keep design tokens centralized using Tailwind theme variables or CSS custom properties.
- Use Lucide React for icons.
- Keep components responsive and composable.
- Avoid adding a large UI library if the project already has suitable components.
- Use realistic placeholder data only for visual prototyping; isolate it so it can be replaced with Supabase data cleanly.
- Do not implement fake interactions. Buttons should work or be clearly disabled with a reason.
- Do not change database schema or authentication behavior just to match a mockup.
- Do not add new product features beyond the PRD.

## 12. Final Quality Checklist

Before calling the UI complete, verify:
- [ ] It looks premium, warm, clean, and wedding-specific without being overly decorative.
- [ ] The five navigation labels are exact and in the agreed order.
- [ ] Typography, spacing, card radii, and colors are consistent.
- [ ] Main CTA and key budget figures are visible quickly.
- [ ] The dashboard does not feel overcrowded.
- [ ] No horizontal overflow at mobile, tablet, or desktop widths.
- [ ] Loading, empty, error, and populated states are considered.
- [ ] Keyboard focus and contrast are visible and usable.
- [ ] Sample data is not mistaken for live backend data.
- [ ] Existing project setup and PRD scope are preserved.
