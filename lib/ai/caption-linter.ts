/**
 * caption-linter.ts - Lints an Instagram caption, enforces the 5-hashtag cap,
 * and simulates the feed's visible cutoff (~125 chars) before "... more".
 * 
 * Ported from caption.py (instagram-agent-skill).
 */

export const INSTAGRAM_CAPTION_LIMIT = 2200;
export const DEFAULT_FEED_TRUNCATE_LIMIT = 125;
export const INSTAGRAM_HASHTAG_CAP = 5;

export const FILLER_TAGS = new Set([
  '#viral', '#fyp', '#explore', '#explorepage', '#foryou', '#foryoupage',
  '#trending', '#instagood', '#love', '#follow', '#like4like', '#reels',
  '#reelsinstagram', '#viralreels', '#instadaily'
]);

const HASHTAG_RE = /(?:^|\s)(#[A-Za-z0-9_]+)/g;
const MENTION_RE = /(?:^|\s)(@[A-Za-z0-9_.]+)/g;
const LINK_RE = /https?:\/\/\S+|\bwww\.\S+|\b[a-z0-9-]+\.(?:com|co|io|net|org|ai|app)\/\S*/gi;
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
const CONCRETE_RE = /\$\s?\d|\b\d[\d,.]*\b|(?:^|\s)[A-Z][a-z]{2,}\b/g;

export const CALL_TO_ACTIONS: Array<{ regex: RegExp; name: string }> = [
  { regex: /\bcomment (?:the word |")?[A-Z0-9]{2,}\b/i, name: 'comment a keyword' },
  { regex: /\b(?:dm|message) me\b/i, name: 'DM me' },
  { regex: /\bsave (?:this|it)\b/i, name: 'save this' },
  { regex: /\bshare (?:this|it)\b/i, name: 'share this' },
  { regex: /\bfollow (?:me|for)\b/i, name: 'follow' },
  { regex: /\blink in (?:my )?bio\b/i, name: 'link in bio' },
  { regex: /\b(?:swipe|tap) (?:through|left|right|for|to)\b/i, name: 'swipe or tap' },
  { regex: /\btell me\b|\bwhat would you\b|\bwhich one\b/i, name: 'answer a question' },
];

export interface CaptionCheck {
  check: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  detail: string;
}

export interface CaptionAnalysis {
  characters: number;
  limit: number;
  truncateAt: number;
  visible: string;
  truncated: boolean;
  firstLineChars: number;
  hashtags: string[];
  mentions: string[];
  links: string[];
  emojiCount: number;
  asks: string[];
  checks: CaptionCheck[];
  verdict: 'READY' | 'REVIEW' | 'FIX';
}

/**
 * Extracts visible window before Instagram's feed cutoff.
 * Instagram cuts mid-word in the feed feed preview.
 */
export function getVisibleFeedWindow(text: string, cut = DEFAULT_FEED_TRUNCATE_LIMIT): string {
  const flat = text.trim();
  return flat.length <= cut ? flat : flat.slice(0, cut);
}

/**
 * Extracts all hashtags from text.
 */
export function extractHashtags(text: string): string[] {
  const tags: string[] = [];
  const matches = text.matchAll(HASHTAG_RE);
  for (const m of matches) {
    if (m[1]) tags.push(m[1]);
  }
  return tags;
}

/**
 * Extracts all mentions from text.
 */
export function extractMentions(text: string): string[] {
  const mentions: string[] = [];
  const matches = text.matchAll(MENTION_RE);
  for (const m of matches) {
    if (m[1]) mentions.push(m[1]);
  }
  return mentions;
}

/**
 * Comprehensive caption linter checking cutoffs, hashtag cap, links, concrete hooks, and calls to action.
 */
export function lintCaption(
  text: string,
  options: {
    truncateAt?: number;
    keywords?: string[];
  } = {}
): CaptionAnalysis {
  const cut = options.truncateAt ?? DEFAULT_FEED_TRUNCATE_LIMIT;
  const stripped = text.trim();
  const chars = stripped.length;
  const lines = stripped.split('\n');
  const firstLine = lines[0]?.trim() || '';

  const hashtags = extractHashtags(stripped);
  const mentions = extractMentions(stripped);
  const links = stripped.match(LINK_RE) || [];
  const emojis = stripped.match(EMOJI_RE) || [];
  const window = getVisibleFeedWindow(stripped, cut);
  const truncated = chars > cut;

  const asks = CALL_TO_ACTIONS.filter(({ regex }) => regex.test(stripped)).map(({ name }) => name);
  const filler = hashtags.filter((t) => FILLER_TAGS.has(t.toLowerCase()));
  const keywords = (options.keywords || []).map((k) => k.trim()).filter(Boolean);

  const checks: CaptionCheck[] = [];

  function addCheck(name: string, status: 'PASS' | 'WARN' | 'FAIL', detail: string) {
    checks.push({ check: name, status, detail });
  }

  // 1. Length check
  if (chars > INSTAGRAM_CAPTION_LIMIT) {
    addCheck('LENGTH', 'FAIL', `${chars} / ${INSTAGRAM_CAPTION_LIMIT} characters, ${chars - INSTAGRAM_CAPTION_LIMIT} over the limit`);
  } else {
    addCheck('LENGTH', 'PASS', `${chars} / ${INSTAGRAM_CAPTION_LIMIT} characters`);
  }

  // 2. First line / Hook check
  if (!firstLine) {
    addCheck('FIRST LINE', 'FAIL', 'Caption opens on a blank line');
  } else if (firstLine.startsWith('#') || firstLine.startsWith('@')) {
    addCheck('FIRST LINE', 'FAIL', 'Opens on a hashtag or mention instead of an engaging sentence');
  } else if (firstLine.length > cut) {
    addCheck('FIRST LINE', 'WARN', `${firstLine.length} characters; cut at ${cut} mid-thought in feed preview`);
  } else {
    addCheck('FIRST LINE', 'PASS', `${firstLine.length} characters, lands whole`);
  }

  // 3. Concrete hook check in visible window
  const concreteMatches = window.match(CONCRETE_RE) || [];
  if (concreteMatches.length > 0) {
    addCheck('HOOK IS CONCRETE', 'PASS', `${concreteMatches.length} concrete element(s) (numbers, entities) in visible window`);
  } else {
    addCheck('HOOK IS CONCRETE', 'WARN', 'Nothing checkable or concrete before the tap in the visible window');
  }

  // 4. Hashtag cap check (Instagram Dec 2025 cap = 5)
  if (hashtags.length > INSTAGRAM_HASHTAG_CAP) {
    addCheck('HASHTAGS', 'FAIL', `${hashtags.length} tags; exceeds Instagram's 5-tag cap. Tags beyond 5 do not count and hurt reach.`);
  } else if (hashtags.length === INSTAGRAM_HASHTAG_CAP && filler.length > 0) {
    addCheck('HASHTAGS', 'WARN', `${hashtags.length} tags at cap, but ${filler.length} are generic filler. Focus on niche topics.`);
  } else if (filler.length > 0) {
    addCheck('HASHTAGS', 'WARN', `${hashtags.length} tags, with generic filler: ${filler.slice(0, 3).join(', ')}`);
  } else {
    addCheck('HASHTAGS', 'PASS', `${hashtags.length} tag(s)${hashtags.length > 0 ? ': ' + hashtags.join(' ') : ''}`);
  }

  // 5. Hashtag placement (should be below the fold)
  if (hashtags.length === 0) {
    addCheck('TAG PLACEMENT', 'PASS', 'No tags to place');
  } else {
    const hasTagInWindow = hashtags.some((t) => window.includes(t));
    if (hasTagInWindow) {
      addCheck('TAG PLACEMENT', 'WARN', 'Hashtag placed inside visible window, consuming valuable feed hook space');
    } else {
      addCheck('TAG PLACEMENT', 'PASS', 'Tags are safely placed below the fold');
    }
  }

  // 6. Links in caption (not clickable)
  if (links.length > 0) {
    addCheck('LINKS', 'WARN', `${links.length} dead link(s) in caption. Captions are not clickable on Instagram; move links to DMs or bio.`);
  } else {
    addCheck('LINKS', 'PASS', 'No unclickable links in caption body');
  }

  // 7. Single ask check
  if (asks.length === 1) {
    addCheck('ONE ASK', 'PASS', `One clear call to action: ${asks[0]}`);
  } else if (asks.length === 0) {
    addCheck('ONE ASK', 'WARN', 'No call to action detected. Guide the reader on what action to take');
  } else {
    addCheck('ONE ASK', 'WARN', `${asks.length} conflicting asks (${asks.join(', ')}). Multiple asks dilute conversion.`);
  }

  // 8. Emoji density
  const emojiDensity = (emojis.length * 100) / Math.max(chars, 1);
  if (emojiDensity > 4) {
    addCheck('EMOJI', 'WARN', `${emojis.length} emoji (${emojiDensity.toFixed(1)} per 100 chars); reads as decoration`);
  } else {
    addCheck('EMOJI', 'PASS', `${emojis.length} emoji (${emojiDensity.toFixed(1)} per 100 chars)`);
  }

  // 9. Optional search terms / keywords
  if (keywords.length > 0) {
    const low = stripped.toLowerCase();
    const found = keywords.filter((k) => low.includes(k.toLowerCase()));
    const missing = keywords.filter((k) => !low.includes(k.toLowerCase()));
    const inWindow = found.filter((k) => window.toLowerCase().includes(k.toLowerCase()));
    const status = missing.length === 0 ? 'PASS' : (found.length > 0 ? 'WARN' : 'FAIL');
    addCheck(
      'SEARCH TERMS',
      status,
      `${found.length}/${keywords.length} present${found.length > 0 ? `, ${inWindow.length} in visible window` : ''}${missing.length > 0 ? `. Missing: ${missing.join(', ')}` : ''}`
    );
  }

  const fails = checks.filter((c) => c.status === 'FAIL').length;
  const warns = checks.filter((c) => c.status === 'WARN').length;
  const verdict: 'READY' | 'REVIEW' | 'FIX' = fails > 0 ? 'FIX' : (warns > 0 ? 'REVIEW' : 'READY');

  return {
    characters: chars,
    limit: INSTAGRAM_CAPTION_LIMIT,
    truncateAt: cut,
    visible: window,
    truncated,
    firstLineChars: firstLine.length,
    hashtags,
    mentions,
    links,
    emojiCount: emojis.length,
    asks,
    checks,
    verdict,
  };
}
