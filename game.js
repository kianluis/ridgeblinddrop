// ═══════════════════════════════════════════════════════
// RIDGE MYSTERY DROP — game.js
// Core game logic: ordering, opening, milestones, prestige
// ═══════════════════════════════════════════════════════

let isOpening = false;

// ── Orders ───────────────────────────────────────────────

function placeOrder(tierId) {
  const tier = PACKAGE_TIERS.find(t => t.id === tierId);
  if (!tier || state.credits < tier.cost) return;

  // Total order cap
  if (state.orders.length >= getMaxOrders()) return;

  // Overnight cap
  if (tierId === 'overnight') {
    const activeOvernight = state.orders.filter(o => o.tier === 'overnight').length;
    if (activeOvernight >= MAX_OVERNIGHT_ORDERS) return;
  }

  state.credits -= tier.cost;
  const shipTime = getShipTime(tier);
  state.orders.push({
    id: state.nextOrderId++,
    tier: tier.id,
    startTime: Date.now(),
    duration: shipTime,
    ready: shipTime <= 0,
  });
  saveState();
  renderAll();
  renderOrderPanel(); // refresh affordability in modal
  playSound('order');
}

function buyCarrier(carrierId) {
  const carrier = CARRIERS.find(c => c.id === carrierId);
  if (!carrier || state.credits < carrier.cost) return;
  state.credits -= carrier.cost;
  if (!state.carriersOwned.includes(carrierId)) state.carriersOwned.push(carrierId);
  state.carrier = carrierId;
  saveState();
  renderAll();
  renderOrderPanel();
  playSound('carrier');
  showToast('Carrier Upgraded!', `Now using ${carrier.name} (${carrier.mult}× speed)`);
}

function buyWarehouseUpgrade(upgradeId) {
  const upgrade = WAREHOUSE_UPGRADES.find(u => u.id === upgradeId);
  if (!upgrade || state.credits < upgrade.cost) return;
  if ((state.warehouseUpgrades || []).includes(upgradeId)) return;
  state.credits -= upgrade.cost;
  if (!state.warehouseUpgrades) state.warehouseUpgrades = [];
  state.warehouseUpgrades.push(upgradeId);
  saveState();
  renderAll();
  renderOrderPanel();
  playSound('carrier');
  showToast(upgrade.icon + ' ' + upgrade.name, upgrade.desc);
}

function activateCarrier(carrierId) {
  state.carrier = carrierId;
  saveState();
  renderAll();
  renderOrderPanel();
}

// ── Package Opening ───────────────────────────────────────

