import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy · Mutuals",
};

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto w-full max-w-[1120px] px-5 sm:px-8">
        <section className="pt-[140px] pb-[96px] lg:pt-[220px] lg:pb-[160px]">
          <h1 className="font-display text-[36px] lg:text-[56px]">Privacy</h1>
          <p className="mt-6 max-w-[600px] text-[18px] text-ink-soft">
            Privacy policy: coming with the private beta. Until then: we store only what you submit to the
            waitlist (email or phone), never sell it, and delete it on request at hello@getmutuals.ai.
          </p>
        </section>
        <div className="border-t border-paper-2 py-10">
          <Footer />
        </div>
      </main>
    </>
  );
}
