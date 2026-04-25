# Product Note — Design Decisions & Approach

I went with a single-page layout because I thought about how a recruiter would actually use this — they're scanning through candidates quickly and don't want to navigate back and forth between pages. The filters sit in a horizontal strip at the top so they're always visible, and the table takes up most of the screen since that's where the real work happens.

For the filters, I used multi-select for Status and Skills (since recruiters often want to see "New + Screening" together) and a simple min-max input for YOE instead of a slider, because number inputs are more precise when you know exactly what range you want. Location is a single-select dropdown since teams usually hire for one city at a time.

I used static JSON as the data source because it was the fastest way to get a working prototype, and the assignment said persistence wasn't required. The status update works in-memory through a JSObject — it updates instantly but resets on refresh. In a real setup, I'd swap the JSON for a Google Sheet data source or connect to a REST API, which Appsmith makes pretty straightforward.

**Assumptions I made:**
- Skills filter uses OR logic (show candidates with *any* of the selected skills), not AND. I figured a recruiter casting a wide net would prefer this.
- The detail view is a modal rather than a side panel — quicker to open and close when you're reviewing multiple candidates.
- I kept the table to 6–7 columns to avoid horizontal scrolling, with the full details available in the modal.

**What I'd improve with more time:**
- Add server-side pagination and sorting for larger datasets
- Add a confirmation dialog before status changes to prevent accidental updates
- Include a status change history / audit log per candidate
- Make the skills filter support AND/OR toggle so the recruiter can choose
- Add inline column sorting and filter result count badge
