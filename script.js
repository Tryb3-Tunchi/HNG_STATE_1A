
const state = {
  title:       "Redesign the onboarding flow for mobile users",
  description: "Audit the current mobile onboarding screens, identify key drop-off points, and propose a simplified 3-step flow that improves activation rate across iOS and Android. Coordinate with the product and design teams to validate assumptions, run usability tests on at least 5 participants, and deliver a high-fidelity Figma prototype by end of sprint.",
  priority:    "High",
  status:      "In Progress",
  dueDate:     new Date("2026-04-18T18:00:00Z"),
  completed:   false,
};

let editSnapshot = null;


const card            = document.getElementById("todo-card");
const viewMode        = document.getElementById("view-mode");
const editMode        = document.getElementById("edit-mode");

const checkbox        = document.querySelector('[data-testid="test-todo-complete-toggle"]');
const titleEl         = document.querySelector('[data-testid="test-todo-title"]');
const descEl          = document.querySelector('[data-testid="test-todo-description"]');
const priorityBadge   = document.getElementById("priority-badge");
const priorityIndicator = document.getElementById("priority-indicator");
const statusBadge     = document.getElementById("status-badge");
const overdueIndicator= document.getElementById("overdue-indicator");
const timeRemainingEl = document.getElementById("time-remaining-el");
const dueDateEl       = document.getElementById("due-date-el");
const expandToggle    = document.getElementById("expand-toggle");
const expandLabel     = document.getElementById("expand-label");
const segBtns         = document.querySelectorAll(".seg-btn");

const editBtn         = document.getElementById("edit-btn");
const deleteBtn       = document.querySelector('[data-testid="test-todo-delete-button"]');
const saveBtn         = document.getElementById("save-btn");
const cancelBtn       = document.getElementById("cancel-btn");

const editTitleInput  = document.getElementById("edit-title-input");
const editDescInput   = document.getElementById("edit-desc-input");
const editPriSelect   = document.getElementById("edit-priority-select");
const editDueDateInput= document.getElementById("edit-due-date-input");

/* ── Helpers ───────────────────────────────────────────── */
const DESC_THRESHOLD = 120; // chars before collapse kicks in

