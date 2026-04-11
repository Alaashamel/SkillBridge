/**
 * app.js — Application Entry Point
 *
 * Bootstraps SkillBridge:
 *   1. Load persisted state
 *   2. Init UI helpers (theme, events)
 *   3. Inject dashboard shell HTML
 *   4. Wire up context menu
 *   5. Render initial dashboard
 *   6. Seed demo data if first launch
 */

(function bootstrap() {

  // 1. Load state from localStorage
  State.load();

  // 2. Init UI module (theme, modal events, sidebar)
  UI.init();

  // 3. Inject the dashboard page HTML shell
  //    (stats + grid live here; JS fills them in)
  const dashPage = document.getElementById('page-dashboard');
  if (dashPage) {
    dashPage.innerHTML = `
      <!-- Stats row -->
      <div class="stats-row">
        <div class="stat-card orange">
          <div class="stat-icon">📚</div>
          <div class="stat-num" id="stat-total">0</div>
          <div class="stat-label">Total Skills</div>
        </div>
        <div class="stat-card teal">
          <div class="stat-icon">✅</div>
          <div class="stat-num" id="stat-done">0</div>
          <div class="stat-label">Completed</div>
        </div>
        <div class="stat-card gold">
          <div class="stat-icon">🔥</div>
          <div class="stat-num" id="stat-inprogress">0</div>
          <div class="stat-label">In Progress</div>
        </div>
        <div class="stat-card red">
          <div class="stat-icon">⏳</div>
          <div class="stat-num" id="stat-notstarted">0</div>
          <div class="stat-label">Not Started</div>
        </div>
      </div>

      <!-- Section header with filters -->
      <div class="section-header">
        <div>
          <div class="section-title">Your Skills</div>
          <div class="section-sub">Click any card to view its roadmap</div>
        </div>
        <div class="filter-row">
          <div class="filter-chip active"
               onclick="Dashboard.setFilter('all', this)">All</div>
          <div class="filter-chip"
               onclick="Dashboard.setFilter('inprogress', this)">In Progress</div>
          <div class="filter-chip"
               onclick="Dashboard.setFilter('done', this)">Completed</div>
        </div>
      </div>

      <!-- Skills grid (populated by Dashboard.render) -->
      <div class="skills-grid" id="skills-grid"></div>
    `;
  }

  // 4. Wire up context menu actions
  document.getElementById('ctx-open')?.addEventListener('click', () => {
    if (State.ctxSkillId) Router.goDetail(State.ctxSkillId);
    UI.closeContextMenu();
  });
  document.getElementById('ctx-delete')?.addEventListener('click', () => {
    if (State.ctxSkillId) SkillActions.delete(State.ctxSkillId);
    UI.closeContextMenu();
  });

  // 5. Wire up "Add Skill" button (also callable from modal)
  document.getElementById('add-skill-btn')?.addEventListener('click', SkillActions.open);

  // 6. Inject detail page back button
  const detailPage = document.getElementById('page-detail');
  if (detailPage) {
    const backBtn = document.createElement('button');
    backBtn.className = 'detail-back';
    backBtn.innerHTML = `
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      Back to Dashboard`;
    backBtn.onclick = () => Router.go('dashboard');

    const detailContent = document.createElement('div');
    detailContent.id = 'detail-content';

    detailPage.appendChild(backBtn);
    detailPage.appendChild(detailContent);
  }

  // 7. Seed demo data on first launch, then render
  State.seedIfEmpty();
  Dashboard.render();

  console.log('[SkillBridge] App initialized ✓');

})();
