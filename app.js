// ---------- i18n ----------

// French sight-reading uses solfège syllables (Do/Ré/Mi...); English music
// education uses plain letter names (C/D/E...) — translating the solfège
// word-for-word would be non-idiomatic, so the note-naming scheme itself
// switches with the language, not just the surrounding UI text.
const LETTER_TO_SOLFEGE = { C: 'do', D: 're', E: 'mi', F: 'fa', G: 'sol', A: 'la', B: 'si' };
const DISPLAY_LABEL = { do: 'Do', re: 'Ré', mi: 'Mi', fa: 'Fa', sol: 'Sol', la: 'La', si: 'Si' };

function lang() {
  return state.settings.lang === 'en' ? 'en' : 'fr';
}

// Every user-facing string lives here. Values are either a plain string or a
// function of whatever arguments the call site needs to interpolate. t()
// falls back to French for a missing key so a partially-translated addition
// never renders blank.
const STRINGS = {
  fr: {
    appTitle: '🎼 Lecture de notes',
    pageTitle: 'Lecture de notes — Entraînement',
    streak: 'série',
    record: 'record',
    score: 'score',
    speed: 'vitesse',
    unlockedNotes: 'notes débloquées',
    clefTreble: 'Clé de Sol',
    clefBass: 'Clé de Fa',
    clefBoth: 'Les deux',
    clefShortTreble: 'Sol',
    clefShortBass: 'Fa',
    inputMic: '🎤 Micro',
    inputMidi: '🎹 Clavier MIDI',
    inputKeyboard: "🖱️ Piano à l'écran",
    practiceNormal: '📚 Progression',
    practiceReview: '🎯 Révision',
    timerFree: '♾️ Libre',
    timerMinutes: (n) => `${n} min`,
    listeningMic: 'Je t’écoute…',
    listeningMidi: 'Joue la note sur ton clavier…',
    listeningKeyboard: 'Clique la note demandée ci-dessous…',
    btnStart: '▶️ Commencer',
    btnResume: '▶️ Reprendre',
    btnRetryMic: '🎤 Réessayer',
    btnSkip: '⏭ Passer',
    btnPause: '⏸ Pause',
    micUnsupported: "La reconnaissance vocale n'est pas disponible dans ce navigateur. Utilise Google Chrome sur ordinateur.",
    midiUnsupported: "L'API MIDI n'est pas disponible dans ce navigateur. Utilise Google Chrome ou Edge sur ordinateur.",
    midiDenied: '❌ Accès MIDI refusé. Autorise-le dans les réglages du site puis recharge la page.',
    midiWaiting: "🎹 En attente d'autorisation MIDI…",
    midiNoDevice: '⚠️ Aucun clavier MIDI détecté — branche-le et réessaie.',
    midiConnected: (names) => `✅ Clavier connecté : ${names}`,
    micBlocked: 'Le micro est bloqué. Autorise-le dans ton navigateur puis clique sur Réessayer.',
    micError: (err) => `Erreur micro (${err}). Clique sur Réessayer.`,
    micServiceDown:
      "Le service de reconnaissance vocale de Chrome ne répond pas (souvent un pare-feu/VPN/antivirus qui bloque la connexion à Google). Essaie Edge, ou vérifie ta connexion, puis clique sur Réessayer.",
    micNoResponse: 'Pas de réponse du micro, on réessaie…',
    micUnintelligible: '(rien de compréhensible)',
    micSilence: '(silence)',
    progressTitle: '📈 Ta progression',
    chartLevel: 'Niveau',
    chartAccuracy: 'Précision',
    chartSpeed: 'Vitesse',
    chartVolume: 'Volume',
    chartTitleLevel: 'Niveau global (0–100)',
    chartTitleAccuracy: 'Précision (%)',
    chartTitleSpeed: 'Temps de réponse moyen (s) — plus bas = mieux',
    chartTitleVolume: 'Notes travaillées par jour',
    chartEmpty: 'Joue quelques notes pour commencer à tracer ta courbe 📈',
    chartEmptyOneDay: 'Reviens demain pour voir ta courbe évoluer 🌱',
    regularityTitle: 'Régularité — 12 dernières semaines',
    chipNotesToday: (n) => `🎵 <b>${n}</b> note${n > 1 ? 's' : ''} aujourd'hui`,
    chipAccuracy: (acc) => `🎯 <b>${acc}</b> précision`,
    chipPerNote: (spd) => `⚡ <b>${spd}</b> par note`,
    chipLevel: (lvl) => `📈 Niveau <b>${lvl}</b>`,
    chipStreakDays: (n) => `🔥 <b>${n}</b> jour${n > 1 ? 's' : ''} d'affilée`,
    heatmapTooltip: (date, n) => `${date} — ${n} note${n > 1 ? 's' : ''}`,
    insightToWork: '🎯 À travailler',
    insightErrorRate: (pct) => `${pct}% d'erreur`,
    insightConfusions: '🔀 Confusions fréquentes',
    statsTitle: 'Progression par note',
    btnExport: '⬇️ Exporter',
    btnImport: '⬆️ Importer',
    btnResetBass: 'Réinitialiser clé de Fa',
    btnReset: 'Réinitialiser',
    legendLocked: 'Pas encore débloquée',
    legendWeak: 'À travailler',
    legendMid: 'En progrès',
    legendStrong: 'Maîtrisée',
    lockedCell: (label) => `🔒 ${label}`,
    learningBadge: (label) => `✨ ${label}`,
    cellTooltip: (label, errorPct, attempts, avgPart) =>
      `${label} — taux d'erreur ${errorPct}% · ${attempts} essai${attempts > 1 ? 's' : ''}${avgPart}`,
    avgTimeSuffix: (s) => ` · temps moyen ${s}s`,
    statusLocked: 'Verrouillée',
    statusLearning: '✨ Apprentissage',
    statusWeak: 'Faible',
    statusMid: 'En progrès',
    statusStrong: 'Maîtrisée',
    tableTitle: 'Détail par note',
    thNote: 'Note',
    thClef: 'Clé',
    thStatus: 'Statut',
    thPick: 'Probabilité',
    thError: "Taux d'erreur",
    thAvg: 'Temps moyen',
    thAttempts: 'Essais',
    nextUnlockPaused: 'Déblocages en pause (révision)',
    nextUnlockInfo: (label, pct) => `Prochaine : ${label} · ${pct}%`,
    nextUnlockAllDone: 'Toutes débloquées 🎉',
    reviewHint: (n, labels) => `🎯 Révision : uniquement tes ${n} notes les plus fragiles (${labels}) — pas de nouveaux déblocages.`,
    sessionTimerRemaining: (t) => `⏱️ ${t} restantes`,
    sessionSummaryTitle: '⏱️ Temps écoulé — bilan de la session',
    sessionSummaryNotes: (n) => `🎵 <b>${n}</b> note${n > 1 ? 's' : ''}`,
    sessionSummaryAccuracy: (pct) => `🎯 <b>${pct}%</b> précision`,
    sessionSummaryUnlocked: (n) => `🔓 <b>${n >= 0 ? '+' : ''}${n}</b> débloquée${Math.abs(n) > 1 ? 's' : ''}`,
    sessionSummaryLevel: (n) => `📈 Niveau <b>${n >= 0 ? '+' : ''}${n}</b>`,
    feedbackCorrect: (label, time, speedEmoji, milestone) => `✅ ${label} (${time}${speedEmoji})${milestone}`,
    milestoneStreak: (n) => ` · 🔥 ${n} d'affilée !`,
    feedbackIncorrect: (source, heard, understood) => `❌ ${source} : "${heard}"${understood}`,
    understood: (label) => ` (compris : ${label})`,
    sourceMic: 'Micro a entendu',
    sourceKeyboard: 'Clavier a joué',
    pausedMessage: 'En pause. Clique sur Reprendre pour continuer.',
    confirmReset: 'Réinitialiser toute ta progression ? Cette action est irréversible.',
    confirmResetBass:
      "Réinitialiser ta progression en clé de Fa ? Tu repartiras de Fa₃ (la note au centre de la clé), puis les notes les plus proches se débloqueront en premier. La clé de Sol n'est pas touchée. Cette action est irréversible.",
    resetBassDone: (label) => `✅ Clé de Fa réinitialisée. Tu repars de ${label}.`,
    confirmImport: 'Importer cette sauvegarde va remplacer ta progression actuelle sur cet appareil. Continuer ?',
    invalidFile: "Ce fichier n'est pas une sauvegarde valide (JSON illisible).",
    invalidProgress: 'Ce fichier ne contient pas de progression reconnaissable.',
    importSuccess: '✅ Progression importée avec succès.',
    langLabel: 'Langue',
    langFr: '🇫🇷 Français',
    langEn: '🇬🇧 English',
  },
  en: {
    appTitle: '🎼 Note Reading',
    pageTitle: 'Note Reading — Practice',
    streak: 'streak',
    record: 'best',
    score: 'score',
    speed: 'speed',
    unlockedNotes: 'notes unlocked',
    clefTreble: 'Treble Clef',
    clefBass: 'Bass Clef',
    clefBoth: 'Both',
    clefShortTreble: 'Treble',
    clefShortBass: 'Bass',
    inputMic: '🎤 Mic',
    inputMidi: '🎹 MIDI Keyboard',
    inputKeyboard: '🖱️ On-screen Piano',
    practiceNormal: '📚 Progress',
    practiceReview: '🎯 Review',
    timerFree: '♾️ Free',
    timerMinutes: (n) => `${n} min`,
    listeningMic: 'Listening…',
    listeningMidi: 'Play the note on your keyboard…',
    listeningKeyboard: 'Click the requested note below…',
    btnStart: '▶️ Start',
    btnResume: '▶️ Resume',
    btnRetryMic: '🎤 Retry',
    btnSkip: '⏭ Skip',
    btnPause: '⏸ Pause',
    micUnsupported: 'Speech recognition is not available in this browser. Use Google Chrome on desktop.',
    midiUnsupported: 'The MIDI API is not available in this browser. Use Google Chrome or Edge on desktop.',
    midiDenied: '❌ MIDI access denied. Allow it in the site settings, then reload the page.',
    midiWaiting: '🎹 Waiting for MIDI permission…',
    midiNoDevice: '⚠️ No MIDI keyboard detected — plug it in and try again.',
    midiConnected: (names) => `✅ Keyboard connected: ${names}`,
    micBlocked: 'The mic is blocked. Allow it in your browser, then click Retry.',
    micError: (err) => `Mic error (${err}). Click Retry.`,
    micServiceDown:
      "Chrome's speech recognition service isn't responding (often a firewall/VPN/antivirus blocking the connection to Google). Try Edge, or check your connection, then click Retry.",
    micNoResponse: 'No response from the mic, retrying…',
    micUnintelligible: '(nothing understandable)',
    micSilence: '(silence)',
    progressTitle: '📈 Your progress',
    chartLevel: 'Level',
    chartAccuracy: 'Accuracy',
    chartSpeed: 'Speed',
    chartVolume: 'Volume',
    chartTitleLevel: 'Overall level (0–100)',
    chartTitleAccuracy: 'Accuracy (%)',
    chartTitleSpeed: 'Average response time (s) — lower is better',
    chartTitleVolume: 'Notes practiced per day',
    chartEmpty: 'Play a few notes to start tracing your curve 📈',
    chartEmptyOneDay: 'Come back tomorrow to see your curve grow 🌱',
    regularityTitle: 'Consistency — last 12 weeks',
    chipNotesToday: (n) => `🎵 <b>${n}</b> note${n > 1 ? 's' : ''} today`,
    chipAccuracy: (acc) => `🎯 <b>${acc}</b> accuracy`,
    chipPerNote: (spd) => `⚡ <b>${spd}</b> per note`,
    chipLevel: (lvl) => `📈 Level <b>${lvl}</b>`,
    chipStreakDays: (n) => `🔥 <b>${n}</b> day${n > 1 ? 's' : ''} in a row`,
    heatmapTooltip: (date, n) => `${date} — ${n} note${n > 1 ? 's' : ''}`,
    insightToWork: '🎯 Needs work',
    insightErrorRate: (pct) => `${pct}% error`,
    insightConfusions: '🔀 Frequent mix-ups',
    statsTitle: 'Progress by note',
    btnExport: '⬇️ Export',
    btnImport: '⬆️ Import',
    btnResetBass: 'Reset bass clef',
    btnReset: 'Reset',
    legendLocked: 'Not unlocked yet',
    legendWeak: 'Needs work',
    legendMid: 'In progress',
    legendStrong: 'Solid',
    lockedCell: (label) => `🔒 ${label}`,
    learningBadge: (label) => `✨ ${label}`,
    cellTooltip: (label, errorPct, attempts, avgPart) =>
      `${label} — error rate ${errorPct}% · ${attempts} attempt${attempts > 1 ? 's' : ''}${avgPart}`,
    avgTimeSuffix: (s) => ` · avg time ${s}s`,
    statusLocked: 'Locked',
    statusLearning: '✨ Learning',
    statusWeak: 'Needs work',
    statusMid: 'In progress',
    statusStrong: 'Solid',
    tableTitle: 'Detail by note',
    thNote: 'Note',
    thClef: 'Clef',
    thStatus: 'Status',
    thPick: 'Probability',
    thError: 'Error rate',
    thAvg: 'Avg. time',
    thAttempts: 'Attempts',
    nextUnlockPaused: 'Unlocks paused (review)',
    nextUnlockInfo: (label, pct) => `Next: ${label} · ${pct}%`,
    nextUnlockAllDone: 'All unlocked 🎉',
    reviewHint: (n, labels) => `🎯 Review: only your ${n} shakiest notes (${labels}) — no new unlocks.`,
    sessionTimerRemaining: (t) => `⏱️ ${t} remaining`,
    sessionSummaryTitle: '⏱️ Time’s up — session summary',
    sessionSummaryNotes: (n) => `🎵 <b>${n}</b> note${n > 1 ? 's' : ''}`,
    sessionSummaryAccuracy: (pct) => `🎯 <b>${pct}%</b> accuracy`,
    sessionSummaryUnlocked: (n) => `🔓 <b>${n >= 0 ? '+' : ''}${n}</b> unlocked`,
    sessionSummaryLevel: (n) => `📈 Level <b>${n >= 0 ? '+' : ''}${n}</b>`,
    feedbackCorrect: (label, time, speedEmoji, milestone) => `✅ ${label} (${time}${speedEmoji})${milestone}`,
    milestoneStreak: (n) => ` · 🔥 ${n} in a row!`,
    feedbackIncorrect: (source, heard, understood) => `❌ ${source}: "${heard}"${understood}`,
    understood: (label) => ` (heard as: ${label})`,
    sourceMic: 'Mic heard',
    sourceKeyboard: 'Keyboard played',
    pausedMessage: 'Paused. Click Resume to continue.',
    confirmReset: 'Reset all your progress? This action is irreversible.',
    confirmResetBass:
      "Reset your bass clef progress? You'll start over from F3 (the note at the clef's center), then the closest notes will unlock first. The treble clef isn't affected. This action is irreversible.",
    resetBassDone: (label) => `✅ Bass clef reset. Starting over from ${label}.`,
    confirmImport: 'Importing this save will replace your current progress on this device. Continue?',
    invalidFile: 'This file is not a valid save (unreadable JSON).',
    invalidProgress: "This file doesn't contain recognizable progress.",
    importSuccess: '✅ Progress imported successfully.',
    langLabel: 'Language',
    langFr: '🇫🇷 Français',
    langEn: '🇬🇧 English',
  },
};