function openPackage(orderId) {
  if (isOpening) return;
  const orderIdx = state.orders.findIndex(o => o.id === orderId);
  if (orderIdx === -1) return;
  const order = state.orders[orderIdx];
  if (!order.ready) return;

  isOpening = true;

  // Remove from queue immediately and roll item
  state.orders.splice(orderIdx, 1);
  const tier = PACKAGE_TIERS.find(t => t.id === order.tier);

  // Pity system: guarantee Mr. Doodle on pull 101 if never received it
  const doodle = COLLECTIBLES.find(c => c.id === 'carryon-mr-doodle');
  const item = (state.pullsSinceDoodle >= 100)
    ? doodle
    : rollItem(tier);

  // Update pity counters
  if (item.id === 'carryon-mr-doodle') {
    state.pullsSinceDoodle = 0;
  } else {
    state.pullsSinceDoodle = (state.pullsSinceDoodle || 0) + 1;
  }
  // Soft ultra pity counter — resets on any ultra (including doodle)
  if (item.rarity === 'ultra') {
    state.pullsSinceUltra = 0;
  } else {
    state.pullsSinceUltra = (state.pullsSinceUltra || 0) + 1;
  }

  // Update state
  const isNew = !state.collection[item.id];
  state.collection[item.id] = (state.collection[item.id] || 0) + 1;
  state.packagesOpened++;
  state.lastNewItemId = isNew ? item.id : null;
  if (isNew) {
    if (!state.newCollectionItems) state.newCollectionItems = [];
    if (!state.newCollectionItems.includes(item.id)) state.newCollectionItems.push(item.id);
  }

  // Credits: tier base return + rarity item value, 2× on special, rarity-scaled duplicate bonus
  let creditsGained = (tier.baseCredits || 0) + item.credits;
  if (item.special === '2xcredits') creditsGained *= 2;
  const dupBonusByRarity = { common: 4, uncommon: 10, rare: 25, ultra: 60 };
  const dupBonus = isNew ? 0 : Math.round((dupBonusByRarity[item.rarity] ?? 4) * getDupMultiplier());
  creditsGained += dupBonus;

  state.credits += creditsGained;
  state.totalCreditsEarned += creditsGained;

  if (item.rarity === 'rare')  state.firstRare  = true;
  if (item.rarity === 'ultra') state.firstUltra = true;
  state.pullHistory.push({ id: item.id, name: item.name, rarity: item.rarity });

  // Free common box bonus for rare or ultra pulls
  if (item.rarity === 'rare' || item.rarity === 'ultra') {
    const standardTier = PACKAGE_TIERS.find(t => t.id === 'standard');
    state.orders.push({
      id: state.nextOrderId++,
      tier: 'standard',
      startTime: Date.now(),
      duration: 0,
      ready: true,
      free: true,
    });
    setTimeout(() => showToast('🎁 FREE BOX!', 'Lucky pull bonus — a free Common box is waiting!'), 2200);
  }

  saveState();
  checkMilestones();
  renderAll();
  updateCollectionTabBadge();

  // ── Animation sequence ───────────────────────────────
  const overlay     = document.getElementById('open-overlay');
  const boxStage    = document.getElementById('box-stage');
  const revealEl    = document.getElementById('reveal-state');
  const openingBox  = document.getElementById('opening-box');
  const boxLid      = document.getElementById('box-lid');
  const boxLabel    = document.getElementById('box-stage-label');

  // Reset animation state
  openingBox.classList.remove('shaking');
  boxLid.classList.remove('lid-open');
  overlay.classList.add('active');
  boxStage.style.display    = 'flex';
  revealEl.style.display    = 'none';

  // Phase 1 — shake (150 ms)
  setTimeout(() => {
    openingBox.classList.add('shaking');
    boxLabel.textContent = 'INCOMING...';
    playSound('box_shake');
  }, 150);

  // Phase 2 — lid open (800 ms)
  setTimeout(() => {
    openingBox.classList.remove('shaking');
    boxLid.classList.add('lid-open');
    boxLabel.textContent = 'OPENING...';
    playSound('lid_open');
  }, 800);

  // Phase 3 — rarity flash (1050 ms)
  setTimeout(() => {
    const flash = document.getElementById('rarity-flash');
    flash.style.background = rarityColor(item.rarity);
    flash.classList.remove('flash-active');
    void flash.offsetWidth; // reflow
    flash.classList.add('flash-active');
    playSound(item.rarity);
  }, 1050);

  // Phase 4 — reveal card (1420 ms)
  setTimeout(() => {
    boxStage.style.display = 'none';
    _showReveal(item, isNew, creditsGained, dupBonus);
  }, 1420);
}

