/* ===================================================================
   CANDIDATE CRM DASHBOARD — Application Logic
   =================================================================== */

const STATUS_OPTIONS = ["New", "Screening", "Shortlisted", "Interviewed", "Selected", "Rejected"];

const STATUS_COLORS = {
  "New":         "#3b82f6",
  "Screening":   "#f59e0b",
  "Shortlisted": "#8b5cf6",
  "Interviewed": "#06b6d4",
  "Selected":    "#10b981",
  "Rejected":    "#ef4444"
};

const state = {
  allCandidates: [],
  filteredCandidates: [],
  filters: {
    search: "",
    statuses: new Set(),
    yoeMin: "",
    yoeMax: "",
    location: "",
    skills: new Set(),
  },
  sort: {
    key: "name",
    dir: "asc",
  },
  selectedCandidateId: null,
};

let refs = {};

document.addEventListener("DOMContentLoaded", async () => {
  // Capture DOM references after page load
  refs = {
    statusCards: document.getElementById("statusCards"),
    searchInput: document.getElementById("searchInput"),
    searchClear: document.getElementById("searchClear"),
    filterStatus: document.getElementById("filterStatus"),
    yoeMin: document.getElementById("yoeMin"),
    yoeMax: document.getElementById("yoeMax"),
    filterLocation: document.getElementById("filterLocation"),
    filterSkills: document.getElementById("filterSkills"),
    btnResetFilters: document.getElementById("btnResetFilters"),
    activeFilters: document.getElementById("activeFilters"),
    resultsCount: document.getElementById("resultsCount"),
    tableBody: document.getElementById("tableBody"),
    candidateTable: document.getElementById("candidateTable"),
    emptyState: document.getElementById("emptyState"),
    btnEmptyReset: document.getElementById("btnEmptyReset"),
    tableHeaders: Array.from(document.querySelectorAll(".table__th[data-sort]")),
    panelOverlay: document.getElementById("panelOverlay"),
    detailPanel: document.getElementById("detailPanel"),
    panelHeader: document.getElementById("panelHeader"),
    panelBody: document.getElementById("panelBody"),
    panelFooter: document.getElementById("panelFooter"),
    toastContainer: document.getElementById("toastContainer"),
  };

  await loadData();
  setupBaseEvents();
  createFilterDropdowns();
  applyFiltersAndRender();
});

// ===== Data Loading =====
async function loadData() {
  try {
    const response = await fetch("./mock_candidates.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.allCandidates = await response.json();
  } catch (error) {
    console.error("Failed to load mock data:", error);
    showToast("Unable to load candidate data. Check file paths.", "warning");
    state.allCandidates = [];
  }
}

// ===== Event Setup =====
function setupBaseEvents() {
  // Search with debounce
  const debouncedSearch = debounce((value) => {
    state.filters.search = value.trim().toLowerCase();
    applyFiltersAndRender();
  }, 220);

  refs.searchInput.addEventListener("input", (event) => {
    const value = event.target.value;
    refs.searchClear.classList.toggle("visible", value.length > 0);
    debouncedSearch(value);
  });

  refs.searchClear.addEventListener("click", () => {
    refs.searchInput.value = "";
    refs.searchClear.classList.remove("visible");
    state.filters.search = "";
    applyFiltersAndRender();
    refs.searchInput.focus();
  });

  // YOE inputs with debounce
  refs.yoeMin.addEventListener("input", debounce(() => {
    state.filters.yoeMin = refs.yoeMin.value;
    applyFiltersAndRender();
  }, 300));

  refs.yoeMax.addEventListener("input", debounce(() => {
    state.filters.yoeMax = refs.yoeMax.value;
    applyFiltersAndRender();
  }, 300));

  // Reset
  refs.btnResetFilters.addEventListener("click", resetAllFilters);
  refs.btnEmptyReset.addEventListener("click", resetAllFilters);

  // Overlay closes panel
  refs.panelOverlay.addEventListener("click", closeDetailPanel);

  // Sortable headers
  refs.tableHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const key = header.dataset.sort;
      if (state.sort.key === key) {
        state.sort.dir = state.sort.dir === "asc" ? "desc" : "asc";
      } else {
        state.sort.key = key;
        state.sort.dir = "asc";
      }
      applyFiltersAndRender();
    });
  });

  // Escape to close
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (refs.detailPanel.classList.contains("open")) {
        closeDetailPanel();
      } else {
        closeAllDropdowns();
      }
    }
  });

  // Click outside to close dropdowns
  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-dropdown-id]")) {
      closeAllDropdowns();
    }
  });
}

