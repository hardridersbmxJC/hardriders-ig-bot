/**
 * humanizer.ts - Strips machine fingerprints, corporate slop, and invisible Unicode from drafts.
 * 
 * Ported from humanize.py & slop.json (instagram-agent-skill).
 * Executes three passes:
 *   1. INVISIBLE: removes zero-width characters, soft hyphens, BOM, tags, normalizes spaces.
 *   2. TYPOGRAPHIC: converts em-dashes, en-dashes, curly quotes, bullets into natural typing.
 *   3. LEXICAL: replaces AI/corporate slop phrases and words with plain, conversational language.
 */

export interface SlopInvisibleEntry {
  cp: string;
  name: string;
  action: 'delete' | 'space';
}

export interface SlopTypographicEntry {
  from: string;
  name: string;
  to: string;
}

export interface SlopLexicalEntry {
  find: string;
  replace: string;
  family: string;
}

export interface SlopStructureEntry {
  id?: string;
  name: string;
  regex: string;
  fix: string;
}

export interface SlopLexicon {
  version: string;
  note: string;
  invisible: SlopInvisibleEntry[];
  typographic: SlopTypographicEntry[];
  words: SlopLexicalEntry[];
  phrases: SlopLexicalEntry[];
  structures: SlopStructureEntry[];
}