function _showReveal(item, isNew, creditsGained, dupBonus) {
  const revealEl  = document.getElementById('reveal-state');
  const revealBox = document.getElementById('reveal-box');

  // Camera flash
  const sf = document.getElementById('screen-flash');
  if (sf) { sf.classList.remove('flash'); void sf.offsetWidth; sf.classList.add('flash'); }

  revealEl.style.display        = 'flex';
  revealEl.style.flexDirection  = 'column';
  revealEl.style.alignItems     = 'center';

  // Reset revealPop so it replays
  revealBox.style.animation = 'none';
  void revealBox.offsetWidth;
  revealBox.style.animation = '';

  revealBox.style.borderColor = rarityColor(item.rarity);
  revealBox.style.boxShadow   = `0 0 24px ${rarityColor(item.rarity)}55`;

  // Icon
  const revealIcon = document.getElementById('reveal-icon');
  revealIcon.innerHTML = '';
  revealIcon.appendChild(_itemIconEl(item, 64));

  // Text fields
  const nameEl = document.getElementById('reveal-name');
  nameEl.textContent = item.name.replace('\n', ' ');
  nameEl.style.color = rarityColor(item.rarity);

  document.getElementById('reveal-rarity').innerHTML =
    `<span class="rarity-badge ${badgeClass(item.rarity)}">${rarityLabel(item.rarity)}</span>`;

  // Duplicate message
  const dupEl = document.getElementById('reveal-dupe-msg');
  if (!isNew) {
    dupEl.style.display = '';
    dupEl.textContent   = 'Already collected! Bonus: +' + dupBonus + ' cr';
  } else {
    dupEl.style.display = 'none';
  }

  // Credits count-up (0 → creditsGained over 600ms)
  const creditsEl = document.getElementById('reveal-credits');
  creditsEl.textContent = '+0 CREDITS';
  const _cStart = performance.now();
  (function _cStep(now) {
    const t = Math.min((now - _cStart) / 600, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    creditsEl.textContent = '+' + Math.round(eased * creditsGained) + ' CREDITS';
    if (t < 1) requestAnimationFrame(_cStep);
  })(performance.now());

  // NEW badge
  const existingBadge = revealBox.querySelector('.reveal-new-badge');
  if (existingBadge) existingBadge.remove();
  if (isNew) {
    const badge = document.createElement('div');
    badge.className   = 'reveal-new-badge';
    badge.textContent = 'NEW!';
    revealBox.appendChild(badge);
  }

  // Sparkles (rare+ultra) and dust puffs (common)
  const sparkles = document.getElementById('sparkle-container');
  sparkles.innerHTML = '';
  const count = item.rarity === 'ultra' ? 28 : item.rarity === 'rare' ? 14 : item.rarity === 'common' ? 3 : 0;
  const sColor = rarityColor(item.rarity);
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = item.rarity === 'common' ? 'dust-puff' : 'sparkle';
    const tx = (Math.random() - 0.5) * (item.rarity === 'common' ? 80 : 240);
    const ty = (Math.random() - 0.5) * (item.rarity === 'common' ? 80 : 240);
    s.style.cssText = `left:50%;top:50%;--tx:${tx}px;--ty:${ty}px;
      animation-delay:${(Math.random() * 0.2).toFixed(2)}s;
      background:${sColor};box-shadow:0 0 4px ${sColor};`;
    sparkles.appendChild(s);
  }

  // Rarity burst
  const burst = document.getElementById('rarity-burst');
  if (burst) {
    burst.innerHTML = '';
    const burstColors = { uncommon: '#2e7a3a', rare: '#2a5fa8', ultra: '#c8a000' };
    const bc = burstColors[item.rarity];
    if (bc) {
      const ringCount = item.rarity === 'ultra' ? 4 : 2;
      const rayCount  = item.rarity === 'ultra' ? 8 : item.rarity === 'rare' ? 6 : 0;
      for (let i = 0; i < ringCount; i++) {
        const ring = document.createElement('div');
        ring.className = 'burst-ring';
        ring.style.cssText = `border-color:${bc};animation-delay:${(i * 0.1).toFixed(1)}s;`;
        burst.appendChild(ring);
      }
      for (let i = 0; i < rayCount; i++) {
        const ray = document.createElement('div');
        ray.className = 'burst-ray';
        const angle = (i / rayCount) * 360;
        ray.style.cssText = `background:${bc};box-shadow:0 0 3px ${bc};transform:rotate(${angle}deg);animation-delay:${(i * 0.02).toFixed(2)}s;`;
        burst.appendChild(ray);
      }
      if (item.rarity === 'ultra') {
        const vig = document.createElement('div');
        vig.className = 'ultra-vignette';
        document.body.appendChild(vig);
        setTimeout(() => vig.remove(), 2200);
      }
    }
  }

  // Staggered entrance: icon → name → rarity → credits
  [
    ['reveal-icon',    'reveal-entrance-icon',  50],
    ['reveal-name',    'reveal-entrance-slide', 220],
    ['reveal-rarity',  'reveal-entrance-slide', 320],
    ['reveal-credits', 'reveal-entrance-slide', 380],
  ].forEach(([id, cls, delay]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.animation = 'none';
    el.style.opacity   = '0';
    setTimeout(() => {
      el.style.opacity   = '';
      el.style.animation = cls === 'reveal-entrance-icon'
        ? 'revealEntranceIcon 0.3s cubic-bezier(0.34,1.56,0.64,1) both'
        : 'revealEntranceSlide 0.22s ease-out both';
    }, delay);
  });

  // Close button label
  document.getElementById('reveal-close-btn').textContent =
    isNew ? 'ADD TO COLLECTION' : 'COLLECT ANYWAY';
}