// ===== Filter Dropdowns =====
function createFilterDropdowns() {
  const locations = unique(state.allCandidates.map((c) => c.current_location)).sort();
  const skills = unique(state.allCandidates.flatMap((c) => c.skills || [])).sort();

  createDropdown({
    mount: refs.filterStatus,
    id: "statusDropdown",
    label: "Status",
    placeholder: "All Statuses",
    options: STATUS_OPTIONS,
    multi: true,
    onChange: (selectedValues) => {
      state.filters.statuses = new Set(selectedValues);
      applyFiltersAndRender();
    },
  });

  createDropdown({
    mount: refs.filterLocation,
    id: "locationDropdown",
    label: "Location",
    placeholder: "All Locations",
    options: locations,
    multi: false,
    onChange: (selectedValues) => {
      state.filters.location = selectedValues[0] || "";
      applyFiltersAndRender();
    },
  });

  createDropdown({
    mount: refs.filterSkills,
    id: "skillsDropdown",
    label: "Skills",
    placeholder: "All Skills",
    options: skills,
    multi: true,
    onChange: (selectedValues) => {
      state.filters.skills = new Set(selectedValues);
      applyFiltersAndRender();
    },
  });
}

// ===== Core Filter + Render Pipeline =====
function applyFiltersAndRender() {
  let data = [...state.allCandidates];
  const { search, statuses, yoeMin, yoeMax, location, skills } = state.filters;

  // Search by name or email
  if (search) {
    data = data.filter((c) => {
      return (c.name || "").toLowerCase().includes(search) ||
             (c.email || "").toLowerCase().includes(search);
    });
  }

  // Status multi-select (OR logic)
  if (statuses.size > 0) {
    data = data.filter((c) => statuses.has(c.current_status));
  }

  // YOE range
  const min = yoeMin !== "" ? Number(yoeMin) : null;
  const max = yoeMax !== "" ? Number(yoeMax) : null;
  if (Number.isFinite(min)) data = data.filter((c) => Number(c.years_of_experience) >= min);
  if (Number.isFinite(max)) data = data.filter((c) => Number(c.years_of_experience) <= max);

  // Location single-select
  if (location) data = data.filter((c) => c.current_location === location);

  // Skills multi-select (OR logic - match at least one)
  if (skills.size > 0) {
    data = data.filter((c) => {
      const candidateSkills = c.skills || [];
      return Array.from(skills).some((skill) => candidateSkills.includes(skill));
    });
  }

  // Sort
  data.sort((a, b) => compareByKey(a, b, state.sort.key, state.sort.dir));
  state.filteredCandidates = data;

  // Render everything
  renderSortHeaders();
  renderStatusCards();
  renderResultsCount();
  renderActiveFilters();
  renderTable();
}

// ===== Render: Status Summary Cards =====
function renderStatusCards() {
  const totalCounts = {};
  STATUS_OPTIONS.forEach((s) => totalCounts[s] = 0);
  state.allCandidates.forEach((c) => {
    if (totalCounts[c.current_status] !== undefined) totalCounts[c.current_status]++;
  });

  refs.statusCards.innerHTML = STATUS_OPTIONS.map((status) => {
    const isActive = state.filters.statuses.has(status);
    const color = STATUS_COLORS[status] || "#64748b";
    return `
      <div class="status-card ${isActive ? "active" : ""}" data-status="${escapeAttr(status)}" role="button" tabindex="0" title="Filter by ${status}">
        <span class="status-card__dot" style="background: ${color}"></span>
        <span class="status-card__label">${escapeHtml(status)}</span>
        <span class="status-card__count">${totalCounts[status]}</span>
      </div>
    `;
  }).join("");

  // Attach click handlers
  refs.statusCards.querySelectorAll(".status-card").forEach((card) => {
    card.addEventListener("click", () => {
      const status = card.dataset.status;
      if (state.filters.statuses.has(status)) {
        state.filters.statuses.delete(status);
      } else {
        state.filters.statuses.add(status);
      }
      syncDropdownValue("statusDropdown", Array.from(state.filters.statuses));
      applyFiltersAndRender();
    });
  });
}

