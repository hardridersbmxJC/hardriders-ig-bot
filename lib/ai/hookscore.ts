/**
 * hookscore.ts - Scores a Reel hook across 5 proven attention dimensions
 * and classifies it against 26 validated hook formulas.
 * 
 * Ported from hookscore.py & hooks.json (instagram-agent-skill).
 */

export interface HookFormula {
  id: number;
  name: string;
  template: string;
  example: string;
  on_screen: string;
  best_for: string;
  trap: string;
  match: string;
}

export const HOOK_FORMULAS_DATA: HookFormula[] = [
  {
    "id": 1,
    "name": "Cost Confession",
    "template": "{Specific amount} is what {one mistake} cost me.",
    "example": "$18,000 is what one missing clause cost me.",
    "on_screen": "$18,000 MISTAKE",
    "best_for": "Trust, fast. People finish the videos where you are the one who looks bad.",
    "trap": "A fake cost. 'It cost me my peace of mind' is not a number and everybody can hear that.",
    "match": "\\$\\s?\\d[\\d,]*\\s+(?:is|was) what\\b|\\bcost (?:me|us|him|her|them)\\b|\\blost\\b[^.!?]{0,20}\\$\\s?\\d"
  },
  {
    "id": 2,
    "name": "Negative Command",
    "template": "Stop {common action}. Do {alternative} instead.",
    "example": "Stop posting three times a day. Post twice and reply to every comment for an hour.",
    "on_screen": "STOP POSTING DAILY",
    "best_for": "Saves and arguments. The imperative gets attention that a statement does not.",
    "trap": "Telling people to stop doing something nobody does. The habit has to be one the viewer recognises in themselves.",
    "match": "^\\s*(?:stop|quit|never|don'?t|dont|please)\\b[^.!?]{0,30}\\b(?:do|be|make|buy|use|start|say|post|send|take|charge)?\\b|\\b(?:do not|don'?t|dont|never) (?:do|be|make|buy|use|start|say|post|take)\\b|\\bquit your\\b"
  },
  {
    "id": 3,
    "name": "Nobody Tells You",
    "template": "Nobody tells you that {uncomfortable truth about the thing they want}.",
    "example": "Nobody tells you that your first 30 reels are supposed to flop.",
    "on_screen": "YOUR FIRST 30 WILL FLOP",
    "best_for": "New audiences. It positions you as the person who says the quiet part.",
    "trap": "Picking a truth everybody already says. If the comments are agreeing before you finish, it was not a secret.",
    "match": "\\b(?:nobody|no one|nobody ever)\\s+(?:ever\\s+)?(?:tells|told|talks|talked|says|said|mentions|teaches)\\b|\\bwhat (?:nobody|no one) (?:tells|says)\\b"
  },
  {
    "id": 4,
    "name": "The Replacement",
    "template": "{This thing} replaced {expensive thing} for {price}.",
    "example": "This $12 tool replaced the editor I was paying $2,000 a month.",
    "on_screen": "$2,000 -> $12",
    "best_for": "Demos and tool videos. The price gap does the work.",
    "trap": "Overstating the replacement. If it replaced 60% of the job, say 60%, or the comments will say it for you.",
    "match": "\\breplaced?\\b[^.!?]*\\$\\s?\\d|\\$\\s?\\d[^.!?]*\\breplaced?\\b|\\binstead of (?:paying|hiring)\\b"
  },
  {
    "id": 5,
    "name": "Time Collapse",
    "template": "This used to take me {long time}. It now takes {short time}.",
    "example": "Proposals used to take me five hours. They take twenty minutes now.",
    "on_screen": "5 HOURS -> 20 MIN",
    "best_for": "Process videos where the payoff is speed. Reads instantly on screen.",
    "trap": "A ratio nobody believes. 40 hours to 4 seconds gets treated as a lie even when it is true.",
    "match": "\\bused to take\\b|\\bnow (?:it )?(?:only )?takes?\\b|\\btakes? (?:me )?\\d+\\s*(?:sec|second|min|minute|hour|hr)"
  },
  {
    "id": 6,
    "name": "The Receipt",
    "template": "I {did thing} for {N days}. Here are the actual numbers.",
    "example": "I posted one reel a day for 60 days. Here is what it did to my DMs.",
    "on_screen": "60 DAYS. REAL NUMBERS.",
    "best_for": "Experiments. Pairs with a screen recording of the real dashboard, which is the whole value.",
    "trap": "Not showing the screen. A numbers video with no screen recording is a numbers claim.",
    "match": "\\bi\\s+\\w+(?:ed)?\\s+[^.!?]{0,30}\\bfor\\s+\\d+\\s+(?:days?|weeks?|months?|years?)\\b|\\bhere (?:are|is) (?:the|my)\\b[^.!?]*\\bnumbers\\b|\\bwe(?:'ll| will)? do \\$\\s?\\d"
  },
  {
    "id": 7,
    "name": "Wrong Way, Right Way",
    "template": "You are doing {thing} wrong, and it is not your fault. {The fix}.",
    "example": "You are writing captions wrong, and it is not your fault. Instagram hides everything after line one.",
    "on_screen": "YOUR CAPTIONS ARE CUT",
    "best_for": "Teaching. The 'not your fault' half stops it reading as an insult, which is what kills this one.",
    "trap": "Skipping the absolution. 'You are doing it wrong' on its own makes people leave rather than learn.",
    "match": "\\b(?:big(?:gest)?|common|the) mistake\\b|\\bmistake (?:that|people|i)\\b|\\byou'?(?:re| are) doing\\b[^.!?]*\\bwrong\\b|\\bdoing (?:it|this) wrong\\b"
  },
  {
    "id": 8,
    "name": "Insider Leak",
    "template": "I spent {N years} {inside the thing}. Here is what we never said out loud.",
    "example": "I spent six years selling agency retainers. Here is what we never put in the proposal.",
    "on_screen": "6 YEARS INSIDE",
    "best_for": "Authority without a credential slide. Works only if the years are real.",
    "trap": "Promising a secret and delivering the brochure. The comments are merciless about this one.",
    "match": "\\bi (?:spent|worked|ran|was|have been)\\b[^.!?]*\\b\\d+\\s*\\+?\\s*years?\\b|\\bwe never (?:told|said|showed)\\b|\\bnobody (?:puts|tells you about)\\b|\\bi (?:sell|sold|run)\\b[^.!?]*\\$\\s?\\d"
  },
  {
    "id": 9,
    "name": "The Steal",
    "template": "Steal this {artifact}. It took me {time} to get right.",
    "example": "Steal this four-line follow-up. It took me two years and a lot of dead leads.",
    "on_screen": "STEAL THIS",
    "best_for": "Saves and sends, which are the two metrics that move reach the most.",
    "trap": "The artifact not being on screen. If they cannot screenshot it, there is nothing to steal.",
    "match": "^\\s*steal\\b|\\bsteal (?:this|these|my)\\b|^\\s*(?:here'?s|this is) (?:the|my) (?:exact|literal)\\b"
  },
  {
    "id": 10,
    "name": "If This, Then Watch",
    "template": "If you {specific situation}, this {short time} fixes it.",
    "example": "If your reels get views and no followers, the next 40 seconds fix it.",
    "on_screen": "VIEWS BUT NO FOLLOWERS?",
    "best_for": "Qualifying hard. Fewer people stay, and the ones who do are the ones who buy.",
    "trap": "A situation so broad it qualifies nobody. 'If you want to grow' is not a situation.",
    "match": "^\\s*if (?:you|i|we|your|my|they)\\b"
  },
  {
    "id": 11,
    "name": "Numbered With A Favourite",
    "template": "{N} {things} that {outcome}. Number {k} is the one nobody uses.",
    "example": "Five caption edits that double saves. Number four is the one nobody does.",
    "on_screen": "5 EDITS. #4 IS THE ONE.",
    "best_for": "Retention through the middle: naming a favourite gives people a reason to stay past three.",
    "trap": "N above seven. Nobody believes you have nine good ones, and you do not.",
    "match": "^\\s*(?:here are\\s+)?\\d+\\s+\\w+|\\bnumber \\d+\\b|\\b(?:three|four|five|seven|ten)\\s+\\w+\\s+(?:every|that|you)\\b"
  },
  {
    "id": 12,
    "name": "The Objection",
    "template": "\"{Objection they actually say}.\" Fine. Here is the version that works anyway.",
    "example": "\"I don't want to be on camera.\" Fine. Here is the faceless version that still sells.",
    "on_screen": "\"I HATE BEING ON CAMERA\"",
    "best_for": "Selling to the people who already said no once.",
    "trap": "Inventing the objection. Pull it verbatim from a DM or a comment, including the bad grammar.",
    "match": "^\\s*[\\\"“'][^\\\"”']{5,120}[\\\"”'][,.]?\\s*(?:fine|ok|okay|sure|right|here)"
  },
  {
    "id": 13,
    "name": "Before And After, On Screen",
    "template": "{Show the old thing}. {Show the new thing}. {One sentence on the lever}.",
    "example": "This was my profile in March. This is it now. I changed the name field, nothing else.",
    "on_screen": "MARCH  /  NOW",
    "best_for": "Anything visual. The cut between the two frames is the hook, the words are secondary.",
    "trap": "Three levers. Name one thing that changed or the transformation stops being believable.",
    "match": "\\b(?:this|that) was\\b[^.!?]*[.!?]\\s*(?:this|that) is\\b|\\bbefore\\b[^.!?]*\\bafter\\b|\\bi (?:look|looked) back at\\b"
  },
  {
    "id": 14,
    "name": "The Callout",
    "template": "{Specific group}, this is the one you have been ignoring.",
    "example": "Photographers charging under $2,000: this is the pricing page you have been avoiding.",
    "on_screen": "PHOTOGRAPHERS UNDER $2K",
    "best_for": "Cutting a broad audience down to the one that converts. Send rate goes up because people tag each other.",
    "trap": "A group so large it is not a callout. 'Entrepreneurs' is not a group.",
    "match": "^\\s*(?:every|all|any)\\s+\\w+|^\\s*[a-z][\\w ]{2,28}(?:ers|ists|ors|ants)\\b\\s*[,:]|^\\s*for (?:viewers|people|anyone|those|everyone)\\b|^\\s*(?:attention|listen up)\\b"
  },
  {
    "id": 15,
    "name": "The Flop Record",
    "template": "My first {N} {attempts} did nothing. Here is what changed on {N+1}.",
    "example": "My first 47 reels averaged 300 views. Number 48 did 400,000. One thing was different.",
    "on_screen": "47 FLOPS, THEN THIS",
    "best_for": "People at the start, which is most of the audience. High comment rate.",
    "trap": "Making the change sound like luck. If the answer is 'I got lucky', there is no video.",
    "match": "\\bmy first\\s+\\d+\\b|\\bfirst\\s+\\d+\\s+(?:reels?|videos?|posts?|clients?|months?)\\b"
  },
  {
    "id": 16,
    "name": "The Verbatim Question",
    "template": "\"{Question exactly as it was asked}\" - I get this every week.",
    "example": "\"How do I post consistently without hating it?\" I get this one every week.",
    "on_screen": "ASKED EVERY WEEK",
    "best_for": "Search. A question typed the way people type it is what Instagram search is matching against.",
    "trap": "Tidying the question up. The value is that it is in their words, typos and all.",
    "match": "^\\s*[\\\"“']?(?:how|what|what'?s|why|when|where|who|which|can|should|do|does|did|is|are|have you|would you)\\b[^?]{3,110}\\?"
  },
  {
    "id": 17,
    "name": "Head To Head",
    "template": "{A} versus {B}. I ran both for {time} and one of them was not close.",
    "example": "Carousels versus reels. I ran both for 90 days and it was not close.",
    "on_screen": "CAROUSELS vs REELS",
    "best_for": "Comments. People arrive already holding an opinion, which is the point.",
    "trap": "Refusing to pick. A comparison with a diplomatic ending is a video with no ending.",
    "match": "\\b(?:vs\\.?|versus)\\b|\\bdifferences? between\\b|\\b(?:a|the) or (?:b|the)\\b"
  },
  {
    "id": 18,
    "name": "Cold Open Demo",
    "template": "{Start mid-action, already doing the thing.} Watch what this does.",
    "example": "Watch what happens when I paste a competitor's caption into this.",
    "on_screen": "WATCH THIS",
    "best_for": "Screen recordings and anything with a visible result. No setup at all, the hand is already moving.",
    "trap": "A result that takes twelve seconds to arrive. If the payoff is slow, cut to it and show the wait afterwards.",
    "match": "^\\s*watch (?:what|this|me)\\b|^\\s*(?:let me|lemme) show you\\b|^\\s*repeat after me\\b"
  },
  {
    "id": 19,
    "name": "The Deadline",
    "template": "{Thing} changes on {date}. Do {action} before then.",
    "example": "Your top nine grid crops change the second you post a reel. Fix the covers first.",
    "on_screen": "BEFORE YOU POST AGAIN",
    "best_for": "Urgency that is real. Platform changes, seasonal windows, policy updates.",
    "trap": "Manufactured urgency. One fake deadline and every future one is discounted.",
    "match": "\\bbefore (?:you|it|they|the)\\b[^.!?]*\\b(?:change|changes|end|ends|close|closes|expires|goes)\\b|\\bchanges on\\b|\\bby 20\\d\\d\\b"
  },
  {
    "id": 20,
    "name": "Permission",
    "template": "You do not need {the thing everyone says you need}.",
    "example": "You do not need a niche. You need one person you can name.",
    "on_screen": "YOU DON'T NEED A NICHE",
    "best_for": "Relief. Very high save rate, because it removes a blocker rather than adding a task.",
    "trap": "Removing the blocker and putting nothing in its place. The second half is the whole video.",
    "match": "\\byou (?:do not|don'?t|dont) need\\b|\\bstop (?:trying to|worrying about)\\b"
  },
  {
    "id": 21,
    "name": "Mid-Sentence Start",
    "template": "{...and that is when {the turn}.}",
    "example": "...and that is when the client asked for the money back. Three days after approving it.",
    "on_screen": "HE ASKED FOR A REFUND",
    "best_for": "Stories. Starting mid-scene makes the viewer feel they arrived late, which is a reason to stay.",
    "trap": "Never going back to fill in the gap. Deliver the setup by second eight or it reads as a mistake.",
    "match": "^\\s*(?:\\.\\.\\.|…)|^\\s*(?:and (?:that'?s|that is|then) when|so (?:he|she|they) (?:said|asked))\\b|^\\s*(?:uh|um)\\b"
  },
  {
    "id": 22,
    "name": "Contrarian Flip",
    "template": "{Well-known saying, inverted.}",
    "example": "Nice guys finish first.",
    "on_screen": "NICE GUYS FINISH FIRST",
    "best_for": "Comments. The viewer has to stop and check whether they misheard you.",
    "trap": "Flipping a saying nobody says. The original has to be a reflex, or the inversion is just a sentence.",
    "match": "^\\s*[A-Za-z][\\w' ]{2,34}\\b(?:finish|finishes|win|wins|lose|loses|beats?|is|are)\\s+(?:first|last|dead|wrong|right|better|overrated|underrated)\\b"
  },
  {
    "id": 23,
    "name": "The Statistic",
    "template": "{N}% of {group} {surprising fact}.",
    "example": "33% of high school graduates never read another book.",
    "on_screen": "33% NEVER READ AGAIN",
    "best_for": "Sends. A number a person can repeat at dinner gets sent to somebody.",
    "trap": "A statistic you cannot source. Say where it came from in the video or do not use it.",
    "match": "^\\s*\\d[\\d,.]*\\s?%|\\b\\d[\\d,.]*\\s?%\\s+of\\b"
  },
  {
    "id": 24,
    "name": "The Reveal",
    "template": "This is the new {thing}.",
    "example": "This is the new Sony point and shoot, and it fixes the one thing I hated.",
    "on_screen": "THE NEW ONE",
    "best_for": "Anything physical or visual. The object is the hook and the words are captions on it.",
    "trap": "Holding the thing up without saying what it changes. A reveal with no stake is an advert.",
    "match": "^\\s*(?:so,?\\s+)?(?:this|these|here) (?:is|are)\\s+(?:the\\s+)?(?:new|my new)\\b|^\\s*(?:so,?\\s+)?this (?:new|tiny|little)\\b|^\\s*this \\w+ has (?:the|a)\\b"
  },
  {
    "id": 25,
    "name": "Someone Else's Result",
    "template": "There was one {person} who {outcome} in {time}.",
    "example": "There was one creator who grew a million subscribers in a single month.",
    "on_screen": "1M SUBS IN ONE MONTH",
    "best_for": "Proof when the user does not have their own number yet. Third-person is allowed if it is true.",
    "trap": "No name and no link. An anonymous miracle is a rumour.",
    "match": "\\bthere (?:was|is) (?:one|a|this)\\b|\\b(?:one|a) (?:guy|girl|creator|student|founder|kid|client|friend) (?:i know |who |that )(?:\\w+ed|grew|made|built|went|took|got|hit)\\b|\\bwe had a new\\b"
  },
  {
    "id": 26,
    "name": "The Superlative",
    "template": "The {fastest / biggest / only} {thing} is {the answer}.",
    "example": "The fastest way to get confident is to build evidence you cannot argue with.",
    "on_screen": "THE FASTEST WAY",
    "best_for": "One-claim videos with no story attached. It is the most common shape in the wild and the easiest to write badly.",
    "trap": "A superlative with a soft answer. If the second half is 'consistency', you have said nothing and the comments will tell you.",
    "match": "^\\s*(?:the\\s+)?(?:fastest|quickest|best|worst|biggest|greatest|easiest|hardest|only|number one|#1|most important)\\s+\\w+|\\bthe (?:fastest|best|worst|biggest|greatest|only) way to\\b"
  }
];
export const CLASSIFY_ORDER: number[] = [
  1,
  23,
  5,
  4,
  3,
  15,
  20,
  7,
  9,
  26,
  25,
  24,
  18,
  17,
  8,
  6,
  16,
  12,
  10,
  2,
  13,
  19,
  21,
  22,
  11,
  14
];

