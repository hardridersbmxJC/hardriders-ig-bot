/**
 * beats.ts - Turns a Reel script into a timed beat sheet before recording.
 * 
 * Estimates speaking duration, tracks retention checkpoints, and flags retention killers
 * including static shots lasting over 4 seconds, hooks over 3 seconds, abstract runs, and lack of loops.
 * 
 * Ported from beats.py (instagram-agent-skill).
 */

const WORD_RE = /[A-Za-z0-9$%'’-]+/g;
const SENT_RE = /[^.!?]+[.!?]*/g;
const CONCRETE_RE = /\$\s?\d|\b\d[\d,.]*\b|(?:^|\s)[A-Z][a-z]{2,}\b/g;

export const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'if', 'of', 'to', 'in', 'on', 'for',
  'with', 'that', 'this', 'it', 'is', 'are', 'was', 'were', 'be', 'been',
  'you', 'your', 'i', 'my', 'me', 'we', 'our', 'they', 'them', 'he', 'she',
  'so', 'just', 'not', 'no', 'do', 'did', 'does', 'have', 'has', 'had',
  'will', 'can', 'at', 'as', 'by', 'from', 'out', 'up', 'off', 'one', 'all'
]);

export const HOOK_WINDOW_SECONDS = 3.0; // Seconds before the viewer decides whether to scroll
export const MAX_STATIC_BEAT_SECONDS = 4.0; // Alert threshold: static shot > 4s causes drop-off
export const ABSTRACT_RUN_LIMIT = 3; // Beats in a row without checkable elements

export function extractWords(text: string): string[] {
  const normalized = text.replace(/(?<=\d),(?=\d)/g, '');
  return normalized.match(WORD_RE) || [];
}

