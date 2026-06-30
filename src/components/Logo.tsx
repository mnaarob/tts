type LogoProps = {
  /**
   * Tailwind / CSS classes applied to the root `<svg>`. Use `text-*` to control
   * the chip body + pins colour (they inherit `currentColor`). Defaults assume
   * the logo is rendered on a light surface.
   */
  className?: string;
  /** Fill colour for the white "T" cutout. Override for dark-background placements. */
  letterColor?: string;
  /** Fill colour for the pin-1 indicator dot in the upper-left of the chip body. */
  accentColor?: string;
  /** Accessible name. Set to `''` to mark the SVG as purely decorative. */
  title?: string;
};

/**
 * Tech to Store brand mark — a stylised IC chip with a "T" cut into its face
 * and a teal pin-1 indicator dot. The chip body and pins inherit `currentColor`
 * so callers can re-tint via `className="text-slate-900"`.
 */
export function Logo({
  className,
  letterColor = '#ffffff',
  accentColor = '#14b8a6',
  title = 'Tech to Store',
}: LogoProps) {
  const decorative = title === '';
  return (
    <svg
      viewBox="0 0 96 96"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : title}
    >
      {!decorative && <title>{title}</title>}
      <g fill="currentColor">
        <rect x="14" y="14" width="68" height="68" rx="8" />
        <rect x="21" y="8" width="8" height="6" />
        <rect x="44" y="8" width="8" height="6" />
        <rect x="67" y="8" width="8" height="6" />
        <rect x="21" y="82" width="8" height="6" />
        <rect x="44" y="82" width="8" height="6" />
        <rect x="67" y="82" width="8" height="6" />
        <rect x="8" y="21" width="6" height="8" />
        <rect x="8" y="44" width="6" height="8" />
        <rect x="8" y="67" width="6" height="8" />
        <rect x="82" y="21" width="6" height="8" />
        <rect x="82" y="44" width="6" height="8" />
        <rect x="82" y="67" width="6" height="8" />
      </g>
      <rect x="28" y="32" width="40" height="8" fill={letterColor} />
      <rect x="44" y="32" width="8" height="40" fill={letterColor} />
      <circle cx="27" cy="27" r="3" fill={accentColor} />
    </svg>
  );
}
