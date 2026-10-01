# FlowBoard Design System

This file is the single source of truth for FlowBoard's design tokens (colors, typography, corner radii, shadows) and a catalog of every reusable piece of UI in the app (icons, buttons, form fields, and components organized as atoms → molecules → organisms).

It's written to be read and edited by **anyone** — you don't need to know how to code to change a color or understand what a component does. It's also written so an AI coding agent (like Claude) can read it precisely.

## How this file works

- The tables under **Foundations** below (Colors, Typography, Radii, Shadows) are wrapped in `<!-- tokens:... -->` comment markers. Those markers and the tables inside them are read by a script that regenerates the app's actual CSS from this file.
- **To change a value**: edit the `Value` column of a row (for example, change `--color-accent`'s value to try a different purple), then save the file.
  - If the app is running locally (`npm run dev`), the change appears in the running app automatically — no need to do anything else.
  - Every deployment (`npm run build`) also re-reads this file, so what you see live always matches what's written here.
  - If you're not running anything locally, just tell Claude what you changed (or paste your edited table) and ask it to sync — Claude can apply the edit and it'll take effect on the next deploy.
- **Do not** edit the `Token` column of an existing row, remove a row, or touch the `<!-- tokens:... -->` markers themselves — the sync script depends on that structure. Anything *outside* those marker blocks (all the prose and catalog tables further down this file) is free-form — edit those parts however you like, they're documentation only and never parsed by anything.
- **Adding a brand-new color, a new icon, a new button variant, or a new component** is not a value change — it needs actual code. Tell Claude what you want and it'll build it and update this file to document it.

---

## Foundations

### Colors

<!-- tokens:colors -->
| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#0369a1` | Primary buttons, links, focus rings, the app's main brand blue |
| `--color-primary-hover` | `#075985` | Hover state for anything using `--color-primary` |
| `--color-accent` | `#8a38f5` | Reserved for the single primary call-to-action per page — today that's only the "New Board" button |
| `--color-accent-hover` | `#7c2ff0` | Hover state for the accent button |
| `--color-danger` | `#c0132f` | Destructive actions, error text, the "High" priority badge text |
| `--color-danger-bg` | `#fde3e8` | Background tint behind danger text: error banners, the "High" priority badge |
| `--color-text` | `#0a0a0a` | Default body and heading text color |
| `--color-muted` | `#666677` | De-emphasized metadata: timestamps, counts, hints, placeholder-adjacent text |
| `--color-border` | `rgba(0, 0, 0, 0.1)` | Default border color for inputs, cards, and dividers |
| `--color-border-strong` | `#8a8a99` | Boundary of interactive controls (inputs, selects, textareas); meets the 3:1 non-text contrast minimum (WCAG 1.4.11) |
| `--color-column-bg` | `#f3f4f6` | Kanban column background |
| `--color-page-bg` | `#f8f9fb` | App page background |
| `--color-avatar-bg` | `#4f46e5` | Assignee and user avatar circle background |
| `--color-white` | `#ffffff` | White surfaces: cards, modals, filled-button text |
| `--color-priority-medium-bg` | `#fef3c7` | "Medium" priority badge background |
| `--color-priority-medium-text` | `#92400e` | "Medium" priority badge text |
| `--color-priority-low-bg` | `#dcfce7` | "Low" priority badge background |
| `--color-priority-low-text` | `#166534` | "Low" priority badge text |
| `--color-notice-bg` | `#e0f2fe` | Informational notice banner background (e.g. the login page's magic-link notice) |
<!-- /tokens:colors -->

### Typography

The app uses [Inter](https://fonts.google.com/specimen/Inter) everywhere, loaded from Google Fonts, falling back to the system font if it fails to load.

<!-- tokens:typography -->
| Token | Value | Usage |
|---|---|---|
| `--font-size-3xl` | `32px` | Page-level headings, e.g. "My Boards" |
| `--font-size-2xl` | `24px` | Section headings, e.g. the login title, a board's name |
| `--font-size-xl` | `18px` | Card titles: a board tile's name, a modal's title |
| `--font-size-base` | `16px` | Default body text, form inputs, button labels |
| `--font-size-sm` | `14px` | The most common text size: labels, kanban card titles, tabs, muted metadata |
| `--font-size-xs` | `12px` | Small metadata: avatar initials, counts, due dates, hints |
| `--font-size-2xs` | `11px` | The priority badge on a kanban card |
| `--font-size-3xs` | `10px` | The assignee avatar initial on a kanban card |
| `--font-weight-regular` | `400` | Default body text weight (the implicit browser default) |
| `--font-weight-medium` | `500` | The only non-default weight used anywhere: headings, labels, buttons, card titles |
| `--letter-spacing-tightest` | `-0.4px` | The tightest tracking, used on a board tile's title |
| `--letter-spacing-tighter` | `-0.3px` | Used on the navbar brand name, nav link, and sign-out text |
| `--letter-spacing-tight` | `-0.15px` | Used on column names and kanban card titles |
| `--letter-spacing-wide` | `0.3px` | Positive tracking paired with uppercase text, used on small all-caps field labels |
<!-- /tokens:typography -->

### Radii

<!-- tokens:radii -->
| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `8px` | Small elements: the login page's tab switcher |
| `--radius-md` | `10px` | The default radius for almost everything: buttons, inputs, cards, columns |
| `--radius-lg` | `16px` | Large surfaces: modals, the login card |
| `--radius-full` | `9999px` | Fully rounded: avatars, the priority badge, the column card-count badge |
<!-- /tokens:radii -->

### Shadows

<!-- tokens:shadows -->
| Token | Value | Usage |
|---|---|---|
| `--shadow-modal` | `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)` | Modals and the login card — a strong, elevated shadow |
| `--shadow-card` | `0 1px 2px rgba(0, 0, 0, 0.06)` | A subtle lift on hover for kanban cards |
<!-- /tokens:shadows -->

### Icons

FlowBoard uses a small set of hand-drawn inline SVG icons, defined in `src/components/icons.tsx`. Every icon accepts a `size` prop (in pixels) and, except the logo, a `color` prop (any CSS color).

| Icon | Component | Default size | Usage |
|---|---|---|---|
| Logo mark | `LogoIcon` | 20px | The FlowBoard brand mark, always shown white on the primary-blue logo badge |
| Plus | `PlusIcon` | 16px | "Add card" and "New Board" buttons |
| Upload | `UploadIcon` | 24px | The empty-state drop zone in a kanban column ("Drop a card here or add one below") |
| Close (X) | `CloseIcon` | 12px | The close button on modals |

---

## Components

### Buttons

FlowBoard has one shared `Button` component (`src/components/Button.tsx`) with five variants covering every button in the app. There is no "size" prop — every button is the same size within its variant.

| Variant | Looks like | When to use it |
|---|---|---|
| `primary` | Filled, primary blue, white text | The single main action in a form or view — "Save", "Create", "Sign in" |
| `accent` | Filled, accent purple, white text | Reserved for "New Board" only — don't reuse this color for anything else |
| `secondary` | No fill, dark text | A neutral secondary action next to a primary one — "Cancel" |
| `danger-text` | No fill, red text | A destructive, low-emphasis action — "Delete card" |
| `ghost-muted` | No fill, muted gray text that darkens on hover | A tertiary, quiet action — "Add card", "Sign out" |

### Form Fields

Shared input styling lives in `src/components/formFields.module.css` and is used by every form in the app (the card modal, the create-board modal, and the login page). All text inputs, textareas, and selects share the same border, radius, padding, and focus ring, so a form always feels consistent no matter which page it's on.

| Element | Description |
|---|---|
| Text input | Single-line text, e.g. a card's title or a board's name |
| Textarea | Multi-line text, e.g. a card's description |
| Select | A dropdown, e.g. a card's priority |
| Label | A field's name, shown above it — comes in a normal weight and a smaller "muted, uppercase" variant for secondary fields |

### Atoms

The smallest reusable building blocks — each one does exactly one thing and doesn't depend on the others.

| Atom | File | Description |
|---|---|---|
| Button | `src/components/Button.tsx` | The shared button described above |
| Modal shell | `src/components/Modal.tsx` | A generic overlay + panel + title + close button; other components put their own content inside it |
| Kanban card | `src/components/Card.tsx` | A single draggable card: title, priority badge, due date, assignee avatar |
| Board tile | `src/components/BoardCard.tsx` | A single clickable tile on the "My Boards" page showing a board's name and creation date |
| Icons | `src/components/icons.tsx` | The 4 icons listed above |

### Molecules

Small groups of atoms that work together as one unit.

| Molecule | File | Description |
|---|---|---|
| Column | `src/components/Column.tsx` | One kanban column: a name and card-count header, a list of cards (or an empty-state drop zone), and an "Add card" button |
| Create Board modal | `src/components/CreateBoardModal.tsx` | A Modal containing one text field and Cancel/Create buttons |

### Organisms

Larger, page-section-sized pieces made of molecules and atoms, usually tied to real app behavior (data fetching, navigation).

| Organism | File | Description |
|---|---|---|
| Navbar | `src/components/Navbar.tsx` | The top header: logo, brand name, "Boards" and "Design System" links, user avatar, and sign-out button |
| Card modal | `src/components/CardModal.tsx` | A Modal containing every card field (name, description, assignee, priority, due date) plus Delete/Cancel/Save — used for both creating and editing a card |
| Board | `src/components/Board.tsx` | A full board view: the breadcrumb header, the row of columns, and the logic for opening the card modal and handling drag-and-drop |

---

## Usage principles

- **Accent purple (`--color-accent`) is reserved for one call-to-action per page.** Today that's only the "New Board" button. Using it anywhere else dilutes what it's supposed to draw attention to.
- **Danger red and its background tint are for destructive actions and error states only** — never use them decoratively.
- **Muted text (`--color-muted`) is for de-emphasized metadata** (timestamps, counts, hints), never for primary body copy a user needs to read carefully.
- **`--radius-md` (10px) is the default.** Only reach for `--radius-sm` (8px) or `--radius-lg` (16px) when an element is meaningfully smaller or larger than the norm (the tab switcher, a modal).
- When in doubt, look at how an existing, similar element is styled and match it rather than inventing a new value — that's what keeps this system worth having.
