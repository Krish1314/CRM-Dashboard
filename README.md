# Candidate CRM Dashboard (KOTS Assignment)

Submission-ready project for the IT Testing Lead assignment:
- Realistic candidate mock dataset (`mock_candidates.json`)
- Appsmith implementation guide (`appsmith_layout_plan.md`)
- QA checklist with edge cases and known limitations (`qa_test_checklist.md`)
- Product note in a junior SDET voice (`product_note.md`)
- Static web demo (`index.html`, `styles.css`, `app.js`) deployable to Netlify

## Project Structure

- `mock_candidates.json` - 14 realistic candidate records
- `appsmith_layout_plan.md` - widgets, filters, bindings, and status update wiring
- `qa_test_checklist.md` - practical scenario-based QA coverage
- `product_note.md` - design decisions, assumptions, and future improvements
- `index.html` / `styles.css` / `app.js` - optional frontend demo
- `netlify.toml` - Netlify deployment config

## Run Locally

Because this project fetches `mock_candidates.json`, run it with a local server:

```bash
python3 -m http.server 8080
```

Open: `http://localhost:8080`

## Deploy to Netlify

1. Push this folder to a GitHub repository.
2. In Netlify, choose **Add new site -> Import an existing project**.
3. Select your repository.
4. Build settings:
   - Build command: *(leave empty)*
   - Publish directory: `.`
5. Deploy.

## Appsmith Implementation (for assignment)

1. Create a new Appsmith app.
2. Use `mock_candidates.json` as the static data source (or Google Sheet).
3. Follow `appsmith_layout_plan.md` to create widgets and bindings.
4. Validate flows using `qa_test_checklist.md`.
5. Add `product_note.md` content to your submission doc.

## Submission Checklist

- [ ] Appsmith App URL
- [ ] Product note (5-10 lines)
- [ ] QA checklist + edge cases + known limitations
- [ ] Mention in-memory status update reset behavior on refresh

## Notes

- The static web dashboard is an extra demo artifact; the core assignment target is Appsmith.
- Candidate status updates in the static demo are in-memory and reset on full page refresh.
# 👥 Candidate CRM Dashboard

A CRM-style dashboard for a hiring team to manage and filter job candidates through the hiring pipeline. Built as a KOTS assignment submission (IT Testing Lead role).

<br>

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Candidate Table** | View all 14 candidates with sortable columns (click headers to sort) |
| **Live Search** | Search by name or email with debounced input (250ms) |
| **Multi-Filter System** | Status (multi-select), YOE (min–max), Location (dropdown), Skills (multi-select) |
| **Filter Tags** | See active filters as removable tags below the filter bar |
| **Status Cards** | Clickable status summary cards that double as quick filters |
| **Detail Panel** | Slide-in side panel showing full candidate details |
| **Status Update** | Update a candidate's hiring status (in-memory, resets on refresh) |
| **Toast Notifications** | Visual feedback on status updates and filter resets |
| **Reset All Filters** | One-click reset for all active filters |
| **Keyboard Support** | Press `Escape` to close panels and dropdowns |
| **Responsive Design** | Works on desktop, tablet, and mobile screens |

<br>

## 🛠 Tech Stack

- **HTML5** — Semantic structure
- **CSS3** — Custom design system with CSS variables, glassmorphism, animations
- **Vanilla JavaScript** — No frameworks, no dependencies, no build step
- **Google Fonts** — Inter typeface
- **Netlify** — Static site deployment

<br>

## 🚀 Deployment

### Deploy on Netlify (Recommended)

1. Push this repo to GitHub
2. Go to [app.netlify.com](https://app.netlify.com)
3. Click **"Add new site" → "Import an existing project"**
4. Connect your GitHub repo
5. Deploy settings (auto-detected from `netlify.toml`):
   - **Build command**: *(leave empty)*
   - **Publish directory**: `.`
6. Click **Deploy** — your site will be live in ~30 seconds

### Run Locally

No installation or build step needed:

```bash
# Option 1: Just open the HTML file
open index.html

# Option 2: Use a local server (for best experience)
npx serve .
# or
python3 -m http.server 8000
```

<br>

## 📁 Project Structure

```
Assignment/
├── index.html              # Main page
├── styles.css              # Complete design system & styles
├── app.js                  # Application logic (data, filters, UI)
├── netlify.toml            # Netlify deployment config
├── README.md               # This file
├── mock_candidates.json    # Raw JSON dataset (reference)
├── docs/
│   ├── qa-test-checklist.md    # QA test scenarios + edge cases
│   ├── product-note.md         # Design decisions & assumptions
│   └── appsmith-layout-plan.md # Appsmith widget mapping guide
```

<br>

## 📋 Documentation

| Document | Description |
|----------|-------------|
| [QA Test Checklist](docs/qa-test-checklist.md) | 50+ test scenarios, 10 edge cases, 6 known limitations, smoke test |
| [Product Note](docs/product-note.md) | Design decisions, assumptions, and improvement ideas |
| [Appsmith Layout Plan](docs/appsmith-layout-plan.md) | Widget-by-widget guide for building this in Appsmith |

<br>

## ⚠️ Known Limitations

1. **Status updates are in-memory** — they reset on page refresh (expected; would use Google Sheets API or REST backend for persistence)
2. **No pagination** — all 14 candidates load at once (fine for this dataset, would add pagination at 50+)
3. **Skills filter uses OR logic** — selecting multiple skills shows candidates with *any* of those skills
4. **No YOE validation** — entering Min > Max shows empty results instead of a validation error

<br>

## 👤 Author

**Krish Patel** — KOTS Assignment | IT Testing Lead Role

<br>

---

*Built with ☕ and attention to detail.*
