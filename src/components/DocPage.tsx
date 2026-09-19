import type { ReactNode } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

/** Long-form pages (docs, privacy, terms) share one measure and one heading rhythm. */
export function DocPage({ title, lede, updated, children }: { title: string; lede?: ReactNode; updated?: string; children: ReactNode }) {
  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-[1120px] px-5 sm:px-8">
        <article className="pt-[140px] pb-[96px] lg:pt-[220px] lg:pb-[160px]">
          <h1 className="font-display text-[36px] lg:text-[56px]">{title}</h1>
          {updated ? <p className="mt-4 font-mono text-[13px] text-ink-faint">Last updated {updated}</p> : null}
          {lede ? <p className="mt-6 max-w-[680px] text-[18px] text-ink-soft">{lede}</p> : null}
          <div className="mt-12 max-w-[680px] space-y-12 text-[16px] leading-[1.65] text-ink-soft">{children}</div>
        </article>
        <div className="border-t border-paper-2 py-10">
          <Footer />
        </div>
      </main>
    </>
  );
}

export function DocSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 space-y-4">
      <h2 className="font-display text-[24px] text-ink lg:text-[28px]">{title}</h2>
      {children}
    </section>
  );
}

export function DocList({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2 pl-5 marker:text-ink-faint">{children}</ul>;
}

export function Command({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-paper-2 bg-paper-2/40 px-4 py-3 font-mono text-[13px] leading-[1.6] text-ink">
      <code>{children}</code>
    </pre>
  );
}

export const docLink = "text-signal underline underline-offset-4";
