import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Story } from "@/components/Story";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <div className="mx-auto max-w-[1120px] px-5 sm:px-8">
          <Story />
        </div>
      </main>
      <Footer />
    </>
  );
}
