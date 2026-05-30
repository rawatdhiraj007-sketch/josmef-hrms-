'use client';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type Status = 'online' | 'away' | 'busy' | 'offline';

interface AvatarProps {
  name?: string;
  src?: string;
  size?: Size;
  status?: Status;
  /** Override the gradient (defaults to primary→accent) */
  gradient?: string;
  /** Square instead of round */
  square?: boolean;
  className?: string;
}

const SIZE_MAP = {
  xs: { d: 'w-6 h-6',  txt: 'text-[10px]', dot: 'w-1.5 h-1.5' },
  sm: { d: 'w-7 h-7',  txt: 'text-xs',     dot: 'w-2 h-2' },
  md: { d: 'w-9 h-9',  txt: 'text-sm',     dot: 'w-2.5 h-2.5' },
  lg: { d: 'w-11 h-11', txt: 'text-base',  dot: 'w-3 h-3' },
  xl: { d: 'w-16 h-16', txt: 'text-xl',    dot: 'w-3.5 h-3.5' },
} as const;

const STATUS_COLOR = {
  online:  'bg-emerald-500',
  away:    'bg-amber-500',
  busy:    'bg-rose-500',
  offline: 'bg-surface-300',
} as const;

export default function Avatar({
  name, src, size = 'md', status, gradient, square, className = '',
}: AvatarProps) {
  const s = SIZE_MAP[size];
  const initials = (name ?? '?')
    .split(' ').filter(Boolean).slice(0, 2)
    .map(p => p[0]?.toUpperCase()).join('') || '?';

  return (
    <div className={`relative inline-block flex-shrink-0 ${className}`}>
      <div
        className={`${s.d} ${square ? 'rounded-lg' : 'rounded-full'} overflow-hidden shadow-soft ring-2 ring-white`}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={name ?? ''} className="w-full h-full object-cover" />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center text-white font-semibold ${s.txt}`}
            style={{
              background: gradient ?? 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
            }}
          >
            {initials}
          </div>
        )}
      </div>
      {status && (
        <span
          className={`absolute bottom-0 right-0 ${s.dot} ${STATUS_COLOR[status]} rounded-full ring-2 ring-white`}
        />
      )}
    </div>
  );
}

// ─── Stacked avatars (e.g. "+3 more") ──────────────────────
interface AvatarGroupProps {
  avatars: { name?: string; src?: string; gradient?: string }[];
  max?: number;
  size?: Size;
}

export function AvatarGroup({ avatars, max = 4, size = 'sm' }: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - visible.length;
  return (
    <div className="flex items-center -space-x-2">
      {visible.map((a, i) => (
        <Avatar key={i} {...a} size={size} className="ring-2 ring-white" />
      ))}
      {overflow > 0 && (
        <div className={`${SIZE_MAP[size].d} rounded-full bg-surface-100 border-2 border-white flex items-center justify-center text-[10px] font-semibold text-surface-600`}>
          +{overflow}
        </div>
      )}
    </div>
  );
}