// ===== Render: Results Count =====
function renderResultsCount() {
  const total = state.allCandidates.length;
  const shown = state.filteredCandidates.length;
  if (shown === 0) {
    refs.resultsCount.innerHTML = `No candidates match your current filters`;
  } else {
    refs.resultsCount.innerHTML = `Showing <strong>${shown}</strong> of <strong>${total}</strong> candidates`;
  }
}

// ===== Render: Active Filter Tags =====
function renderActiveFilters() {
  const tags = [];

  if (state.filters.search) {
    tags.push({ key: "search", label: `Search: "${state.filters.search}"` });
  }
  state.filters.statuses.forEach((status) => {
    tags.push({ key: "status", value: status, label: `Status: ${status}` });
  });
  if (state.filters.yoeMin !== "") {
    tags.push({ key: "yoeMin", label: `Min YOE: ${state.filters.yoeMin}` });
  }
  if (state.filters.yoeMax !== "") {
    tags.push({ key: "yoeMax", label: `Max YOE: ${state.filters.yoeMax}` });
  }
  if (state.filters.location) {
    tags.push({ key: "location", label: `Location: ${state.filters.location}` });
  }
  state.filters.skills.forEach((skill) => {
    tags.push({ key: "skill", value: skill, label: `Skill: ${skill}` });
  });

  refs.activeFilters.innerHTML = tags.map((tag) => `
    <span class="filter-tag" data-key="${escapeAttr(tag.key)}" data-value="${escapeAttr(tag.value || "")}">
      ${escapeHtml(tag.label)}
      <button class="filter-tag__remove" type="button" title="Remove filter" aria-label="Remove ${escapeAttr(tag.label)}">&times;</button>
    </span>
  `).join("");

  // Attach remove handlers
  refs.activeFilters.querySelectorAll(".filter-tag__remove").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const tagEl = btn.closest(".filter-tag");
      removeFilterTag(tagEl.dataset.key, tagEl.dataset.value);
      applyFiltersAndRender();
    });
  });
}

function removeFilterTag(key, value) {
  switch (key) {
    case "search":
      state.filters.search = "";
      refs.searchInput.value = "";
      refs.searchClear.classList.remove("visible");
      break;
    case "status":
      state.filters.statuses.delete(value);
      syncDropdownValue("statusDropdown", Array.from(state.filters.statuses));
      break;
    case "yoeMin":
      state.filters.yoeMin = "";
      refs.yoeMin.value = "";
      break;
    case "yoeMax":
      state.filters.yoeMax = "";
      refs.yoeMax.value = "";
      break;
    case "location":
      state.filters.location = "";
      syncDropdownValue("locationDropdown", []);
      break;
    case "skill":
      state.filters.skills.delete(value);
      syncDropdownValue("skillsDropdown", Array.from(state.filters.skills));
      break;
  }
}