function t(key, ...args) {
  const entry = STRINGS[lang()][key] ?? STRINGS.fr[key];
  return typeof entry === 'function' ? entry(...args) : entry;
}

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

// Words the speech recognizer commonly substitutes for each syllable/letter,
// because short, non-dictionary sounds ("do/ré/mi/fa", or a single spoken
// letter) get auto-corrected toward nearby real words. Keep entries distinct
// across notes to avoid cross-matches. Keyed by solfège syllable in French,
// by letter (lowercase) in English.
const SYNONYMS_FR = {
  do: ['do', 'dot', 'dos', 'doh', 'deau', 'dau', 'daux', 'dou', 'doux', 'tout', 'dodo'],
  re: ['re', 'rez', 'raie', 'rey', 'rai', 'ret', 'raid', 'erre', 'rue', 'roue', 'ray', 'rets', 'rep'],
  mi: ['mi', 'mie', 'mit', 'mis', 'mix', 'amie', 'ami', 'midi', 'mini', 'mythe', 'nuit'],
  fa: ['fa', 'fat', 'fas', 'fah', 'fac', 'phare', 'far', 'fin', 'fine', 'fard', 'fort'],
  sol: ['sol', 'sole', 'saul', 'soll', 'seul', 'sols', 'solde', 'saoul', 'soleil', 'solo'],
  la: ['la', 'las', 'lah', 'lard', 'lac', 'art', 'lart', 'lanc'],
  si: ['si', 'scie', 'ci', 'cis', 'sit', 'sy', 'six', 'sil'],
};

