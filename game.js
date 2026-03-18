// ═══════════════════════════════════════════════════════
// RIDGE MYSTERY DROP — game.js
// Core game logic: ordering, opening, milestones, prestige
// ═══════════════════════════════════════════════════════

let isOpening = false;

// ── Orders ───────────────────────────────────────────────

function placeOrder(tierId) {
  const tier = PACKAGE_TIERS.find(t => t.id === tierId);
  if (!tier || state.credits < tier.cost) return;

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
    : rollItem(tier.rareboost);

  // Update pity counter
  if (item.id === 'carryon-mr-doodle') {
    state.pullsSinceDoodle = 0;
  } else {
    state.pullsSinceDoodle = (state.pullsSinceDoodle || 0) + 1;
  }

  // Update state
  const isNew = !state.collection[item.id];
  state.collection[item.id] = (state.collection[item.id] || 0) + 1;
  state.packagesOpened++;
  state.lastNewItemId = isNew ? item.id : null;

  // Credits: base value, 2× on special, +3 duplicate bonus
  let creditsGained = item.credits;
  if (item.special === '2xcredits') creditsGained *= 2;
  const dupBonus = isNew ? 0 : 3;
  creditsGained += dupBonus;

  state.credits += creditsGained;
  state.totalCreditsEarned += creditsGained;

  if (item.rarity === 'rare')  state.firstRare  = true;
  if (item.rarity === 'ultra') state.firstUltra = true;
  state.pullHistory.push({ id: item.id, name: item.name, rarity: item.rarity });

  saveState();
  checkMilestones();
  renderAll();

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

  revealEl.style.display        = 'flex';
  revealEl.style.flexDirection  = 'column';
  revealEl.style.alignItems     = 'center';

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

  document.getElementById('reveal-credits').textContent = '+' + creditsGained + ' CREDITS';

  // NEW badge
  const existingBadge = revealBox.querySelector('.reveal-new-badge');
  if (existingBadge) existingBadge.remove();
  if (isNew) {
    const badge = document.createElement('div');
    badge.className   = 'reveal-new-badge';
    badge.textContent = 'NEW!';
    revealBox.appendChild(badge);
  }

  // Sparkles (rare+ultra)
  const sparkles = document.getElementById('sparkle-container');
  sparkles.innerHTML = '';
  const count = item.rarity === 'ultra' ? 28 : item.rarity === 'rare' ? 14 : 0;
  const sColor = rarityColor(item.rarity);
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    const tx = (Math.random() - 0.5) * 240;
    const ty = (Math.random() - 0.5) * 240;
    s.style.cssText = `left:50%;top:50%;--tx:${tx}px;--ty:${ty}px;
      animation-delay:${(Math.random() * 0.4).toFixed(2)}s;
      background:${sColor};box-shadow:0 0 6px ${sColor};`;
    sparkles.appendChild(s);
  }

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
  if (!confirm(
    'PRESTIGE\n\n' +
    'Reset your collection for a permanent +10% rare rate bonus.\n' +
    'After this prestige: ' + bonus + '% total rare boost.\n\n' +
    'Your credits and carriers are kept.\n\nAre you sure?'
  )) return;

  state.prestigeCount      = (state.prestigeCount || 0) + 1;
  state.prestigeRareBonus  = (state.prestigeRareBonus || 0) + 0.10;
  state.collection         = {};
  state.packagesOpened     = 0;
  state.pullHistory        = [];
  state.milestonesCompleted = [];
  state.firstRare          = false;
  state.firstUltra         = false;
  state.lastNewItemId      = null;

  saveState();
  renderAll();
  renderBooklet();
  renderMilestones();
  playSound('prestige');
  showToast('✦ PRESTIGE ✦', `You are now Prestige ✦${state.prestigeCount}.\n+10% rare rate — go again!`);
}
