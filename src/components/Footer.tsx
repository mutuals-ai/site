import { copy } from "@/lib/copy";

/** Slim footer: contact, legal. The giant wordmark closes the page, shown whole. */
export function Footer() {
  return (
    <footer className="relative mt-[48px] lg:mt-[64px]">
      <div className="mx-auto max-w-[1120px] px-5 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-paper-2 pt-6 font-mono text-[13px] text-ink-faint">
          <a href={`mailto:${copy.footer.email}`} className="transition-colors hover:text-ink">{copy.footer.email}</a>
          <div className="flex gap-6">
            {copy.footer.links.map((l) => (
              <a key={l.href} href={l.href} className="transition-colors hover:text-ink">{l.label}</a>
            ))}
          </div>
          <span>© 2026 Mutuals · Vienna</span>
        </div>
        <div
          className="font-display font-display-hero mt-10 w-full pb-10 text-[clamp(88px,19vw,300px)] leading-[0.9] tracking-[-0.03em] text-ink select-none"
          aria-hidden="true"
        >
          Mutuals
        </div>
      </div>
    </footer>
  );
}