const SYNONYMS_EN = {
  a: ['a', 'ay', 'eh', 'aye'],
  b: ['b', 'be', 'bee', 'bea'],
  c: ['c', 'see', 'sea', 'si'],
  d: ['d', 'dee'],
  e: ['e', 'ee', 'eee'],
  f: ['f', 'eff', 'ef'],
  g: ['g', 'gee', 'jee'],
};

// MIDI note number 60 = C4 (middle C) by convention; pitch class is the
// number mod 12. Only natural (white-key) pitch classes map to a letter —
// sharps/flats never match, since the staff notes we teach are all naturals.
const MIDI_PITCH_CLASS_TO_LETTER = { 0: 'C', 2: 'D', 4: 'E', 5: 'F', 7: 'G', 9: 'A', 11: 'B' };
const MIDI_DISPLAY_NAMES_FR = ['Do', 'Do♯', 'Ré', 'Ré♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si'];
const MIDI_DISPLAY_NAMES_EN = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

function midiDisplayName(pitchClass) {
  return (lang() === 'en' ? MIDI_DISPLAY_NAMES_EN : MIDI_DISPLAY_NAMES_FR)[pitchClass];
}

function midiNoteName(midiNumber) {
  const pitchClass = ((midiNumber % 12) + 12) % 12;
  const octave = Math.floor(midiNumber / 12) - 1;
  return `${midiDisplayName(pitchClass)}${toSubscript(octave)}`;
}

// How solidly the most-recently-unlocked note must be answered before the
// next one appears: enough attempts, a low enough error rate, and answered
// close enough to the player's own pace (see unlockGate).
const MIN_ATTEMPTS_TO_UNLOCK = 8;
const UNLOCK_MAX_ERROR_RATE = 0.15;
const UNLOCK_MAX_SPEED_RATIO = 1.5;
const STORAGE_KEY = 'noteReadingTrainerV1';

// Below this many attempts a note is still "being introduced" — shown with a
// ✨ badge — regardless of how those first few answers went, since a couple
// of data points aren't enough to call an error rate reliable yet. Purely
// informational: it doesn't feed the pick-weight formula.
const LEARNING_ATTEMPTS = 6;

// Flat penalty added to a note's measured time for every miss along the way,
// on top of the real elapsed time (which already keeps running through
// retries — see onIncorrect). Makes a mistake cost something predictable
// even if the very next retry is instant.
const MISS_TIME_PENALTY_MS = 5000;

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
  };
}

// Note naming is language-dependent (solfège in French, letter names in
// English — see the i18n section above), so it's computed on demand from
// the language-independent `letter`/`solfege`/`octave` rather than baked
// into the note object at creation time.
function noteLabel(n) {
  return lang() === 'en' ? n.letter : DISPLAY_LABEL[n.solfege];
}

function noteDisplayLabel(n) {
  return `${noteLabel(n)}${toSubscript(n.octave)}`;
}

const NOTES = buildNotes();
const NOTES_BY_ID = Object.fromEntries(NOTES.map((n) => [n.id, n]));

// The curriculum order notes get unlocked in — separate from `order` (which
// is the bottom-to-top staff position used for display). Defaults to `order`
// for every note. Bass is overridden below to start at F3, the line the bass
// ("F") clef is anchored on and drawn between its two dots — the one note
// readable straight off the clef symbol with no counting — then radiate
// outward by diatonic distance, alternating up/down on ties.
NOTES.forEach((n) => {
  n.unlockOrder = n.order;
});

