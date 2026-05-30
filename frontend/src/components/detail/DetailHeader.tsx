'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';

interface DetailHeaderProps {
  /** Primary title (e.g. person's full name) */
  title: string;
  /** Short identifier above the title (e.g. "EMP-2025-0421") */
  eyebrow?: ReactNode;
  /** Subtitle below the title (e.g. "Registered Nurse · ICU") */
  subtitle?: ReactNode;
  /** Status badge / pill to the right of the title */
  badge?: ReactNode;
  /** Right-aligned action buttons */
  actions?: ReactNode;
  /** Avatar: shows initials + gradient if no src */
  avatarName?: string;
  avatarSrc?: string;
  /** Optional override for the back-button href (defaults to router.back()) */
  backHref?: string;
}

/**
 * Premium detail page header — Linear/Stripe-style.
 *
 * Layout:
 *   ← Back  Avatar  EYEBROW
 *                   Big title          Badge        [Actions]
 *                   Subtitle
 */
export default function DetailHeader({
  title, eyebrow, subtitle, badge, actions,
  avatarName, avatarSrc, backHref,
}: DetailHeaderProps) {
  const router = useRouter();

  function goBack() {
    if (backHref) router.push(backHref);
    else router.back();
  }

  return (
    <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="flex items-start gap-3 sm:gap-4 min-w-0">
        <button
          type="button"
          onClick={goBack}
          aria-label="Back"
          className="w-9 h-9 mt-0.5 rounded-lg flex items-center justify-center text-surface-500 hover:text-surface-900 hover:bg-surface-100 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {(avatarName || avatarSrc) && (
          <div className="flex-shrink-0 mt-0.5">
            <Avatar name={avatarName} src={avatarSrc} size="xl" />
          </div>
        )}

        <div className="min-w-0">
          {eyebrow && (
            <div className="text-2xs text-primary-700 font-mono font-semibold uppercase tracking-wider mb-1">
              {eyebrow}
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 tracking-tight">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <div className="text-sm text-surface-500 mt-1">{subtitle}</div>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </header>
  );
}
