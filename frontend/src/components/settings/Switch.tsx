'use client';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

/**
 * Premium toggle switch with smooth spring animation and gradient track.
 * Linear / Vercel style.
 */
export default function Switch({
  checked, onChange, ariaLabel, size = 'md', disabled,
}: SwitchProps) {
  const dims = size === 'sm'
    ? { track: 'w-8 h-4',   thumb: 'w-3 h-3',  off: 'translate-x-0.5', on: 'translate-x-[18px]' }
    : { track: 'w-10 h-5.5', thumb: 'w-4 h-4', off: 'translate-x-0.5', on: 'translate-x-[22px]' };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center ${dims.track} flex-shrink-0 rounded-full
                  transition-all duration-300 ease-out
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40 focus-visible:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${checked
                    ? 'bg-gradient-to-r from-primary-600 to-accent-600 shadow-[0_0_16px_rgba(99,102,241,0.4)]'
                    : 'bg-surface-200 hover:bg-surface-300'}`}
      style={size === 'md' ? { width: 40, height: 22 } : {}}
    >
      <span
        className={`inline-block ${dims.thumb} bg-white rounded-full shadow-md
                    transition-transform duration-300 ease-out will-change-transform
                    ${checked ? dims.on : dims.off}`}
      />
    </button>
  );
}