const WORD_RE = /[A-Za-z0-9$%'’-]+/g;
const NUMBER_RE = /\$\s?\d[\d,]*(?:\.\d+)?|\b\d[\d,]*(?:\.\d+)?\s?(?:%|k\b|x\b|hrs?\b|hours?\b|mins?\b|minutes?\b|days?\b|weeks?\b|months?\b|years?\b)?/gi;
const PROPER_RE = /(?<!^)\b[A-Z][a-z]{2,}\b/g;
const HASHTAG_RE = /(?:^|\s)#\w+/;
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}]/u;

export const SPOKEN_NUMBERS = new Set([
  'zero', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'fifteen', 'twenty', 'thirty', 'forty', 'fifty',
  'sixty', 'seventy', 'eighty', 'ninety', 'hundred', 'thousand', 'million',
  'billion', 'dozen', 'half', 'twice', 'triple'
]);

export const MONEY_WORDS = new Set([
  'dollars', 'dollar', 'bucks', 'grand', 'percent', 'cents',
  'millionaire', 'billionaire', 'revenue', 'profit', 'salary', 'rent'
]);

export const STAKES_WORDS = new Set([
  'stop', 'never', 'wrong', 'mistake', 'mistakes', 'lost', 'lose', 'losing',
  'cost', 'costs', 'broke', 'broken', 'failed', 'failure', 'fail', 'nobody',
  'no', 'not', "don't", 'dont', "doesn't", "didn't", "can't", "won't",
  'quit', 'quitting', 'fired', 'deleted', 'delete', 'killed', 'kills', 'kill',
  'replaced', 'replaces', 'cut', 'beat', 'free', 'paid', 'charged', 'hired',
  'saved', 'first', 'banned', 'illegal', 'worst', 'hate', 'hated', 'wasted',
  'waste', 'scam', 'lie', 'lied', 'lying', 'truth', 'secret', 'hidden',
  'stole', 'stolen', 'before', 'until', 'instead', 'but', 'except', 'unless',
  'problem', 'risk', 'danger', 'warning', 'regret', 'wish', 'should', "shouldn't",
  'still', 'already', 'only', 'without', 'versus', 'vs', 'actually'
]);

