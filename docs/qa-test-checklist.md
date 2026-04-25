# QA Test Checklist — Candidate CRM Dashboard

> Scenario-based checklist written from the perspective of someone who's actually clicked through the app and looked for real gaps.

---

## 1. Search Functionality

| # | Scenario | Expected Result |
|---|----------|-----------------|
| S1 | Type a candidate's full name (e.g., "Ananya Sharma") in the search box | Only that candidate appears in the table |
| S2 | Type a partial name (e.g., "rah") | All candidates whose name contains "rah" are shown (e.g., Rahul) |
| S3 | Search by email (e.g., "arif.khan") | Candidate with matching email appears |
| S4 | Type something that matches no one (e.g., "zzzzz") | Table shows empty state / "No candidates found" message |
| S5 | Search is case-insensitive: type "ANANYA" | Same result as typing "ananya" |
| S6 | Clear the search box after searching | Full candidate list is restored |
| S7 | Type a search term, then apply a filter on top | Both search AND filter should apply together (AND logic) |

---

## 2. Filter — Status (Multi-Select)

| # | Scenario | Expected Result |
|---|----------|-----------------|
| F1 | Select a single status (e.g., "New") | Only candidates with status "New" are shown |
| F2 | Select multiple statuses (e.g., "New" + "Screening") | Candidates with either status are shown (OR within status filter) |
| F3 | Select all 6 statuses | Same as no filter — all candidates visible |
| F4 | Deselect all statuses after selecting some | Full list is restored (no status filter active) |
| F5 | Select "Selected" status | Only the candidate(s) marked as Selected appear (verify it's Vikram Joshi) |

---

## 3. Filter — Years of Experience (Min–Max)

| # | Scenario | Expected Result |
|---|----------|-----------------|
| Y1 | Set Min YOE = 3, leave Max empty | All candidates with YOE ≥ 3 shown |
| Y2 | Leave Min empty, set Max YOE = 2 | All candidates with YOE ≤ 2 shown |
| Y3 | Set Min = 3, Max = 5 | Candidates with 3, 4, or 5 YOE shown |
| Y4 | Set Min = 0, Max = 0 | Only the fresher (Kavitha, 0 YOE) appears |
| Y5 | Set Min = 15 | No candidates found (max in data is 10) |
| Y6 | Set Min = 5, Max = 2 (impossible range) | No candidates shown OR validation error appears |

---

## 4. Filter — Location (Dropdown)

| # | Scenario | Expected Result |
|---|----------|-----------------|
| L1 | Select "Bangalore" | Only Bangalore-based candidates shown |
| L2 | Select "Chennai" → then switch to "Delhi" | Table updates to show only Delhi candidates |
| L3 | Clear the location selection | Full list restored |
| L4 | Select a location + a status filter together | Both filters apply (AND logic) |

---

## 5. Filter — Skills (Multi-Select)

| # | Scenario | Expected Result |
|---|----------|-----------------|
| SK1 | Select "API Testing" | All candidates who have "API Testing" in their skills array are shown |
| SK2 | Select "API Testing" + "Cypress" | Candidates who have either skill (OR logic) are shown |
| SK3 | Select "Appsmith" | Only Mohammed Arif Khan appears (he's the only one with this skill) |
| SK4 | Verify the skills dropdown has no duplicates | Each skill appears only once in the dropdown options |
| SK5 | Select a rare skill (e.g., "Docker") | Only Vikram Joshi appears |

---

## 6. Reset All Filters

| # | Scenario | Expected Result |
|---|----------|-----------------|
| R1 | Apply search + 2 filters, then click "Reset All Filters" | All inputs are cleared, full candidate list is restored |
| R2 | Click Reset when no filters are active | No change — app doesn't crash or show errors |
| R3 | After reset, verify the candidate count matches total dataset (14) | Count displays correctly |

---

## 7. Candidate Detail View (Modal)

| # | Scenario | Expected Result |
|---|----------|-----------------|
| D1 | Click on a row in the table | Modal opens showing that candidate's details |
| D2 | Verify all fields are displayed: name, email, phone, YOE, role, location, skills, source, notes | All fields present and correctly populated |
| D3 | Open detail for a candidate with `phone: null` (e.g., Priya Nair) | Phone shows "N/A" instead of "null" or blank |
| D4 | Open detail for a candidate with empty notes (e.g., Priya Nair) | Notes shows "No notes available" or similar fallback |
| D5 | Close the modal | Modal closes, table is still in the same state (filters preserved) |

---

## 8. Status Update

| # | Scenario | Expected Result |
|---|----------|-----------------|
| U1 | Open a candidate, change status from "New" to "Screening", click Update | Success alert shown, modal closes |
| U2 | After status update, verify the table reflects the new status | Updated status visible in the table row |
| U3 | Apply a status filter, update a candidate's status to something outside the filter | Candidate disappears from filtered view (correct behavior) |
| U4 | Refresh the page after a status update | Status resets to original (expected for in-memory — document this as known limitation) |
| U5 | Update status to the same value it already is | No error; app handles gracefully |

---

## 9. Data Consistency

| # | Scenario | Expected Result |
|---|----------|-----------------|
| DC1 | Count total candidates in the table (no filters) | Matches the JSON dataset count (14) |
| DC2 | Verify candidate IDs are unique | No duplicate IDs in the table |
| DC3 | Verify all status values are from the expected set | No typos or unexpected status strings |
| DC4 | Check that skills are displayed as a readable list, not `["Manual Testing","JIRA"]` | Comma-separated or tag-style display |
| DC5 | Verify email format looks valid for all candidates | All emails contain `@` and a domain |

---

## 10. Edge Cases (5+ as required)

| # | Edge Case | What to test | Expected Result |
|---|-----------|-------------|-----------------|
| E1 | **No results after filtering** | Apply Status = "Selected" + Location = "Delhi" | Table shows empty state with "No candidates found" or similar — NOT a blank table with headers only |
| E2 | **Very long candidate name** | Check display of "Sai Kiran Teja Venkata Ramana Murthy" (id: 12) | Name doesn't overflow, truncates with ellipsis, or wraps cleanly |
| E3 | **Very long email address** | Check display of `arif.khan.qa.automation.engineer@company-email-domain.co.in` (id: 4) | Email doesn't break the table layout |
| E4 | **Candidate with only 1 skill** | Open Neha Kapoor (id: 13) — has only "Manual Testing" | Skills display correctly, no trailing comma or empty tag |
| E5 | **Candidate with 0 years of experience** | Kavitha Sundaram (id: 7) has 0 YOE | Displays as "0" not blank/null; included when Min YOE = 0 |
| E6 | **Candidate with many skills (7 skills)** | Open Arjun D'Souza (id: 14) | All 7 skills are visible/readable, no overflow issues |
| E7 | **Null phone field** | 4 candidates have `phone: null` | Detail view shows "N/A", NOT "null", "undefined", or blank |
| E8 | **Special characters in name** | Arjun D'Souza has an apostrophe in the name | Name renders correctly, search works for "D'Souza" |
| E9 | **Search + filter combination returns zero results** | Search "Ananya" + filter Location = "Mumbai" | Empty state shown (Ananya is in Bangalore, not Mumbai) |
| E10 | **Rapid filter toggling** | Quickly select/deselect multiple status options | Table updates correctly without flicker, stale data, or crashes |

---

## 11. Known Limitations / Bugs to Document

> These should be logged transparently in your submission.

| # | Issue | Type | Notes |
|---|-------|------|-------|
| KL1 | Status update resets on page refresh | Known Limitation | Expected with in-memory/static JSON. Would fix with Google Sheet or API persistence. |
| KL2 | No pagination — all candidates load at once | Known Limitation | Fine for 14 records, but would be an issue at 100+. Would add server-side pagination. |
| KL3 | Skills filter uses OR logic, not AND | Design Decision | If recruiter selects "API Testing" + "Java", candidates with either skill appear. AND logic might be expected in some cases. |
| KL4 | YOE filter doesn't validate min ≤ max | Potential Bug | If user enters Min=5, Max=2, the table just shows empty. Should show a validation message. |
| KL5 | No sorting on table columns | Known Limitation | Appsmith tables support sorting — just not configured in this version. Easy to add. |
| KL6 | No confirmation dialog before status update | UX Gap | Accidental status changes could happen. Would add "Are you sure?" modal with more time. |

---

## Quick Sanity Smoke Test (5 steps)

Use this to quickly verify the app is working after any change:

1. ✅ Page loads — table shows 14 candidates
2. ✅ Type "ananya" in search — 1 result appears
3. ✅ Select Status = "New" — 3 candidates shown (Priya, Kavitha, Sai Kiran)
4. ✅ Click a row — modal opens with correct details
5. ✅ Change status in modal, click Update — table reflects the change
