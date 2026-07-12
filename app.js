// ---------- Data model ----------

const LETTER_TO_SOLFEGE = { C: 'do', D: 're', E: 'mi', F: 'fa', G: 'sol', A: 'la', B: 'si' };
const DISPLAY_LABEL = { do: 'Do', re: 'Ré', mi: 'Mi', fa: 'Fa', sol: 'Sol', la: 'La', si: 'Si' };

// Bottom-to-top note order for each clef: the 9 staff positions plus up to
// three ledger lines on each side, which stretches the readable range a bit
// further without going into rare, hard-to-count territory. This spans
// octaves 3-6 in treble and 1-4 in bass.
const TREBLE_KEYS = [
  'f/3', 'g/3', 'a/3', 'b/3', 'c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4',
  'c/5', 'd/5', 'e/5', 'f/5', 'g/5', 'a/5', 'b/5', 'c/6', 'd/6', 'e/6',
];
const BASS_KEYS = [
  'a/1', 'b/1', 'c/2', 'd/2', 'e/2', 'f/2', 'g/2', 'a/2', 'b/2', 'c/3', 'd/3',
  'e/3', 'f/3', 'g/3', 'a/3', 'b/3', 'c/4', 'd/4', 'e/4', 'f/4', 'g/4',
];

// Words the speech recognizer commonly substitutes for each syllable, because
// "do/ré/mi/fa" aren't ordinary French words and get auto-corrected toward
// nearby real ones. Keep entries distinct across notes to avoid cross-matches.
const SYNONYMS = {
  do: ['do', 'dot', 'dos', 'doh', 'deau', 'dau', 'daux', 'dou', 'doux', 'tout', 'dodo'],
  re: ['re', 'rez', 'raie', 'rey', 'rai', 'ret', 'raid', 'erre', 'rue', 'roue', 'ray', 'rets', 'rep'],
  mi: ['mi', 'mie', 'mit', 'mis', 'mix', 'amie', 'ami', 'midi', 'mini', 'mythe', 'nuit'],
  fa: ['fa', 'fat', 'fas', 'fah', 'fac', 'phare', 'far', 'fin', 'fine', 'fard', 'fort'],
  sol: ['sol', 'sole', 'saul', 'soll', 'seul', 'sols', 'solde', 'saoul', 'soleil', 'solo'],
  la: ['la', 'las', 'lah', 'lard', 'lac', 'art', 'lart', 'lanc'],
  si: ['si', 'scie', 'ci', 'cis', 'sit', 'sy', 'six', 'sil'],
};

// MIDI note number 60 = C4 (middle C) by convention; pitch class is the
// number mod 12. Only natural (white-key) pitch classes map to a letter —
// sharps/flats never match, since the staff notes we teach are all naturals.
const MIDI_PITCH_CLASS_TO_LETTER = { 0: 'C', 2: 'D', 4: 'E', 5: 'F', 7: 'G', 9: 'A', 11: 'B' };
const MIDI_DISPLAY_NAMES = ['Do', 'Do♯', 'Ré', 'Ré♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si'];

function midiNoteName(midiNumber) {
  const pitchClass = ((midiNumber % 12) + 12) % 12;
  const octave = Math.floor(midiNumber / 12) - 1;
  return `${MIDI_DISPLAY_NAMES[pitchClass]}${toSubscript(octave)}`;
}

const MIN_ATTEMPTS_TO_UNLOCK = 2;
const UNLOCK_THRESHOLD = 0.6;
const EMA_ALPHA = 0.35;
const STORAGE_KEY = 'noteReadingTrainerV1';

// A correct answer only counts as full mastery if it was quick; a slow-but-
// correct answer still counts (you did read the note right) but drags the
// score down, since fluent sight-reading is as much about speed as accuracy.
// "Quick" is relative to the player's own recent pace, tracked separately per
// input mode: speech recognition adds latency a MIDI keystroke doesn't have,
// and a fixed bar would misjudge one mode or the other. The clamps keep the
// bar sane for very fast players and beginners alike.
const MIN_CORRECT_SCORE = 0.5;
const BASELINE_ALPHA = 0.12;
const DEFAULT_BASELINE_MS = 2500;
const BASELINE_SAMPLE_CAP_MS = 15000;
const FAST_MIN_MS = 900;
const FAST_MAX_MS = 3000;
const SLOW_FACTOR = 3;

function speedBaselineMs() {
  const baselines = state.stats.speedBaseline || {};
  return baselines[state.settings.inputMode] || DEFAULT_BASELINE_MS;
}

function fastAnswerMs() {
  return Math.min(FAST_MAX_MS, Math.max(FAST_MIN_MS, 0.8 * speedBaselineMs()));
}

function slowAnswerMs() {
  return fastAnswerMs() * SLOW_FACTOR;
}

// A freshly unlocked note gets a large pick-weight bonus that fades over its
// first attempts, so new material shows up immediately and repeatedly while
// it's being introduced instead of drowning in the growing practice pool.
const NOVELTY_ATTEMPTS = 6;
const NOVELTY_BONUS = 1.0;

// Notes not asked for a while get a gentle boost (capped), so mastered notes
// keep resurfacing for spaced review instead of disappearing forever once
// their mastery weight bottoms out.
const STALENESS_BONUS = 0.12;

function correctnessScore(correct, elapsedMs) {
  if (!correct) return 0;
  const fast = fastAnswerMs();
  const slow = slowAnswerMs();
  if (elapsedMs <= fast) return 1;
  if (elapsedMs >= slow) return MIN_CORRECT_SCORE;
  const t = (elapsedMs - fast) / (slow - fast);
  return 1 - t * (1 - MIN_CORRECT_SCORE);
}

function buildNotes() {
  const notes = [];
  TREBLE_KEYS.forEach((key, order) => notes.push(makeNote('treble', key, order)));
  BASS_KEYS.forEach((key, order) => notes.push(makeNote('bass', key, order)));
  return notes;
}

const SUBSCRIPT_DIGITS = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' };

function toSubscript(num) {
  return String(num).split('').map((d) => SUBSCRIPT_DIGITS[d] || d).join('');
}

function makeNote(clef, key, order) {
  const letter = key[0].toUpperCase();
  const octave = Number(key.split('/')[1]);
  const solfege = LETTER_TO_SOLFEGE[letter];
  return {
    id: `${clef}-${key.replace('/', '')}`,
    clef,
    key,
    letter,
    octave,
    order,
    solfege,
    label: DISPLAY_LABEL[solfege],
    displayLabel: `${DISPLAY_LABEL[solfege]}${toSubscript(octave)}`,
  };
}

const NOTES = buildNotes();
const NOTES_BY_ID = Object.fromEntries(NOTES.map((n) => [n.id, n]));

// ---------- Persistence ----------

function loadState() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (e) {
    saved = null;
  }

  const progress = {};
  NOTES.forEach((n) => {
    progress[n.id] = { ema: 0.35, attempts: 0, unlocked: false };
  });

  const trebleFirst = NOTES.find((n) => n.clef === 'treble' && n.order === 0);
  const bassFirst = NOTES.find((n) => n.clef === 'bass' && n.order === 0);
  progress[trebleFirst.id].unlocked = true;
  progress[bassFirst.id].unlocked = true;

  const stats = { totalAttempts: 0, totalCorrect: 0, streak: 0, bestStreak: 0, speedBaseline: {} };
  const settings = { clefMode: 'both', inputMode: 'midi', sessionMinutes: 0 };

  if (saved && saved.progress) {
    Object.keys(progress).forEach((id) => {
      if (saved.progress[id]) progress[id] = saved.progress[id];
    });
  }
  if (saved && saved.stats) {
    Object.assign(stats, saved.stats);
  }
  if (saved && saved.settings) {
    Object.assign(settings, saved.settings);
  }

  // Daily journal ('YYYY-MM-DD' -> aggregates) and confusion counters
  // ('Mi₄ → Sol' -> count) power the progress card.
  const history = (saved && saved.history) || {};
  const confusions = (saved && saved.confusions) || {};

  return { progress, stats, settings, history, confusions };
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      progress: state.progress,
      stats: state.stats,
      settings: state.settings,
      history: state.history,
      confusions: state.confusions,
    })
  );
}

