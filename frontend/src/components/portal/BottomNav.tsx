'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface BottomNavItem {
  href: string;
  label: string;
  icon: any;
}

interface BottomNavProps {
  items: BottomNavItem[];
}

/**
 * iOS/Android-style bottom tab bar for the Employee Portal.
 * Mobile-only — desktop uses the top nav strip in PortalLayout.
 * Tokenized colors → works under every theme.
 */
export default function BottomNav({ items }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      role="navigation"
      aria-label="Portal navigation"
      className="
        md:hidden
        fixed bottom-0 left-0 right-0 z-40
        bg-white/90 backdrop-blur-lg
        border-t border-surface-200
        shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.08)]
        pb-[max(env(safe-area-inset-bottom),0px)]
      "
    >
      <ul className="flex items-stretch justify-around">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/portal' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`
                  flex flex-col items-center justify-center gap-0.5
                  py-2 min-h-[52px]
                  transition-colors
                  ${active ? 'text-primary-600' : 'text-surface-500 hover:text-surface-900'}
                `}
              >
                <span
                  className={`
                    relative flex items-center justify-center
                    w-9 h-9 rounded-xl transition-all
                    ${active ? 'bg-gradient-to-br from-primary-500/10 to-accent-500/10' : ''}
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {active && (
                    <span
                      aria-hidden
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-600"
                    />
                  )}
                </span>
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
