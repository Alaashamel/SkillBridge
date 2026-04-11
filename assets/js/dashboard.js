/**
 * dashboard.js — Dashboard Page Module
 *
 * Handles: stat card rendering, skill grid,
 * filter chips, and the "Add Skill" flow.
 */

const Dashboard = (() => {

  // ── Render full dashboard ──────────────────────
  function render() {
    _renderStats();
    _renderGrid();
    _updateNavBadge();
  }

  // ── Stats row ──────────────────────────────────
  function _renderStats() {
    const skills      = State.skills;
    const total       = skills.length;
    const completed   = skills.filter(s => State.getProgress(s) === 100).length;
    const inProgress  = skills.filter(s => {
      const p = State.getProgress(s);
      return p > 0 && p < 100;
    }).length;
    const notStarted  = skills.filter(s => State.getProgress(s) === 0).length;

    _setText('stat-total',      total);
    _setText('stat-done',       completed);
    _setText('stat-inprogress', inProgress);
    _setText('stat-notstarted', notStarted);
  }

  function _updateNavBadge() {
    _setText('nav-badge-count', State.skills.length);
  }

  // ── Skills grid ────────────────────────────────
  function _renderGrid() {
    const grid = document.getElementById('skills-grid');
    if (!grid) return;

    let skills = State.skills;

    // Apply active filter
    if (State.currentFilter === 'inprogress') {
      skills = skills.filter(s => {
        const p = State.getProgress(s);
        return p > 0 && p < 100;
      });
    } else if (State.currentFilter === 'done') {
      skills = skills.filter(s => State.getProgress(s) === 100);
    }

    if (!skills.length) {
      grid.innerHTML = _emptyStateHTML();
      return;
    }

    grid.innerHTML = skills.map(s => _skillCardHTML(s)).join('');
  }

  // ── Skill card HTML ────────────────────────────
  function _skillCardHTML(s) {
    const pct      = State.getProgress(s);
    const allSteps = [
      ...s.steps.beginner,
      ...s.steps.intermediate,
      ...s.steps.advanced,
    ];
    const total    = allSteps.length;
    const done     = allSteps.filter(st => st.done).length;
    const iconBg   = State.ICON_COLORS[s.icon] || State.DEFAULT_ICON_BG;
    const barClass = pct === 100 ? 'full' : '';
    const diffClass = {
      Beginner:     'diff-beginner',
      Intermediate: 'diff-intermediate',
      Advanced:     'diff-advanced',
    }[s.difficulty] || '';

    const dots = allSteps.map((st, i) => {
      const cls = st.done ? 'done' : (i === done ? 'current' : '');
      return `<div class="step-dot ${cls}"></div>`;
    }).join('');

    const stepsPreview = total
      ? `<div class="step-dots">${dots}</div>`
      : `<span style="opacity:.5;font-size:12px">No steps yet — click to add your roadmap</span>`;

    return `
      <div class="skill-card" onclick="Router.goDetail('${s.id}')">
        <div class="skill-card-top">
          <div style="display:flex;align-items:center;gap:12px">
            <div class="skill-icon-wrap" style="background:${iconBg}">${s.icon}</div>
            <div class="skill-name">${UI.escHTML(s.name)}</div>
          </div>
          <button
            class="skill-card-menu"
            onclick="event.stopPropagation(); UI.openContextMenu(event, '${s.id}')"
            aria-label="Options">
            <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5"  r="1.5"/>
              <circle cx="12" cy="12" r="1.5"/>
              <circle cx="12" cy="19" r="1.5"/>
            </svg>
          </button>
        </div>

        <div class="skill-meta">
          <span class="skill-cat">${UI.escHTML(s.category)}</span>
          <span class="skill-diff ${diffClass}">${s.difficulty}</span>
        </div>

        <div class="progress-wrap">
          <div class="progress-bar-track">
            <div class="progress-bar-fill ${barClass}" style="width:${pct}%"></div>
          </div>
          <div class="progress-text">
            <span>${done} of ${total} steps</span>
            <span class="progress-pct">${pct}%</span>
          </div>
        </div>

        <div class="skill-steps-preview">${stepsPreview}</div>
      </div>`;
  }

  // ── Empty state HTML ───────────────────────────
  function _emptyStateHTML() {
    const isFiltered = State.currentFilter !== 'all';
    return `
      <div class="empty-state">
        <span class="empty-icon">${isFiltered ? '🔍' : '🗺️'}</span>
        <div class="empty-title">
          ${isFiltered ? 'No skills match this filter' : 'No skills yet'}
        </div>
        <div class="empty-sub">
          ${isFiltered
            ? 'Try switching to "All" to see everything.'
            : 'Start building your learning roadmap by adding your first skill.'}
        </div>
        ${!isFiltered
          ? `<button class="btn btn-primary" onclick="UI.openModal('modal-add-skill')">
               <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                 <path d="M12 5v14M5 12h14"/>
               </svg>
               Add Your First Skill
             </button>`
          : ''}
      </div>`;
  }

  // ── Filter chips ───────────────────────────────
  function setFilter(type, chipEl) {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chipEl.classList.add('active');
    State.currentFilter = type;
    _renderGrid();
  }

  // ── Utility ────────────────────────────────────
  function _setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  // ── Public API ─────────────────────────────────
  return { render, setFilter };

})();

/* ── Skill creation actions ──────────────────── */
const SkillActions = {

  /** Open the Add Skill modal and reset its fields. */
  open() {
    document.getElementById('skill-name-input').value = '';
    document.getElementById('skill-category').value   = 'Tech';
    document.getElementById('skill-difficulty').value = 'Beginner';
    UI.resetIconPicker();
    UI.openModal('modal-add-skill');
    setTimeout(() => document.getElementById('skill-name-input')?.focus(), 120);
  },

  /** Save the new skill from the modal form. */
  save() {
    const name = document.getElementById('skill-name-input')?.value.trim();
    if (!name) {
      UI.toast('Please enter a skill name', 'error');
      return;
    }

    const skill = {
      id:         `skill-${Date.now()}`,
      name,
      icon:       State.selectedIcon,
      category:   document.getElementById('skill-category').value,
      difficulty: document.getElementById('skill-difficulty').value,
      createdAt:  new Date().toISOString(),
      steps: { beginner: [], intermediate: [], advanced: [] },
    };

    State.addSkill(skill);
    UI.closeModal('modal-add-skill');
    Dashboard.render();
    UI.toast(`"${name}" added to your skills!`, 'success');
  },

  /** Delete a skill by ID. */
  delete(id) {
    const skill = State.findSkill(id);
    if (!skill) return;
    State.removeSkill(id);
    Dashboard.render();
    UI.toast(`"${skill.name}" deleted`, 'success');
  },
};
