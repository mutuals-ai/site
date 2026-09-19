import Link from "next/link";
import { ArrowIcon } from "@/components/ArrowIcon";
import { LogoMark } from "@/components/Logo";
import { AgentShowcase } from "@/components/AgentShowcase";
import { MemoryEngine } from "@/components/MemoryEngine";
import { AbstractBackdrop } from "@/components/AbstractBackdrop";
import { HeroAgents } from "@/components/AgentLogo";
import { WaitlistForm } from "@/components/WaitlistForm";
import s from "@/components/landing.module.css";

export default function Page() {
  return (
    <div className={s.page}>
      <a className={s.skip} href="#main">
        Skip to content
      </a>
      <header className={s.nav}>
        <Link href="/" className={s.brand}>
          <LogoMark className="h-6 w-6" />
          Mutuals
        </Link>
        <nav aria-label="Main">
          <a href="#how-it-works">How it works</a>
          <a href="#agents">Agents</a>
          <a href="#security">Security</a>
        </nav>
        <a className={s.navCta} href="https://app.getmutuals.ai/login">
          Sign in <ArrowIcon direction="diagonal" />
        </a>
      </header>
      <main id="main">
        <section className={s.hero}>
          <AbstractBackdrop />
          <div className={s.heroCopy}>
            <h1>
              A second brain
              <br />
              for your relationships.
            </h1>
            <p className={s.lead}>
              Remember who you met, what they’re working on, and where you left
              off. Mutuals turns your notes into connected profiles your AI can
              use.
            </p>
            <div className={s.actions}>
              <a className={s.lightButton} href="#agents">
                Connect your agent <ArrowIcon direction="diagonal" />
              </a>
              <a className={s.quietButton} href="#how-it-works">
                See how it works <ArrowIcon direction="down" />
              </a>
            </div>
          </div>
          <HeroAgents />
        </section>
        <MemoryEngine />
        <section id="agents" className={s.agentsSection}>
          <div className={s.container}>
            <div className={s.centerHeading}>
              <p className={s.sectionLabel}>Agent connections</p>
              <h2>
                Add relationship memory
                <br />
                to your agent.
              </h2>
              <p>
                Save a conversation in Claude Code. Look up the person in Codex.
                <br className={s.desktopBreak} /> Both work with the same record
                in Mutuals.
              </p>
            </div>
            <AgentShowcase />
          </div>
        </section>
        <section id="security" className={s.security}>
          <div className={s.container}>
            <div className={s.securitySymbol} aria-hidden="true">
              <svg viewBox="0 0 64 72" fill="none">
                <path
                  d="M32 3 58 13v22c0 17-16 28-26 34C22 63 6 52 6 35V13L32 3Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="m21 35 8 8 16-18"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className={s.centerHeading}>
              <p className={s.sectionLabel}>Security & control</p>
              <h2>
                Choose what your
                <br />
                agent can access.
              </h2>
              <p>
                You decide which agents can access your memory
                <br className={s.desktopBreak} /> and what they’re allowed to do
                with it.
              </p>
            </div>
            <div className={s.securityGrid}>
              <article>
                <span aria-hidden="true"><ArrowIcon direction="diagonal" /></span>
                <h3>Permission comes first.</h3>
                <p>
                  Every connection needs your approval. Reading and remembering
                  are separate permissions.
                </p>
              </article>
              <article>
                <span aria-hidden="true">⊘</span>
                <h3>Disconnect at any time.</h3>
                <p>
                  Review and revoke an agent’s access in Mutuals. Revocation
                  stops its future requests.
                </p>
              </article>
              <article>
                <span aria-hidden="true">≡</span>
                <h3>See what’s remembered.</h3>
                <p>
                  Inspect your people and original notes in the app. Review the
                  context behind a remembered detail.
                </p>
              </article>
            </div>
            <div className={s.disclosure}>
              <p>
                Connected agents receive the names and context you let them
                read. Their providers’ policies apply to that data.
                Disconnecting cannot erase copies already shared. The Mutuals
                connector does not message your contacts.
              </p>
              <a href="/privacy">
                Read the privacy policy <ArrowIcon direction="diagonal" />
              </a>
            </div>
          </div>
        </section>
        <section id="waitlist" className={s.join}>
          <div className={s.container}>
            <p className={s.sectionLabel}>Early access</p>
            <h2>
              Build your relationship
              <br />
              memory with Mutuals.
            </h2>
            <p>Be first to hear when your Mutuals connection is ready.</p>
            <div className={s.form}>
              <WaitlistForm id="early-access" compact />
            </div>
            <p className={s.joinNote}>
              A launch update when your spot opens. No newsletter.
            </p>
          </div>
        </section>
      </main>
      <footer className={s.footer}>
        <div>
          <Link className={s.brand} href="/">
            Mutuals
          </Link>
          <p>A second brain for your relationships.</p>
        </div>
        <div>
          <a href="mailto:hello@getmutuals.ai">Contact</a>
          <a href="/privacy">Privacy</a>
          <a href="/imprint">Imprint</a>
          <span>© 2026 Mutuals</span>
        </div>
      </footer>
    </div>
  );
}
