import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Imprint · Mutuals",
};

export default function ImprintPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-[1120px] px-5 sm:px-8">
        <section className="pt-[140px] pb-[96px] lg:pt-[220px] lg:pb-[160px]">
          <h1 className="font-display text-[36px] lg:text-[56px]">Imprint</h1>
          <div className="mt-6 max-w-[600px] space-y-5 text-[18px] text-ink-soft">
            <p>Mutuals is operated by <strong className="font-medium text-ink">WeAmplify e.U.</strong>, a registered sole proprietorship owned by Kyrillus Mehanni.</p>
            <address className="not-italic">Lange Gasse 3/22<br />1080 Vienna<br />Austria</address>
            <p>Company register number: FN 609504f<br />Registered office: Vienna<br />Business activity: IT services</p>
            <p>Contact: <a className="text-signal underline underline-offset-4" href="mailto:contact@kyrill.us">contact@kyrill.us</a></p>
            <p className="text-[14px]">Company details from the <a className="text-signal underline underline-offset-4" href="https://www.evi.gv.at/f/609504f">official EVI company register entry</a>, checked on 19 September 2026.</p>
          </div>
        </section>
        <div className="border-t border-paper-2 py-10">
          <Footer />
        </div>
      </main>
    </>
  );
}