// ===== Render: Candidate Table =====
function renderTable() {
  if (state.filteredCandidates.length === 0) {
    refs.tableBody.innerHTML = "";
    refs.candidateTable.style.display = "none";
    refs.emptyState.classList.add("visible");
    return;
  }

  refs.candidateTable.style.display = "";
  refs.emptyState.classList.remove("visible");

  refs.tableBody.innerHTML = state.filteredCandidates.map((c, index) => {
    const slug = statusToSlug(c.current_status);
    const delay = Math.min(index * 0.02, 0.3);
    return `
      <tr class="table__row" data-id="${c.id}" style="animation-delay:${delay}s" title="Click to view ${escapeAttr(c.name)}">
        <td class="table__td table__td--name">${escapeHtml(c.name)}</td>
        <td class="table__td">${escapeHtml(c.email)}</td>
        <td class="table__td">${escapeHtml(c.primary_role)}</td>
        <td class="table__td table__td--center">${c.years_of_experience}</td>
        <td class="table__td">${escapeHtml(c.current_location)}</td>
        <td class="table__td table__td--center">
          <span class="badge-status badge-status--${slug}">
            <span class="badge-status__dot"></span>
            ${escapeHtml(c.current_status)}
          </span>
        </td>
        <td class="table__td"><span class="badge-source">${escapeHtml(c.source)}</span></td>
      </tr>
    `;
  }).join("");

  // Attach row click handlers
  refs.tableBody.querySelectorAll(".table__row").forEach((row) => {
    row.addEventListener("click", () => openDetailPanel(Number(row.dataset.id)));
  });
}

// ===== Render: Sort Header Indicators =====
function renderSortHeaders() {
  refs.tableHeaders.forEach((header) => {
    header.classList.remove("sort-asc", "sort-desc");
    if (header.dataset.sort === state.sort.key) {
      header.classList.add(state.sort.dir === "asc" ? "sort-asc" : "sort-desc");
    }
  });
}

// ===== Detail Panel =====
function openDetailPanel(candidateId) {
  const candidate = state.allCandidates.find((c) => c.id === candidateId);
  if (!candidate) return;
  state.selectedCandidateId = candidateId;

  const slug = statusToSlug(candidate.current_status);

  // Header
  refs.panelHeader.innerHTML = `
    <div class="panel__header-info">
      <h2 class="panel__name">${escapeHtml(candidate.name)}</h2>
      <p class="panel__role">${escapeHtml(candidate.primary_role)} · ${escapeHtml(candidate.current_location)}</p>
    </div>
    <button class="panel__close" id="panelCloseBtn" type="button" aria-label="Close panel">&times;</button>
  `;

  // Body
  refs.panelBody.innerHTML = `
    <section class="panel__section">
      <h3 class="panel__section-title">Contact Information</h3>
      ${renderField("Email", candidate.email)}
      ${renderField("Phone", candidate.phone || "N/A", !candidate.phone)}
    </section>

    <section class="panel__section">
      <h3 class="panel__section-title">Professional Details</h3>
      ${renderField("Experience", `${candidate.years_of_experience} year${candidate.years_of_experience !== 1 ? "s" : ""}`)}
      ${renderField("Role", candidate.primary_role)}
      ${renderField("Location", candidate.current_location)}
      ${renderField("Source", candidate.source)}
      <div class="panel__field">
        <span class="panel__field-label">Status</span>
        <span class="panel__field-value">
          <span class="badge-status badge-status--${slug}">
            <span class="badge-status__dot"></span>
            ${escapeHtml(candidate.current_status)}
          </span>
        </span>
      </div>
    </section>

    <section class="panel__section">
      <h3 class="panel__section-title">Skills</h3>
      <div class="panel__skills-list">
        ${(candidate.skills || []).map((s) => `<span class="skill-tag">${escapeHtml(s)}</span>`).join("")}
      </div>
    </section>

    <section class="panel__section">
      <h3 class="panel__section-title">Notes</h3>
      <div class="panel__notes ${candidate.notes ? "" : "panel__notes--empty"}">
        ${escapeHtml(candidate.notes || "No notes available for this candidate.")}
      </div>
    </section>
  `;

  // Footer — Status Update
  refs.panelFooter.innerHTML = `
    <p class="panel__footer-title">Update Status</p>
    <div class="panel__status-row">
      <select class="panel__status-select" id="panelStatusSelect">
        ${STATUS_OPTIONS.map((s) => `<option value="${escapeAttr(s)}" ${candidate.current_status === s ? "selected" : ""}>${escapeHtml(s)}</option>`).join("")}
      </select>
      <button class="btn btn--primary" id="panelSaveStatusBtn" type="button">Update</button>
    </div>
  `;

  // Attach events
  document.getElementById("panelCloseBtn").addEventListener("click", closeDetailPanel);
  document.getElementById("panelSaveStatusBtn").addEventListener("click", () => {
    const newStatus = document.getElementById("panelStatusSelect").value;
    updateCandidateStatus(candidateId, newStatus);
  });

  // Open panel
  refs.panelOverlay.classList.add("open");
  refs.detailPanel.classList.add("open");
  document.body.style.overflow = "hidden";
}

