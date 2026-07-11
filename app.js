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
const FAST_ANSWER_MS = 1500;
const SLOW_ANSWER_MS = 6000;
const MIN_CORRECT_SCORE = 0.5;

function correctnessScore(correct, elapsedMs) {
  if (!correct) return 0;
  if (elapsedMs <= FAST_ANSWER_MS) return 1;
  if (elapsedMs >= SLOW_ANSWER_MS) return MIN_CORRECT_SCORE;
  const t = (elapsedMs - FAST_ANSWER_MS) / (SLOW_ANSWER_MS - FAST_ANSWER_MS);
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

  const stats = { totalAttempts: 0, totalCorrect: 0, streak: 0, bestStreak: 0 };
  const settings = { clefMode: 'both', inputMode: 'midi' };

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

  return { progress, stats, settings };
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ progress: state.progress, stats: state.stats, settings: state.settings })
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

// Live probability that this note gets picked on the next draw, given the
// current practice pool (respects clef mode) and everyone's mastery level.
// Notes outside the active pool (locked, or excluded by the clef filter)
// have no chance of being picked right now, hence 0%.
function pickProbability(note) {
  const pool = unlockedNotesForPractice();
  if (!pool.some((n) => n.id === note.id)) return 0;
  const totalWeight = pool.reduce((sum, n) => sum + noteMasteryWeight(state.progress[n.id].ema), 0);
  if (totalWeight <= 0) return 0;
  const weight = noteMasteryWeight(state.progress[note.id].ema);
  return Math.round((weight / totalWeight) * 100);
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

// Sharpens the gap between weak and mastered notes; the small floor keeps
// mastered notes reachable for review without letting their combined weight
// (there can be many of them) drown out the few notes that still need work.
function noteMasteryWeight(ema) {
  return Math.pow(1 - ema, 4) + 0.03;
}

function pickNextNote(excludeId) {
  let candidates = unlockedNotesForPractice();
  // Hard-exclude the previous note so it never repeats back-to-back, unless
  // it's genuinely the only note available yet.
  if (excludeId && candidates.length > 1) {
    const withoutPrevious = candidates.filter((n) => n.id !== excludeId);
    if (withoutPrevious.length > 0) candidates = withoutPrevious;
  }

  const weights = candidates.map((n) => noteMasteryWeight(state.progress[n.id].ema));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i];
    if (r <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

function maybeUnlockNext(clef) {
  const seq = NOTES.filter((n) => n.clef === clef).sort((a, b) => a.order - b.order);
  const unlocked = seq.filter((n) => state.progress[n.id].unlocked);
  if (unlocked.length === seq.length) return null;

  // Only the most recently unlocked note needs to be mastered — requiring
  // every previously-unlocked note to stay simultaneously "ready" made later
  // notes (often the same letter on another octave) take longer and longer
  // to reach as the practice pool grew.
  const mostRecent = unlocked[unlocked.length - 1];
  const p = state.progress[mostRecent.id];
  const ready = p.attempts >= MIN_ATTEMPTS_TO_UNLOCK && p.ema >= UNLOCK_THRESHOLD;

  if (ready) {
    const next = seq[unlocked.length];
    state.progress[next.id].unlocked = true;
    state.progress[next.id].ema = 0.35;
    return next;
  }
  return null;
}

function updateAfterAnswer(note, correct, elapsedMs) {
  const p = state.progress[note.id];
  p.attempts += 1;
  const score = correctnessScore(correct, elapsedMs || 0);
  p.ema = p.ema + EMA_ALPHA * (score - p.ema);

  state.stats.totalAttempts += 1;
  if (correct) {
    state.stats.totalCorrect += 1;
    state.stats.streak += 1;
    state.stats.bestStreak = Math.max(state.stats.bestStreak, state.stats.streak);
  } else {
    state.stats.streak = 0;
  }

  const unlocked = maybeUnlockNext(note.clef);
  saveState();
  renderStats();
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
    onIncorrect(label, null);
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
  setFeedback('', '');
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
  setFeedback(`✅ Correct ! C'était ${note.label} (${elapsedLabel})`, 'success');
  const unlocked = updateAfterAnswer(note, true, elapsedMs);
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

function onIncorrect(rawHeard, interpretedLabel) {
  const note = state.currentNote;
  const interpretation = interpretedLabel && interpretedLabel !== rawHeard ? ` (compris : ${interpretedLabel})` : '';
  const source = state.settings.inputMode === 'mic' ? 'Micro a entendu' : 'Clavier a joué';
  setFeedback(`❌ ${source} : "${rawHeard}"${interpretation} — note affichée : ${note.label}`, 'error');
  updateAfterAnswer(note, false);
  updateTopbar();
  if (state.autoMode) setTimeout(() => beginListening(), 1400);
}

// ---------- Stats UI ----------

function masteryClass(entry) {
  if (!entry.unlocked) return 'locked';
  if (entry.ema < 0.4) return 'weak';
  if (entry.ema < 0.7) return 'mid';
  return 'strong';
}

function renderStats() {
  statsGridEl.innerHTML = '';

  [
    { clef: 'treble', title: 'Clé de Sol' },
    { clef: 'bass', title: 'Clé de Fa' },
  ].forEach(({ clef, title }) => {
    const wrap = document.createElement('div');
    const heading = document.createElement('div');
    heading.className = 'clef-row-title';
    heading.textContent = title;
    wrap.appendChild(heading);

    const row = document.createElement('div');
    row.className = 'clef-row';

    NOTES.filter((n) => n.clef === clef)
      .sort((a, b) => a.order - b.order)
      .forEach((n) => {
        const entry = state.progress[n.id];
        const cell = document.createElement('div');
        cell.className = 'note-cell ' + masteryClass(entry);
        const pct = Math.round(entry.ema * 100);
        const pickPct = pickProbability(n);
        cell.innerHTML = entry.unlocked
          ? `${n.displayLabel}<div class="pick-pct">${pickPct}%</div><div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div>`
          : `🔒 ${n.displayLabel}`;
        row.appendChild(cell);
      });

    wrap.appendChild(row);
    statsGridEl.appendChild(wrap);
  });
}

function updateTopbar() {
  streakValueEl.textContent = state.stats.streak;
  bestStreakValueEl.textContent = state.stats.bestStreak;
  scoreValueEl.textContent = `${state.stats.totalCorrect} / ${state.stats.totalAttempts}`;
  unlockedValueEl.textContent = `${unlockedNotes().length} / ${NOTES.length}`;
}

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
    if (mode === 'midi') ensureMidiReady();
    if (state.autoMode) beginListening();
  });
});

// ---------- Wiring ----------

startBtn.addEventListener('click', () => {
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
    state.noteBatch = [];
    state.batchDone = [];
    state.batchIndex = 0;

    saveState();
    renderStats();
    updateTopbar();
    updateClefSwitcherUI();
    setFeedback('✅ Progression importée avec succès.', 'success');
    importFileInput.value = '';
  };
  reader.readAsText(file);
});

// ---------- Init ----------

renderStats();
updateTopbar();
updateClefSwitcherUI();
state.micSupported = setupRecognition();
state.midiSupported = !!navigator.requestMIDIAccess;
state.midiPermissionDenied = false;
buildOnscreenKeyboard();
applyInputModeUI();
