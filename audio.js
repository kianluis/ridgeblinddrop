// ═══════════════════════════════════════════════════════
// RIDGE MYSTERY DROP — audio.js
// Web Audio API sound system (no external files)
// ═══════════════════════════════════════════════════════

let _audioCtx = null;

function getAudioCtx() {
  if (!_audioCtx) {
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }
  // Resume if suspended (browser autoplay policy)
  if (_audioCtx && _audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

// Play a single tone
function playNote(freq, duration, type = 'square', volume = 0.08, startOffset = 0) {
  if (!state.soundEnabled) return;
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t = ctx.currentTime + startOffset;
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration + 0.01);
  } catch(e) {}
}

function playSound(type) {
  if (!state.soundEnabled) return;
  switch (type) {
    // ── UI ─────────────────────────────────────────────
    case 'order':
      playNote(330, 0.08, 'square', 0.07);
      playNote(440, 0.12, 'square', 0.07, 0.09);
      break;

    case 'carrier':
      playNote(440, 0.08, 'square', 0.07);
      playNote(660, 0.10, 'square', 0.07, 0.09);
      playNote(880, 0.15, 'square', 0.07, 0.19);
      break;

    // ── Box animation ──────────────────────────────────
    case 'box_shake':
      // Low rumble
      playNote(80,  0.15, 'sawtooth', 0.05);
      playNote(100, 0.15, 'sawtooth', 0.04, 0.05);
      playNote(80,  0.15, 'sawtooth', 0.05, 0.12);
      break;

    case 'lid_open':
      // Quick rising pop
      playNote(300, 0.06, 'sine', 0.08);
      playNote(500, 0.08, 'sine', 0.08, 0.06);
      playNote(700, 0.10, 'sine', 0.07, 0.13);
      break;

    // ── Rarity reveals ────────────────────────────────
    case 'common':
      playNote(440, 0.20, 'sine', 0.07);
      break;

    case 'uncommon':
      [440, 550, 660].forEach((f, i) =>
        playNote(f, 0.14, 'sine', 0.08, i * 0.10));
      break;

    case 'rare':
      [330, 392, 494, 587, 659].forEach((f, i) =>
        playNote(f, 0.18, 'triangle', 0.10, i * 0.08));
      break;

    case 'ultra':
      // Full fanfare
      [261, 329, 392, 523, 659, 784, 1047].forEach((f, i) =>
        playNote(f, 0.22, 'sine', 0.12, i * 0.07));
      break;

    // ── Events ────────────────────────────────────────
    case 'arrive':
      // Ding-ding-ding
      [523, 659, 784].forEach((f, i) =>
        playNote(f, 0.18, 'sine', 0.09, i * 0.12));
      break;

    case 'milestone':
      [523, 659, 784, 1047].forEach((f, i) =>
        playNote(f, 0.16, 'sine', 0.09, i * 0.10));
      break;

    case 'prestige':
      // Grand ascending chord
      [262, 330, 392, 523, 659, 784, 1047, 1319].forEach((f, i) =>
        playNote(f, 0.30, 'sine', 0.11, i * 0.06));
      break;
  }
}
