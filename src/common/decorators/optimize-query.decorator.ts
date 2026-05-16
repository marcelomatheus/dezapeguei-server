import { SetMetadata } from '@nestjs/common';

export const OPTIMIZE_QUERY_HINTS_KEY = 'optimizeQueryHints';

export type OptimizeQueryHints = {
  maxDurationMs?: number;
  indexHint?: string;
  cacheTtlSeconds?: number;
};

export const OptimizeQuery = (hints: OptimizeQueryHints = {}) =>
  SetMetadata(OPTIMIZE_QUERY_HINTS_KEY, hints);
