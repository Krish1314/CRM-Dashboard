# Candidate CRM Dashboard

A simple internal dashboard built for a hiring team to manage and track job candidates through the recruitment pipeline. This was built as part of the KOTS assignment for the IT Testing Lead role.

**Live Demo:** [View on Netlify](https://krish-crm-dashboard.netlify.app)

---

## What This Project Does

This dashboard lets a recruiter or hiring manager:

- View all candidates in a single table
- Search candidates by name or email
- Filter by status, experience, location, or skills
- Click on any candidate to see their full profile
- Update a candidate's hiring status directly from the detail view

The data is static JSON (no backend needed). Status updates work in-memory and reset on page refresh — this is documented as a known limitation.

---

## Project Structure

```
├── index.html              → Main HTML page (entry point)
├── styles.css              → All styling — dark theme, layout, components
├── app.js                  → Application logic — filters, rendering, events
├── mock_candidates.json    → Dataset of 14 candidates (used as data source)
├── netlify.toml            → Netlify deployment config
├── .gitignore
├── README.md
└── docs/
    ├── qa-test-checklist.md     → QA scenarios, edge cases, known limitations
    ├── product-note.md          → My design decisions and assumptions
    └── appsmith-layout-plan.md  → Widget-by-widget Appsmith mapping
```

---

## Tech Stack

- **HTML5** — page structure
- **CSS3** — custom properties, flexbox, grid, animations
- **Vanilla JavaScript** — no frameworks or dependencies
- **Google Fonts** — Inter typeface
- **Netlify** — static hosting

No build step. No `npm install`. Just open `index.html`.

---

## Features

### Search
- Live search by candidate name or email
- Debounced input (250ms) to avoid unnecessary re-renders
- Clear button appears when text is entered

### Filters
- **Status** — multi-select dropdown (New, Screening, Shortlisted, Interviewed, Selected, Rejected)
- **YOE** — min and max number inputs for years of experience range
- **Location** — single-select dropdown, options derived from data
- **Skills** — multi-select dropdown, OR logic (matches candidates with any selected skill)
- **Reset All** — clears every filter and search input at once

All filters work together using AND logic between filter types.

### Status Summary Cards
Six cards at the top showing candidate count per status. Clicking a card toggles that status filter — syncs with the dropdown.

### Candidate Table
- Displays: Name, Email, Role, YOE, Location, Status, Source
- Click any column header to sort (ascending/descending toggle)
- Status shown as color-coded badges
- Long emails truncate with ellipsis
- Empty state shown when no candidates match filters

### Detail Panel
- Slides in from the right when a row is clicked
- Shows all candidate info: contact, experience, skills (as tags), notes
- Status update dropdown + Update button at the bottom
- Closes on overlay click, close button, or Escape key
- Body scroll is locked while panel is open

### Toast Notifications
- Success toast on status update
- Info toast on filter reset
- Auto-dismiss after 3 seconds with slide-out animation

---

## How the Code Works

### Data Flow

```
mock_candidates.json → loadData() → state.allCandidates
                                         ↓
                              applyFiltersAndRender()
                                         ↓
                              state.filteredCandidates
                                         ↓
                    ┌────────────────────────────────────┐
                    │  renderStatusCards()                │
                    │  renderResultsCount()               │
                    │  renderActiveFilters()              │
                    │  renderTable()                      │
                    │  renderSortHeaders()                │
                    └────────────────────────────────────┘
```

Everything goes through `applyFiltersAndRender()`. When any filter changes, search updates, or status is modified — this function re-runs the full pipeline.

### Key Functions in `app.js`

| Function | What it does |
|----------|-------------|
| `loadData()` | Fetches `mock_candidates.json` and stores it in state |
| `applyFiltersAndRender()` | Runs all filters on raw data, sorts results, triggers all render functions |
| `createDropdown()` | Builds a custom multi-select or single-select dropdown component |
| `renderTable()` | Generates table rows from filtered data, attaches click handlers |
| `openDetailPanel(id)` | Populates and opens the slide-in panel for a specific candidate |
| `updateCandidateStatus(id, status)` | Mutates candidate status in-memory, re-renders everything |
| `resetAllFilters()` | Clears all filter state, resets all UI inputs, shows toast |
| `syncDropdownValue(id, values)` | Syncs dropdown UI when filters change externally (e.g., status card click) |

### State Management

All app state lives in one `state` object:

```javascript
const state = {
  allCandidates: [],        // raw data from JSON
  filteredCandidates: [],   // result after all filters applied
  filters: {
    search: "",             // search query (lowercased)
    statuses: new Set(),    // selected status values
    yoeMin: "",             // min years of experience
    yoeMax: "",             // max years of experience
    location: "",           // selected location
    skills: new Set(),      // selected skill values
  },
  sort: { key: "name", dir: "asc" },
  selectedCandidateId: null,
};
```

### Custom Dropdown Component

Built from scratch since native `<select>` doesn't support multi-select with checkboxes. Each dropdown instance:
- Has its own `Set()` for tracking selected values
- Exposes a `__setValues()` method for external syncing
- Closes when clicking outside or selecting in single-select mode
- Shows a count badge for multi-select, value text for single-select

---

## Dataset

14 candidates with realistic Indian names, emails, and profiles. The data intentionally includes edge cases for testing:

- 4 candidates with `phone: null`
- 1 candidate with 0 years of experience (fresher)
- 1 candidate with a very long name (Sai Kiran Teja Venkata Ramana Murthy)
- 1 candidate with a very long email address
- 1 candidate with only 1 skill
- 1 candidate with 7 skills
- 1 candidate with an apostrophe in the name (D'Souza)
- All 6 statuses and all 4 sources are represented

---

## Known Limitations

1. **Status updates reset on refresh** — data is in-memory, not persisted
2. **No pagination** — fine for 14 records, would need it at 50+
3. **Skills filter uses OR logic** — selecting "Java" + "Cypress" shows candidates with either, not both
4. **No min/max validation** — entering Min YOE > Max YOE shows empty results silently
5. **No confirmation on status change** — accidental updates are possible

---

## Running Locally

```bash
# Just open the file directly
open index.html

# Or use any local server
python3 -m http.server 3000
```

Then go to `http://localhost:3000`

---

## Deploying to Netlify

1. Push to GitHub
2. Go to [app.netlify.com](https://app.netlify.com) → Add new site → Import from GitHub
3. Select the repo, leave build command empty, publish directory as `.`
4. Deploy

The `netlify.toml` in the repo handles the config automatically.

---

## Documentation

- [QA Test Checklist](docs/qa-test-checklist.md) — 50+ test scenarios, 10 edge cases, smoke test
- [Product Note](docs/product-note.md) — design decisions, assumptions, improvements
- [Appsmith Layout Plan](docs/appsmith-layout-plan.md) — widget mapping for Appsmith build