function closeReveal() {
  document.getElementById('open-overlay').classList.remove('active');
  document.getElementById('opening-box').classList.remove('shaking');
  document.getElementById('box-lid').classList.remove('lid-open');
  isOpening = false;
  renderAll();
}

// ── Open All (condensed 0.6s animation per package) ───────

let _openAllQueue = [];

function openAll() {
  if (isOpening) return;
  const readyOrders = state.orders.filter(o => o.ready);
  if (readyOrders.length < 2) return;
  _openAllQueue = readyOrders.map(o => o.id);
  _openNextInQueue();
}

function _openNextInQueue() {
  if (_openAllQueue.length === 0) return;
  const orderId = _openAllQueue.shift();
  // Order may have already been removed (e.g. opened manually)
  if (!state.orders.find(o => o.id === orderId)) {
    _openNextInQueue();
    return;
  }
  _openAllSingle(orderId, () => _openNextInQueue());
}

function _openAllSingle(orderId, onDone) {
  if (isOpening) return;
  const orderIdx = state.orders.findIndex(o => o.id === orderId);
  if (orderIdx === -1) { onDone(); return; }
  const order = state.orders[orderIdx];
  if (!order.ready) { onDone(); return; }

  isOpening = true;
  state.orders.splice(orderIdx, 1);
  const tier = PACKAGE_TIERS.find(t => t.id === order.tier);

  const doodle = COLLECTIBLES.find(c => c.id === 'carryon-mr-doodle');
  const item = (state.pullsSinceDoodle >= 100) ? doodle : rollItem(tier);

  if (item.id === 'carryon-mr-doodle') state.pullsSinceDoodle = 0;
  else state.pullsSinceDoodle = (state.pullsSinceDoodle || 0) + 1;
  if (item.rarity === 'ultra') state.pullsSinceUltra = 0;
  else state.pullsSinceUltra = (state.pullsSinceUltra || 0) + 1;

  const isNew = !state.collection[item.id];
  state.collection[item.id] = (state.collection[item.id] || 0) + 1;
  state.packagesOpened++;
  state.lastNewItemId = isNew ? item.id : null;
  if (isNew) {
    if (!state.newCollectionItems) state.newCollectionItems = [];
    if (!state.newCollectionItems.includes(item.id)) state.newCollectionItems.push(item.id);
  }

  let creditsGained = (tier.baseCredits || 0) + item.credits;
  if (item.special === '2xcredits') creditsGained *= 2;
  const dupBonusByRarity = { common: 4, uncommon: 10, rare: 25, ultra: 60 };
  const dupBonus = isNew ? 0 : Math.round((dupBonusByRarity[item.rarity] ?? 4) * getDupMultiplier());
  creditsGained += dupBonus;

  state.credits += creditsGained;
  state.totalCreditsEarned += creditsGained;
  if (item.rarity === 'rare')  state.firstRare  = true;
  if (item.rarity === 'ultra') state.firstUltra = true;
  state.pullHistory.push({ id: item.id, name: item.name, rarity: item.rarity });

  if (item.rarity === 'rare' || item.rarity === 'ultra') {
    state.orders.push({ id: state.nextOrderId++, tier: 'standard', startTime: Date.now(), duration: 0, ready: true, free: true });
  }

  saveState();
  checkMilestones();
  renderAll();
  updateCollectionTabBadge();

  // Condensed reveal: flash → show card for 0.5s → auto-close
  const overlay  = document.getElementById('open-overlay');
  const boxStage = document.getElementById('box-stage');
  const revealEl = document.getElementById('reveal-state');

  document.getElementById('opening-box').classList.remove('shaking');
  document.getElementById('box-lid').classList.remove('lid-open');
  overlay.classList.add('active');
  boxStage.style.display = 'none';
  revealEl.style.display = 'none';

  // Phase 1 — rarity flash (80ms)
  setTimeout(() => {
    const flash = document.getElementById('rarity-flash');
    flash.style.background = rarityColor(item.rarity);
    flash.classList.remove('flash-active');
    void flash.offsetWidth;
    flash.classList.add('flash-active');
    playSound(item.rarity);
  }, 80);

  // Phase 2 — reveal card (220ms)
  setTimeout(() => {
    _showReveal(item, isNew, creditsGained, dupBonus);
  }, 220);

  // Phase 3 — auto-close (820ms total), then next
  setTimeout(() => {
    overlay.classList.remove('active');
    isOpening = false;
    renderAll();
    onDone();
  }, 820);
}