export const WEAK_OPENERS = [
  'so', 'ok', 'okay', 'hey', 'hi', 'hello', 'guys', 'yo', 'alright',
  'welcome', 'today', 'basically', 'honestly', 'look', 'listen', 'um',
  'just', 'let', 'lets', "let's", 'i wanted', 'i want', 'one of',
  'have you', 'did you', 'do you', 'are you', 'in this', 'in today',
  'the thing', 'a lot', 'there is', 'there are', 'this is', 'it is',
  'as a', 'when it', "if you've", 'you know'
];

export const IMPERATIVES = new Set([
  'stop', 'steal', 'copy', 'delete', 'try', 'watch', 'read', 'save',
  'use', 'build', 'make', 'write', 'send', 'take', 'start', 'quit',
  'never', 'always', "don't", 'dont', 'do', 'put', 'run', 'check'
]);

export const DEALBREAKERS: Array<{ regex: RegExp; message: string }> = [
  {
    regex: /^\s*(?:stop scrolling|don'?t scroll)/i,
    message: 'Opens with "stop scrolling". Asking for attention proves you have not earned it.',
  },
  {
    regex: /\b(?:in (?:this|today'?s) (?:video|reel)|i'?m going to show you|i'?ll show you how)\b/i,
    message: 'Video preamble. Delete it and open directly on the payoff.',
  },
  {
    regex: /^\s*(?:hey |hi |what'?s up |welcome )/i,
    message: 'Greeting. Nobody came to the feed to be greeted.',
  },
  {
    regex: HASHTAG_RE,
    message: 'Hashtag in the hook. Hashtags belong at the bottom of the caption.',
  },
  {
    regex: EMOJI_RE,
    message: 'Emoji in the hook. On-screen text at hook size has room for words or emoji, not both.',
  },
];

function clamp(n: number): number {
  return Math.max(0.0, Math.min(100.0, n));
}

export function extractWords(text: string): string[] {
  const normalized = text.replace(/(?<=\d),(?=\d)/g, '');
  return normalized.match(WORD_RE) || [];
}

export interface DimensionScore {
  score: number;
  detail: string;
}

/**
 * 1. LENGTH: 5-12 words lands in ~2.5s before thumb moves.
 */
export function checkLength(text: string): DimensionScore {
  const w = extractWords(text);
  const n = w.length;
  const secs = n / 2.75;
  const chars = text.trim().length;

  let score: number;
  if (n >= 5 && n <= 12) {
    score = 100.0;
  } else if (n < 5) {
    score = clamp(100 - (5 - n) * 20);
  } else {
    score = clamp(100 - (n - 12) * 11);
  }

  if (chars > 60) {
    score -= 12;
  }

  return {
    score: clamp(score),
    detail: `${n} words, ${chars} chars, ~${secs.toFixed(1)}s spoken (target: 5-12 words)`,
  };
}

/**
 * 2. SPECIFICITY: One concrete marker (numbers, entities, prices) beats abstract claims.
 */
export function checkSpecificity(text: string): DimensionScore {
  const nums = (text.match(NUMBER_RE) || []).map((s) => s.trim()).filter(Boolean);
  const propers = Array.from(new Set(text.match(PROPER_RE) || []));
  const low = extractWords(text).map((w) => w.toLowerCase().replace(/['’]/g, ''));
  const spoken = low.filter((w) => SPOKEN_NUMBERS.has(w) || MONEY_WORDS.has(w));

  const hits = nums.length + propers.length + spoken.length;
  const score = hits === 0 ? 15.0 : clamp(45 + hits * 30);
  const found = [...nums.slice(0, 2), ...propers.slice(0, 2), ...spoken.slice(0, 2)].join(', ');

  return {
    score,
    detail: hits > 0
      ? `${hits} concrete marker(s): ${found}`
      : '0 concrete markers - no number, no name, nothing checkable',
  };
}

/**
 * 3. STAKES: Tension, cost, negation. Something the viewer might lose or avoid.
 */
export function checkStakes(text: string): DimensionScore {
  const w = extractWords(text).map((x) => x.toLowerCase().replace(/['’]/g, ''));
  const hits = w.filter((x) => STAKES_WORDS.has(x));
  const markers = Array.from(new Set(hits));
  if (/\$\s?\d/.test(text)) {
    markers.push('a price');
  }

  const n = markers.length;
  const score = n === 0 ? 20.0 : n === 1 ? 70.0 : 100.0;
  return {
    score: clamp(score),
    detail: n > 0
      ? `${n} tension marker(s): ${markers.slice(0, 4).join(', ')}`
      : '0 tension markers - nothing at stake in this hook',
  };
}

/**
 * 4. FRONTLOAD: High-impact payload word should be within the first 3 words.
 */
export function checkFrontload(text: string): DimensionScore {
  const w = extractWords(text);
  if (w.length === 0) {
    return { score: 0.0, detail: 'empty' };
  }

  const low = w.map((x) => x.toLowerCase().replace(/['’]/g, ''));
  const opener = low.slice(0, 2).join(' ');
  let penalty = 0;
  let hitOpener: string | null = null;

  for (const weak of WEAK_OPENERS) {
    if (opener.startsWith(weak) || low[0] === weak) {
      penalty = 30;
      hitOpener = weak;
      break;
    }
  }

  let payloadIndex: number | null = null;
  for (let i = 0; i < low.length; i++) {
    const token = low[i];
    if (
      STAKES_WORDS.has(token) ||
      SPOKEN_NUMBERS.has(token) ||
      MONEY_WORDS.has(token) ||
      NUMBER_RE.test(w[i]) ||
      (i > 0 && PROPER_RE.test(w[i]))
    ) {
      payloadIndex = i;
      break;
    }
  }

  let base: number;
  let where: string;
  if (payloadIndex === null) {
    base = 30.0;
    where = 'no payload word anywhere in the hook';
  } else if (payloadIndex <= 2) {
    base = 100.0;
    where = `payload frontloaded at word ${payloadIndex + 1}`;
  } else if (payloadIndex <= 5) {
    base = 70.0;
    where = `payload at word ${payloadIndex + 1}, could move forward`;
  } else {
    base = 40.0;
    where = `payload at word ${payloadIndex + 1}, too late`;
  }

  const detail = where + (hitOpener ? `; weak opener "${hitOpener}"` : '');
  return {
    score: clamp(base - penalty),
    detail,
  };
}

/**
 * 5. ADDRESS: Aimed directly at a specific viewer.
 */
export function checkAddress(text: string): DimensionScore {
  const low = text.toLowerCase();
  const w = extractWords(text).map((x) => x.toLowerCase().replace(/['’]/g, ''));

  if (/\b(you|your|you're|youre|yourself)\b/i.test(low)) {
    return { score: 100.0, detail: 'speaks directly to the viewer (second person)' };
  }
  if (w.length > 0 && IMPERATIVES.has(w[0])) {
    return { score: 90.0, detail: `imperative opener ("${w[0]}")` };
  }
  if (/\b(i|my|me|we|our)\b/i.test(low)) {
    return { score: 70.0, detail: 'first person, no viewer explicitly addressed' };
  }
  return { score: 35.0, detail: 'third person, nobody in the room' };
}

export interface HookScoreDimensions {
  LENGTH: DimensionScore;
  SPECIFICITY: DimensionScore;
  STAKES: DimensionScore;
  FRONTLOAD: DimensionScore;
  ADDRESS: DimensionScore;
}

export interface HookScoreResult {
  hook: string;
  dimensions: HookScoreDimensions;
  overallScore: number;
  verdict: 'STRONG' | 'OK' | 'WEAK';
  weakestDimension: keyof HookScoreDimensions;
  flags: string[];
  formula: {
    id: number | null;
    name: string;
  };
}

/**
 * Classifies a hook into one of the 26 known viral formulas.
 */
export function classifyHook(text: string): { id: number | null; name: string } {
  const byId = new Map(HOOK_FORMULAS_DATA.map((h) => [h.id, h]));
  for (const id of CLASSIFY_ORDER) {
    const formula = byId.get(id);
    if (!formula) continue;
    try {
      const reg = new RegExp(formula.match, 'i');
      if (reg.test(text)) {
        return { id: formula.id, name: formula.name };
      }
    } catch {
      // Ignore invalid regex in edge cases
    }
  }
  return { id: null, name: 'unclassified' };
}

/**
 * Evaluates a hook across the 5 dimensions, calculates overall score & verdict.
 */
export function scoreHook(text: string): HookScoreResult {
  const dimensions: HookScoreDimensions = {
    LENGTH: checkLength(text),
    SPECIFICITY: checkSpecificity(text),
    STAKES: checkStakes(text),
    FRONTLOAD: checkFrontload(text),
    ADDRESS: checkAddress(text),
  };

  const flags: string[] = [];
  for (const { regex, message } of DEALBREAKERS) {
    if (regex.test(text)) {
      flags.push(message);
    }
  }

  const scores = [
    dimensions.LENGTH.score,
    dimensions.SPECIFICITY.score,
    dimensions.STAKES.score,
    dimensions.FRONTLOAD.score,
    dimensions.ADDRESS.score,
  ];

  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const minScore = Math.min(...scores);

  let overall = mean * 0.6 + minScore * 0.4 - flags.length * 15;
  overall = clamp(overall);

  const verdict: 'STRONG' | 'OK' | 'WEAK' =
    overall >= 70 && minScore >= 55 && flags.length === 0
      ? 'STRONG'
      : overall >= 50
      ? 'OK'
      : 'WEAK';

  const dimensionKeys: Array<keyof HookScoreDimensions> = [
    'LENGTH',
    'SPECIFICITY',
    'STAKES',
    'FRONTLOAD',
    'ADDRESS',
  ];

  let weakest = dimensionKeys[0];
  let lowestVal = dimensions[weakest].score;
  for (const k of dimensionKeys) {
    if (dimensions[k].score < lowestVal) {
      lowestVal = dimensions[k].score;
      weakest = k;
    }
  }

  const formula = classifyHook(text);

  return {
    hook: text.trim(),
    dimensions,
    overallScore: Math.round(overall * 10) / 10,
    verdict,
    weakestDimension: weakest,
    flags,
    formula,
  };
}

/**
 * Ranks a batch of hooks descending by overall score.
 */
export function rankHooks(hooks: string[]): HookScoreResult[] {
  return hooks
    .map((h) => scoreHook(h))
    .sort((a, b) => b.overallScore - a.overallScore);
}