function renderField(label, value, muted = false) {
  return `
    <div class="panel__field">
      <span class="panel__field-label">${escapeHtml(label)}</span>
      <span class="panel__field-value ${muted ? "panel__field-value--muted" : ""}">${escapeHtml(String(value))}</span>
    </div>
  `;
}

function closeDetailPanel() {
  refs.panelOverlay.classList.remove("open");
  refs.detailPanel.classList.remove("open");
  document.body.style.overflow = "";
  state.selectedCandidateId = null;
}

function updateCandidateStatus(candidateId, newStatus) {
  const candidate = state.allCandidates.find((c) => c.id === candidateId);
  if (!candidate) return;

  const oldStatus = candidate.current_status;
  if (newStatus === oldStatus) {
    showToast(`Status is already "${newStatus}"`, "info");
    closeDetailPanel();
    return;
  }

  candidate.current_status = newStatus;
  closeDetailPanel();
  applyFiltersAndRender();
  showToast(`${candidate.name}: ${oldStatus} → ${newStatus}`, "success");
}

// ===== Reset All Filters =====
function resetAllFilters() {
  state.filters.search = "";
  state.filters.statuses.clear();
  state.filters.yoeMin = "";
  state.filters.yoeMax = "";
  state.filters.location = "";
  state.filters.skills.clear();

  refs.searchInput.value = "";
  refs.searchClear.classList.remove("visible");
  refs.yoeMin.value = "";
  refs.yoeMax.value = "";

  syncDropdownValue("statusDropdown", []);
  syncDropdownValue("locationDropdown", []);
  syncDropdownValue("skillsDropdown", []);

  showToast("All filters cleared", "info");
  applyFiltersAndRender();
}

// ===== Custom Dropdown Component =====
function createDropdown({ mount, id, label, placeholder, options, multi, onChange }) {
  const selected = new Set();

  mount.innerHTML = `
    <label class="filter-label">${escapeHtml(label)}</label>
    <div class="dropdown" data-dropdown-id="${id}">
      <button class="dropdown__trigger" type="button" aria-haspopup="listbox" aria-expanded="false">
        <span class="dropdown__text">${escapeHtml(placeholder)}</span>
        <span class="dropdown__badge" style="display:none;">0</span>
        <svg class="dropdown__arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="dropdown__menu" role="listbox">
        <div class="dropdown__menu-header">
          <span class="dropdown__menu-title">${escapeHtml(label)}</span>
          <button class="dropdown__clear-btn" type="button">Clear</button>
        </div>
        <div class="dropdown__menu-options">
          ${options.map((opt) => renderDropdownOption(opt, multi)).join("")}
        </div>
      </div>
    </div>
  `;

  const dropdown = mount.querySelector(".dropdown");
  const trigger = dropdown.querySelector(".dropdown__trigger");
  const menu = dropdown.querySelector(".dropdown__menu");
  const textEl = dropdown.querySelector(".dropdown__text");
  const badgeEl = dropdown.querySelector(".dropdown__badge");
  const clearBtn = dropdown.querySelector(".dropdown__clear-btn");
  const optionEls = Array.from(dropdown.querySelectorAll(".dropdown__option"));

  function updateView(fireOnChange = true) {
    const arr = Array.from(selected);
    const hasSelection = arr.length > 0;

    if (!hasSelection) {
      textEl.textContent = placeholder;
      badgeEl.style.display = "none";
      trigger.classList.remove("has-value");
    } else if (multi) {
      textEl.textContent = `${arr.length} selected`;
      badgeEl.textContent = arr.length;
      badgeEl.style.display = "inline-flex";
      trigger.classList.add("has-value");
    } else {
      textEl.textContent = arr[0];
      badgeEl.style.display = "none";
      trigger.classList.add("has-value");
    }

    // Sync option visual states
    optionEls.forEach((el) => {
      el.classList.toggle("selected", selected.has(el.dataset.value));
    });

    if (fireOnChange) onChange(arr);
  }

  // Option click
  optionEls.forEach((optionEl) => {
    optionEl.addEventListener("click", (e) => {
      e.stopPropagation();
      const value = optionEl.dataset.value;
      if (multi) {
        if (selected.has(value)) selected.delete(value);
        else selected.add(value);
      } else {
        const wasSelected = selected.has(value);
        selected.clear();
        if (!wasSelected) selected.add(value);
        closeDropdown(dropdown);
      }
      updateView();
    });
  });

  // Toggle dropdown
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown(dropdown);
  });

  // Clear button
  clearBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    selected.clear();
    updateView();
  });

  // External setter for syncing from status cards / filter tag removal
  dropdown.__setValues = (values) => {
    selected.clear();
    (values || []).forEach((v) => { if (options.includes(v)) selected.add(v); });
    updateView(false); // Don't fire onChange to avoid infinite loop
  };

  dropdown.__placeholder = placeholder;
}