export const SLOP_LEXICON: SlopLexicon = {
  "version": "1.0",
  "note": "Lexicon used by humanize.py and detect.py. Replacements are plain-English and keep the sentence grammatical. The last block of each list is Instagram-specific: caption and voiceover slop that does not show up on other platforms. Edit freely - it is meant to be yours.",
  "invisible": [
    {
      "cp": "U+200B",
      "name": "ZERO WIDTH SPACE",
      "action": "delete"
    },
    {
      "cp": "U+200C",
      "name": "ZERO WIDTH NON-JOINER",
      "action": "delete"
    },
    {
      "cp": "U+200D",
      "name": "ZERO WIDTH JOINER",
      "action": "delete"
    },
    {
      "cp": "U+2060",
      "name": "WORD JOINER",
      "action": "delete"
    },
    {
      "cp": "U+FEFF",
      "name": "ZERO WIDTH NO-BREAK SPACE / BOM",
      "action": "delete"
    },
    {
      "cp": "U+00AD",
      "name": "SOFT HYPHEN",
      "action": "delete"
    },
    {
      "cp": "U+180E",
      "name": "MONGOLIAN VOWEL SEPARATOR",
      "action": "delete"
    },
    {
      "cp": "U+061C",
      "name": "ARABIC LETTER MARK",
      "action": "delete"
    },
    {
      "cp": "U+200E",
      "name": "LEFT-TO-RIGHT MARK",
      "action": "delete"
    },
    {
      "cp": "U+200F",
      "name": "RIGHT-TO-LEFT MARK",
      "action": "delete"
    },
    {
      "cp": "U+E0000-U+E007F",
      "name": "TAG CHARACTERS (invisible ASCII smuggling)",
      "action": "delete"
    },
    {
      "cp": "U+00A0",
      "name": "NO-BREAK SPACE",
      "action": "space"
    },
    {
      "cp": "U+202F",
      "name": "NARROW NO-BREAK SPACE",
      "action": "space"
    },
    {
      "cp": "U+2009",
      "name": "THIN SPACE",
      "action": "space"
    },
    {
      "cp": "U+2007",
      "name": "FIGURE SPACE",
      "action": "space"
    },
    {
      "cp": "U+2003",
      "name": "EM SPACE",
      "action": "space"
    },
    {
      "cp": "U+2002",
      "name": "EN SPACE",
      "action": "space"
    },
    {
      "cp": "U+2063",
      "name": "INVISIBLE SEPARATOR",
      "action": "delete"
    }
  ],
  "typographic": [
    {
      "from": "—",
      "name": "EM DASH",
      "to": ", "
    },
    {
      "from": "–",
      "name": "EN DASH",
      "to": "-"
    },
    {
      "from": "‘",
      "name": "LEFT SINGLE QUOTE",
      "to": "'"
    },
    {
      "from": "’",
      "name": "RIGHT SINGLE QUOTE",
      "to": "'"
    },
    {
      "from": "“",
      "name": "LEFT DOUBLE QUOTE",
      "to": "\""
    },
    {
      "from": "”",
      "name": "RIGHT DOUBLE QUOTE",
      "to": "\""
    },
    {
      "from": "…",
      "name": "HORIZONTAL ELLIPSIS",
      "to": "..."
    },
    {
      "from": "′",
      "name": "PRIME",
      "to": "'"
    },
    {
      "from": "·",
      "name": "MIDDLE DOT",
      "to": "-"
    },
    {
      "from": "•",
      "name": "BULLET",
      "to": "-"
    },
    {
      "from": "→",
      "name": "RIGHTWARDS ARROW",
      "to": "->"
    }
  ],
  "words": [
    {
      "find": "delve into",
      "replace": "look at",
      "family": "verbs"
    },
    {
      "find": "delve",
      "replace": "look",
      "family": "verbs"
    },
    {
      "find": "dive deep into",
      "replace": "get into",
      "family": "verbs"
    },
    {
      "find": "deep dive",
      "replace": "breakdown",
      "family": "nouns"
    },
    {
      "find": "leverage",
      "replace": "use",
      "family": "verbs"
    },
    {
      "find": "leveraging",
      "replace": "using",
      "family": "verbs"
    },
    {
      "find": "utilize",
      "replace": "use",
      "family": "verbs"
    },
    {
      "find": "utilizing",
      "replace": "using",
      "family": "verbs"
    },
    {
      "find": "harness",
      "replace": "use",
      "family": "verbs"
    },
    {
      "find": "embark on",
      "replace": "start",
      "family": "verbs"
    },
    {
      "find": "foster",
      "replace": "build",
      "family": "verbs"
    },
    {
      "find": "facilitate",
      "replace": "help",
      "family": "verbs"
    },
    {
      "find": "showcase",
      "replace": "show",
      "family": "verbs"
    },
    {
      "find": "unlock",
      "replace": "get",
      "family": "verbs"
    },
    {
      "find": "elevate",
      "replace": "improve",
      "family": "verbs"
    },
    {
      "find": "streamline",
      "replace": "simplify",
      "family": "verbs"
    },
    {
      "find": "spearhead",
      "replace": "lead",
      "family": "verbs"
    },
    {
      "find": "underscore",
      "replace": "show",
      "family": "verbs"
    },
    {
      "find": "underscores",
      "replace": "shows",
      "family": "verbs"
    },
    {
      "find": "cultivate",
      "replace": "build",
      "family": "verbs"
    },
    {
      "find": "amplify",
      "replace": "boost",
      "family": "verbs"
    },
    {
      "find": "curate",
      "replace": "pick",
      "family": "verbs"
    },
    {
      "find": "curated",
      "replace": "picked",
      "family": "verbs"
    },
    {
      "find": "empower",
      "replace": "let",
      "family": "verbs"
    },
    {
      "find": "revolutionize",
      "replace": "change",
      "family": "verbs"
    },
    {
      "find": "transformative",
      "replace": "big",
      "family": "adjectives"
    },
    {
      "find": "robust",
      "replace": "solid",
      "family": "adjectives"
    },
    {
      "find": "seamless",
      "replace": "clean",
      "family": "adjectives"
    },
    {
      "find": "seamlessly",
      "replace": "cleanly",
      "family": "adjectives"
    },
    {
      "find": "pivotal",
      "replace": "key",
      "family": "adjectives"
    },
    {
      "find": "crucial",
      "replace": "important",
      "family": "adjectives"
    },
    {
      "find": "vital",
      "replace": "important",
      "family": "adjectives"
    },
    {
      "find": "comprehensive",
      "replace": "complete",
      "family": "adjectives"
    },
    {
      "find": "cutting-edge",
      "replace": "new",
      "family": "adjectives"
    },
    {
      "find": "game-changing",
      "replace": "big",
      "family": "adjectives"
    },
    {
      "find": "game-changer",
      "replace": "big deal",
      "family": "nouns"
    },
    {
      "find": "groundbreaking",
      "replace": "new",
      "family": "adjectives"
    },
    {
      "find": "unparalleled",
      "replace": "unmatched",
      "family": "adjectives"
    },
    {
      "find": "invaluable",
      "replace": "useful",
      "family": "adjectives"
    },
    {
      "find": "meticulous",
      "replace": "careful",
      "family": "adjectives"
    },
    {
      "find": "meticulously",
      "replace": "carefully",
      "family": "adjectives"
    },
    {
      "find": "myriad of",
      "replace": "many",
      "family": "adjectives"
    },
    {
      "find": "myriad",
      "replace": "many",
      "family": "adjectives"
    },
    {
      "find": "multifaceted",
      "replace": "complicated",
      "family": "adjectives"
    },
    {
      "find": "holistic",
      "replace": "whole",
      "family": "adjectives"
    },
    {
      "find": "bespoke",
      "replace": "custom",
      "family": "adjectives"
    },
    {
      "find": "innovative",
      "replace": "new",
      "family": "adjectives"
    },
    {
      "find": "profound",
      "replace": "big",
      "family": "adjectives"
    },
    {
      "find": "remarkable",
      "replace": "notable",
      "family": "adjectives"
    },
    {
      "find": "compelling",
      "replace": "convincing",
      "family": "adjectives"
    },
    {
      "find": "tapestry",
      "replace": "mix",
      "family": "nouns"
    },
    {
      "find": "realm",
      "replace": "world",
      "family": "nouns"
    },
    {
      "find": "landscape",
      "replace": "market",
      "family": "nouns"
    },
    {
      "find": "journey",
      "replace": "process",
      "family": "nouns"
    },
    {
      "find": "testament to",
      "replace": "proof of",
      "family": "nouns"
    },
    {
      "find": "cornerstone",
      "replace": "base",
      "family": "nouns"
    },
    {
      "find": "beacon",
      "replace": "signal",
      "family": "nouns"
    },
    {
      "find": "paradigm",
      "replace": "model",
      "family": "nouns"
    },
    {
      "find": "synergy",
      "replace": "overlap",
      "family": "nouns"
    },
    {
      "find": "ecosystem",
      "replace": "system",
      "family": "nouns"
    },
    {
      "find": "treasure trove",
      "replace": "pile",
      "family": "nouns"
    },
    {
      "find": "plethora of",
      "replace": "lots of",
      "family": "nouns"
    },
    {
      "find": "plethora",
      "replace": "lots",
      "family": "nouns"
    },
    {
      "find": "arsenal",
      "replace": "set",
      "family": "nouns"
    },
    {
      "find": "north star",
      "replace": "goal",
      "family": "nouns"
    },
    {
      "find": "moreover",
      "replace": "also",
      "family": "connectives"
    },
    {
      "find": "furthermore",
      "replace": "also",
      "family": "connectives"
    },
    {
      "find": "additionally",
      "replace": "also",
      "family": "connectives"
    },
    {
      "find": "nevertheless",
      "replace": "still",
      "family": "connectives"
    },
    {
      "find": "consequently",
      "replace": "so",
      "family": "connectives"
    },
    {
      "find": "thus",
      "replace": "so",
      "family": "connectives"
    },
    {
      "find": "hence",
      "replace": "so",
      "family": "connectives"
    },
    {
      "find": "notably",
      "replace": "",
      "family": "connectives"
    },
    {
      "find": "importantly",
      "replace": "",
      "family": "connectives"
    },
    {
      "find": "ultimately",
      "replace": "in the end",
      "family": "connectives"
    },
    {
      "find": "in essence",
      "replace": "basically",
      "family": "connectives"
    },
    {
      "find": "in conclusion",
      "replace": "so",
      "family": "connectives"
    },
    {
      "find": "when it comes to",
      "replace": "with",
      "family": "connectives"
    },
    {
      "find": "in order to",
      "replace": "to",
      "family": "connectives"
    },
    {
      "find": "a wide range of",
      "replace": "many",
      "family": "connectives"
    },
    {
      "find": "it is worth noting that",
      "replace": "note that",
      "family": "connectives"
    },
    {
      "find": "supercharge",
      "replace": "speed up",
      "family": "verbs"
    },
    {
      "find": "skyrocket",
      "replace": "raise",
      "family": "verbs"
    },
    {
      "find": "unleash",
      "replace": "release",
      "family": "verbs"
    },
    {
      "find": "effortlessly",
      "replace": "easily",
      "family": "adjectives"
    },
    {
      "find": "captivating",
      "replace": "interesting",
      "family": "adjectives"
    },
    {
      "find": "stunning",
      "replace": "good",
      "family": "adjectives"
    },
    {
      "find": "breathtaking",
      "replace": "striking",
      "family": "adjectives"
    },
    {
      "find": "iconic",
      "replace": "known",
      "family": "adjectives"
    },
    {
      "find": "must-have",
      "replace": "worth having",
      "family": "adjectives"
    },
    {
      "find": "no-brainer",
      "replace": "obvious",
      "family": "nouns"
    },
    {
      "find": "hidden gem",
      "replace": "good one",
      "family": "nouns"
    },
    {
      "find": "secret sauce",
      "replace": "the actual method",
      "family": "nouns"
    },
    {
      "find": "ultimate guide",
      "replace": "guide",
      "family": "nouns"
    },
    {
      "find": "level up",
      "replace": "improve",
      "family": "verbs"
    },
    {
      "find": "hack",
      "replace": "trick",
      "family": "nouns"
    }
  ],
  "phrases": [
    {
      "find": "in today's fast-paced world",
      "replace": "right now",
      "family": "openers"
    },
    {
      "find": "in today's digital age",
      "replace": "right now",
      "family": "openers"
    },
    {
      "find": "in the ever-evolving landscape of",
      "replace": "in",
      "family": "openers"
    },
    {
      "find": "in the ever-changing world of",
      "replace": "in",
      "family": "openers"
    },
    {
      "find": "let's face it",
      "replace": "",
      "family": "openers"
    },
    {
      "find": "here's the thing",
      "replace": "",
      "family": "openers"
    },
    {
      "find": "picture this",
      "replace": "",
      "family": "openers"
    },
    {
      "find": "imagine a world where",
      "replace": "imagine if",
      "family": "openers"
    },
    {
      "find": "it's no secret that",
      "replace": "",
      "family": "openers"
    },
    {
      "find": "we've all been there",
      "replace": "",
      "family": "openers"
    },
    {
      "find": "let that sink in",
      "replace": "",
      "family": "closers"
    },
    {
      "find": "the choice is yours",
      "replace": "",
      "family": "closers"
    },
    {
      "find": "food for thought",
      "replace": "",
      "family": "closers"
    },
    {
      "find": "the future is here",
      "replace": "",
      "family": "closers"
    },
    {
      "find": "what are your thoughts?",
      "replace": "",
      "family": "closers"
    },
    {
      "find": "drop a comment below",
      "replace": "",
      "family": "closers"
    },
    {
      "find": "at the end of the day",
      "replace": "",
      "family": "closers"
    },
    {
      "find": "needle-moving",
      "replace": "useful",
      "family": "closers"
    },
    {
      "find": "move the needle",
      "replace": "make a difference",
      "family": "closers"
    },
    {
      "find": "a testament to",
      "replace": "proof of",
      "family": "nouns"
    },
    {
      "find": "had the opportunity to",
      "replace": "got to",
      "family": "connectives"
    },
    {
      "find": "i am excited to announce",
      "replace": "",
      "family": "openers"
    },
    {
      "find": "i'm thrilled to share",
      "replace": "",
      "family": "openers"
    },
    {
      "find": "i am humbled to",
      "replace": "",
      "family": "openers"
    },
    {
      "find": "without further ado",
      "replace": "",
      "family": "openers"
    },
    {
      "find": "buckle up",
      "replace": "",
      "family": "openers"
    },
    {
      "find": "the harsh truth is",
      "replace": "",
      "family": "openers"
    },
    {
      "find": "spoiler alert",
      "replace": "",
      "family": "openers"
    },
    {
      "find": "read that again",
      "replace": "",
      "family": "closers"
    },
    {
      "find": "you're welcome",
      "replace": "",
      "family": "closers"
    },
    {
      "find": "save this for later",
      "replace": "",
      "family": "closers"
    },
    {
      "find": "who's with me",
      "replace": "",
      "family": "closers"
    },
    {
      "find": "stop scrolling",
      "replace": "",
      "family": "openers"
    },
    {
      "find": "don't scroll past this",
      "replace": "",
      "family": "openers"
    },
    {
      "find": "in this video i'm going to show you",
      "replace": "",
      "family": "openers"
    },
    {
      "find": "in today's video",
      "replace": "",
      "family": "openers"
    },
    {
      "find": "watch till the end",
      "replace": "",
      "family": "openers"
    },
    {
      "find": "you won't believe",
      "replace": "",
      "family": "openers"
    },
    {
      "find": "nobody is talking about this",
      "replace": "few people do this",
      "family": "openers"
    },
    {
      "find": "no one is talking about this",
      "replace": "few people do this",
      "family": "openers"
    },
    {
      "find": "this changed everything",
      "replace": "this worked",
      "family": "openers"
    },
    {
      "find": "this is your sign to",
      "replace": "",
      "family": "openers"
    },
    {
      "find": "little did i know",
      "replace": "",
      "family": "connectives"
    },
    {
      "find": "fast forward to today",
      "replace": "now",
      "family": "connectives"
    },
    {
      "find": "and just like that",
      "replace": "",
      "family": "connectives"
    },
    {
      "find": "the rest is history",
      "replace": "",
      "family": "closers"
    },
    {
      "find": "run don't walk",
      "replace": "",
      "family": "closers"
    },
    {
      "find": "trust me on this one",
      "replace": "",
      "family": "closers"
    },
    {
      "find": "don't sleep on this",
      "replace": "",
      "family": "closers"
    },
    {
      "find": "follow for more",
      "replace": "",
      "family": "closers"
    },
    {
      "find": "hit follow for more",
      "replace": "",
      "family": "closers"
    },
    {
      "find": "double tap if",
      "replace": "",
      "family": "closers"
    },
    {
      "find": "tag someone who needs this",
      "replace": "",
      "family": "closers"
    },
    {
      "find": "let me know in the comments",
      "replace": "",
      "family": "closers"
    },
    {
      "find": "share this with someone who needs it",
      "replace": "",
      "family": "closers"
    },
    {
      "find": "the algorithm loves",
      "replace": "Instagram pushes",
      "family": "nouns"
    },
    {
      "find": "beat the algorithm",
      "replace": "get reach",
      "family": "nouns"
    },
    {
      "find": "go viral overnight",
      "replace": "get reach",
      "family": "nouns"
    }
  ],
  "structures": [
    {
      "id": "not-just",
      "regex": "(?i)\\bit'?s not (?:just|only) [^.!?\\n]{2,60}[,.] it'?s\\b",
      "name": "\"It's not just X, it's Y\"",
      "fix": "Say the one thing you actually mean. Delete the setup half."
    },
    {
      "id": "not-only",
      "regex": "(?i)\\bnot only\\b[^.!?\\n]{2,80}\\bbut also\\b",
      "name": "\"Not only X but also Y\"",
      "fix": "Split into two sentences, or drop the weaker half."
    },
    {
      "id": "isnt-about",
      "regex": "(?i)\\b(?:this|it) is(?:n'?t| not) about [^.!?\\n]{2,60}[.!] it'?s about\\b",
      "name": "\"It isn't about X. It's about Y.\"",
      "fix": "Lead with Y. The reversal is the tell."
    },
    {
      "id": "the-result",
      "regex": "(?i)^\\s*(?:the result|the best part|the kicker|the catch)\\?\\s*$",
      "name": "One-word rhetorical question line",
      "fix": "Answer it inline instead of staging a reveal."
    },
    {
      "id": "heres-what",
      "regex": "(?i)\\bhere'?s what (?:i|we) learned\\b",
      "name": "\"Here's what I learned\"",
      "fix": "State the lesson. Skip the announcement."
    },
    {
      "id": "triad",
      "regex": "(?i)\\b\\w+, \\w+, and \\w+\\.",
      "name": "Rule-of-three triad",
      "fix": "Two items or four. Three is the model's default rhythm."
    },
    {
      "id": "rocket",
      "regex": "[\\U0001F680\\U0001F525\\U0001F4A1\\u2728\\U0001F3AF]",
      "name": "Rocket / fire / bulb / sparkle / dart emoji",
      "fix": "One emoji max, and not one of these five."
    },
    {
      "id": "hashtag-wall",
      "regex": "(?:#\\w+[ \\t]*){5,}",
      "name": "Hashtag wall (5+)",
      "fix": "Three hashtags. LinkedIn stopped rewarding the wall."
    },
    {
      "id": "as-an-ai",
      "regex": "(?i)\\bas an ai\\b|\\bas a language model\\b",
      "name": "Model self-reference",
      "fix": "Delete the sentence."
    },
    {
      "id": "in-summary",
      "regex": "(?i)^\\s*(?:in summary|to summarize|in conclusion)\\b",
      "name": "Essay-closer opener",
      "fix": "A post does not need a conclusion paragraph."
    },
    {
      "id": "engagement-bait",
      "regex": "(?i)\\b(?:agree\\?|thoughts\\?|who else\\b|am i wrong\\?)\\s*$",
      "name": "Reflex engagement bait",
      "fix": "Ask a question only you could ask, about the specific thing above it."
    },
    {
      "id": "stop-scroll",
      "regex": "(?im)^\\s*(?:stop scrolling|don'?t scroll|wait[,.]? don'?t scroll)\\b",
      "name": "\"Stop scrolling\" opener",
      "fix": "The scroll-stop has to be the claim itself. Asking for attention is the tell that you have not earned it."
    },
    {
      "id": "in-this-video",
      "regex": "(?i)\\b(?:in (?:this|today'?s) (?:video|reel|post)|today i'?m going to show you|i'?m going to (?:show|teach) you how)\\b",
      "name": "Video preamble (\"in this video I'm going to show you\")",
      "fix": "Delete it and start at the payoff. The first two seconds decide the whole reel."
    },
    {
      "id": "emoji-bullets",
      "regex": "(?m)^\\s*[\\U0001F300-\\U0001FAFF✅➡⬅✔✨]\\s*\\S",
      "name": "Emoji bullet list",
      "fix": "Use a hyphen or a line break. Emoji bullets are the single most template-looking thing in a caption."
    },
    {
      "id": "caps-shout",
      "regex": "\\b[A-Z]{3,}\\b(?:\\s+\\b[A-Z]{3,}\\b){2,}",
      "name": "Three or more shouted words in a row",
      "fix": "Caps are a volume knob, not a highlighter. One word, at most."
    },
    {
      "id": "follow-bait",
      "regex": "(?i)\\b(?:follow for more|tag someone who|double tap if|share this if|comment below if)\\b",
      "name": "Reflex follow or tag bait",
      "fix": "Ask for the one action this post actually earns. The generic ask trains the audience to ignore every ask."
    }
  ]
};

