type LogoProps = {
  /**
   * Tailwind / CSS classes applied to the root `<img>`.
   * Size via `w-*` / `h-*`.
   */
  className?: string;
  /** Kept for call-site compatibility; unused (PNG mark). */
  letterColor?: string;
  /** Kept for call-site compatibility; unused (PNG mark). */
  accentColor?: string;
  /** Accessible name. Set to `''` to mark as decorative. */
  title?: string;
};

/**
 * Tech to Store brand mark — red shopping-cart icon.
 */
export function Logo({
  className,
  title = 'Tech to Store',
}: LogoProps) {
  const decorative = title === '';
  return (
    <img
      src="/logo.png"
      alt={decorative ? '' : title}
      aria-hidden={decorative || undefined}
      className={`rounded-lg object-cover ${className ?? ''}`.trim()}
      draggable={false}
    />
  );
}
