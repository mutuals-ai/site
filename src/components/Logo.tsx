type LogoProps = {
  className?: string;
  title?: string;
};

/**
 * The Mutuals mark: two overlapping circles — two people, one connection.
 * Hand-drawn geometry (two <circle> primitives, opaque and overlapping so
 * the union reads as a single linked form), not a traced illustration.
 * Renders in `currentColor` so callers control the colour via text-* classes.
 */
export function Logo({ className, title }: LogoProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="24" cy="24" r="16" />
      <circle cx="40" cy="40" r="16" />
    </svg>
  );
}

/** Alias of `Logo` for call sites where "mark" reads clearer than "logo" (e.g. beside a separate wordmark). */
export const LogoMark = Logo;