const URL_RE = /https?:\/\/\S+|www\.\S+|\S+@\S+\.\S+/gi;

function parseCodePoint(spec: string): number | [number, number] {
  if (spec.includes('-')) {
    const [start, end] = spec.split('-');
    return [parseInt(start.replace(/^U\+/, ''), 16), parseInt(end.replace(/^U\+/, ''), 16)];
  }
  return parseInt(spec.replace(/^U\+/, ''), 16);
}

/**
 * Protects URLs and emails so cleaning passes do not alter query parameters or paths.
 */
export function protectUrls(text: string): { protectedText: string; urls: string[] } {
  const urls: string[] = [];
  const protectedText = text.replace(URL_RE, (match) => {
    urls.push(match);
    return `\x00URL${urls.length - 1}\x00`;
  });
  return { protectedText, urls };
}

/**
 * Restores URLs previously protected with protectUrls.
 */
export function restoreUrls(text: string, urls: string[]): string {
  let restored = text;
  urls.forEach((url, i) => {
    restored = restored.split(`\x00URL${i}\x00`).join(url);
  });
  return restored;
}

/**
 * Pass 1: Invisible character deletion and normalization.
 */
export function passInvisible(text: string, lexicon: SlopLexicon = SLOP_LEXICON): { text: string; count: number } {
  let cleaned = text;
  let count = 0;

  for (const entry of lexicon.invisible) {
    const cp = parseCodePoint(entry.cp);
    let regex: RegExp;
    if (Array.isArray(cp)) {
      regex = new RegExp(`[\\u{${cp[0].toString(16)}}-\\u{${cp[1].toString(16)}}]`, 'gu');
    } else {
      regex = new RegExp(String.fromCodePoint(cp).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gu');
    }

    const matches = cleaned.match(regex);
    if (matches && matches.length > 0) {
      count += matches.length;
      cleaned = cleaned.replace(regex, entry.action === 'delete' ? '' : ' ');
    }
  }

  // Any remaining Unicode Cf (format) characters
  const cfRegex = /\p{Cf}/gu;
  const cfMatches = cleaned.match(cfRegex);
  if (cfMatches && cfMatches.length > 0) {
    count += cfMatches.length;
    cleaned = cleaned.replace(cfRegex, '');
  }

  return { text: cleaned, count };
}

/**
 * Pass 2: Typographic normalization.
 */
export function passTypographic(text: string, lexicon: SlopLexicon = SLOP_LEXICON): { text: string; count: number } {
  let cleaned = text;
  let count = 0;

  for (const entry of lexicon.typographic) {
    const ch = entry.from;
    if (!cleaned.includes(ch)) continue;

    if (ch === '—') {
      cleaned = cleaned.replace(/\s*—\s*/g, ', ');
      count++;
    } else if (ch === '–') {
      cleaned = cleaned.replace(/\s*–\s*(?=\d)/g, '-');
      cleaned = cleaned.replace(/\s+–\s+/g, ', ');
      cleaned = cleaned.split('–').join('-');
      count++;
    } else {
      cleaned = cleaned.split(ch).join(entry.to);
      count++;
    }
  }

  // Fix punctuation anomalies created by replacements
  cleaned = cleaned.replace(/,\s*([,.;:!?])/g, '$1');
  cleaned = cleaned.replace(/,\s*\n/g, '\n');

  return { text: cleaned, count };
}

function matchCase(source: string, replacement: string): string {
  if (!replacement) return replacement;
  if (source === source.toUpperCase() && source.length > 1) {
    return replacement.toUpperCase();
  }
  if (source[0] === source[0].toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

/**
 * Pass 3: Lexical replacement of corporate/AI slop.
 */
export function passLexical(text: string, lexicon: SlopLexicon = SLOP_LEXICON): { text: string; count: number } {
  let cleaned = text;
  let count = 0;

  const entries = [...lexicon.phrases, ...lexicon.words].sort(
    (a, b) => b.find.length - a.find.length
  );

  for (const entry of entries) {
    const escaped = entry.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    const matches = cleaned.match(regex);
    if (matches && matches.length > 0) {
      count += matches.length;
      cleaned = cleaned.replace(regex, (m) => matchCase(m, entry.replace));
    }
  }

  // Post-replacement cleanup
  cleaned = cleaned.replace(/[ \t]{2,}/g, ' ');
  cleaned = cleaned.replace(/^[ \t]*(?:[,.;:]+[ \t]*)+/gm, '');
  cleaned = cleaned.replace(/^[ \t](?=\S)/gm, '');
  cleaned = cleaned.replace(/\s+([,.;:!?])/g, '$1');
  cleaned = cleaned.replace(/,\s*([,.;:!?])/g, '$1');
  cleaned = cleaned.split('...').join('\x00ELL\x00');
  cleaned = cleaned.replace(/\.\s*\.+/g, '.');
  cleaned = cleaned.replace(/([!?])\s*\./g, '$1');
  cleaned = cleaned.split('\x00ELL\x00').join('...');
  cleaned = cleaned.replace(/^[ \t]+$/gm, '');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  cleaned = cleaned.replace(/,\s*(also|so|still|basically|in the end)\s*,\s*/gi, (_, word) => {
    return `. ${word.charAt(0).toUpperCase() + word.slice(1)}, `;
  });

  return { text: cleaned, count };
}

/**
 * Capitalization restoration: if original starts sentences with capitals, restore dropped openers.
 */
export function restoreCapitals(original: string, text: string): string {
  const sentenceStarts = original.match(/(?:^|[.!?]\s+|\n)\s*([A-Za-z])/g) || [];
  if (sentenceStarts.length === 0) return text;

  const upperCount = sentenceStarts.filter((s) => /[A-Z]/.test(s.slice(-1))).length;
  if (upperCount * 2 < sentenceStarts.length) {
    return text; // Author deliberately writes in lowercase
  }

  return text.replace(/(?:^|(?<=[.!?] )|(?<=[.!?]\n)|(?<=\n))\s*([a-z])/g, (m, letter) => {
    return m.slice(0, -1) + letter.toUpperCase();
  });
}

/**
 * Core humanize function that runs all three passes safely.
 */
export function humanize(text: string, lexicon: SlopLexicon = SLOP_LEXICON): {
  text: string;
  report: {
    invisibleCount: number;
    typographicCount: number;
    lexicalCount: number;
  };
} {
  if (!text || typeof text !== 'string') {
    return { text: text || '', report: { invisibleCount: 0, typographicCount: 0, lexicalCount: 0 } };
  }

  const rawForCase = text;
  const { protectedText, urls } = protectUrls(text);
  const inv = passInvisible(protectedText, lexicon);
  const typo = passTypographic(inv.text, lexicon);
  const lexi = passLexical(typo.text, lexicon);
  let result = restoreCapitals(rawForCase, lexi.text);
  result = restoreUrls(result, urls);

  return {
    text: result.trim(),
    report: {
      invisibleCount: inv.count,
      typographicCount: typo.count,
      lexicalCount: lexi.count,
    },
  };
}

/**
 * Quick helper that humanizes a string directly.
 */
export function humanizeText(text: string): string {
  return humanize(text).text;
}

/**
 * Middleware filter for automated outgoing messages before dispatch to Meta API.
 */
export function humanizeMiddleware(text: string): string {
  if (!text) return text;
  const clean = humanizeText(text);
  return clean;
}
