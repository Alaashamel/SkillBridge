/**
 * detail.js — Skill Detail Page Module
 *
 * Handles rendering the skill hero, circular progress,
 * phase roadmap, and all step CRUD interactions.
 */

const DetailPage = (() => {

  const PHASES = [
    { key: 'beginner',     label: 'Beginner',     cls: 'phase-beginner' },
    { key: 'intermediate', label: 'Intermediate',  cls: 'phase-intermediate' },
    { key: 'advanced',     label: 'Advanced',      cls: 'phase-advanced' },
  ];

  // ── Render ─────────────────────────────────────
  function render(skill) {
    const container = document.getElementById('detail-content');
    if (!container) return;

    container.innerHTML = _heroHTML(skill) + _roadmapHTML(skill);
  }

  // ── Hero block ─────────────────────────────────
  function _heroHTML(skill) {
    const pct      = State.getProgress(skill);
    const allSteps = _allSteps(skill);
    const doneCount = allSteps.filter(s => s.done).length;
    const total     = allSteps.length;

    const R    = 34;
    const circ = +(2 * Math.PI * R).toFixed(2);
    const offset = +(circ - (pct / 100) * circ).toFixed(2);

    const iconBg    = State.ICON_COLORS[skill.icon] || State.DEFAULT_ICON_BG;
    const fillClass = pct === 100 ? 'fill complete' : 'fill';
    const diffClass = {
      Beginner:     'diff-beginner',
      Intermediate: 'diff-intermediate',
      Advanced:     'diff-advanced',
    }[skill.difficulty] || '';

    return `
      <div class="detail-hero">
        <div class="detail-hero-icon" style="background:${iconBg}">
          ${skill.icon}
        </div>
        <div class="detail-hero-info">
          <div class="detail-hero-name">${UI.escHTML(skill.name)}</div>
          <div class="detail-hero-meta">
            <span class="skill-cat">${UI.escHTML(skill.category)}</span>
            <span class="skill-diff ${diffClass}">${skill.difficulty}</span>
            <span style="font-size:12px;color:var(--text-2)">
              ${total} step${total !== 1 ? 's' : ''} · ${doneCount} completed
            </span>
          </div>
        </div>
        <div class="detail-progress-widget">
          <div class="circular-progress">
            <svg width="80" height="80" viewBox="0 0 80 80">
              <circle class="track" cx="40" cy="40" r="${R}"/>
              <circle class="${fillClass}" cx="40" cy="40" r="${R}"
                stroke-dasharray="${circ}"
                stroke-dashoffset="${offset}"/>
            </svg>
            <div class="circular-num">${pct}%</div>
          </div>
          <div class="circular-label">Complete</div>
        </div>
      </div>`;
  }

  // ── Roadmap HTML ───────────────────────────────
  function _roadmapHTML(skill) {
    const groups = PHASES.map(ph => _phaseHTML(skill, ph)).join('');
    return `<div class="roadmap-section">${groups}</div>`;
  }

  function _phaseHTML(skill, ph) {
    const steps     = skill.steps[ph.key];
    const doneCount = steps.filter(s => s.done).length;

    const stepsHTML = steps.map((st, i) => _stepHTML(skill.id, ph.key, st, i)).join('');
    const phaseLabel = {
      beginner:     'Beginner',
      intermediate: 'Intermediate',
      advanced:     'Advanced',
    }[ph.key];

    return `
      <div class="roadmap-group">
        <div class="roadmap-phase-header ${ph.cls}">
          <span class="phase-badge">${ph.label}</span>
          <div class="phase-line"></div>
          <span class="phase-count">${doneCount}/${steps.length}</span>
        </div>

        ${stepsHTML}

        <button class="add-step-btn" onclick="StepActions.openModal('${skill.id}', '${ph.key}')">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Add ${phaseLabel} step
        </button>
      </div>`;
  }

  function _stepHTML(skillId, phase, step, index) {
    const checkedClass = step.done ? 'checked' : '';
    const doneClass    = step.done ? 'done-item' : '';

    return `
      <div class="step-item ${doneClass}">
        <div
          class="step-check ${checkedClass}"
          onclick="StepActions.toggle('${skillId}', '${phase}', ${index})"
          title="${step.done ? 'Mark incomplete' : 'Mark complete'}">
          <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <div class="step-content">
          <div class="step-title">${UI.escHTML(step.title)}</div>
          ${step.desc
            ? `<div class="step-desc">${UI.escHTML(step.desc)}</div>`
            : ''}
        </div>
        <button
          class="step-delete-btn"
          onclick="StepActions.delete('${skillId}', '${phase}', ${index})"
          title="Remove step">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>`;
  }

  // ── Helpers ────────────────────────────────────
  function _allSteps(skill) {
    return [
      ...skill.steps.beginner,
      ...skill.steps.intermediate,
      ...skill.steps.advanced,
    ];
  }

  // ── Public API ─────────────────────────────────
  return { render };

})();

/* ── Step actions ─────────────────────────────── */
const StepActions = {

  /** Open the Add Step modal for a given skill + phase. */
  openModal(skillId, phase) {
    State.currentSkillId = skillId;
    State.pendingPhase   = phase;

    const phaseLabel = {
      beginner:     'Beginner Phase',
      intermediate: 'Intermediate Phase',
      advanced:     'Advanced Phase',
    }[phase] || phase;

    const phaseEl = document.getElementById('step-modal-phase');
    if (phaseEl) phaseEl.textContent = phaseLabel;

    document.getElementById('step-title-input').value = '';
    document.getElementById('step-desc-input').value  = '';

    UI.openModal('modal-add-step');
    setTimeout(() => document.getElementById('step-title-input')?.focus(), 120);
  },

  /** Save the new step from the modal. */
  save() {
    const title = document.getElementById('step-title-input')?.value.trim();
    if (!title) {
      UI.toast('Please enter a step title', 'error');
      return;
    }

    const skillId = State.currentSkillId;
    const phase   = State.pendingPhase;
    const desc    = document.getElementById('step-desc-input')?.value.trim();

    State.addStep(skillId, phase, { title, desc, done: false });

    UI.closeModal('modal-add-step');

    const skill = State.findSkill(skillId);
    if (skill) DetailPage.render(skill);

    Dashboard.render();
    UI.toast('Step added!', 'success');
  },

  /** Toggle a step's done state. */
  toggle(skillId, phase, index) {
    State.toggleStep(skillId, phase, index);
    const skill = State.findSkill(skillId);
    if (skill) DetailPage.render(skill);
    Dashboard.render();
  },

  /** Remove a step. */
  delete(skillId, phase, index) {
    State.removeStep(skillId, phase, index);
    const skill = State.findSkill(skillId);
    if (skill) DetailPage.render(skill);
    Dashboard.render();
    UI.toast('Step removed', 'success');
  },
};