function toLocalDatetimeValue(date) {
  /* Converts Date → "YYYY-MM-DDTHH:MM" for datetime-local input */
  const pad = n => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDueDate(date) {
  return "Due " + date.toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
}

function getTimeRemaining(due) {
  if (state.status === "Done") return { text: "Completed", cls: "done", overdue: false };

  const now  = new Date();
  const diff = due - now;
  const abs  = Math.abs(diff);
  const mins = Math.floor(abs / 60_000);
  const hrs  = Math.floor(abs / 3_600_000);
  const days = Math.floor(abs / 86_400_000);

  if (diff <= 0) {
    let text;
    if (mins < 2)   text = "Due now!";
    else if (hrs < 1) text = `Overdue by ${mins} minute${mins!==1?"s":""}`;
    else if (hrs < 24) text = `Overdue by ${hrs} hour${hrs!==1?"s":""}`;
    else               text = `Overdue by ${days} day${days!==1?"s":""}`;
    return { text, cls: "overdue", overdue: true };
  }

  let text;
  if (mins < 60)   text = `Due in ${mins} minute${mins!==1?"s":""}`;
  else if (hrs < 24) text = `Due in ${hrs} hour${hrs!==1?"s":""}`;
  else if (days===1) text = "Due tomorrow";
  else               text = `Due in ${days} days`;
  return { text, cls: "", overdue: false };
}

/* ── Render ────────────────────────────────────────────── */
function render() {
  /* Title */
  titleEl.textContent = state.title;
  titleEl.classList.toggle("is-done", state.completed);

  /* Description */
  descEl.textContent = state.description;
  descEl.classList.toggle("is-done", state.completed);

  /* Collapse if description is long */
  const isLong = state.description.length > DESC_THRESHOLD;
  if (isLong && expandToggle.getAttribute("aria-expanded") === "false") {
    descEl.classList.add("collapsed");
  }
  expandToggle.style.display = isLong ? "inline-flex" : "none";

  /* Priority badge */
  const p = state.priority.toLowerCase();
  priorityBadge.className = `badge badge--priority priority-badge--${p}`;
  priorityBadge.setAttribute("aria-label", `Priority: ${state.priority}`);
  priorityBadge.innerHTML = `
    <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" aria-hidden="true"><circle cx="4" cy="4" r="4"/></svg>
    ${state.priority}
  `;

  /* Priority indicator bar */
  priorityIndicator.className = `priority-indicator priority--${p}`;

  /* Status badge */
  const statusClass = state.status === "Done" ? "status--done"
                    : state.status === "Pending" ? "status--pending"
                    : "status--in-progress";
  statusBadge.className = `badge ${statusClass}`;
  statusBadge.textContent = state.status;
  statusBadge.setAttribute("aria-label", `Status: ${state.status}`);

  /* Checkbox */
  checkbox.checked = state.completed;

  /* Segmented control */
  segBtns.forEach(btn => {
    const active = btn.dataset.status === state.status;
    btn.classList.toggle("seg--active", active);
    btn.setAttribute("aria-pressed", String(active));
  });

  /* Due date */
  dueDateEl.textContent = formatDueDate(state.dueDate);
  dueDateEl.setAttribute("datetime", state.dueDate.toISOString());

  /* Time remaining + overdue */
  updateTime();
}

function updateTime() {
  const { text, cls, overdue } = getTimeRemaining(state.dueDate);

  timeRemainingEl.textContent = text;
  timeRemainingEl.className   = cls;
  timeRemainingEl.setAttribute("aria-label", "Time remaining: " + text);

  overdueIndicator.classList.toggle("hidden", !overdue);
  card.classList.toggle("is-overdue", overdue);
}

/* ── Expand / Collapse ─────────────────────────────────── */
expandToggle.addEventListener("click", () => {
  const expanded = expandToggle.getAttribute("aria-expanded") === "true";
  expandToggle.setAttribute("aria-expanded", String(!expanded));
  descEl.classList.toggle("collapsed", expanded);
  expandLabel.textContent = expanded ? "Show more" : "Show less";
});

/* ── Checkbox ──────────────────────────────────────────── */
checkbox.addEventListener("change", function () {
  state.completed = this.checked;
  state.status    = this.checked ? "Done" : "Pending";
  render();
});

/* ── Status segmented control ──────────────────────────── */
segBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    state.status    = btn.dataset.status;
    state.completed = state.status === "Done";
    render();
  });
});

/* ── Edit Mode ─────────────────────────────────────────── */
function openEditMode() {
  /* Save snapshot */
  editSnapshot = { ...state, dueDate: new Date(state.dueDate) };

  /* Populate form */
  editTitleInput.value   = state.title;
  editDescInput.value    = state.description;
  editPriSelect.value    = state.priority;
  editDueDateInput.value = toLocalDatetimeValue(state.dueDate);

  /* Swap views */
  viewMode.classList.add("hidden");
  editMode.classList.remove("hidden");

  /* Focus first field */
  editTitleInput.focus();
}

function closeEditMode(save) {
  if (save) {
    state.title       = editTitleInput.value.trim() || state.title;
    state.description = editDescInput.value.trim()  || state.description;
    state.priority    = editPriSelect.value;

    const rawDate = new Date(editDueDateInput.value);
    if (!isNaN(rawDate)) state.dueDate = rawDate;

    /* Reset expand if desc changed */
    expandToggle.setAttribute("aria-expanded", "false");
    descEl.classList.add("collapsed");
    expandLabel.textContent = "Show more";
  } else {
    /* Restore snapshot */
    Object.assign(state, editSnapshot);
    state.dueDate = editSnapshot.dueDate;
  }

  editMode.classList.add("hidden");
  viewMode.classList.remove("hidden");

  render();

  /* Return focus to edit button */
  editBtn.focus();
}

editBtn.addEventListener("click", openEditMode);
saveBtn.addEventListener("click", () => closeEditMode(true));
cancelBtn.addEventListener("click", () => closeEditMode(false));

/* Trap basic focus inside edit form: Escape = cancel */
editMode.addEventListener("keydown", e => {
  if (e.key === "Escape") closeEditMode(false);
});

/* ── Delete ────────────────────────────────────────────── */
deleteBtn.addEventListener("click", () => alert("Delete clicked"));


render();
setInterval(updateTime, 30_000);
