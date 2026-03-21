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
      // Soft thud then single note
      playNote(120, 0.08, 'sine', 0.09);
      playNote(440, 0.20, 'sine', 0.07, 0.06);
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

// ═══════════════════════════════════════════════════════
// BACKGROUND MUSIC
// Cozy warehouse BGM — C major, I–vi–IV–V loop, 90 BPM
// Pure Web Audio API, no external files.
// ═══════════════════════════════════════════════════════

const _MU = {
  C3:130.81, E3:164.81, F3:174.61, G3:196.00, A3:220.00, B3:246.94,
  C4:261.63, D4:293.66, E4:329.63, G4:392.00, A4:440.00, B4:493.88,
  C5:523.25, D5:587.33, E5:659.25, G5:783.99,
};

const _MB = 60 / 90;          // seconds per beat at 90 BPM = 0.667s
const _ML = 16;                // loop length in beats
const _MD = _ML * _MB;         // loop duration ≈ 10.67s

// Melody  — [freq, durationBeats, startBeat]
const _MELODY = [
  // Bar 1  C (beats 0–4)
  [_MU.E5, 1,   0  ], [_MU.G5, .5,  1  ], [_MU.E5, .5, 1.5],
  [_MU.D5, 1,   2  ], [_MU.C5, 1,   3  ],
  // Bar 2  Am (beats 4–8)
  [_MU.D5, .5,  4  ], [_MU.E5, .5,  4.5], [_MU.G5, 1,  5  ],
  [_MU.E5, .5,  6  ], [_MU.D5, .5,  6.5], [_MU.C5, 1,  7  ],
  // Bar 3  F (beats 8–12)
  [_MU.A4, 1,   8  ], [_MU.C5, .5,  9  ], [_MU.B4, .5, 9.5],
  [_MU.A4, 1,  10  ], [_MU.G4, 1,  11  ],
  // Bar 4  G → C (beats 12–16, leads back to bar 1)
  [_MU.G4, .5, 12  ], [_MU.A4, .5, 12.5], [_MU.B4, 1, 13  ],
  [_MU.C5, 1,  14  ], [_MU.E5, 1,  15  ],
];

// Bass — root + fifth, one stab per 2 beats
const _BASS = [
  [_MU.C3, .45, 0 ], [_MU.G3, .45, 2 ],
  [_MU.A3, .45, 4 ], [_MU.E3, .45, 6 ],
  [_MU.F3, .45, 8 ], [_MU.C3, .45, 10],
  [_MU.G3, .45, 12], [_MU.B3, .45, 14],
];

// Chord pads — soft sine stab on chord change
const _CHORDS = [
  [[_MU.C4, _MU.E4, _MU.G4], .5, 0 ],
  [[_MU.A3, _MU.C4, _MU.E4], .5, 4 ],
  [[_MU.F3, _MU.A3, _MU.C4], .5, 8 ],
  [[_MU.G3, _MU.B3, _MU.D4], .5, 12],
];

let _musicGain    = null;
let _musicSched   = null;
let _musicOrigin  = 0;
let _musicNextLoop = 0;
let _musicActive  = false;

function _getMusicGain() {
  const ctx = getAudioCtx();
  if (!ctx) return null;
  if (!_musicGain) {
    _musicGain = ctx.createGain();
    _musicGain.gain.value = 1;
    _musicGain.connect(ctx.destination);
  }
  return _musicGain;
}

function _schedLoop(loopIdx) {
  const ctx = getAudioCtx();
  const mg  = _getMusicGain();
  if (!ctx || !mg) return;

  const t0 = _musicOrigin + loopIdx * _MD;

  function schedNote(freq, durBeats, startBeat, type, vol) {
    const t   = t0 + startBeat * _MB;
    const end = t  + durBeats  * _MB;
    if (end < ctx.currentTime) return;
    const start = Math.max(ctx.currentTime + 0.001, t);
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.linearRampToValueAtTime(vol, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, t + durBeats * _MB * 0.88);
    osc.connect(gain);
    gain.connect(mg);
    osc.start(start);
    osc.stop(end + 0.05);
  }

  _MELODY.forEach(([f, d, b])   => schedNote(f, d, b, 'triangle', 0.065));
  _BASS.forEach(  ([f, d, b])   => schedNote(f, d, b, 'sine',     0.042));
  _CHORDS.forEach(([fs, d, b])  => fs.forEach(f => schedNote(f, d, b, 'sine', 0.020)));
}

function _schedAhead() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const needed = Math.floor((ctx.currentTime - _musicOrigin) / _MD) + 2;
  while (_musicNextLoop <= needed) {
    _schedLoop(_musicNextLoop++);
  }
}

function startBgMusic() {
  if (_musicActive) return;
  const ctx = getAudioCtx();
  if (!ctx) return;

  if (!_musicGain) {
    _musicOrigin  = ctx.currentTime;
    _musicNextLoop = 0;
  }

  // Fade in
  const mg = _getMusicGain();
  mg.gain.cancelScheduledValues(ctx.currentTime);
  mg.gain.setValueAtTime(mg.gain.value, ctx.currentTime);
  mg.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.8);

  _musicActive = true;
  _schedAhead();
  _musicSched = setInterval(_schedAhead, _MD * 500); // check every ~half loop
}

function stopBgMusic() {
  _musicActive = false;
  if (_musicSched) { clearInterval(_musicSched); _musicSched = null; }
  const ctx = getAudioCtx();
  const mg  = _getMusicGain();
  if (ctx && mg) {
    mg.gain.cancelScheduledValues(ctx.currentTime);
    mg.gain.setValueAtTime(mg.gain.value, ctx.currentTime);
    mg.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
  }
}
