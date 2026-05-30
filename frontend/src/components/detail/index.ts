/**
 * NextNova detail-page primitives — barrel export.
 *
 * Usage:
 *   import { DetailHeader, InfoRow, Timeline, StickyActionBar } from '@/components/detail';
 *
 * Pair with:
 *   - <Tabs/> from '@/components/ui' for tab nav
 *   - <Card/> / <CardHeader/> for sectioning
 *   - <Badge/> for status pills
 */
export { default as DetailHeader }    from './DetailHeader';
export { default as InfoRow }         from './InfoRow';
export { default as Timeline }        from './Timeline';
export type { TimelineEvent }         from './Timeline';
export { default as StickyActionBar } from './StickyActionBar';
