/**
 * ui.js — UI Helper Module
 *
 * Handles: theme toggling, toast notifications,
 * modal open/close, sidebar (mobile), icon selection,
 * and the context menu.
 */

const UI = (() => {

  // ── Theme ──────────────────────────────────────

  function applyTheme() {
    const dark = State.theme === 'dark';
    document.documentElement.setAttribute('data-theme', State.theme);
    document.getElementById('theme-pill')
      ?.classList.toggle('on', dark);
    document.getElementById('settings-theme-pill')
      ?.classList.toggle('on', dark);
  }

  function toggleTheme() {
    State.theme = State.theme === 'dark' ? 'light' : 'dark';
    applyTheme();
  }

  // ── Toast Notifications ────────────────────────

  /**
   * @param {string} message
   * @param {'success'|'error'} type
   */
  function toast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<div class="toast-dot"></div>${escHTML(message)}`;
    container.appendChild(el);

    setTimeout(() => {
      el.style.animation = 'toastOut .3s forwards';
      setTimeout(() => el.remove(), 300);
    }, 3000);
  }

  // ── Modals ─────────────────────────────────────

  function openModal(id) {
    document.getElementById(id)?.classList.add('open');
  }

  function closeModal(id) {
    document.getElementById(id)?.classList.remove('open');
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay.open')
      .forEach(m => m.classList.remove('open'));
  }

  // Close modal on overlay backdrop click
  function _initModalBackdropClose() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', function (e) {
        if (e.target === this) this.classList.remove('open');
      });
    });
  }

  // Close modals on Escape
  function _initEscapeKey() {
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeAllModals();
    });
  }

  // ── Sidebar (mobile) ───────────────────────────

  function toggleSidebar() {
    document.getElementById('sidebar')?.classList.toggle('open');
  }

  function closeSidebar() {
    document.getElementById('sidebar')?.classList.remove('open');
  }

  function _initSidebarOutsideClick() {
    document.addEventListener('click', e => {
      const sb = document.getElementById('sidebar');
      const hb = document.getElementById('hamburger');
      if (sb && hb && !sb.contains(e.target) && !hb.contains(e.target)) {
        closeSidebar();
      }
    });
  }

  // ── Icon Picker ────────────────────────────────

  function selectIcon(el) {
    document.querySelectorAll('.icon-opt').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    State.selectedIcon = el.dataset.icon;
  }

  function resetIconPicker() {
    document.querySelectorAll('.icon-opt').forEach(o => o.classList.remove('selected'));
    const first = document.querySelector('.icon-opt[data-icon="💻"]');
    if (first) first.classList.add('selected');
    State.selectedIcon = '💻';
  }

  // ── Context Menu ───────────────────────────────

  function openContextMenu(e, skillId) {
    State.ctxSkillId = skillId;
    const menu = document.getElementById('ctx-menu');
    if (!menu) return;

    const x = Math.min(e.clientX, window.innerWidth  - 180);
    const y = Math.min(e.clientY, window.innerHeight - 100);
    menu.style.left = x + 'px';
    menu.style.top  = y + 'px';
    menu.classList.add('open');
    e.stopPropagation();
  }

  function closeContextMenu() {
    document.getElementById('ctx-menu')?.classList.remove('open');
  }

  function _initContextMenu() {
    // Context menu actions wired in app.js after all modules load
    document.addEventListener('click', closeContextMenu);
  }

  // ── Utility ────────────────────────────────────

  function escHTML(str) {
    return String(str)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;');
  }

  // ── Init ───────────────────────────────────────

  function init() {
    applyTheme();
    _initModalBackdropClose();
    _initEscapeKey();
    _initSidebarOutsideClick();
    _initContextMenu();
  }

  // ── Public API ─────────────────────────────────
  return {
    init,
    applyTheme,
    toggleTheme,
    toast,
    openModal,
    closeModal,
    closeAllModals,
    toggleSidebar,
    closeSidebar,
    selectIcon,
    resetIconPicker,
    openContextMenu,
    closeContextMenu,
    escHTML,
  };

})();