// ---------- App state ----------

const state = loadState();
state.currentNote = null;
state.lastNoteId = null;
state.autoMode = false;
state.awaitingResult = false;
state.silentEndStreak = 0;
state.noteShownAt = Date.now();
state.listeningRequested = false;
state.noteBatch = [];
state.batchDone = [];
state.batchIndex = 0;
state.lastAnswered = null;
// Session-only: not persisted, so a forgotten review session can't silently
// block curriculum progress across visits.
state.reviewMode = false;
state.sessionEndAt = null;
state.sessionTicker = null;
state.sessionStats = null;

// ---------- DOM ----------

const scoreEl = document.getElementById('score');
const listeningEl = document.getElementById('listeningIndicator');
const feedbackEl = document.getElementById('feedback');
const startBtn = document.getElementById('startBtn');
const micBtn = document.getElementById('micBtn');
const skipBtn = document.getElementById('skipBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFileInput = document.getElementById('importFile');
const unsupportedMsg = document.getElementById('unsupportedMsg');
const midiUnsupportedMsg = document.getElementById('midiUnsupportedMsg');
const midiDeviceStatusEl = document.getElementById('midiDeviceStatus');
const listeningTextEl = document.getElementById('listeningText');
const onscreenKeyboardEl = document.getElementById('onscreenKeyboard');
const statsGridEl = document.getElementById('statsGrid');
const clefSwitcherEl = document.getElementById('clefSwitcher');
const inputModeSwitcherEl = document.getElementById('inputModeSwitcher');

const streakValueEl = document.getElementById('streakValue');
const bestStreakValueEl = document.getElementById('bestStreakValue');
const scoreValueEl = document.getElementById('scoreValue');
const avgSpeedValueEl = document.getElementById('avgSpeedValue');
const unlockedValueEl = document.getElementById('unlockedValue');

// ---------- Staff rendering ----------

const CURRENT_NOTE_STYLE = { fillStyle: '#4361ee', strokeStyle: '#4361ee' };
const DONE_NOTE_STYLE = { fillStyle: '#2a9d8f', strokeStyle: '#2a9d8f' };
const UPCOMING_NOTE_STYLE = { fillStyle: '#b7bbcf', strokeStyle: '#b7bbcf' };
const STAFF_SCALE = 1.45;

// Notes already recognized in this batch stay visible but dim to "done";
// the note currently being asked is highlighted; the rest wait their turn.
function styleForPosition(index, currentIndex, doneMask) {
  if (doneMask[index]) return DONE_NOTE_STYLE;
  if (index === currentIndex) return CURRENT_NOTE_STYLE;
  return UPCOMING_NOTE_STYLE;
}

function createScaledContext(unscaledWidth, unscaledHeight) {
  const VF = Vex.Flow;
  scoreEl.innerHTML = '';
  const renderer = new VF.Renderer(scoreEl, VF.Renderer.Backends.SVG);
  renderer.resize(Math.ceil(unscaledWidth * STAFF_SCALE), Math.ceil(unscaledHeight * STAFF_SCALE));
  const context = renderer.getContext();
  context.scale(STAFF_SCALE, STAFF_SCALE);
  return context;
}

function renderBatch(batch, currentIndex, doneMask) {
  const clefsUsed = new Set(batch.map((n) => n.clef));
  if (clefsUsed.size > 1) {
    renderGrandStaffBatch(batch, currentIndex, doneMask);
  } else {
    renderSingleStaffBatch(batch, currentIndex, doneMask, batch[0].clef);
  }
}

// Live probability of each note being picked on the next draw, given the
// current practice pool (respects clef mode) and the same weights the picker
// actually uses. Notes outside the active pool (locked, or excluded by the
// clef filter) are absent from the map and display as 0%.
function pickProbabilities() {
  const pool = practicePool();
  const weights = pool.map((n) => noteWeight(n, pool.length));
  const total = weights.reduce((a, b) => a + b, 0);
  const map = new Map();
  if (total > 0) {
    pool.forEach((n, i) => map.set(n.id, Math.round((weights[i] / total) * 100)));
  }
  return map;
}

function renderSingleStaffBatch(batch, currentIndex, doneMask, clef) {
  const VF = Vex.Flow;
  const context = createScaledContext(400, 190);

  const stave = new VF.Stave(10, 40, 360);
  stave.addClef(clef);
  stave.setContext(context).draw();

  const staveNotes = batch.map((note, i) => {
    const sn = new VF.StaveNote({ keys: [note.key], duration: 'q', clef });
    sn.setStyle(styleForPosition(i, currentIndex, doneMask));
    return sn;
  });

  const voice = new VF.Voice({ num_beats: batch.length, beat_value: 4 }).setStrict(false);
  voice.addTickables(staveNotes);
  new VF.Formatter().joinVoices([voice]).format([voice], 300);
  voice.draw(context, stave);
}

function renderGrandStaffBatch(batch, currentIndex, doneMask) {
  const VF = Vex.Flow;
  const context = createScaledContext(400, 320);

  const trebleStave = new VF.Stave(10, 10, 360);
  trebleStave.addClef('treble');
  trebleStave.setContext(context).draw();

  const bassStave = new VF.Stave(10, 150, 360);
  bassStave.addClef('bass');
  bassStave.setContext(context).draw();

  new VF.StaveConnector(trebleStave, bassStave)
    .setType(VF.StaveConnector.type.BRACE)
    .setContext(context)
    .draw();
  new VF.StaveConnector(trebleStave, bassStave)
    .setType(VF.StaveConnector.type.SINGLE_LEFT)
    .setContext(context)
    .draw();

  const trebleNotes = [];
  const bassNotes = [];

  batch.forEach((note, i) => {
    const style = styleForPosition(i, currentIndex, doneMask);
    if (note.clef === 'treble') {
      const sn = new VF.StaveNote({ keys: [note.key], duration: 'q', clef: 'treble' });
      sn.setStyle(style);
      trebleNotes.push(sn);
      bassNotes.push(new VF.StaveNote({ keys: ['d/3'], duration: 'qr', clef: 'bass' }));
    } else {
      const sn = new VF.StaveNote({ keys: [note.key], duration: 'q', clef: 'bass' });
      sn.setStyle(style);
      bassNotes.push(sn);
      trebleNotes.push(new VF.StaveNote({ keys: ['b/4'], duration: 'qr', clef: 'treble' }));
    }
  });

  const trebleVoice = new VF.Voice({ num_beats: batch.length, beat_value: 4 }).setStrict(false);
  trebleVoice.addTickables(trebleNotes);
  const bassVoice = new VF.Voice({ num_beats: batch.length, beat_value: 4 }).setStrict(false);
  bassVoice.addTickables(bassNotes);

  new VF.Formatter().joinVoices([trebleVoice, bassVoice]).format([trebleVoice, bassVoice], 300);
  trebleVoice.draw(context, trebleStave);
  bassVoice.draw(context, bassStave);
}

// ---------- Adaptive selection ----------

function unlockedNotes() {
  return NOTES.filter((n) => state.progress[n.id].unlocked);
}

function unlockedNotesForPractice() {
  return unlockedNotes().filter(
    (n) => state.settings.clefMode === 'both' || n.clef === state.settings.clefMode
  );
}

// In review mode the pool narrows to the notes that still need work: those
// below the "mastered" bar. When fewer than REVIEW_MIN_POOL qualify, the
// weakest mastered notes top the pool up so the drill keeps some variety
// (and the mode stays useful even when everything is green).
const REVIEW_EMA_THRESHOLD = 0.7;
const REVIEW_MIN_POOL = 3;

function practicePool() {
  const base = unlockedNotesForPractice();
  if (!state.reviewMode) return base;
  const sorted = [...base].sort((a, b) => state.progress[a.id].ema - state.progress[b.id].ema);
  const weak = sorted.filter((n) => state.progress[n.id].ema < REVIEW_EMA_THRESHOLD);
  return weak.length >= REVIEW_MIN_POOL ? weak : sorted.slice(0, Math.min(REVIEW_MIN_POOL, sorted.length));
}

// Pick weight combines three pressures:
// - mastery gap: sharply favors notes still being missed; the small floor
//   keeps mastered notes reachable without letting their combined weight
//   (there can be many of them) drown out the few notes that need work;
// - novelty: freshly unlocked notes are drilled right away and often, fading
//   back to normal over their first NOVELTY_ATTEMPTS attempts;
// - staleness: notes unseen for roughly six laps of the pool earn the full
//   (small) review bonus, so mastered notes still resurface periodically.
function noteWeight(note, poolSize) {
  const p = state.progress[note.id];
  let w = Math.pow(1 - p.ema, 4) + 0.03;
  w += NOVELTY_BONUS * Math.max(0, 1 - p.attempts / NOVELTY_ATTEMPTS);
  const gap = state.stats.totalAttempts - (p.lastSeenAt || 0);
  const horizon = Math.max(1, 6 * poolSize);
  w += STALENESS_BONUS * Math.min(1, gap / horizon);
  return w;
}

function pickNextNote(excludeId) {
  let candidates = practicePool();
  // Hard-exclude the previous note so it never repeats back-to-back, unless
  // it's genuinely the only note available yet.
  if (excludeId && candidates.length > 1) {
    const withoutPrevious = candidates.filter((n) => n.id !== excludeId);
    if (withoutPrevious.length > 0) candidates = withoutPrevious;
  }

  const weights = candidates.map((n) => noteWeight(n, candidates.length));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i];
    if (r <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

// The note whose mastery gates the next unlock, and the note that would be
// unlocked. Unlocked notes don't necessarily form a contiguous prefix of the
// sequence (widening the range added notes below already-unlocked ones), so
// the next candidate is the lowest locked note, not seq[unlocked.length].
function unlockGate(clef) {
  const seq = NOTES.filter((n) => n.clef === clef).sort((a, b) => a.order - b.order);
  const unlocked = seq.filter((n) => state.progress[n.id].unlocked);
  const next = seq.find((n) => !state.progress[n.id].unlocked);
  if (!next || unlocked.length === 0) return null;

  // Only the most recently unlocked note needs to be mastered — requiring
  // every previously-unlocked note to stay simultaneously "ready" made later
  // notes (often the same letter on another octave) take longer and longer
  // to reach as the practice pool grew.
  const gate = state.progress[unlocked[unlocked.length - 1].id];
  const attemptsPart = Math.min(1, gate.attempts / MIN_ATTEMPTS_TO_UNLOCK);
  const emaPart = Math.min(1, gate.ema / UNLOCK_THRESHOLD);
  return { next, progress: Math.min(attemptsPart, emaPart) };
}

function maybeUnlockNext(clef) {
  const info = unlockGate(clef);
  if (!info || info.progress < 1) return null;
  state.progress[info.next.id].unlocked = true;
  state.progress[info.next.id].ema = 0.35;
  return info.next;
}

function todayKey(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dd}`;
}

// 0-100 measure of overall reading level: total mastery across the full
// range of notes, so it grows both by unlocking new notes and by
// consolidating the ones already unlocked.
function globalLevel() {
  const sum = NOTES.reduce((s, n) => {
    const p = state.progress[n.id];
    return s + (p.unlocked ? p.ema : 0);
  }, 0);
  return Math.round((sum / NOTES.length) * 100);
}

// Consecutive practice days ending today (or yesterday, so the streak isn't
// shown as broken before today's session happened).
function practiceStreakDays() {
  let streak = 0;
  const d = new Date();
  if (!((state.history[todayKey(d)] || {}).attempts > 0)) d.setDate(d.getDate() - 1);
  while ((state.history[todayKey(d)] || {}).attempts > 0) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function recordConfusion(note, givenLabel) {
  if (!givenLabel) return;
  const key = `${note.displayLabel} → ${givenLabel}`;
  state.confusions[key] = (state.confusions[key] || 0) + 1;
}

function updateAfterAnswer(note, correct, elapsedMs) {
  const p = state.progress[note.id];
  p.attempts += 1;
  const score = correctnessScore(correct, elapsedMs || 0);
  p.ema = p.ema + EMA_ALPHA * (score - p.ema);

  state.stats.totalAttempts += 1;
  p.lastSeenAt = state.stats.totalAttempts;
  state.lastAnswered = { id: note.id, correct };

  // Speed tracking, from correct answers only (a wrong answer's timing says
  // nothing about reading fluency). The cap keeps a coffee break from
  // wrecking the averages.
  const sample = correct ? Math.min(elapsedMs || 0, BASELINE_SAMPLE_CAP_MS) : 0;
  if (sample > 0) {
    if (!state.stats.speedBaseline) state.stats.speedBaseline = {};
    const mode = state.settings.inputMode;
    const prev = state.stats.speedBaseline[mode];
    state.stats.speedBaseline[mode] = prev ? prev + BASELINE_ALPHA * (sample - prev) : sample;
    p.avgMs = p.avgMs ? p.avgMs + 0.3 * (sample - p.avgMs) : sample;
  }
  if (correct) {
    state.stats.totalCorrect += 1;
    state.stats.streak += 1;
    state.stats.bestStreak = Math.max(state.stats.bestStreak, state.stats.streak);
  } else {
    state.stats.streak = 0;
  }

  // Review mode consolidates what's already unlocked; advancing through the
  // curriculum is what normal mode is for.
  const unlocked = state.reviewMode ? null : maybeUnlockNext(note.clef);

  // Daily journal entry (written after the unlock so the level snapshot
  // includes the note that was just added).
  const key = todayKey();
  const day = (state.history[key] = state.history[key] || {
    attempts: 0, correct: 0, timeSum: 0, timeCount: 0, level: 0, unlocked: 0,
  });
  day.attempts += 1;
  if (correct) day.correct += 1;
  if (sample > 0) {
    day.timeSum += sample;
    day.timeCount += 1;
  }
  day.level = globalLevel();
  day.unlocked = unlockedNotes().length;

  saveState();
  renderStats();
  renderProgress();
  return unlocked;
}

// ---------- Speech recognition ----------

const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

function normalizeWords(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

// Common French agreement endings the speech recognizer tacks onto a
// mis-heard word ("seul" -> "seule", "ami" -> "amies"...). Stripping them
// before matching means we don't have to hand-enumerate every gender/number
// variant of every homophone for every note.
function wordVariants(word) {
  const variants = new Set([word]);
  if (word.length > 4 && word.endsWith('es')) variants.add(word.slice(0, -2));
  if (word.length > 3 && word.endsWith('e')) variants.add(word.slice(0, -1));
  if (word.length > 3 && word.endsWith('s')) variants.add(word.slice(0, -1));
  return [...variants];
}

function findSpokenSolfege(words) {
  // Also try adjacent-word concatenations: elisions like "d'eau" or "s'y" get
  // split into separate words ("d", "eau") once punctuation is stripped.
  const tokens = [...words];
  for (let i = 0; i < words.length - 1; i++) {
    tokens.push(words[i] + words[i + 1]);
  }

  const candidates = new Set();
  tokens.forEach((t) => wordVariants(t).forEach((v) => candidates.add(v)));

  for (const token of candidates) {
    for (const key of Object.keys(SYNONYMS)) {
      if (SYNONYMS[key].includes(token)) return key;
    }
  }
  return null;
}

function setupRecognition() {
  if (!SpeechRecognitionCtor) {
    return false;
  }
  recognition = new SpeechRecognitionCtor();
  recognition.lang = 'fr-FR';
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 5;

  function handleSpeechEvent(event) {
    state.awaitingResult = false;
    state.silentEndStreak = 0;
    const results = event.results && event.results[0];
    if (!results || results.length === 0) {
      onIncorrect('(rien de compréhensible)', null);
      return;
    }

    let matched = null;
    let interpretedLabel = null;
    const rawTranscript = results[0].transcript.trim() || '(silence)';

    for (let i = 0; i < results.length; i++) {
      const words = normalizeWords(results[i].transcript);
      const spoken = findSpokenSolfege(words);
      if (!interpretedLabel && spoken) interpretedLabel = DISPLAY_LABEL[spoken];
      if (spoken === state.currentNote.solfege) {
        matched = spoken;
        break;
      }
    }

    if (matched) {
      onCorrect();
    } else {
      onIncorrect(rawTranscript, interpretedLabel);
    }
  }

  recognition.onresult = handleSpeechEvent;
  // Some browsers emit "nomatch" instead of "result" when audio was captured
  // but nothing recognizable came out of it (common with very short words).
  recognition.onnomatch = handleSpeechEvent;

  recognition.onerror = (event) => {
    state.awaitingResult = false;

    if (event.error === 'no-speech') {
      // Not a real failure — the browser's mic just timed out waiting for
      // sound. Restart quietly and keep waiting; the user shouldn't have to
      // do anything or see an error just because they took a moment.
      state.silentEndStreak = 0;
      if (state.listeningRequested) {
        setTimeout(() => startListening(), 300);
      } else {
        setListening(false);
      }
      return;
    }

    state.silentEndStreak = 0;
    setListening(false);
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      setFeedback('Le micro est bloqué. Autorise-le dans ton navigateur puis clique sur Réessayer.', 'error');
      state.autoMode = false;
      micBtn.classList.remove('hidden');
    } else if (event.error === 'aborted') {
      // user- or code-triggered stop, nothing to do
    } else {
      setFeedback('Erreur micro (' + event.error + '). Clique sur Réessayer.', 'error');
      state.autoMode = false;
      micBtn.classList.remove('hidden');
    }
  };

  recognition.onend = () => {
    setListening(false);
    if (state.awaitingResult) {
      // Recognition ended without result/nomatch/error firing at all. Seen on
      // some Chrome setups when the connection to Google's speech service is
      // blocked (firewall/antivirus/VPN) — Chrome gives up silently instead
      // of raising a 'network' error.
      state.awaitingResult = false;
      state.silentEndStreak = (state.silentEndStreak || 0) + 1;
      if (state.silentEndStreak >= 2) {
        setFeedback(
          "Le service de reconnaissance vocale de Chrome ne répond pas (souvent un pare-feu/VPN/antivirus qui bloque la connexion à Google). Essaie Edge, ou vérifie ta connexion, puis clique sur Réessayer.",
          'error'
        );
        state.autoMode = false;
        micBtn.classList.remove('hidden');
      } else {
        setFeedback("Pas de réponse du micro, on réessaie…", 'error');
        if (state.autoMode) setTimeout(() => startListening(), 700);
      }
    }
  };

  return true;
}

function startListening() {
  if (!recognition) return;
  state.listeningRequested = true;
  try {
    micBtn.classList.add('hidden');
    state.awaitingResult = true;
    recognition.start();
    setListening(true);
  } catch (e) {
    state.awaitingResult = false;
    // recognition already running or blocked; show manual retry
    micBtn.classList.remove('hidden');
  }
}

function setListening(active) {
  listeningEl.classList.toggle('hidden', !active);
}

// ---------- MIDI input ----------

let midiAccess = null;

function ensureMidiReady() {
  if (!state.midiSupported) return Promise.resolve(false);
  if (midiAccess) return Promise.resolve(true);
  return navigator
    .requestMIDIAccess()
    .then((access) => {
      midiAccess = access;
      attachMidiInputs();
      midiAccess.onstatechange = attachMidiInputs;
      applyInputModeUI();
      return true;
    })
    .catch(() => {
      state.midiPermissionDenied = true;
      applyInputModeUI();
      return false;
    });
}

function attachMidiInputs() {
  if (!midiAccess) return;
  for (const input of midiAccess.inputs.values()) {
    input.onmidimessage = handleMidiMessage;
  }
  updateMidiDeviceStatusUI();
}

// Shared by any "played a pitch" input source (MIDI hardware, on-screen
// keyboard clicks): validates octave-agnostically against the displayed
// note's letter, while progress still records against that exact note
// instance (onCorrect/onIncorrect always act on state.currentNote).
function handleNotePlayed(midiNumber) {
  if (!state.listeningRequested || !state.currentNote) return;

  const pitchClass = ((midiNumber % 12) + 12) % 12;
  const letter = MIDI_PITCH_CLASS_TO_LETTER[pitchClass];
  const label = midiNoteName(midiNumber);

  if (letter && letter === state.currentNote.letter) {
    onCorrect();
  } else {
    onIncorrect(label, null, MIDI_DISPLAY_NAMES[pitchClass]);
  }
}

function handleMidiMessage(event) {
  const data = event.data;
  const command = data[0] & 0xf0;
  const velocity = data[2];
  const isNoteOn = command === 0x90 && velocity > 0;
  if (!isNoteOn) return;
  if (state.settings.inputMode !== 'midi') return;
  handleNotePlayed(data[1]);
}

function updateMidiDeviceStatusUI() {
  if (state.settings.inputMode !== 'midi' || !state.midiSupported) {
    midiDeviceStatusEl.classList.add('hidden');
    return;
  }
  midiDeviceStatusEl.classList.remove('hidden');

  if (state.midiPermissionDenied) {
    midiDeviceStatusEl.className = 'midi-status missing';
    midiDeviceStatusEl.textContent =
      "❌ Accès MIDI refusé. Autorise-le dans les réglages du site puis recharge la page.";
    return;
  }
  if (!midiAccess) {
    midiDeviceStatusEl.className = 'midi-status missing';
    midiDeviceStatusEl.textContent = "🎹 En attente d'autorisation MIDI…";
    return;
  }

  const inputs = [...midiAccess.inputs.values()];
  if (inputs.length === 0) {
    midiDeviceStatusEl.className = 'midi-status missing';
    midiDeviceStatusEl.textContent = '⚠️ Aucun clavier MIDI détecté — branche-le et réessaie.';
  } else {
    midiDeviceStatusEl.className = 'midi-status connected';
    midiDeviceStatusEl.textContent = `✅ Clavier connecté : ${inputs.map((i) => i.name).join(', ')}`;
  }
}

// ---------- Input mode (mic vs MIDI) ----------

function beginListening() {
  state.listeningRequested = true;
  if (state.settings.inputMode === 'midi') {
    setListening(true);
    ensureMidiReady();
  } else if (state.settings.inputMode === 'keyboard') {
    setListening(true);
  } else {
    startListening();
  }
}

function stopListeningNow() {
  state.listeningRequested = false;
  if (state.settings.inputMode === 'mic' && recognition) {
    try {
      recognition.abort();
    } catch (e) {}
  } else {
    setListening(false);
  }
}

function applyInputModeUI() {
  const mode = state.settings.inputMode;
  const isMic = mode === 'mic';
  const isMidi = mode === 'midi';
  const isKeyboard = mode === 'keyboard';

  inputModeSwitcherEl.querySelectorAll('.clef-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.input === mode);
  });

  if (!isMic) micBtn.classList.add('hidden');
  onscreenKeyboardEl.classList.toggle('hidden', !isKeyboard);
  unsupportedMsg.classList.toggle('hidden', !(isMic && !state.micSupported));
  midiUnsupportedMsg.classList.toggle('hidden', !(isMidi && !state.midiSupported));

  if (isMic) listeningTextEl.textContent = "Je t'écoute…";
  else if (isMidi) listeningTextEl.textContent = 'Joue la note sur ton clavier…';
  else listeningTextEl.textContent = 'Clique la note demandée ci-dessous…';

  updateMidiDeviceStatusUI();

  const supported = isMic ? state.micSupported : isMidi ? state.midiSupported : true;
  startBtn.disabled = !supported;
}

// ---------- On-screen piano ----------

const KEYBOARD_MIN_MIDI = 43; // G2
const KEYBOARD_MAX_MIDI = 77; // F5
const WHITE_PITCH_CLASSES = new Set([0, 2, 4, 5, 7, 9, 11]);

function onKeyboardKeyClick(midiNumber) {
  if (state.settings.inputMode !== 'keyboard') return;
  handleNotePlayed(midiNumber);
}

function buildOnscreenKeyboard() {
  onscreenKeyboardEl.innerHTML = '';

  const allMidi = [];
  for (let m = KEYBOARD_MIN_MIDI; m <= KEYBOARD_MAX_MIDI; m++) allMidi.push(m);
  const whiteMidi = allMidi.filter((m) => WHITE_PITCH_CLASSES.has(m % 12));
  const whiteWidthPct = 100 / whiteMidi.length;

  whiteMidi.forEach((m) => {
    const key = document.createElement('div');
    key.className = 'key-white';
    key.style.width = whiteWidthPct + '%';
    key.addEventListener('click', () => onKeyboardKeyClick(m));
    onscreenKeyboardEl.appendChild(key);
  });

  allMidi.forEach((m) => {
    if (WHITE_PITCH_CLASSES.has(m % 12)) return;
    const precedingWhiteCount = whiteMidi.filter((w) => w < m).length;
    const key = document.createElement('div');
    key.className = 'key-black';
    key.style.left = `${precedingWhiteCount * whiteWidthPct - whiteWidthPct * 0.3}%`;
    key.style.width = `${whiteWidthPct * 0.6}%`;
    key.addEventListener('click', (e) => {
      e.stopPropagation();
      onKeyboardKeyClick(m);
    });
    onscreenKeyboardEl.appendChild(key);
  });
}

// ---------- Round flow ----------

const QUEUE_SIZE = 4;

function newBatch() {
  const batch = [];
  let prevId = state.lastNoteId;
  for (let i = 0; i < QUEUE_SIZE; i++) {
    const note = pickNextNote(prevId);
    batch.push(note);
    prevId = note.id;
  }
  return batch;
}

// Cycles forward from `fromIndex` to the next position not yet recognized in
// this batch, wrapping around; returns fromIndex itself if it's the only one
// left, or -1 if the whole batch is done.
function nextUndoneIndex(fromIndex) {
  for (let step = 1; step <= state.batchDone.length; step++) {
    const idx = (fromIndex + step) % state.batchDone.length;
    if (!state.batchDone[idx]) return idx;
  }
  return -1;
}

function beginRound() {
  if (!state.noteBatch.length || state.batchDone.every(Boolean)) {
    state.noteBatch = newBatch();
    state.batchDone = state.noteBatch.map(() => false);
    state.batchIndex = 0;
  }
  state.currentNote = state.noteBatch[state.batchIndex];
  state.noteShownAt = Date.now();
  renderBatch(state.noteBatch, state.batchIndex, state.batchDone);
  // Deliberately keep the last feedback visible: rounds now chain instantly
  // after a correct answer, so clearing here would wipe the ✅ message in the
  // same frame it was written.
  beginListening();
}

function advanceAfterCorrect() {
  state.lastNoteId = state.noteBatch[state.batchIndex].id;
  state.batchDone[state.batchIndex] = true;
  const next = nextUndoneIndex(state.batchIndex);
  if (next !== -1) state.batchIndex = next;
}

function skipCurrent() {
  const next = nextUndoneIndex(state.batchIndex);
  if (next !== -1) state.batchIndex = next;
}

function setFeedback(text, kind) {
  feedbackEl.textContent = text;
  feedbackEl.className = 'feedback' + (kind ? ' ' + kind : '');
}

function onCorrect() {
  const note = state.currentNote;
  const elapsedMs = Date.now() - (state.noteShownAt || Date.now());
  const elapsedLabel = (elapsedMs / 1000).toFixed(1) + 's';
  const speed = elapsedMs <= fastAnswerMs() ? ' ⚡' : elapsedMs >= slowAnswerMs() ? ' 🐢' : '';
  const unlocked = updateAfterAnswer(note, true, elapsedMs);
  const streak = state.stats.streak;
  const milestone = streak > 0 && streak % 10 === 0 ? ` · 🔥 ${streak} d'affilée !` : '';
  setFeedback(`✅ ${note.label} (${elapsedLabel}${speed})${milestone}`, 'success');
  updateTopbar();
  if (unlocked) {
    setTimeout(() => {
      setFeedback(`🎉 Nouvelle note débloquée : ${unlocked.label} (${unlocked.clef === 'treble' ? 'clé de sol' : 'clé de fa'})`, 'success');
    }, 150);
  }
  advanceAfterCorrect();
  if (state.autoMode) {
    if (unlocked) setTimeout(() => beginRound(), 600);
    else beginRound();
  }
}

function onIncorrect(rawHeard, interpretedLabel, givenLabel) {
  const note = state.currentNote;
  const interpretation = interpretedLabel && interpretedLabel !== rawHeard ? ` (compris : ${interpretedLabel})` : '';
  const source = state.settings.inputMode === 'mic' ? 'Micro a entendu' : 'Clavier a joué';
  setFeedback(`❌ ${source} : "${rawHeard}"${interpretation} — note affichée : ${note.label}`, 'error');
  // What the player answered instead: the played pitch (MIDI/keyboard) or the
  // understood syllable (mic). Silence/noise isn't a confusion and passes null.
  recordConfusion(note, givenLabel || interpretedLabel);
  updateAfterAnswer(note, false);
  updateTopbar();
  // The feedback above reveals the right answer, so re-asking the same note
  // immediately would score a trivial "success" and inflate its mastery.
  // Move on instead: the missed note stays undone in the batch and comes back
  // after the others, as a genuine test with fresh timing.
  skipCurrent();
  if (state.autoMode) {
    if (state.settings.inputMode === 'mic') setTimeout(() => beginRound(), 700);
    else beginRound();
  }
}

// ---------- Stats UI ----------

function masteryClass(entry) {
  if (!entry.unlocked) return 'locked';
  if (entry.ema < 0.4) return 'weak';
  if (entry.ema < 0.7) return 'mid';
  return 'strong';
}

// The stats grid keeps a stable DOM (built once, then patched in place) so
// CSS transitions on the mastery bars and cell colors can animate between
// updates instead of being destroyed by innerHTML rebuilds.
const statsCells = new Map(); // note id -> { cell, labelEl, pctEl, fillEl }
const nextUnlockEls = {}; // clef -> element showing next-unlock progress

function buildStatsGrid() {
  statsGridEl.innerHTML = '';
  statsCells.clear();

  [
    { clef: 'treble', title: 'Clé de Sol' },
    { clef: 'bass', title: 'Clé de Fa' },
  ].forEach(({ clef, title }) => {
    const wrap = document.createElement('div');
    const heading = document.createElement('div');
    heading.className = 'clef-row-title';
    const titleEl = document.createElement('span');
    titleEl.textContent = title;
    const unlockEl = document.createElement('span');
    unlockEl.className = 'next-unlock';
    heading.append(titleEl, unlockEl);
    nextUnlockEls[clef] = unlockEl;
    wrap.appendChild(heading);

    const row = document.createElement('div');
    row.className = 'clef-row';

    NOTES.filter((n) => n.clef === clef)
      .sort((a, b) => a.order - b.order)
      .forEach((n) => {
        const cell = document.createElement('div');
        const labelEl = document.createElement('div');
        labelEl.className = 'cell-label';
        const pctEl = document.createElement('div');
        pctEl.className = 'pick-pct';
        const bar = document.createElement('div');
        bar.className = 'bar';
        const fillEl = document.createElement('div');
        fillEl.className = 'bar-fill';
        bar.appendChild(fillEl);
        cell.append(labelEl, pctEl, bar);
        row.appendChild(cell);
        statsCells.set(n.id, { cell, labelEl, pctEl, fillEl });
      });

    wrap.appendChild(row);
    statsGridEl.appendChild(wrap);
  });
}

function renderStats() {
  if (!statsCells.size) buildStatsGrid();
  const pickPcts = pickProbabilities();
  const reviewIds = state.reviewMode ? new Set(practicePool().map((n) => n.id)) : null;

  NOTES.forEach((n) => {
    const entry = state.progress[n.id];
    const { cell, labelEl, pctEl, fillEl } = statsCells.get(n.id);
    cell.className = 'note-cell ' + masteryClass(entry);
    if (reviewIds && reviewIds.has(n.id)) cell.classList.add('in-review');
    if (!entry.unlocked) {
      labelEl.textContent = `🔒 ${n.displayLabel}`;
      return;
    }
    const learning = entry.attempts < NOVELTY_ATTEMPTS;
    labelEl.textContent = (learning ? '✨ ' : '') + n.displayLabel;
    pctEl.textContent = (pickPcts.get(n.id) || 0) + '%';
    fillEl.style.width = Math.round(entry.ema * 100) + '%';
    const avgPart = entry.avgMs ? ` · temps moyen ${(entry.avgMs / 1000).toFixed(1)}s` : '';
    cell.title = `${n.displayLabel} — maîtrise ${Math.round(entry.ema * 100)}% · ${entry.attempts} essai${entry.attempts > 1 ? 's' : ''}${avgPart}`;
  });

  // Flash the cell of the note that was just answered, so the eye is drawn
  // to where the progress bars and probabilities are changing.
  if (state.lastAnswered) {
    const rec = statsCells.get(state.lastAnswered.id);
    if (rec) {
      rec.cell.classList.remove('flash-good', 'flash-bad');
      void rec.cell.offsetWidth; // restart the animation
      rec.cell.classList.add(state.lastAnswered.correct ? 'flash-good' : 'flash-bad');
    }
  }

  ['treble', 'bass'].forEach((clef) => {
    const info = unlockGate(clef);
    nextUnlockEls[clef].textContent = state.reviewMode
      ? 'Déblocages en pause (révision)'
      : info
        ? `Prochaine : ${info.next.displayLabel} · ${Math.round(info.progress * 100)}%`
        : 'Toutes débloquées 🎉';
  });

  // The review pool shifts as notes get consolidated; keep the hint fresh.
  if (state.reviewMode) applyPracticeModeUI();
}

function updateTopbar() {
  streakValueEl.textContent = state.stats.streak;
  bestStreakValueEl.textContent = state.stats.bestStreak;
  scoreValueEl.textContent = `${state.stats.totalCorrect} / ${state.stats.totalAttempts}`;
  const baselines = state.stats.speedBaseline || {};
  const baseline = baselines[state.settings.inputMode];
  avgSpeedValueEl.textContent = baseline ? (baseline / 1000).toFixed(1) + 's' : '–';
  unlockedValueEl.textContent = `${unlockedNotes().length} / ${NOTES.length}`;
}

// ---------- Progress over time ----------

const todayChipsEl = document.getElementById('todayChips');
const progressChartEl = document.getElementById('progressChart');
const heatmapEl = document.getElementById('calendarHeatmap');
const insightsEl = document.getElementById('insights');
const chartSwitcherEl = document.getElementById('chartSwitcher');

state.chartMetric = 'level';

const CHART_METRICS = {
  level: {
    title: 'Niveau global (0–100)',
    color: '#4361ee',
    value: (d) => d.level,
    domain: [0, 100],
  },
  accuracy: {
    title: 'Précision (%)',
    color: '#2a9d8f',
    value: (d) => (d.attempts ? Math.round((d.correct / d.attempts) * 100) : null),
    domain: [0, 100],
  },
  speed: {
    title: 'Temps de réponse moyen (s) — plus bas = mieux',
    color: '#f4a261',
    value: (d) => (d.timeCount ? +(d.timeSum / d.timeCount / 1000).toFixed(2) : null),
    domain: null,
  },
  volume: {
    title: 'Notes travaillées par jour',
    color: '#4361ee',
    value: (d) => d.attempts,
    domain: null,
    bars: true,
  },
};

function chartDayLabel(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

// Days that actually had practice, oldest first, capped to the last 30.
function chartDays() {
  return Object.keys(state.history)
    .filter((k) => state.history[k].attempts > 0)
    .sort()
    .slice(-30);
}

function renderChart() {
  const metric = CHART_METRICS[state.chartMetric];
  const days = chartDays();
  const points = days
    .map((k) => ({ key: k, v: metric.value(state.history[k]) }))
    .filter((pt) => pt.v !== null && pt.v !== undefined);

  if (points.length === 0) {
    progressChartEl.innerHTML =
      '<div class="chart-empty">Joue quelques notes pour commencer à tracer ta courbe 📈</div>';
    return;
  }

  const W = 640, H = 220, L = 36, R = 12, T = 18, B = 26;
  const plotW = W - L - R, plotH = H - T - B;
  const values = points.map((p) => p.v);
  let [lo, hi] = metric.domain || [0, Math.max(...values) * 1.15];
  if (hi <= lo) hi = lo + 1;
  const x = (i) => (points.length === 1 ? L + plotW / 2 : L + (i / (points.length - 1)) * plotW);
  const y = (v) => T + plotH - ((v - lo) / (hi - lo)) * plotH;

  const gridLines = [lo, (lo + hi) / 2, hi]
    .map((v) => {
      const yy = y(v).toFixed(1);
      const label = Number.isInteger(v) ? v : v.toFixed(1);
      return `<line x1="${L}" y1="${yy}" x2="${W - R}" y2="${yy}" stroke="#e9ecf2"/>` +
        `<text x="${L - 6}" y="${+yy + 4}" text-anchor="end" class="chart-tick">${label}</text>`;
    })
    .join('');

  let marks = '';
  if (metric.bars) {
    const bw = Math.min(28, (plotW / points.length) * 0.65);
    marks = points
      .map((p, i) => {
        const yy = y(p.v);
        return `<rect x="${(x(i) - bw / 2).toFixed(1)}" y="${yy.toFixed(1)}" width="${bw.toFixed(1)}" height="${(T + plotH - yy).toFixed(1)}" rx="3" fill="${metric.color}" opacity="0.6"/>`;
      })
      .join('');
  } else {
    const coords = points.map((p, i) => `${x(i).toFixed(1)},${y(p.v).toFixed(1)}`);
    const area = `M${L},${T + plotH} L${coords.join(' L')} L${x(points.length - 1).toFixed(1)},${T + plotH} Z`;
    marks =
      `<path d="${area}" fill="${metric.color}" opacity="0.08"/>` +
      `<polyline points="${coords.join(' ')}" fill="none" stroke="${metric.color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>` +
      points
        .map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="3.5" fill="${metric.color}"><title>${chartDayLabel(p.key)} : ${p.v}</title></circle>`)
        .join('');
  }

  const last = points[points.length - 1];
  const lastLabel = `<text x="${x(points.length - 1).toFixed(1)}" y="${(y(last.v) - 10).toFixed(1)}" text-anchor="middle" class="chart-last">${last.v}</text>`;
  const xLabels =
    `<text x="${L}" y="${H - 6}" class="chart-tick">${chartDayLabel(points[0].key)}</text>` +
    (points.length > 1
      ? `<text x="${W - R}" y="${H - 6}" text-anchor="end" class="chart-tick">${chartDayLabel(last.key)}</text>`
      : '');

  progressChartEl.innerHTML =
    `<div class="chart-title">${metric.title}</div>` +
    `<svg viewBox="0 0 ${W} ${H}" role="img">${gridLines}${marks}${lastLabel}${xLabels}</svg>` +
    (points.length === 1 ? '<div class="chart-empty">Reviens demain pour voir ta courbe évoluer 🌱</div>' : '');
}

function renderTodayChips() {
  const t = state.history[todayKey()] || { attempts: 0, correct: 0, timeSum: 0, timeCount: 0 };
  const acc = t.attempts ? Math.round((t.correct / t.attempts) * 100) + '%' : '–';
  const spd = t.timeCount ? (t.timeSum / t.timeCount / 1000).toFixed(1) + 's' : '–';
  const days = practiceStreakDays();
  todayChipsEl.innerHTML = [
    `<span class="chip">🎵 <b>${t.attempts}</b> note${t.attempts > 1 ? 's' : ''} aujourd'hui</span>`,
    `<span class="chip">🎯 <b>${acc}</b> précision</span>`,
    `<span class="chip">⚡ <b>${spd}</b> par note</span>`,
    `<span class="chip">📈 Niveau <b>${globalLevel()}</b></span>`,
    `<span class="chip${days > 0 ? ' chip-fire' : ''}">🔥 <b>${days}</b> jour${days > 1 ? 's' : ''} d'affilée</span>`,
  ].join('');
}

const HEATMAP_WEEKS = 12;

function renderHeatmap() {
  const today = new Date();
  const start = new Date(today);
  const mondayOffset = (today.getDay() + 6) % 7;
  start.setDate(today.getDate() - mondayOffset - (HEATMAP_WEEKS - 1) * 7);

  let html = '';
  for (let w = 0; w < HEATMAP_WEEKS; w++) {
    let col = '';
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(start);
      cellDate.setDate(start.getDate() + w * 7 + d);
      if (cellDate > today) {
        col += '<i class="hm-cell hm-future"></i>';
        continue;
      }
      const entry = state.history[todayKey(cellDate)];
      const n = entry ? entry.attempts : 0;
      const bucket = n === 0 ? 0 : n < 25 ? 1 : n < 75 ? 2 : n < 150 ? 3 : 4;
      const dateLabel = cellDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      col += `<i class="hm-cell hm-${bucket}" title="${dateLabel} — ${n} note${n > 1 ? 's' : ''}"></i>`;
    }
    html += `<span class="hm-col">${col}</span>`;
  }
  heatmapEl.innerHTML = html;
}

function renderInsights() {
  const weak = unlockedNotes()
    .filter((n) => state.progress[n.id].attempts > 0 && state.progress[n.id].ema < 0.7)
    .sort((a, b) => state.progress[a.id].ema - state.progress[b.id].ema)
    .slice(0, 3);
  const confusions = Object.entries(state.confusions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  let html = '';
  if (weak.length) {
    html +=
      '<div class="insight-block"><div class="insight-title">🎯 À travailler</div>' +
      weak
        .map((n) => `<span class="insight-chip">${n.displayLabel} · ${Math.round(state.progress[n.id].ema * 100)}%</span>`)
        .join('') +
      '</div>';
  }
  if (confusions.length) {
    html +=
      '<div class="insight-block"><div class="insight-title">🔀 Confusions fréquentes</div>' +
      confusions
        .map(([pair, count]) => `<span class="insight-chip">${pair} <b>(${count}×)</b></span>`)
        .join('') +
      '</div>';
  }
  insightsEl.innerHTML = html;
  insightsEl.classList.toggle('hidden', !html);
}

function renderProgress() {
  renderTodayChips();
  renderChart();
  renderHeatmap();
  renderInsights();
}

chartSwitcherEl.querySelectorAll('.clef-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    state.chartMetric = btn.dataset.metric;
    chartSwitcherEl.querySelectorAll('.clef-btn').forEach((b) => {
      b.classList.toggle('active', b === btn);
    });
    renderChart();
  });
});

