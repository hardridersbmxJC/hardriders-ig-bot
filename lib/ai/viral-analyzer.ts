/**
 * viral-analyzer.ts - Calculates Outlier Multiples and analyzes viral performance patterns.
 * 
 * Ported from swipe.py (instagram-agent-skill).
 * Raw views are not evidence: a 2M-follower account getting 400k views is average,
 * but a 4k-follower account getting 400k views is a true viral outlier (100x baseline).
 */

import { classifyHook, scoreHook, type HookScoreResult } from './hookscore';

export interface ReelPerformanceData {
  id?: string;
  account?: string;
  views: number;
  followers?: number;
  median?: number;
  hook?: string;
}

export interface AnalyzedReel extends ReelPerformanceData {
  baseline: number;
  outlierMultiple: number;
  formulaId: number | null;
  formulaName: string;
  wordCount: number;
  hookScore?: number;
  hookVerdict?: 'STRONG' | 'OK' | 'WEAK';
  fullHookAnalysis?: HookScoreResult;
}

export interface ViralBatchAnalysis {
  baselineType: 'account median' | 'follower count' | 'sample median';
  totalReels: number;
  uniqueAccounts: number;
  sampleMedianViews: number;
  reels: AnalyzedReel[];
  topThird: AnalyzedReel[];
  bottomThird: AnalyzedReel[];
  topFormulas: Array<{ formulaName: string; count: number }>;
  medianTopHookScore: number | null;
  medianBottomHookScore: number | null;
  medianTopWords: number | null;
  medianBottomWords: number | null;
  unclassifiedCount: number;
}

/**
 * Calculates the statistical median of a numeric array.
 */
export function calculateMedian(numbers: number[]): number {
  if (!numbers || numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 100) / 100;
  }
  return sorted[mid];
}

/**
 * Calculates the Outlier Multiple (views / baseline).
 * e.g., 400,000 views with a 10,000 baseline yields a 40.0x multiple.
 */
export function calculateOutlierMultiple(views: number, baseline: number): number {
  if (!baseline || baseline <= 0) return 0;
  return Math.round((views / baseline) * 100) / 100;
}

/**
 * Analyzes a single reel's viral performance against its account baseline.
 */
export function analyzeSingleReel(data: ReelPerformanceData): AnalyzedReel {
  const baseline = data.median || data.followers || 0;
  const outlierMultiple = calculateOutlierMultiple(data.views, baseline);

  let formulaId: number | null = null;
  let formulaName = 'unclassified';
  let wordCount = 0;
  let hookScore: number | undefined;
  let hookVerdict: 'STRONG' | 'OK' | 'WEAK' | undefined;
  let fullHookAnalysis: HookScoreResult | undefined;

  if (data.hook) {
    const classified = classifyHook(data.hook);
    formulaId = classified.id;
    formulaName = classified.name;

    const words = data.hook.match(/[A-Za-z0-9$%'’-]+/g) || [];
    wordCount = words.length;

    const scored = scoreHook(data.hook);
    fullHookAnalysis = scored;
    hookScore = scored.overallScore;
    hookVerdict = scored.verdict;
  }

  return {
    ...data,
    baseline,
    outlierMultiple,
    formulaId,
    formulaName,
    wordCount,
    hookScore,
    hookVerdict,
    fullHookAnalysis,
  };
}

/**
 * Analyzes a batch of reel performance entries, calculates medians,
 * identifies outlier multiples, and extracts viral hook trends.
 */
export function analyzeViralBatch(reels: ReelPerformanceData[]): ViralBatchAnalysis {
  if (reels.length === 0) {
    return {
      baselineType: 'sample median',
      totalReels: 0,
      uniqueAccounts: 0,
      sampleMedianViews: 0,
      reels: [],
      topThird: [],
      bottomThird: [],
      topFormulas: [],
      medianTopHookScore: null,
      medianBottomHookScore: null,
      medianTopWords: null,
      medianBottomWords: null,
      unclassifiedCount: 0,
    };
  }

  const allViews = reels.map((r) => r.views).filter((v) => typeof v === 'number' && !isNaN(v));
  const sampleMedianViews = calculateMedian(allViews);

  const hasExplicitMedian = reels.some((r) => (r.median ?? 0) > 0);
  const hasFollowers = reels.some((r) => (r.followers ?? 0) > 0);

  const baselineType: 'account median' | 'follower count' | 'sample median' =
    hasExplicitMedian ? 'account median' : hasFollowers ? 'follower count' : 'sample median';

  const analyzedList = reels.map((r) => {
    const item = { ...r };
    if (!item.median && !item.followers && sampleMedianViews > 0) {
      item.median = sampleMedianViews;
    }
    return analyzeSingleReel(item);
  });

  // Rank descending by Outlier Multiple
  const ranked = [...analyzedList].sort((a, b) => b.outlierMultiple - a.outlierMultiple);

  const thirdSize = Math.max(1, Math.floor(ranked.length / 3));
  const topThird = ranked.slice(0, thirdSize);
  const bottomThird = ranked.slice(-thirdSize);

  // Frequency of top hook formulas
  const formulaCounts = new Map<string, number>();
  for (const r of topThird) {
    if (r.formulaName && r.formulaName !== 'unclassified') {
      formulaCounts.set(r.formulaName, (formulaCounts.get(r.formulaName) || 0) + 1);
    }
  }

  const topFormulas = Array.from(formulaCounts.entries())
    .map(([formulaName, count]) => ({ formulaName, count }))
    .sort((a, b) => b.count - a.count);

  const topScores = topThird.map((r) => r.hookScore).filter((s): s is number => s !== undefined);
  const bottomScores = bottomThird.map((r) => r.hookScore).filter((s): s is number => s !== undefined);

  const topWords = topThird.map((r) => r.wordCount);
  const bottomWords = bottomThird.map((r) => r.wordCount);

  const uniqueAccounts = new Set(ranked.map((r) => r.account).filter(Boolean)).size;
  const unclassifiedCount = ranked.filter((r) => r.formulaName === 'unclassified').length;

  return {
    baselineType,
    totalReels: ranked.length,
    uniqueAccounts,
    sampleMedianViews,
    reels: ranked,
    topThird,
    bottomThird,
    topFormulas,
    medianTopHookScore: topScores.length > 0 ? calculateMedian(topScores) : null,
    medianBottomHookScore: bottomScores.length > 0 ? calculateMedian(bottomScores) : null,
    medianTopWords: topWords.length > 0 ? calculateMedian(topWords) : null,
    medianBottomWords: bottomWords.length > 0 ? calculateMedian(bottomWords) : null,
    unclassifiedCount,
  };
}
