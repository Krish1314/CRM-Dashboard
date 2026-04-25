# Appsmith Page Layout Plan — Candidate CRM Dashboard

## Overall Page Structure

The page uses a **single-page layout** with a left-to-right flow: **Filters Panel → Candidate Table → Detail Modal**. This avoids page navigation overhead and keeps everything one click away, which is exactly what a recruiter scanning 50–100 candidates needs.

---

## Section 1: Top Bar

| Widget | Name | Purpose |
|--------|------|---------|
| **Text** | `txtPageTitle` | Page heading: "Candidate Dashboard" |
| **Input** | `inputSearch` | Search box — placeholder: "Search by name or email…" |

**Wiring:**
- `inputSearch.text` is referenced in the table's filter logic.
- Add a debounce (300ms) via the `onTextChanged` event to avoid lag on every keystroke.

---

## Section 2: Filters Panel (Left Sidebar or Horizontal Strip)

> **Recommendation:** Use a **horizontal filter strip** below the top bar. It saves vertical real estate and is more natural for scanning. If the screen is narrow, a collapsible left sidebar works too.

| Widget | Name | Type | Config |
|--------|------|------|--------|
| **Multi-Select** | `filterStatus` | MultiSelect | Options: `New, Screening, Shortlisted, Interviewed, Selected, Rejected` |
| **Input** | `filterYoeMin` | NumberInput | Label: "Min YOE", default: empty, validation: ≥ 0 |
| **Input** | `filterYoeMax` | NumberInput | Label: "Max YOE", default: empty, validation: ≥ filterYoeMin |
| **Select** | `filterLocation` | SingleSelect | Options: dynamically derived from `unique(data.map(c => c.current_location))` |
| **Multi-Select** | `filterSkills` | MultiSelect | Options: dynamically derived from flattened + deduplicated skills array |
| **Button** | `btnResetFilters` | Button | Label: "Reset All Filters" |

**Wiring — Reset Button (`btnResetFilters.onClick`):**
```javascript
{{
  filterStatus.setValue([]);
  filterYoeMin.setValue('');
  filterYoeMax.setValue('');
  filterLocation.setValue('');
  filterSkills.setValue([]);
  inputSearch.setValue('');
}}
```

---

## Section 3: Candidate Table (Main Content Area)

| Widget | Name | Purpose |
|--------|------|---------|
| **Table** | `tblCandidates` | Main data table showing filtered candidates |

**Visible Columns (keep it to 6–7 max for readability):**

| Column | Source Field | Notes |
|--------|-------------|-------|
| ID | `id` | Hidden or narrow column |
| Name | `name` | Primary identifier |
| Email | `email` | — |
| YOE | `years_of_experience` | Right-aligned numeric |
| Role | `primary_role` | — |
| Status | `current_status` | Use **tag/badge** styling (color-coded) |
| Source | `source` | — |

**Table Data Binding (the core filter logic):**

```javascript
{{
  (() => {
    let data = mock_candidates.data; // or your JSObject/query name

    // Search filter
    const search = inputSearch.text?.toLowerCase() || '';
    if (search) {
      data = data.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search)
      );
    }

    // Status filter (multi-select)
    const statuses = filterStatus.selectedOptionValues || [];
    if (statuses.length > 0) {
      data = data.filter(c => statuses.includes(c.current_status));
    }

    // YOE range filter
    const minYoe = filterYoeMin.text ? Number(filterYoeMin.text) : null;
    const maxYoe = filterYoeMax.text ? Number(filterYoeMax.text) : null;
    if (minYoe !== null) {
      data = data.filter(c => c.years_of_experience >= minYoe);
    }
    if (maxYoe !== null) {
      data = data.filter(c => c.years_of_experience <= maxYoe);
    }

    // Location filter
    const loc = filterLocation.selectedOptionValue || '';
    if (loc) {
      data = data.filter(c => c.current_location === loc);
    }

    // Skills filter (match at least one skill)
    const skills = filterSkills.selectedOptionValues || [];
    if (skills.length > 0) {
      data = data.filter(c =>
        skills.some(skill => c.skills.includes(skill))
      );
    }

    return data;
  })()
}}
```