// ---------- Clef switcher ----------

function updateClefSwitcherUI() {
  clefSwitcherEl.querySelectorAll('.clef-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === state.settings.clefMode);
  });
}

clefSwitcherEl.querySelectorAll('.clef-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.mode;
    if (mode === state.settings.clefMode) return;
    state.settings.clefMode = mode;
    saveState();
    updateClefSwitcherUI();
    // The practice pool just changed, so the displayed pick probabilities
    // are stale until re-rendered.
    renderStats();

    if (state.autoMode) {
      stopListeningNow();
      // Notes already queued may belong to a clef we just excluded — start fresh.
      state.noteBatch = [];
      state.batchDone = [];
      state.batchIndex = 0;
      beginRound();
    }
  });
});

inputModeSwitcherEl.querySelectorAll('.clef-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.input;
    if (mode === state.settings.inputMode) return;
    stopListeningNow();
    state.settings.inputMode = mode;
    saveState();
    applyInputModeUI();
    // The speed stat in the topbar is per input mode.
    updateTopbar();
    if (mode === 'midi') ensureMidiReady();
    if (state.autoMode) beginListening();
  });
});

// ---------- Practice mode (progression vs review) ----------

const practiceModeSwitcherEl = document.getElementById('practiceModeSwitcher');
const reviewHintEl = document.getElementById('reviewHint');