function renderDropdownOption(option, multi) {
  const indicator = multi
    ? `<span class="dropdown__checkbox"><span class="dropdown__checkbox-icon">✓</span></span>`
    : `<span class="dropdown__radio"><span class="dropdown__radio-dot"></span></span>`;
  return `
    <div class="dropdown__option" role="option" data-value="${escapeAttr(option)}">
      ${indicator}
      <span>${escapeHtml(option)}</span>
    </div>
  `;
}

function syncDropdownValue(dropdownId, values) {
  const dropdown = document.querySelector(`[data-dropdown-id="${dropdownId}"]`);
  if (dropdown && typeof dropdown.__setValues === "function") {
    dropdown.__setValues(values);
  }
}

function toggleDropdown(dropdown) {
  const menu = dropdown.querySelector(".dropdown__menu");
  const trigger = dropdown.querySelector(".dropdown__trigger");
  const isOpen = menu.classList.contains("open");

  closeAllDropdowns();

  if (!isOpen) {
    trigger.classList.add("active");
    trigger.setAttribute("aria-expanded", "true");
    menu.classList.add("open");
  }
}

function closeDropdown(dropdown) {
  if (!dropdown) return;
  const menu = dropdown.querySelector(".dropdown__menu");
  const trigger = dropdown.querySelector(".dropdown__trigger");
  if (menu) menu.classList.remove("open");
  if (trigger) {
    trigger.classList.remove("active");
    trigger.setAttribute("aria-expanded", "false");
  }
}

function closeAllDropdowns() {
  document.querySelectorAll("[data-dropdown-id]").forEach((d) => closeDropdown(d));
}

// ===== Sorting =====
function compareByKey(a, b, key, direction) {
  const left = a[key];
  const right = b[key];
  let cmp = 0;
  if (typeof left === "number" && typeof right === "number") {
    cmp = left - right;
  } else {
    cmp = String(left || "").localeCompare(String(right || ""), undefined, { sensitivity: "base" });
  }
  return direction === "asc" ? cmp : -cmp;
}

// ===== Toast Notifications =====
function showToast(message, variant = "info") {
  const icons = { success: "✅", info: "ℹ️", warning: "⚠️" };
  const toast = document.createElement("div");
  toast.className = `toast toast--${variant}`;
  toast.innerHTML = `
    <span class="toast__icon">${icons[variant] || "ℹ️"}</span>
    <span>${escapeHtml(message)}</span>
  `;
  refs.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("removing");
    toast.addEventListener("animationend", () => toast.remove());
  }, 3000);
}

// ===== Utility Functions =====
function unique(items) {
  return Array.from(new Set(items.filter(Boolean)));
}

function statusToSlug(status) {
  return String(status || "").toLowerCase().replace(/\s+/g, "-");
}

function debounce(fn, wait) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
}
