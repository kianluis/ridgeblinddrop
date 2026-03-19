// ═══════════════════════════════════════════════════════
// RIDGE MYSTERY DROP — main.js
// Entry point: tabs, game loop, init
// ═══════════════════════════════════════════════════════

// ── Tab switching ─────────────────────────────────────────

function switchTab(tab) {
  const tabs = ['game', 'booklet', 'milestones'];
  document.querySelectorAll('.tab-btn').forEach((btn, i) => {
    btn.classList.toggle('active', tabs[i] === tab);
  });
  document.getElementById('game-tab').style.display         = tab === 'game'       ? 'block' : 'none';
  document.getElementById('booklet-panel').style.display    = tab === 'booklet'    ? 'block' : 'none';
  document.getElementById('milestones-panel').style.display = tab === 'milestones' ? 'block' : 'none';

  // Fade-in entrance for non-game tabs
  if (tab !== 'game') {
    const panelId = tab === 'booklet' ? 'booklet-panel' : 'milestones-panel';
    const panelEl = document.getElementById(panelId);
    if (panelEl) {
      panelEl.classList.remove('tab-entering');
      void panelEl.offsetWidth;
      panelEl.classList.add('tab-entering');
    }
  }

  if (tab === 'booklet') {
    state.newCollectionItems = [];
    updateCollectionTabBadge();
    renderBooklet();
  }
  if (tab === 'milestones') renderMilestones();
}

// ── Booklet filter ────────────────────────────────────────

function setBookletFilter(filter) {
  state.bookletFilter = filter;
  renderBooklet();
}

// ── Sound toggle ──────────────────────────────────────────

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  if (state.soundEnabled) startBgMusic(); else stopBgMusic();
  saveState();
  renderTopBar();
}

// ── Star field (warehouse night mode) ────────────────────

function initStars() {
  const stars = document.getElementById('wh-stars');
  if (!stars) return;
  for (let i = 0; i < 35; i++) {
    const s = document.createElement('div');
    s.style.cssText =
      `position:absolute;width:${Math.random() < 0.3 ? 2 : 1}px;height:${Math.random() < 0.3 ? 2 : 1}px;` +
      `background:#fff;border-radius:50%;` +
      `left:${(Math.random() * 100).toFixed(1)}%;` +
      `top:${(Math.random() * 55).toFixed(1)}%;` +
      `opacity:${(0.35 + Math.random() * 0.65).toFixed(2)};`;
    stars.appendChild(s);
  }
}

// ── Game loop (runs every 500 ms) ─────────────────────────

let _prevReadyCount = 0;
const _animatedReadyOrders = new Set();

function gameTick() {
  const now = Date.now();

  // Check for newly-arrived shipments
  let changed = false;
  let newlyReady = 0;
  const newlyReadyIds = [];
  state.orders.forEach(order => {
    if (!order.ready && now >= order.startTime + order.duration * 1000) {
      order.ready = true;
      changed     = true;
      newlyReady++;
      newlyReadyIds.push(order.id);
    }
  });

  if (newlyReady > 0) {
    playSound('arrive');
    showToast('Package Arrived!', newlyReady > 1
      ? newlyReady + ' packages are ready to open!'
      : 'A package is ready to open!');
    changed = true;
  }

  // Idle credits — 5 per 5 real seconds
  const idleElapsed = (now - state.lastIdleTick) / 1000;
  if (idleElapsed >= 5) {
    const gained = Math.floor(idleElapsed / 5) * 5;
    state.lastIdleTick += Math.floor(idleElapsed / 5) * 5 * 1000;
    state.credits           += gained;
    state.totalCreditsEarned += gained;
    showIdleFloat(gained);
    changed = true;
  }

  if (changed) saveState();

  renderOrderQueue();
  renderTopBar();

  // Arriving animation sequence — one-shot per order
  if (newlyReadyIds.length > 0) {
    newlyReadyIds.forEach(id => {
      if (_animatedReadyOrders.has(id)) return;
      _animatedReadyOrders.add(id);

      // Shake the order card + gold progress bar
      const card = document.querySelector(`.order-card[data-order-id="${id}"]`);
      if (card) {
        card.classList.add('order-arriving');
        const btn = card.querySelector('.btn-open');
        if (btn) btn.classList.add('btn-arriving');
      }

      // "★ ARRIVED ★" floating badge inside the transit panel
      const transitPanel = document.getElementById('transit-panel');
      if (transitPanel) {
        const badge = document.createElement('div');
        badge.className = 'arrived-badge-floating';
        badge.textContent = '★ ARRIVED ★';
        const afterTitle = transitPanel.querySelector('.panel-title');
        if (afterTitle) afterTitle.after(badge);
        else transitPanel.prepend(badge);
        setTimeout(() => {
          badge.style.opacity = '0';
          setTimeout(() => badge.remove(), 380);
        }, 2600);
      }
    });
  }

  // Update day/night roughly every minute (every 120 ticks × 500ms = 60 s)
  _dayNightCounter = (_dayNightCounter + 1) % 120;
  if (_dayNightCounter === 0) updateDayNight();
}

let _dayNightCounter = 0;

// ── Guide overlay ─────────────────────────────────────────

const GUIDE_KEY = 'ridgeMysteryGuideShown_' + SESSION_ID;

function openGuide() {
  const overlay = document.getElementById('guide-overlay');
  overlay.classList.remove('hidden', 'guide-active');
  void overlay.offsetWidth; // reflow so animations replay
  overlay.classList.add('guide-active');
}

function closeGuide() {
  document.getElementById('guide-overlay').classList.add('hidden');
  localStorage.setItem(GUIDE_KEY, '1');
}

let _resetPending = false;
let _resetTimer   = null;

function resetProgress() {
  const btn = document.getElementById('reset-btn');
  if (!_resetPending) {
    _resetPending = true;
    btn.textContent = 'SURE?';
    btn.classList.add('reset-confirm');
    _resetTimer = setTimeout(() => {
      _resetPending = false;
      btn.textContent = '↺';
      btn.classList.remove('reset-confirm');
    }, 3000);
  } else {
    clearTimeout(_resetTimer);
    window._resetting = true;
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(GUIDE_KEY);
    location.reload();
  }
}

// ── Init ──────────────────────────────────────────────────

function init() {
  loadState();
  initStars();
  updateDayNight();

  renderAll();
  renderBooklet();
  renderMilestones();
  renderTestimonials();
  updateMissionsTabBadge();

  // Show game tab by default
  switchTab('game');

  // Game loop
  setInterval(gameTick, 500);

  // Clear the lastNewItemId after first booklet render so the animation only plays once
  setTimeout(() => { state.lastNewItemId = null; }, 800);

  // Start background music on first user interaction (browser autoplay policy)
  document.addEventListener('click', function _musicBoot() {
    if (state.soundEnabled) startBgMusic();
    document.removeEventListener('click', _musicBoot);
  });

  // Show guide on first visit only
  if (!localStorage.getItem(GUIDE_KEY)) {
    openGuide();
  }

  // Save on tab close / navigate away
  window.addEventListener('beforeunload', saveState);

  // Save when tab is hidden (more reliable on mobile / quick tab switches)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveState();
  });
}

init();