function applyPracticeModeUI() {
  practiceModeSwitcherEl.querySelectorAll('.clef-btn').forEach((btn) => {
    btn.classList.toggle('active', (btn.dataset.practice === 'review') === state.reviewMode);
  });
  if (state.reviewMode) {
    const pool = practicePool();
    reviewHintEl.textContent =
      `🎯 Révision : uniquement tes ${pool.length} notes les plus fragiles (${pool
        .map((n) => n.displayLabel)
        .join(', ')}) — pas de nouveaux déblocages.`;
    reviewHintEl.classList.remove('hidden');
  } else {
    reviewHintEl.classList.add('hidden');
  }
}

practiceModeSwitcherEl.querySelectorAll('.clef-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const wantsReview = btn.dataset.practice === 'review';
    if (wantsReview === state.reviewMode) return;
    state.reviewMode = wantsReview;
    applyPracticeModeUI();
    // Pool changed: displayed probabilities and review highlights are stale,
    // and any queued batch may contain notes now outside the pool.
    renderStats();
    if (state.autoMode) {
      stopListeningNow();
      state.noteBatch = [];
      state.batchDone = [];
      state.batchIndex = 0;
      beginRound();
    }
  });
});

// ---------- Session timer (time-boxing) ----------

const timerSwitcherEl = document.getElementById('timerSwitcher');
const sessionTimerEl = document.getElementById('sessionTimer');
const sessionSummaryEl = document.getElementById('sessionSummary');

