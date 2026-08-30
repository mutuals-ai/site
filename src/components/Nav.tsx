import Link from "next/link";
import { copy } from "@/lib/copy";
import { LogoMark } from "@/components/Logo";

/** Fixed, full-width nav. Server component; the clock is the only client piece. */
export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 text-ink [mask-image:linear-gradient(to_bottom,black_70%,transparent)] bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1120px] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-[10px] text-signal">
          <LogoMark className="h-6 w-6 shrink-0" title="Mutuals" />
          <span className="font-display font-display-hero text-[24px] text-ink">{copy.nav.brand}</span>
        </Link>
        <a
          href="#waitlist"
          className="flex h-10 items-center rounded-full border border-ink-faint px-4 font-mono text-[13px] transition-colors hover:border-ink"
        >
          {copy.nav.cta} <span aria-hidden="true" className="ml-1.5">→</span>
        </a>
      </div>
    </header>
  );
}