**Row click event (`tblCandidates.onRowSelected`):**
```javascript
{{ showModal('modalCandidateDetail') }}
```

---

## Section 4: Candidate Detail Modal

| Widget | Name | Type | Purpose |
|--------|------|------|---------|
| **Modal** | `modalCandidateDetail` | Modal | Container for detail view |
| **Text** | `txtDetailName` | Text | `{{ tblCandidates.selectedRow.name }}` |
| **Text** | `txtDetailEmail` | Text | `{{ tblCandidates.selectedRow.email }}` |
| **Text** | `txtDetailPhone` | Text | `{{ tblCandidates.selectedRow.phone \|\| 'N/A' }}` |
| **Text** | `txtDetailYoe` | Text | `{{ tblCandidates.selectedRow.years_of_experience }} years` |
| **Text** | `txtDetailRole` | Text | `{{ tblCandidates.selectedRow.primary_role }}` |
| **Text** | `txtDetailLocation` | Text | `{{ tblCandidates.selectedRow.current_location }}` |
| **Text** | `txtDetailSkills` | Text | `{{ tblCandidates.selectedRow.skills.join(', ') }}` |
| **Text** | `txtDetailSource` | Text | `{{ tblCandidates.selectedRow.source }}` |
| **Text** | `txtDetailNotes` | Text | `{{ tblCandidates.selectedRow.notes \|\| 'No notes available' }}` |
| **Select** | `selectUpdateStatus` | SingleSelect | Options: all 6 statuses. Default: `{{ tblCandidates.selectedRow.current_status }}` |
| **Button** | `btnUpdateStatus` | Button | Label: "Update Status" |

**Status Update Wiring (`btnUpdateStatus.onClick`):**

Since we're using static JSON in-memory, create a **JSObject** (`CandidateUtils`) to handle mutable state:

```javascript
// JSObject: CandidateUtils
export default {
  candidateData: mock_candidates.data.map(c => ({...c})),  // mutable copy

  getFilteredData() {
    // same filter logic as above but references this.candidateData instead
  },

  updateStatus(candidateId, newStatus) {
    const candidate = this.candidateData.find(c => c.id === candidateId);
    if (candidate) {
      candidate.current_status = newStatus;
      showAlert(`Status updated to "${newStatus}"`, 'success');
      closeModal('modalCandidateDetail');
    }
  }
}
```

Then the **table data** binds to `{{ CandidateUtils.getFilteredData() }}` and the **Update button** calls:
```javascript
{{ CandidateUtils.updateStatus(tblCandidates.selectedRow.id, selectUpdateStatus.selectedOptionValue) }}
```

---

## Data Source Setup

1. **Create a JSObject** named `mock_candidates` (or use an API/Query)
2. Paste the JSON from `mock_candidates.json` as the return value
3. Reference it as `mock_candidates.data` throughout

Alternatively, use a **Google Sheet** as data source:
- Create a sheet with columns matching the data model
- Add the Appsmith Google Sheets plugin
- Create a query `getCandidates` — this gives you read/write persistence for free

---

## Status Badge Colors (Optional Polish)

Apply conditional styling to the Status column in the table:

| Status | Color |
|--------|-------|
| New | `#3B82F6` (Blue) |
| Screening | `#F59E0B` (Amber) |
| Shortlisted | `#8B5CF6` (Purple) |
| Interviewed | `#06B6D4` (Cyan) |
| Selected | `#10B981` (Green) |
| Rejected | `#EF4444` (Red) |

---

## Widget Summary Count

| Widget Type | Count |
|-------------|-------|
| Text | ~12 |
| Input | 3 |
| Select | 2 |
| MultiSelect | 2 |
| Table | 1 |
| Button | 2 |
| Modal | 1 |
| **Total** | **~23 widgets** |

This is well within Appsmith's free tier and keeps the page lightweight.