function applyTimerSwitcherUI() {
  timerSwitcherEl.querySelectorAll('.clef-btn').forEach((btn) => {
    btn.classList.toggle('active', Number(btn.dataset.minutes) === state.settings.sessionMinutes);
  });
  // Locked while a countdown is running or paused mid-flight, so switching
  // horses mid-session can't silently invalidate the summary snapshot. Free
  // to change while idle, or paused in "Libre" mode (nothing to disrupt).
  const locked = state.autoMode || state.sessionRemainingMs != null;
  timerSwitcherEl.querySelectorAll('.clef-btn').forEach((btn) => {
    btn.disabled = locked;
  });
  timerSwitcherEl.classList.toggle('disabled', locked);
}

function formatCountdown(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function renderSessionTimer() {
  if (state.sessionRemainingMs == null) {
    sessionTimerEl.classList.add('hidden');
    return;
  }
  sessionTimerEl.textContent = `⏱️ ${formatCountdown(state.sessionRemainingMs)} restantes`;
  sessionTimerEl.classList.remove('hidden');
}

function tickSessionTimer() {
  state.sessionRemainingMs = Math.max(0, state.sessionEndAt - Date.now());
  renderSessionTimer();
  if (state.sessionRemainingMs <= 0) endSessionByTimeout();
}

function resumeSessionTimer() {
  if (state.sessionRemainingMs == null) return;
  state.sessionEndAt = Date.now() + state.sessionRemainingMs;
  renderSessionTimer();
  state.sessionTicker = setInterval(tickSessionTimer, 250);
  applyTimerSwitcherUI();
}

function pauseSessionTimer() {
  if (state.sessionTicker) {
    clearInterval(state.sessionTicker);
    state.sessionTicker = null;
  }
  if (state.sessionEndAt != null) {
    state.sessionRemainingMs = Math.max(0, state.sessionEndAt - Date.now());
    state.sessionEndAt = null;
  }
  applyTimerSwitcherUI();
}

// Snapshot the counters a session summary is measured against. Re-taken on
// every "fresh" start (not on resume-from-pause) — harmless in "Libre" mode,
// where no summary is ever shown.
function startSession() {
  state.sessionStats = {
    attemptsStart: state.stats.totalAttempts,
    correctStart: state.stats.totalCorrect,
    unlockedStart: unlockedNotes().length,
    levelStart: globalLevel(),
  };
  const minutes = state.settings.sessionMinutes;
  state.sessionRemainingMs = minutes > 0 ? minutes * 60 * 1000 : null;
  if (state.sessionRemainingMs != null) resumeSessionTimer();
  else renderSessionTimer();
  applyTimerSwitcherUI();
}

function renderSessionSummary() {
  if (!state.sessionStats) return;
  const s = state.sessionStats;
  const attempts = state.stats.totalAttempts - s.attemptsStart;
  const correct = state.stats.totalCorrect - s.correctStart;
  const acc = attempts ? Math.round((correct / attempts) * 100) : 0;
  const unlockedGain = unlockedNotes().length - s.unlockedStart;
  const levelGain = globalLevel() - s.levelStart;
  sessionSummaryEl.innerHTML =
    '<div class="session-summary-title">⏱️ Temps écoulé — bilan de la session</div>' +
    '<div class="today-chips">' +
    `<span class="chip">🎵 <b>${attempts}</b> note${attempts > 1 ? 's' : ''}</span>` +
    `<span class="chip">🎯 <b>${acc}%</b> précision</span>` +
    `<span class="chip">🔓 <b>${unlockedGain >= 0 ? '+' : ''}${unlockedGain}</b> débloquée${Math.abs(unlockedGain) > 1 ? 's' : ''}</span>` +
    `<span class="chip">📈 Niveau <b>${levelGain >= 0 ? '+' : ''}${levelGain}</b></span>` +
    '</div>';
  sessionSummaryEl.classList.remove('hidden');
}

function endSessionByTimeout() {
  if (state.sessionTicker) {
    clearInterval(state.sessionTicker);
    state.sessionTicker = null;
  }
  state.sessionEndAt = null;
  state.sessionRemainingMs = null;
  state.autoMode = false;
  stopListeningNow();
  sessionTimerEl.classList.add('hidden');
  setFeedback('', '');
  renderSessionSummary();
  state.sessionStats = null;

  stopBtn.classList.add('hidden');
  skipBtn.classList.add('hidden');
  micBtn.classList.add('hidden');
  startBtn.classList.remove('hidden');
  startBtn.textContent = '▶️ Commencer';
  applyTimerSwitcherUI();
}

timerSwitcherEl.querySelectorAll('.clef-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const minutes = Number(btn.dataset.minutes);
    if (minutes === state.settings.sessionMinutes) return;
    state.settings.sessionMinutes = minutes;
    saveState();
    applyTimerSwitcherUI();
  });
});