(function assignBassUnlockOrder() {
  const bass = NOTES.filter((n) => n.clef === 'bass').sort((a, b) => a.order - b.order);
  const anchorIndex = bass.findIndex((n) => n.key === 'f/3');
  const ranked = bass
    .map((n, i) => ({ n, i }))
    .sort((a, b) => {
      const da = Math.abs(a.i - anchorIndex);
      const db = Math.abs(b.i - anchorIndex);
      if (da !== db) return da - db;
      const aUp = a.i > anchorIndex;
      const bUp = b.i > anchorIndex;
      return aUp === bUp ? 0 : aUp ? -1 : 1;
    });
  ranked.forEach(({ n }, rank) => {
    n.unlockOrder = rank;
  });
})();

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
    progress[n.id] = { attempts: 0, misses: 0, unlocked: false };
  });

  const trebleFirst = NOTES.find((n) => n.clef === 'treble' && n.unlockOrder === 0);
  const bassFirst = NOTES.find((n) => n.clef === 'bass' && n.unlockOrder === 0);
  progress[trebleFirst.id].unlocked = true;
  progress[bassFirst.id].unlocked = true;

  const stats = { totalAttempts: 0, totalCorrect: 0, streak: 0, bestStreak: 0, speedBaseline: {} };
  const settings = { clefMode: 'both', inputMode: 'midi', sessionMinutes: 0, lang: 'fr' };

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
// True right after a miss, until the note is retried correctly or skipped —
// turns the current note red on the staff instead of the usual blue.
state.currentWrong = false;
// Accumulates 5s per miss on the current note (see MISS_TIME_PENALTY_MS),
// added to its elapsed time once finally answered correctly.
state.missPenaltyMs = 0;
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
const resetBassBtn = document.getElementById('resetBassBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFileInput = document.getElementById('importFile');
const unsupportedMsg = document.getElementById('unsupportedMsg');
const midiUnsupportedMsg = document.getElementById('midiUnsupportedMsg');
const midiDeviceStatusEl = document.getElementById('midiDeviceStatus');
const listeningTextEl = document.getElementById('listeningText');
const onscreenKeyboardEl = document.getElementById('onscreenKeyboard');
const statsGridEl = document.getElementById('statsGrid');
const notesTableBodyEl = document.getElementById('notesTableBody');
const notesTableEl = document.getElementById('notesTable');
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
const WRONG_NOTE_STYLE = { fillStyle: '#e63946', strokeStyle: '#e63946' };
const STAFF_SCALE = 1.45;

// Notes already recognized in this batch stay visible but dim to "done";
// the note currently being asked is highlighted; the rest wait their turn.
// A just-missed current note turns red instead of blue, staying that way
// through the retry until it's answered correctly.
function styleForPosition(index, currentIndex, doneMask, wrong) {
  if (doneMask[index]) return DONE_NOTE_STYLE;
  if (index === currentIndex) return wrong ? WRONG_NOTE_STYLE : CURRENT_NOTE_STYLE;
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

function renderBatch(batch, currentIndex, doneMask, wrong) {
  const clefsUsed = new Set(batch.map((n) => n.clef));
  if (clefsUsed.size > 1) {
    renderGrandStaffBatch(batch, currentIndex, doneMask, wrong);
  } else {
    renderSingleStaffBatch(batch, currentIndex, doneMask, batch[0].clef, wrong);
  }
}

// Live probability of each note being picked on the next draw, given the
// current practice pool (respects clef mode) and the same weights the picker
// actually uses. Notes outside the active pool (locked, or excluded by the
// clef filter) are absent from the map and display as 0%.
function pickProbabilities() {
  const pool = practicePool();
  const poolMin = poolMinAvgMs(pool);
  const weights = pool.map((n) => noteWeight(n, poolMin));
  const total = weights.reduce((a, b) => a + b, 0);
  const map = new Map();
  if (total > 0) {
    // One decimal, not a whole percent: two notes with genuinely different
    // (but close) weights would otherwise round to the same displayed
    // integer and look identical when they aren't.
    pool.forEach((n, i) => map.set(n.id, Math.round((weights[i] / total) * 1000) / 10));
  }
  return map;
}

function renderSingleStaffBatch(batch, currentIndex, doneMask, clef, wrong) {
  const VF = Vex.Flow;
  const context = createScaledContext(400, 190);

  const stave = new VF.Stave(10, 40, 360);
  stave.addClef(clef);
  stave.setContext(context).draw();

  const staveNotes = batch.map((note, i) => {
    const sn = new VF.StaveNote({ keys: [note.key], duration: 'q', clef });
    sn.setStyle(styleForPosition(i, currentIndex, doneMask, wrong));
    return sn;
  });

  const voice = new VF.Voice({ num_beats: batch.length, beat_value: 4 }).setStrict(false);
  voice.addTickables(staveNotes);
  new VF.Formatter().joinVoices([voice]).format([voice], 300);
  voice.draw(context, stave);
}

function renderGrandStaffBatch(batch, currentIndex, doneMask, wrong) {
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
    const style = styleForPosition(i, currentIndex, doneMask, wrong);
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

// Fraction of attempts on this note that were wrong. 0 for a never-tried
// note — that absence of data is handled separately wherever it matters
// (pick weight, review pool), not baked into this helper.
function errorRateOf(p) {
  return p.attempts ? (p.misses || 0) / p.attempts : 0;
}

// In review mode the pool is always exactly the REVIEW_POOL_SIZE shakiest
// notes — ranked by whichever signal is worse, a high error rate or a
// rolling average well behind the pool's fastest note — not a variable-size
// set gated by a threshold.
const REVIEW_POOL_SIZE = 5;

function practicePool() {
  const base = unlockedNotesForPractice();
  if (!state.reviewMode) return base;
  const poolMin = poolMinAvgMs(base);
  const needScore = (n) => {
    const p = state.progress[n.id];
    if (!p.attempts) return 1; // no data yet: treat as needing review
    return Math.max(errorRateOf(p), speedGapBoost(p, poolMin) / SPEED_GAP_FACTOR);
  };
  return [...base].sort((a, b) => needScore(b) - needScore(a)).slice(0, Math.min(REVIEW_POOL_SIZE, base.length));
}

// Fastest recorded rolling average in a pool, or null if nobody in it has
// answered correctly yet. Used as the zero-point for the relative-speed
// factor below: gaps are measured from the pool's own best time, not from
// an absolute duration, so they stay meaningful across input modes and
// players of very different paces.
function poolMinAvgMs(pool) {
  let min = null;
  pool.forEach((n) => {
    const avg = state.progress[n.id].avgMs;
    if (avg != null && (min == null || avg < min)) min = avg;
  });
  return min;
}

// Relative-speed boost: (avgMs - pool's fastest avgMs) / pool's fastest
// avgMs, i.e. "how many times slower than my best note, as a fraction of
// that best time" — subtracting the floor before comparing, exactly so
// that a note which is merely a little slower than the fastest doesn't
// get lost against the fastest's own absolute time. The cap is generous
// (saturates only past ~26x the fastest note) rather than tight: this is
// now the *only* signal
// driving pick weight (see noteWeight), so a low cap made every note beyond
// a modest gap saturate to the exact same weight — e.g. a note at 1.4s and
// one at 2.5s both hitting the old cap of 6 and showing identical odds
// despite a real, meaningful speed difference. It still exists purely to
// stop one pathological outlier (a data glitch) from starving everything
// else completely.
const SPEED_GAP_FACTOR = 4;
const SPEED_GAP_MAX = 100;

function speedGapBoost(p, poolMin) {
  if (p.avgMs == null || poolMin == null || poolMin <= 0) return 0;
  const relativeGap = Math.max(0, p.avgMs - poolMin) / poolMin;
  return Math.min(SPEED_GAP_MAX, SPEED_GAP_FACTOR * relativeGap);
}

// Pick weight is driven by average time alone — how much slower a note's
// rolling average is than the pool's fastest note — not by error rate.
// TIME_WEIGHT_FLOOR keeps even the fastest note from hitting literal zero,
// so it can still turn up sometimes. A note with no correct answer recorded
// yet has nothing to compare, so it's treated as needing full attention
// until a real time comes in.
const TIME_WEIGHT_FLOOR = 0.1;
const TIME_WEIGHT_NO_DATA = TIME_WEIGHT_FLOOR + SPEED_GAP_MAX + 1;

function noteWeight(note, poolMin) {
  const p = state.progress[note.id];
  if (p.avgMs == null) return TIME_WEIGHT_NO_DATA;
  return TIME_WEIGHT_FLOOR + speedGapBoost(p, poolMin);
}

// `excludeIds` may be a single id, a Set, or an array of ids to hard-exclude
// (the previous note, and — from newBatch — every note already placed
// earlier in the same batch, so the same exact note/octave never shows
// twice among the notes on screen at once). Falls back to the full pool
// when excluding would leave nothing to pick from, i.e. fewer distinct
// notes are unlocked than are needed.
function pickNextNote(excludeIds) {
  const excludeSet = excludeIds instanceof Set ? excludeIds : new Set(excludeIds ? [excludeIds] : []);
  let candidates = practicePool();
  if (excludeSet.size) {
    const filtered = candidates.filter((n) => !excludeSet.has(n.id));
    if (filtered.length > 0) candidates = filtered;
  }

  const poolMin = poolMinAvgMs(candidates);
  const weights = candidates.map((n) => noteWeight(n, poolMin));
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
// Full credit (1) once `actual` is at or under `limit` — this is a pass/fail
// bar, not something to keep optimizing past — degrading gracefully toward 0
// the further above it is. Using a hard "must reach 0" target instead would
// make the bar effectively unreachable after a single lifetime miss, since a
// misses/attempts ratio never returns to exactly 0 no matter how many
// correct answers follow.
function gateRatio(actual, limit) {
  if (actual <= limit) return 1;
  return Math.max(0, 1 - (actual - limit) / limit);
}

function unlockGate(clef) {
  const seq = NOTES.filter((n) => n.clef === clef).sort((a, b) => a.unlockOrder - b.unlockOrder);
  const unlocked = seq.filter((n) => state.progress[n.id].unlocked);
  const next = seq.find((n) => !state.progress[n.id].unlocked);
  if (!next || unlocked.length === 0) return null;

  // Only the most recently unlocked note needs to be ready — requiring every
  // previously-unlocked note to stay simultaneously "ready" made later notes
  // (often the same letter on another octave) take longer and longer to
  // reach as the practice pool grew. "Ready" means: enough attempts, a low
  // enough error rate, and answered close enough to the player's own pace.
  const gate = state.progress[unlocked[unlocked.length - 1].id];
  const attemptsPart = Math.min(1, gate.attempts / MIN_ATTEMPTS_TO_UNLOCK);
  const errorPart = gateRatio(errorRateOf(gate), UNLOCK_MAX_ERROR_RATE);
  const baseline = speedBaselineMs();
  const speedPart = gate.avgMs == null ? 0 : gateRatio(gate.avgMs, UNLOCK_MAX_SPEED_RATIO * baseline);
  return { next, progress: Math.min(attemptsPart, errorPart, speedPart) };
}

function maybeUnlockNext(clef) {
  const info = unlockGate(clef);
  if (!info || info.progress < 1) return null;
  state.progress[info.next.id].unlocked = true;
  return info.next;
}

function todayKey(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dd}`;
}

// 0-100 measure of overall reading level: accuracy (1 - error rate) summed
// across the full range of notes, so it grows both by unlocking new notes
// and by cutting mistakes on the ones already unlocked. An unlocked note
// with no attempts yet contributes 0, same as a locked one.
function globalLevel() {
  const sum = NOTES.reduce((s, n) => {
    const p = state.progress[n.id];
    if (!p.unlocked || !p.attempts) return s;
    return s + (1 - errorRateOf(p));
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
  const key = `${noteDisplayLabel(note)} → ${givenLabel}`;
  state.confusions[key] = (state.confusions[key] || 0) + 1;
}

function updateAfterAnswer(note, correct, elapsedMs) {
  const p = state.progress[note.id];
  p.attempts += 1;
  if (!correct) p.misses = (p.misses || 0) + 1;

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

// Returns the spoken note's key — a solfège syllable in French ('do', 're',
// ...), a lowercase letter in English ('c', 'd', ...) — or null. Compare
// against a note with spokenKeyMatches(); render for display with
// spokenKeyLabel().
function findSpokenKey(words) {
  const synonyms = lang() === 'en' ? SYNONYMS_EN : SYNONYMS_FR;
  // Also try adjacent-word concatenations: elisions like "d'eau" or "s'y" get
  // split into separate words ("d", "eau") once punctuation is stripped.
  const tokens = [...words];
  for (let i = 0; i < words.length - 1; i++) {
    tokens.push(words[i] + words[i + 1]);
  }

  const candidates = new Set();
  tokens.forEach((tok) => wordVariants(tok).forEach((v) => candidates.add(v)));

  for (const token of candidates) {
    for (const key of Object.keys(synonyms)) {
      if (synonyms[key].includes(token)) return key;
    }
  }
  return null;
}

function spokenKeyMatches(key, note) {
  return lang() === 'en' ? key === note.letter.toLowerCase() : key === note.solfege;
}

function spokenKeyLabel(key) {
  return lang() === 'en' ? key.toUpperCase() : DISPLAY_LABEL[key];
}

function setupRecognition() {
  if (!SpeechRecognitionCtor) {
    return false;
  }
  recognition = new SpeechRecognitionCtor();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 5;

  function handleSpeechEvent(event) {
    state.awaitingResult = false;
    state.silentEndStreak = 0;
    const results = event.results && event.results[0];
    if (!results || results.length === 0) {
      onIncorrect(t('micUnintelligible'), null);
      return;
    }

    let matched = null;
    let interpretedLabel = null;
    const rawTranscript = results[0].transcript.trim() || t('micSilence');

    for (let i = 0; i < results.length; i++) {
      const words = normalizeWords(results[i].transcript);
      const spoken = findSpokenKey(words);
      if (!interpretedLabel && spoken) interpretedLabel = spokenKeyLabel(spoken);
      if (spoken && spokenKeyMatches(spoken, state.currentNote)) {
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
      setFeedback(t('micBlocked'), 'error');
      state.autoMode = false;
      micBtn.classList.remove('hidden');
    } else if (event.error === 'aborted') {
      // user- or code-triggered stop, nothing to do
    } else {
      setFeedback(t('micError', event.error), 'error');
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
        setFeedback(t('micServiceDown'), 'error');
        state.autoMode = false;
        micBtn.classList.remove('hidden');
      } else {
        setFeedback(t('micNoResponse'), 'error');
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
    // Set right before each start (not once at setup) so a language switch
    // takes effect on the next attempt without needing to recreate the
    // recognition object.
    recognition.lang = lang() === 'en' ? 'en-US' : 'fr-FR';
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
    onIncorrect(label, null, midiDisplayName(pitchClass));
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
    midiDeviceStatusEl.textContent = t('midiDenied');
    return;
  }
  if (!midiAccess) {
    midiDeviceStatusEl.className = 'midi-status missing';
    midiDeviceStatusEl.textContent = t('midiWaiting');
    return;
  }

  const inputs = [...midiAccess.inputs.values()];
  if (inputs.length === 0) {
    midiDeviceStatusEl.className = 'midi-status missing';
    midiDeviceStatusEl.textContent = t('midiNoDevice');
  } else {
    midiDeviceStatusEl.className = 'midi-status connected';
    midiDeviceStatusEl.textContent = t('midiConnected', inputs.map((i) => i.name).join(', '));
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

  if (isMic) listeningTextEl.textContent = t('listeningMic');
  else if (isMidi) listeningTextEl.textContent = t('listeningMidi');
  else listeningTextEl.textContent = t('listeningKeyboard');

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
  // Seeded with the last note of the previous batch so the run doesn't
  // repeat across the boundary either, then grown so every note already
  // placed in this batch is excluded from the rest of it.
  const usedIds = new Set(state.lastNoteId ? [state.lastNoteId] : []);
  for (let i = 0; i < QUEUE_SIZE; i++) {
    const note = pickNextNote(usedIds);
    batch.push(note);
    usedIds.add(note.id);
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
  state.currentWrong = false;
  state.missPenaltyMs = 0;
  renderBatch(state.noteBatch, state.batchIndex, state.batchDone, false);
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
  const elapsedMs = Date.now() - (state.noteShownAt || Date.now()) + (state.missPenaltyMs || 0);
  const elapsedLabel = (elapsedMs / 1000).toFixed(1) + 's';
  const speed = elapsedMs <= fastAnswerMs() ? ' ⚡' : elapsedMs >= slowAnswerMs() ? ' 🐢' : '';
  // A new-note unlock can happen here, but deliberately gets no feedback of
  // its own and no extra delay: it's surfaced in the stats grid (🔒 turning
  // into a live cell) rather than interrupting the answer flow or timing.
  updateAfterAnswer(note, true, elapsedMs);
  const streak = state.stats.streak;
  const milestone = streak > 0 && streak % 10 === 0 ? t('milestoneStreak', streak) : '';
  setFeedback(t('feedbackCorrect', noteLabel(note), elapsedLabel, speed, milestone), 'success');
  updateTopbar();
  advanceAfterCorrect();
  if (state.autoMode) beginRound();
}

function onIncorrect(rawHeard, interpretedLabel, givenLabel) {
  const note = state.currentNote;
  const interpretation = interpretedLabel && interpretedLabel !== rawHeard ? t('understood', interpretedLabel) : '';
  const source = state.settings.inputMode === 'mic' ? t('sourceMic') : t('sourceKeyboard');
  // Deliberately doesn't name the correct note: it's a sight-reading drill,
  // so the answer must come from re-reading the (now red) staff, not from
  // being told the label in text.
  setFeedback(t('feedbackIncorrect', source, rawHeard, interpretation), 'error');
  // What the player answered instead: the played pitch (MIDI/keyboard) or the
  // understood syllable (mic). Silence/noise isn't a confusion and passes null.
  recordConfusion(note, givenLabel || interpretedLabel);
  updateAfterAnswer(note, false);
  updateTopbar();
  state.missPenaltyMs = (state.missPenaltyMs || 0) + MISS_TIME_PENALTY_MS;

  // Stay on the same note instead of moving on: it turns red, and
  // noteShownAt is deliberately left untouched, so the clock keeps running
  // from when the note first appeared. Only the average time matters now
  // (see noteWeight), so the eventual correct answer's elapsed time should
  // reflect the whole struggle — misses and their flat penalty included —
  // not reset to a clean, misleadingly fast final guess.
  state.currentWrong = true;
  renderBatch(state.noteBatch, state.batchIndex, state.batchDone, true);
  if (state.autoMode) beginListening();
}

// ---------- Stats UI ----------

// Color tier from the error rate alone: <10% error is solid, 10-30% still
// needs work, above 30% needs real attention. A freshly-unlocked note with
// no attempts yet is neither good nor bad — 'mid' until real data comes in.
const ERROR_RATE_MID = 0.1;
const ERROR_RATE_WEAK = 0.3;

function noteStatusClass(entry) {
  if (!entry.unlocked) return 'locked';
  if (!entry.attempts) return 'mid';
  const rate = errorRateOf(entry);
  if (rate > ERROR_RATE_WEAK) return 'weak';
  if (rate >= ERROR_RATE_MID) return 'mid';
  return 'strong';
}

// The stats grid keeps a stable DOM (built once, then patched in place) so
// CSS transitions on the mastery bars and cell colors can animate between
// updates instead of being destroyed by innerHTML rebuilds.
const statsCells = new Map(); // note id -> { cell, labelEl, pctEl, fillEl }
const nextUnlockEls = {}; // clef -> element showing next-unlock progress

const clefTitleEls = {}; // clef -> element showing the clef's translated title

function buildStatsGrid() {
  statsGridEl.innerHTML = '';
  statsCells.clear();

  ['treble', 'bass'].forEach((clef) => {
    const wrap = document.createElement('div');
    const heading = document.createElement('div');
    heading.className = 'clef-row-title';
    const titleEl = document.createElement('span');
    titleEl.textContent = clef === 'treble' ? t('clefTreble') : t('clefBass');
    clefTitleEls[clef] = titleEl;
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
    cell.className = 'note-cell ' + noteStatusClass(entry);
    if (reviewIds && reviewIds.has(n.id)) cell.classList.add('in-review');
    const displayLabel = noteDisplayLabel(n);
    if (!entry.unlocked) {
      labelEl.textContent = t('lockedCell', displayLabel);
      return;
    }
    const learning = entry.attempts < LEARNING_ATTEMPTS;
    labelEl.textContent = learning ? t('learningBadge', displayLabel) : displayLabel;
    pctEl.textContent = (pickPcts.get(n.id) || 0).toFixed(1) + '%';
    const errorPct = entry.attempts ? Math.round(errorRateOf(entry) * 100) : 0;
    fillEl.style.width = (entry.attempts ? Math.round((1 - errorRateOf(entry)) * 100) : 0) + '%';
    const avgPart = entry.avgMs ? t('avgTimeSuffix', (entry.avgMs / 1000).toFixed(1)) : '';
    cell.title = t('cellTooltip', displayLabel, errorPct, entry.attempts, avgPart);
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
    clefTitleEls[clef].textContent = clef === 'treble' ? t('clefTreble') : t('clefBass');
    nextUnlockEls[clef].textContent = state.reviewMode
      ? t('nextUnlockPaused')
      : info
        ? t('nextUnlockInfo', noteDisplayLabel(info.next), Math.round(info.progress * 100))
        : t('nextUnlockAllDone');
  });

  // The review pool shifts as notes get consolidated; keep the hint fresh.
  if (state.reviewMode) applyPracticeModeUI();

  renderNotesTable();
}

// ---------- Sortable notes table ----------

// Missing data (locked note, or a metric with nothing recorded yet) sorts as
// the lowest possible value, so those rows consistently cluster at one end
// instead of scattering unpredictably through the middle of a sort.
const NOTES_TABLE_MISSING = -1;

state.tableSort = { key: 'pick', dir: 'desc' };
state.tableClefFilter = 'both';

function noteTableRow(n, pickPcts) {
  const p = state.progress[n.id];
  const pickPct = pickPcts.get(n.id);
  const errorRatePct = p.attempts ? Math.round(errorRateOf(p) * 100) : null;
  const learning = p.unlocked && p.attempts < LEARNING_ATTEMPTS;
  const status = !p.unlocked
    ? t('lockedCell', t('statusLocked'))
    : learning
      ? t('statusLearning')
      : noteStatusClass(p) === 'weak'
        ? t('statusWeak')
        : noteStatusClass(p) === 'mid'
          ? t('statusMid')
          : t('statusStrong');

  return {
    note: n,
    unlocked: p.unlocked,
    label: noteDisplayLabel(n),
    clef: n.clef === 'treble' ? t('clefShortTreble') : t('clefShortBass'),
    status,
    pick: p.unlocked ? pickPct ?? 0 : null,
    errorRate: errorRatePct,
    avgMs: p.avgMs || null,
    attempts: p.attempts || 0,
  };
}

function sortVal(row, key) {
  const v = row[key];
  if (key === 'label' || key === 'clef' || key === 'status') return v;
  return v == null ? NOTES_TABLE_MISSING : v;
}

function renderNotesTable() {
  const { key, dir } = state.tableSort;
  const pickPcts = pickProbabilities();
  const filtered =
    state.tableClefFilter === 'both' ? NOTES : NOTES.filter((n) => n.clef === state.tableClefFilter);
  const rows = filtered.map((n) => noteTableRow(n, pickPcts)).sort((a, b) => {
    const va = sortVal(a, key);
    const vb = sortVal(b, key);
    let cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
    return dir === 'asc' ? cmp : -cmp;
  });

  notesTableBodyEl.innerHTML = rows
    .map((r) => {
      const cls = r.unlocked ? '' : 'locked-row';
      return `<tr class="${cls}">
        <td>${r.label}</td>
        <td>${r.clef}</td>
        <td>${r.status}</td>
        <td>${r.pick == null ? '—' : r.pick.toFixed(1) + '%'}</td>
        <td>${r.errorRate == null ? '—' : r.errorRate + '%'}</td>
        <td>${r.avgMs == null ? '—' : (r.avgMs / 1000).toFixed(1) + 's'}</td>
        <td>${r.attempts}</td>
      </tr>`;
    })
    .join('');

  notesTableEl.querySelectorAll('th').forEach((th) => {
    th.classList.toggle('sorted', th.dataset.sort === key);
    th.querySelector('.sort-arrow')?.remove();
    if (th.dataset.sort === key) {
      const arrow = document.createElement('span');
      arrow.className = 'sort-arrow';
      arrow.textContent = dir === 'asc' ? ' ▲' : ' ▼';
      th.appendChild(arrow);
    }
  });
}

notesTableEl.querySelectorAll('th[data-sort]').forEach((th) => {
  th.addEventListener('click', () => {
    const key = th.dataset.sort;
    if (state.tableSort.key === key) {
      state.tableSort.dir = state.tableSort.dir === 'asc' ? 'desc' : 'asc';
    } else {
      state.tableSort = { key, dir: key === 'label' || key === 'clef' || key === 'status' ? 'asc' : 'desc' };
    }
    renderNotesTable();
  });
});

const tableClefFilterEl = document.getElementById('tableClefFilter');
tableClefFilterEl.querySelectorAll('.clef-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const clef = btn.dataset.clef;
    if (clef === state.tableClefFilter) return;
    state.tableClefFilter = clef;
    tableClefFilterEl.querySelectorAll('.clef-btn').forEach((b) => b.classList.toggle('active', b === btn));
    renderNotesTable();
  });
});

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
    titleKey: 'chartTitleLevel',
    color: '#4361ee',
    value: (d) => d.level,
    domain: [0, 100],
  },
  accuracy: {
    titleKey: 'chartTitleAccuracy',
    color: '#2a9d8f',
    value: (d) => (d.attempts ? Math.round((d.correct / d.attempts) * 100) : null),
    domain: [0, 100],
  },
  speed: {
    titleKey: 'chartTitleSpeed',
    color: '#f4a261',
    value: (d) => (d.timeCount ? +(d.timeSum / d.timeCount / 1000).toFixed(2) : null),
    domain: null,
  },
  volume: {
    titleKey: 'chartTitleVolume',
    color: '#4361ee',
    value: (d) => d.attempts,
    domain: null,
    bars: true,
  },
};

function chartDayLabel(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(lang() === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short' });
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
    progressChartEl.innerHTML = `<div class="chart-empty">${t('chartEmpty')}</div>`;
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
    `<div class="chart-title">${t(metric.titleKey)}</div>` +
    `<svg viewBox="0 0 ${W} ${H}" role="img">${gridLines}${marks}${lastLabel}${xLabels}</svg>` +
    (points.length === 1 ? `<div class="chart-empty">${t('chartEmptyOneDay')}</div>` : '');
}

function renderTodayChips() {
  const today = state.history[todayKey()] || { attempts: 0, correct: 0, timeSum: 0, timeCount: 0 };
  const acc = today.attempts ? Math.round((today.correct / today.attempts) * 100) + '%' : '–';
  const spd = today.timeCount ? (today.timeSum / today.timeCount / 1000).toFixed(1) + 's' : '–';
  const days = practiceStreakDays();
  todayChipsEl.innerHTML = [
    `<span class="chip">${t('chipNotesToday', today.attempts)}</span>`,
    `<span class="chip">${t('chipAccuracy', acc)}</span>`,
    `<span class="chip">${t('chipPerNote', spd)}</span>`,
    `<span class="chip">${t('chipLevel', globalLevel())}</span>`,
    `<span class="chip${days > 0 ? ' chip-fire' : ''}">${t('chipStreakDays', days)}</span>`,
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
      const dateLabel = cellDate.toLocaleDateString(lang() === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short' });
      col += `<i class="hm-cell hm-${bucket}" title="${t('heatmapTooltip', dateLabel, n)}"></i>`;
    }
    html += `<span class="hm-col">${col}</span>`;
  }
  heatmapEl.innerHTML = html;
}

function renderInsights() {
  const weak = unlockedNotes()
    .filter((n) => state.progress[n.id].attempts > 0 && errorRateOf(state.progress[n.id]) >= ERROR_RATE_MID)
    .sort((a, b) => errorRateOf(state.progress[b.id]) - errorRateOf(state.progress[a.id]))
    .slice(0, 3);
  const confusions = Object.entries(state.confusions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  let html = '';
  if (weak.length) {
    html +=
      `<div class="insight-block"><div class="insight-title">${t('insightToWork')}</div>` +
      weak
        .map((n) => `<span class="insight-chip">${noteDisplayLabel(n)} · ${t('insightErrorRate', Math.round(errorRateOf(state.progress[n.id]) * 100))}</span>`)
        .join('') +
      '</div>';
  }
  if (confusions.length) {
    html +=
      `<div class="insight-block"><div class="insight-title">${t('insightConfusions')}</div>` +
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
    reviewHintEl.textContent = t('reviewHint', pool.length, pool.map((n) => noteDisplayLabel(n)).join(', '));
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
  sessionTimerEl.textContent = t('sessionTimerRemaining', formatCountdown(state.sessionRemainingMs));
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
    `<div class="session-summary-title">${t('sessionSummaryTitle')}</div>` +
    '<div class="today-chips">' +
    `<span class="chip">${t('sessionSummaryNotes', attempts)}</span>` +
    `<span class="chip">${t('sessionSummaryAccuracy', acc)}</span>` +
    `<span class="chip">${t('sessionSummaryUnlocked', unlockedGain)}</span>` +
    `<span class="chip">${t('sessionSummaryLevel', levelGain)}</span>` +
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
  startBtn.textContent = t('btnStart');
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
  setFeedback(t('pausedMessage'), '');
  stopBtn.classList.add('hidden');
  skipBtn.classList.add('hidden');
  micBtn.classList.add('hidden');
  startBtn.classList.remove('hidden');
  startBtn.textContent = t('btnResume');
});

resetBtn.addEventListener('click', () => {
  const ok = confirm(t('confirmReset'));
  if (!ok) return;
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
});

resetBassBtn.addEventListener('click', () => {
  const ok = confirm(t('confirmResetBass'));
  if (!ok) return;

  NOTES.filter((n) => n.clef === 'bass').forEach((n) => {
    state.progress[n.id] = { attempts: 0, misses: 0, unlocked: false };
  });
  const first = NOTES.find((n) => n.clef === 'bass' && n.unlockOrder === 0);
  state.progress[first.id].unlocked = true;

  // Any queued round may reference a bass note whose progress just got wiped.
  stopListeningNow();
  state.noteBatch = [];
  state.batchDone = [];
  state.batchIndex = 0;

  saveState();
  renderStats();
  renderProgress();
  updateTopbar();
  setFeedback(t('resetBassDone', noteDisplayLabel(first)), 'success');
  if (state.autoMode) beginRound();
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
      alert(t('invalidFile'));
      importFileInput.value = '';
      return;
    }

    if (!data || typeof data.progress !== 'object') {
      alert(t('invalidProgress'));
      importFileInput.value = '';
      return;
    }

    const ok = confirm(t('confirmImport'));
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
    setFeedback(t('importSuccess'), 'success');
    importFileInput.value = '';
  };
  reader.readAsText(file);
});

// ---------- Language switcher ----------

const langSwitcherEl = document.getElementById('langSwitcher');
const appTitleEl = document.getElementById('appTitle');
const staticLabelEls = {
  lblStreak: 'streak', lblRecord: 'record', lblScore: 'score', lblSpeed: 'speed', lblUnlocked: 'unlockedNotes',
  progressTitle: 'progressTitle', regularityTitle: 'regularityTitle', statsTitle: 'statsTitle',
  tableTitle: 'tableTitle',
  lblLegendLocked: 'legendLocked', lblLegendWeak: 'legendWeak', lblLegendMid: 'legendMid', lblLegendStrong: 'legendStrong',
};
const staticButtonEls = {
  exportBtn: 'btnExport', importBtn: 'btnImport', resetBassBtn: 'btnResetBass', resetBtn: 'btnReset',
};
const CLEF_BTN_KEYS = { treble: 'clefTreble', bass: 'clefBass', both: 'clefBoth' };
const INPUT_BTN_KEYS = { mic: 'inputMic', midi: 'inputMidi', keyboard: 'inputKeyboard' };
const PRACTICE_BTN_KEYS = { normal: 'practiceNormal', review: 'practiceReview' };
const METRIC_BTN_KEYS = { level: 'chartLevel', accuracy: 'chartAccuracy', speed: 'chartSpeed', volume: 'chartVolume' };
const TABLE_TH_KEYS = { label: 'thNote', clef: 'thClef', status: 'thStatus', pick: 'thPick', errorRate: 'thError', avgMs: 'thAvg', attempts: 'thAttempts' };

// Applies every static (non-dynamically-rendered) piece of UI text for the
// current language. Dynamic content (feedback, chips, table rows, chart...)
// is already translated live by whatever render function produces it; this
// only covers HTML that's written once and otherwise never revisited.
function applyStaticI18n() {
  document.documentElement.lang = lang();
  document.title = t('pageTitle');
  langSwitcherEl.querySelectorAll('.clef-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang());
  });
  appTitleEl.textContent = t('appTitle');
  Object.entries(staticLabelEls).forEach(([id, key]) => {
    document.getElementById(id).textContent = t(key);
  });
  Object.entries(staticButtonEls).forEach(([id, key]) => {
    document.getElementById(id).textContent = t(key);
  });

  clefSwitcherEl.querySelectorAll('.clef-btn').forEach((btn) => {
    btn.textContent = t(CLEF_BTN_KEYS[btn.dataset.mode]);
  });
  tableClefFilterEl.querySelectorAll('.clef-btn').forEach((btn) => {
    btn.textContent = t(CLEF_BTN_KEYS[btn.dataset.clef]);
  });
  inputModeSwitcherEl.querySelectorAll('.clef-btn').forEach((btn) => {
    btn.textContent = t(INPUT_BTN_KEYS[btn.dataset.input]);
  });
  practiceModeSwitcherEl.querySelectorAll('.clef-btn').forEach((btn) => {
    btn.textContent = t(PRACTICE_BTN_KEYS[btn.dataset.practice]);
  });
  timerSwitcherEl.querySelectorAll('.clef-btn').forEach((btn) => {
    const minutes = Number(btn.dataset.minutes);
    btn.textContent = minutes === 0 ? t('timerFree') : t('timerMinutes', minutes);
  });
  chartSwitcherEl.querySelectorAll('.clef-btn').forEach((btn) => {
    btn.textContent = t(METRIC_BTN_KEYS[btn.dataset.metric]);
  });
  notesTableEl.querySelectorAll('th[data-sort]').forEach((th) => {
    th.textContent = t(TABLE_TH_KEYS[th.dataset.sort]);
  });

  unsupportedMsg.textContent = t('micUnsupported');
  midiUnsupportedMsg.textContent = t('midiUnsupported');
  micBtn.textContent = t('btnRetryMic');
  skipBtn.textContent = t('btnSkip');
  stopBtn.textContent = t('btnPause');
  // startBtn toggles between "start fresh" and "resume from pause"; detect
  // which state it's currently showing (in either language) rather than
  // assuming, since a lang switch shouldn't reset a paused session's label.
  const wasResume = startBtn.textContent === STRINGS.fr.btnResume || startBtn.textContent === STRINGS.en.btnResume;
  startBtn.textContent = wasResume ? t('btnResume') : t('btnStart');

  applyInputModeUI();
  updateMidiDeviceStatusUI();
}

langSwitcherEl.querySelectorAll('.clef-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const newLang = btn.dataset.lang;
    if (newLang === state.settings.lang) return;
    state.settings.lang = newLang;
    saveState();
    langSwitcherEl.querySelectorAll('.clef-btn').forEach((b) => b.classList.toggle('active', b === btn));
    applyStaticI18n();
    // Full re-render: note labels, table headers/rows, chart, chips and
    // insights all embed language-dependent text or note names.
    renderStats();
    renderProgress();
    updateTopbar();
    if (state.autoMode) renderBatch(state.noteBatch, state.batchIndex, state.batchDone, state.currentWrong);
  });
});

// ---------- Init ----------

applyStaticI18n();
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
