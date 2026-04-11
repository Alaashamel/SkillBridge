/**
 * router.js — Client-side Page Router
 *
 * Handles switching between Dashboard, Detail,
 * and Settings pages without a backend.
 */

const Router = (() => {

  const PAGE_TITLES = {
    dashboard: 'Dashboard',
    detail:    'Skill Detail',
    settings:  'Settings',
  };

  // Which pages show the "Add Skill" button
  const SHOW_ADD_BTN = new Set(['dashboard']);

  /**
   * Navigate to a page.
   * @param {string} page     - 'dashboard' | 'detail' | 'settings'
   * @param {Element} [navEl] - sidebar nav element to mark active
   */
  function go(page, navEl = null) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Show target page
    const target = document.getElementById(`page-${page}`);
    if (target) target.classList.add('active');

    // Update topbar title
    const titleEl = document.getElementById('topbar-title');
    if (titleEl) titleEl.textContent = PAGE_TITLES[page] || page;

    // Show/hide Add Skill button
    const addBtn = document.getElementById('add-skill-btn');
    if (addBtn) addBtn.style.display = SHOW_ADD_BTN.has(page) ? '' : 'none';

    // Update sidebar active state
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (navEl) {
      navEl.classList.add('active');
    } else {
      // Restore active nav from data-page attribute
      const match = document.querySelector(`.nav-item[data-page="${page}"]`);
      if (match) match.classList.add('active');
    }

    // Close sidebar on mobile
    UI.closeSidebar();

    // Page-specific hooks
    if (page === 'settings') {
      _renderSettings();
    }
  }

  /** Navigate directly to a skill's detail page. */
  function goDetail(skillId) {
    State.currentSkillId = skillId;
    go('detail');
    const skill = State.findSkill(skillId);
    if (skill) {
      document.getElementById('topbar-title').textContent = skill.name;
      DetailPage.render(skill);
    }
  }

  /** Render the Settings page HTML. */
  function _renderSettings() {
    const page = document.getElementById('page-settings');
    if (!page) return;

    const dark = State.theme === 'dark';

    page.innerHTML = `
      <div class="settings-grid">

        <div class="settings-card">
          <div class="settings-card-title">Appearance</div>
          <div class="settings-card-sub">
            Customize how SkillBridge looks on your device.
          </div>
          <div class="settings-row">
            <div>
              <div class="settings-row-label">Dark Mode</div>
              <div class="settings-row-sub">Switch between light and dark themes</div>
            </div>
            <div class="toggle-pill ${dark ? 'on' : ''}"
                 id="settings-theme-pill"
                 onclick="UI.toggleTheme()">
              <div class="toggle-knob"></div>
            </div>
          </div>
        </div>

        <div class="settings-card">
          <div class="settings-card-title">Data Management</div>
          <div class="settings-card-sub">
            All data is saved locally in your browser's localStorage.
          </div>
          <div class="settings-row">
            <div>
              <div class="settings-row-label">Export Data</div>
              <div class="settings-row-sub">Download your skills as a JSON file</div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="SettingsActions.exportData()">
              Export
            </button>
          </div>
          <div class="settings-row">
            <div>
              <div class="settings-row-label">Reset All Progress</div>
              <div class="settings-row-sub">Permanently clears all skills and progress</div>
            </div>
            <button class="btn btn-danger btn-sm" onclick="SettingsActions.confirmReset()">
              Reset
            </button>
          </div>
        </div>

        <div class="settings-card">
          <div class="settings-card-title">About SkillBridge</div>
          <div class="settings-card-sub">
            A personal learning roadmap tracker built with vanilla HTML, CSS &amp; JavaScript.
          </div>
          <div class="settings-row">
            <div class="settings-row-label">Version</div>
            <span class="settings-meta">1.0.0</span>
          </div>
          <div class="settings-row">
            <div class="settings-row-label">Skills saved</div>
            <span class="settings-meta">${State.skills.length}</span>
          </div>
          <div class="settings-row">
            <div class="settings-row-label">Storage used</div>
            <span class="settings-meta">${State.getStorageSize()}</span>
          </div>
        </div>

      </div>`;
  }

  // ── Public API ─────────────────────────────────
  return { go, goDetail };

})();

/* ── Settings actions ─────────────────────────── */
const SettingsActions = {
  exportData() {
    const data = JSON.stringify({ skills: State.skills }, null, 2);
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    a.download = 'skillbridge-export.json';
    a.click();
    UI.toast('Data exported successfully!', 'success');
  },

  confirmReset() {
    const confirmed = confirm(
      'This will permanently delete ALL your skills and progress.\n\nAre you sure?'
    );
    if (!confirmed) return;
    State.reset();
    Dashboard.render();
    Router.go('dashboard');
    UI.toast('All data has been reset', 'success');
  },
};