// ---------- Wiring ----------

startBtn.addEventListener('click', () => {
  sessionSummaryEl.classList.add('hidden');
  const resuming = state.sessionRemainingMs != null;
  if (resuming) resumeSessionTimer();
  else startSession();
  state.autoMode = true;
  startBtn.classList.add('hidden');
  skipBtn.classList.remove('hidden');
  stopBtn.classList.remove('hidden');
  beginRound();
});

micBtn.addEventListener('click', () => startListening());

skipBtn.addEventListener('click', () => {
  stopListeningNow();
  skipCurrent();
  beginRound();
});

stopBtn.addEventListener('click', () => {
  state.autoMode = false;
  stopListeningNow();
  pauseSessionTimer();
  setFeedback('En pause. Clique sur Reprendre pour continuer.', '');
  stopBtn.classList.add('hidden');
  skipBtn.classList.add('hidden');
  micBtn.classList.add('hidden');
  startBtn.classList.remove('hidden');
  startBtn.textContent = '▶️ Reprendre';
});

resetBtn.addEventListener('click', () => {
  const ok = confirm('Réinitialiser toute ta progression ? Cette action est irréversible.');
  if (!ok) return;
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
});

exportBtn.addEventListener('click', () => {
  const payload = {
    exportedAt: new Date().toISOString(),
    progress: state.progress,
    stats: state.stats,
    settings: state.settings,
    history: state.history,
    confusions: state.confusions,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lecture-notes-progression-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

importBtn.addEventListener('click', () => importFileInput.click());

importFileInput.addEventListener('change', () => {
  const file = importFileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    let data;
    try {
      data = JSON.parse(reader.result);
    } catch (e) {
      alert("Ce fichier n'est pas une sauvegarde valide (JSON illisible).");
      importFileInput.value = '';
      return;
    }

    if (!data || typeof data.progress !== 'object') {
      alert("Ce fichier ne contient pas de progression reconnaissable.");
      importFileInput.value = '';
      return;
    }

    const ok = confirm(
      'Importer cette sauvegarde va remplacer ta progression actuelle sur cet appareil. Continuer ?'
    );
    if (!ok) {
      importFileInput.value = '';
      return;
    }

    NOTES.forEach((n) => {
      if (data.progress[n.id]) state.progress[n.id] = data.progress[n.id];
    });
    if (data.stats) Object.assign(state.stats, data.stats);
    if (data.settings) Object.assign(state.settings, data.settings);
    if (data.history) state.history = data.history;
    if (data.confusions) state.confusions = data.confusions;
    state.noteBatch = [];
    state.batchDone = [];
    state.batchIndex = 0;

    saveState();
    renderStats();
    renderProgress();
    updateTopbar();
    updateClefSwitcherUI();
    setFeedback('✅ Progression importée avec succès.', 'success');
    importFileInput.value = '';
  };
  reader.readAsText(file);
});

// ---------- Init ----------

renderStats();
renderProgress();
updateTopbar();
updateClefSwitcherUI();
applyTimerSwitcherUI();
state.micSupported = setupRecognition();
state.midiSupported = !!navigator.requestMIDIAccess;
state.midiPermissionDenied = false;
buildOnscreenKeyboard();
applyInputModeUI();
