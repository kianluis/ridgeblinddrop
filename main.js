// ═══════════════════════════════════════════════════════
// RIDGE MYSTERY DROP — main.js
// Entry point: tabs, modals, game loop, init
// ═══════════════════════════════════════════════════════

// ── Tab switching ─────────────────────────────────────────

function switchTab(tab) {
  const tabs = ['game', 'booklet', 'milestones'];
  document.querySelectorAll('.tab-btn').forEach((btn, i) => {
    btn.classList.toggle('active', tabs[i] === tab);
  });
  document.getElementById('game-tab').style.display       = tab === 'game'       ? 'block' : 'none';
  document.getElementById('booklet-panel').style.display  = tab === 'booklet'    ? 'block' : 'none';
  document.getElementById('milestones-panel').style.display = tab === 'milestones' ? 'block' : 'none';

  if (tab === 'booklet')    renderBooklet();
  if (tab === 'milestones') renderMilestones();
}

// ── Order modal ───────────────────────────────────────────

function openOrderModal() {
  renderOrderModal();
  document.getElementById('order-modal').classList.add('active');
  // Resume AudioContext on first user interaction
  getAudioCtx();
}

function closeOrderModal() {
  document.getElementById('order-modal').classList.remove('active');
}

function handleModalBackdrop(e) {
  if (e.target === document.getElementById('order-modal')) closeOrderModal();
}

// ── Booklet filter ────────────────────────────────────────

function setBookletFilter(filter) {
  state.bookletFilter = filter;
  renderBooklet();
}

// ── Sound toggle ──────────────────────────────────────────

function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
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

function gameTick() {
  const now = Date.now();

  // Check for newly-arrived shipments
  let changed = false;
  let newlyReady = 0;
  state.orders.forEach(order => {
    if (!order.ready && now >= order.startTime + order.duration * 1000) {
      order.ready = true;
      changed     = true;
      newlyReady++;
    }
  });

  if (newlyReady > 0) {
    playSound('arrive');
    showToast('Package Arrived!', newlyReady > 1
      ? newlyReady + ' packages are ready to open!'
      : 'A package is ready to open!');
    changed = true;
  }

  // Idle credits — 1 per 30 real seconds
  const idleElapsed = (now - state.lastIdleTick) / 1000;
  if (idleElapsed >= 30) {
    const gained = Math.floor(idleElapsed / 30);
    state.lastIdleTick += gained * 30 * 1000;
    state.credits           += gained;
    state.totalCreditsEarned += gained;
    showIdleFloat(gained);
    changed = true;
  }

  if (changed) saveState();

  renderOrderQueue();
  renderTopBar();

  // Update day/night roughly every minute (every 120 ticks × 500ms = 60 s)
  _dayNightCounter = (_dayNightCounter + 1) % 120;
  if (_dayNightCounter === 0) updateDayNight();
}

let _dayNightCounter = 0;

// ── Init ──────────────────────────────────────────────────

function init() {
  loadState();
  initStars();
  updateDayNight();

  renderAll();
  renderBooklet();
  renderMilestones();

  // Show game tab by default
  switchTab('game');

  // Game loop
  setInterval(gameTick, 500);

  // Clear the lastNewItemId after first booklet render so the animation only plays once
  setTimeout(() => { state.lastNewItemId = null; }, 800);
}

init();
