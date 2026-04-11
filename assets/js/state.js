/**
 * state.js — Single source of truth
 *
 * Manages the application state object and all
 * localStorage read/write operations.
 */

const State = (() => {

  // ── Internal state object ──────────────────────
  const _state = {
    skills:         [],
    theme:          'light',
    currentFilter:  'all',
    currentSkillId: null,
    selectedIcon:   '💻',
    ctxSkillId:     null,
    pendingPhase:   null,   // phase being added to in step modal
  };

  // ── LocalStorage key ───────────────────────────
  const STORAGE_KEY = 'skillbridge_v1';

  // ── Icon → background color map ───────────────
  const ICON_COLORS = {
    '💻': '#f5e6d9', '🎨': '#e8f0ff', '🧠': '#f3e6ff',
    '📊': '#e6f9f3', '🔧': '#fff3e6', '📱': '#e6f0ff',
    '🌐': '#e6f9ff', '🔬': '#f0ffe6', '🎵': '#ffe6f0',
    '✍️': '#fffbe6', '📸': '#ffe6e6', '⚡': '#fffce6',
  };

  // ── Default icon bg fallback ───────────────────
  const DEFAULT_ICON_BG = '#f0ede8';

  // ── Load from localStorage ─────────────────────
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      _state.skills = parsed.skills || [];
      _state.theme  = parsed.theme  || 'light';
    } catch (e) {
      console.warn('[SkillBridge] Failed to load state:', e);
    }
  }

  // ── Save to localStorage ───────────────────────
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        skills: _state.skills,
        theme:  _state.theme,
      }));
    } catch (e) {
      console.warn('[SkillBridge] Failed to save state:', e);
    }
  }

  // ── Seed demo data (only if empty) ────────────
  function seedIfEmpty() {
    if (_state.skills.length > 0) return;
    _state.skills = [
      {
        id: 'seed-1',
        name: 'TypeScript',
        icon: '💻',
        category: 'Tech',
        difficulty: 'Intermediate',
        createdAt: new Date().toISOString(),
        steps: {
          beginner: [
            { title: 'Understand TypeScript basics', desc: 'Types, interfaces, and type inference.', done: true },
            { title: 'Setup tsconfig.json', desc: 'Configure the TypeScript compiler options.', done: true },
          ],
          intermediate: [
            { title: 'Generics and utility types', desc: 'Learn Partial, Required, Pick, Omit, etc.', done: true },
            { title: 'Advanced type manipulation', desc: 'Conditional types and mapped types.', done: false },
          ],
          advanced: [
            { title: 'Decorators and metadata', desc: 'Use decorators for class and method decoration.', done: false },
            { title: 'Declaration files (.d.ts)', desc: 'Write your own type definitions.', done: false },
          ],
        },
      },
      {
        id: 'seed-2',
        name: 'UI/UX Design',
        icon: '🎨',
        category: 'Design',
        difficulty: 'Beginner',
        createdAt: new Date().toISOString(),
        steps: {
          beginner: [
            { title: 'Design principles', desc: 'Contrast, alignment, repetition, proximity.', done: true },
            { title: 'Color theory', desc: 'Hue, saturation, complementary colors.', done: false },
          ],
          intermediate: [],
          advanced:     [],
        },
      },
      {
        id: 'seed-3',
        name: 'Machine Learning',
        icon: '🧠',
        category: 'Science',
        difficulty: 'Advanced',
        createdAt: new Date().toISOString(),
        steps: {
          beginner: [
            { title: 'Statistics fundamentals', desc: 'Probability, distributions, Bayes theorem.', done: false },
          ],
          intermediate: [],
          advanced:     [],
        },
      },
    ];
    save();
  }

  // ── Skill helpers ──────────────────────────────

  /** Calculate overall progress (0–100) for a skill. */
  function getProgress(skill) {
    const all = [
      ...skill.steps.beginner,
      ...skill.steps.intermediate,
      ...skill.steps.advanced,
    ];
    if (!all.length) return 0;
    return Math.round((all.filter(s => s.done).length / all.length) * 100);
  }

  /** Find a skill by ID. */
  function findSkill(id) {
    return _state.skills.find(s => s.id === id) || null;
  }

  /** Add a new skill. */
  function addSkill(skill) {
    _state.skills.unshift(skill);
    save();
  }

  /** Remove a skill by ID. */
  function removeSkill(id) {
    _state.skills = _state.skills.filter(s => s.id !== id);
    save();
  }

  /** Toggle a step's done status. */
  function toggleStep(skillId, phase, index) {
    const skill = findSkill(skillId);
    if (!skill) return;
    skill.steps[phase][index].done = !skill.steps[phase][index].done;
    save();
  }

  /** Add a step to a skill's phase. */
  function addStep(skillId, phase, step) {
    const skill = findSkill(skillId);
    if (!skill) return;
    skill.steps[phase].push(step);
    save();
  }

  /** Remove a step from a skill's phase. */
  function removeStep(skillId, phase, index) {
    const skill = findSkill(skillId);
    if (!skill) return;
    skill.steps[phase].splice(index, 1);
    save();
  }

  /** Reset all data. */
  function reset() {
    _state.skills = [];
    save();
  }

  /** Get localStorage byte size. */
  function getStorageSize() {
    const raw = localStorage.getItem(STORAGE_KEY) || '';
    return (new Blob([raw]).size / 1024).toFixed(1) + ' KB';
  }

  // ── Public API ─────────────────────────────────
  return {
    get skills()         { return _state.skills; },
    get theme()          { return _state.theme; },
    set theme(v)         { _state.theme = v; save(); },
    get currentFilter()  { return _state.currentFilter; },
    set currentFilter(v) { _state.currentFilter = v; },
    get currentSkillId() { return _state.currentSkillId; },
    set currentSkillId(v){ _state.currentSkillId = v; },
    get selectedIcon()   { return _state.selectedIcon; },
    set selectedIcon(v)  { _state.selectedIcon = v; },
    get ctxSkillId()     { return _state.ctxSkillId; },
    set ctxSkillId(v)    { _state.ctxSkillId = v; },
    get pendingPhase()   { return _state.pendingPhase; },
    set pendingPhase(v)  { _state.pendingPhase = v; },

    ICON_COLORS,
    DEFAULT_ICON_BG,

    load,
    save,
    seedIfEmpty,
    getProgress,
    findSkill,
    addSkill,
    removeSkill,
    toggleStep,
    addStep,
    removeStep,
    reset,
    getStorageSize,
  };

})();