export function formatTimecode(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s.toFixed(1)}`;
}

/**
 * Splits raw script lines into timed beats.
 * Long paragraphs exceeding 1.5x MAX_STATIC_BEAT_SECONDS are split by sentence.
 */
export function splitBeats(raw: string, wordsPerSecond: number): string[] {
  const beats: string[] = [];
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    if (extractWords(line).length / wordsPerSecond <= MAX_STATIC_BEAT_SECONDS * 1.5) {
      beats.push(line);
      continue;
    }

    const sentences = (line.match(SENT_RE) || []).map((s) => s.trim()).filter(Boolean);
    let buffer = '';

    for (const part of sentences) {
      const candidate = (buffer ? `${buffer} ${part}` : part).trim();
      if (buffer && extractWords(candidate).length / wordsPerSecond > MAX_STATIC_BEAT_SECONDS) {
        beats.push(buffer);
        buffer = part;
      } else {
        buffer = candidate;
      }
    }
    if (buffer) {
      beats.push(buffer);
    }
  }

  return beats;
}

export interface BeatRow {
  index: number;
  start: number;
  duration: number;
  words: number;
  text: string;
  concreteCount: number;
  label: 'HOOK' | 'MID' | 'CTA' | 'HOOK/CTA' | '';
  flags: string[];
}

export interface BeatAnalysisResult {
  wpm: number;
  targetSeconds?: number;
  totalSeconds: number;
  totalWords: number;
  beats: BeatRow[];
  notes: string[];
  hasStaticShotAlert: boolean;
  staticBeats: number[];
}

/**
 * Analyzes script beats, durations, and retention red flags.
 */
export function analyzeBeats(
  rawScript: string,
  options: {
    wpm?: number;
    targetSeconds?: number;
  } = {}
): BeatAnalysisResult | null {
  const wpm = options.wpm ?? 165;
  const wordsPerSecond = wpm / 60.0;
  const beatTexts = splitBeats(rawScript, wordsPerSecond);

  if (beatTexts.length === 0) {
    return null;
  }

  const rows: BeatRow[] = [];
  let clock = 0.0;

  for (let i = 0; i < beatTexts.length; i++) {
    const text = beatTexts[i];
    const wordCount = extractWords(text).length;
    const dur = wordCount / wordsPerSecond;
    const concreteMatches = text.match(CONCRETE_RE) || [];

    rows.push({
      index: i + 1,
      start: Math.round(clock * 100) / 100,
      duration: Math.round(dur * 100) / 100,
      words: wordCount,
      text,
      concreteCount: concreteMatches.length,
      label: '',
      flags: [],
    });

    clock += dur;
  }

  const total = clock;

  // Label structural positions
  for (const r of rows) {
    if (r.index === 1 || r.start + r.duration <= HOOK_WINDOW_SECONDS) {
      r.label = 'HOOK';
    }
  }

  const lastRow = rows[rows.length - 1];
  lastRow.label = lastRow.label !== 'HOOK' ? 'CTA' : 'HOOK/CTA';

  const half = total / 2;
  for (const r of rows) {
    if (!r.label && r.start <= half && half < r.start + r.duration) {
      r.label = 'MID';
    }
  }

  const notes: string[] = [];

  // Check 1: Hook length (> 3s)
  if (rows[0].duration > HOOK_WINDOW_SECONDS) {
    rows[0].flags.push(
      `Hook runs ${rows[0].duration.toFixed(1)}s, past the ${HOOK_WINDOW_SECONDS.toFixed(0)}s window`
    );
    notes.push(
      `Beat 1 takes ${rows[0].duration.toFixed(1)}s to say. Cut it to ${Math.floor(
        HOOK_WINDOW_SECONDS * wordsPerSecond
      )} words or fewer to avoid drop-off before the hook lands.`
    );
  }

  // Check 2: Hook concreteness
  if (rows[0].concreteCount === 0) {
    notes.push(
      'Beat 1 has no number, name, or price. Hooks without checkable specifics suffer higher skip rates.'
    );
  }

  // Check 3: STATIC SHOTS > 4 SECONDS ALERT
  const staticBeats: number[] = [];
  for (const r of rows) {
    if (r.duration > MAX_STATIC_BEAT_SECONDS) {
      r.flags.push(`${r.duration.toFixed(1)}s on a single beat (> ${MAX_STATIC_BEAT_SECONDS}s static threshold)`);
      staticBeats.push(r.index);
    }
  }

  const hasStaticShotAlert = staticBeats.length > 0;
  if (hasStaticShotAlert) {
    notes.push(
      `ALERTA DE PLANO ESTÁTICO: Beat(s) ${staticBeats.join(', ')} superan los ${MAX_STATIC_BEAT_SECONDS}s (${rows
        .filter((r) => r.duration > MAX_STATIC_BEAT_SECONDS)
        .map((r) => `#${r.index}: ${r.duration.toFixed(1)}s`)
        .join(', ')}). Divide la frase o introduce cambios visuales/cortes de cámara para evitar abandonos.`
    );
  }

  // Check 4: Abstract runs (3 beats with no concrete markers)
  let run = 0;
  let startRunIndex: number | null = null;
  for (const r of rows) {
    if (r.concreteCount === 0) {
      run++;
      if (startRunIndex === null) startRunIndex = r.index;
      if (run === ABSTRACT_RUN_LIMIT) {
        notes.push(
          `Beats ${startRunIndex}-${r.index} contain no concrete data. Add a number, name, or tangible artifact to ground the viewer.`
        );
      }
    } else {
      run = 0;
      startRunIndex = null;
    }
  }

  // Check 5: Audio loop retention
  const firstWords = new Set(
    extractWords(rows[0].text)
      .map((w) => w.toLowerCase())
      .filter((w) => !STOPWORDS.has(w))
  );
  const lastWords = new Set(
    extractWords(lastRow.text)
      .map((w) => w.toLowerCase())
      .filter((w) => !STOPWORDS.has(w))
  );

  const loopWords = Array.from(firstWords).filter((w) => lastWords.has(w));
  if (loopWords.length > 0) {
    notes.push(
      `Loop detectado: El último beat repite "${loopWords.slice(0, 3).join(', ')}" del hook. Fomenta reproducciones en bucle automáticas.`
    );
  } else {
    notes.push(
      'Sin loop: El último beat no comparte palabras clave con el hook. Repetir una palabra del inicio en el cierre eleva el replay rate.'
    );
  }

  // Target time check
  if (options.targetSeconds) {
    const delta = total - options.targetSeconds;
    if (Math.abs(delta) <= options.targetSeconds * 0.1) {
      notes.push(`Duración en objetivo (${total.toFixed(1)}s frente a meta de ${options.targetSeconds}s).`);
    } else if (delta > 0) {
      notes.push(
        `${delta.toFixed(1)}s por encima del objetivo. Recorta aprox. ${Math.round(
          delta * wordsPerSecond
        )} palabras.`
      );
    } else {
      notes.push(
        `${(-delta).toFixed(1)}s por debajo del objetivo. Ajusta ritmo o mantén el formato corto.`
      );
    }
  }

  return {
    wpm,
    targetSeconds: options.targetSeconds,
    totalSeconds: Math.round(total * 100) / 100,
    totalWords: rows.reduce((acc, r) => acc + r.words, 0),
    beats: rows,
    notes,
    hasStaticShotAlert,
    staticBeats,
  };
}