// ── Milestones ───────────────────────────────────────────

function checkMilestones() {
  let anyNew = false;
  MILESTONES.forEach(ms => {
    if (!state.milestonesCompleted.includes(ms.id) &&
        !state.milestonesToClaim.includes(ms.id) &&
        ms.req(state)) {
      state.milestonesToClaim.push(ms.id);
      anyNew = true;
    }
  });
  if (anyNew) {
    saveState();
    renderMilestones();
    renderTrophyShelf();
    updateMissionsTabBadge();
    setTimeout(() => showToast('🎖 Mission Complete!', 'Visit MISSIONS to claim your reward!'), 1600);
  }
}

function claimMilestone(id) {
  const idx = state.milestonesToClaim.indexOf(id);
  if (idx === -1) return;
  const ms = MILESTONES.find(m => m.id === id);
  if (!ms) return;
  state.milestonesToClaim.splice(idx, 1);
  state.milestonesCompleted.push(ms.id);
  // Track trophy permanently across all prestige runs
  if (ms.trophy && !(state.lifetimeTrophies || []).includes(ms.id)) {
    if (!state.lifetimeTrophies) state.lifetimeTrophies = [];
    state.lifetimeTrophies.push(ms.id);
  }
  state.credits            += ms.reward;
  state.totalCreditsEarned += ms.reward;
  saveState();
  renderMilestones();
  renderTrophyShelf();
  updateMissionsTabBadge();
  renderTopBar();
  showToast('🏆 ' + ms.name + ' claimed!', '+' + ms.reward + ' credits!');
  playSound('milestone');
}

// ── Prestige ─────────────────────────────────────────────

function prestige() {
  if (uniqueCount() < getTotalItems()) return;
  const bonus = Math.round((state.prestigeRareBonus + 0.10) * 100);
  const overlay = document.getElementById('prestige-confirm-overlay');
  if (!overlay) return;
  document.getElementById('prestige-confirm-bonus').textContent = bonus + '%';
  overlay.classList.add('active');
}

function confirmPrestige() {
  document.getElementById('prestige-confirm-overlay').classList.remove('active');

  state.prestigeCount      = (state.prestigeCount || 0) + 1;
  state.prestigeRareBonus  = (state.prestigeRareBonus || 0) + 0.10;
  state.collection         = {};
  state.packagesOpened     = 0;
  state.pullHistory        = [];
  state.milestonesCompleted = [];
  state.firstRare          = false;
  state.firstUltra         = false;
  state.lastNewItemId      = null;
  // lifetimeTrophies intentionally NOT reset

  saveState();
  renderAll();
  renderBooklet();
  renderMilestones();
  playSound('prestige');
  showToast('✦ PRESTIGE ✦', `You are now Prestige ✦${state.prestigeCount}.\n+10% rare rate — go again!`);
}

function cancelPrestige() {
  document.getElementById('prestige-confirm-overlay').classList.remove('active');
}
