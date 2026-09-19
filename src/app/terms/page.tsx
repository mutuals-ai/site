import type { Metadata } from "next";
import { DocList, DocPage, DocSection, docLink } from "@/components/DocPage";

export const metadata: Metadata = {
  title: "Terms · Mutuals",
  description: "The terms for using Mutuals.",
};

export default function TermsPage() {
  return (
    <DocPage
      title="Terms of service"
      updated="19 September 2026"
      lede="These terms cover your use of Mutuals at app.getmutuals.ai, its chat channels and its agent connector. They are short on purpose."
    >
      <DocSection id="parties" title="Who you are dealing with">
        <p>
          Mutuals is provided by WeAmplify e.U., Lange Gasse 3/22, 1080 Vienna, Austria (FN 609504f). By creating an account you agree to these terms and confirm you have read the <a className={docLink} href="/privacy">privacy policy</a>.
        </p>
      </DocSection>

      <DocSection id="service" title="The service">
        <p>
          Mutuals is a private relationship memory: you save notes about the people you know and retrieve them on the web, through a chat channel or through an AI agent you connect. It is in beta. Features may change, and some described on our website as planned do not exist yet.
        </p>
        <p>Mutuals is currently free. If paid plans are introduced, you will be told in advance and nothing will be charged without your agreement.</p>
      </DocSection>

      <DocSection id="account" title="Your account">
        <DocList>
          <li>You must be at least 18.</li>
          <li>You sign in with Google and are responsible for keeping that account secure.</li>
          <li>One account is for one person. Do not share it.</li>
        </DocList>
      </DocSection>

      <DocSection id="content" title="Your content">
        <p>
          What you put into Mutuals stays yours. You give us permission to store and process it only to run the service for you, which includes sending it to the AI and hosting providers listed in the privacy policy.
        </p>
        <p>
          Your notes are about other people. You are responsible for having a legitimate reason to keep them and for respecting those people&apos;s rights. Keep it to what you would be comfortable with them reading.
        </p>
      </DocSection>

      <DocSection id="acceptable" title="What is not allowed">
        <DocList>
          <li>Using Mutuals to stalk, harass, discriminate against or surveil anyone.</li>
          <li>Building profiles for sale, for credit, insurance, employment or tenancy decisions, or for any purpose the people concerned would not reasonably expect.</li>
          <li>Storing data you obtained unlawfully.</li>
          <li>Breaking, probing or overloading the service, getting around rate limits or usage caps, or accessing another person&apos;s workspace.</li>
          <li>Reselling the service or presenting it as your own.</li>
        </DocList>
      </DocSection>

      <DocSection id="agents" title="Agents and third parties">
        <p>
          When you connect an AI agent or a chat channel, you instruct us to exchange your data with that provider within the permissions you chose. Those products are not ours. Their terms and privacy policies apply to what they receive, and we are not responsible for what they do with it. You can disconnect an agent at any time; that stops future access and cannot recall what was already shared.
        </p>
        <p>Listing an agent on our website or in our documentation is a statement about compatibility, not an endorsement or partnership in either direction.</p>
      </DocSection>

      <DocSection id="ai" title="AI output">
        <p>
          Mutuals uses language models to understand notes, match them to people and write summaries. Models make mistakes. Mutuals asks before guessing between two people and keeps the source of every fact so you can check it, but you remain responsible for decisions you make based on what it shows you.
        </p>
      </DocSection>

      <DocSection id="availability" title="Availability and limits">
        <p>
          We work to keep Mutuals available and your data safe, but a beta comes without an uptime guarantee. Requests are rate limited, and AI features stop for the day once a workspace reaches its daily model budget. Keep your own copy of anything you cannot afford to lose.
        </p>
      </DocSection>

      <DocSection id="ending" title="Ending things">
        <p>
          You can stop using Mutuals at any time and ask us to delete your account at <a className={docLink} href="mailto:hello@getmutuals.ai">hello@getmutuals.ai</a>. We may suspend or close an account that breaks these terms or puts the service or other people at risk. Where we reasonably can, we will warn you first and give you the chance to export your data.
        </p>
      </DocSection>

      <DocSection id="liability" title="Liability">
        <p>
          We are liable without limit for intent and gross negligence, for injury to life, body or health, and wherever the law does not allow liability to be limited. For slight negligence we are liable only for breach of an essential contractual duty, limited to the damage that was foreseeable and typical for this kind of contract. We are not liable for lost profit or for data you could have kept a copy of. Nothing here limits the rights you have as a consumer under mandatory law.
        </p>
      </DocSection>

      <DocSection id="law" title="Law and changes">
        <p>
          Austrian law applies, excluding its conflict-of-law rules and the UN Convention on Contracts for the International Sale of Goods. If you are a consumer in the EU, you keep the protection of the mandatory rules of your country of residence, and you may bring proceedings there. The European Commission&apos;s online dispute resolution platform is at <a className={docLink} href="https://ec.europa.eu/consumers/odr">ec.europa.eu/consumers/odr</a>. We are not obliged to take part in dispute resolution before a consumer arbitration board and do not do so.
        </p>
        <p>
          If we change these terms in a way that matters, we will tell you by email at least 14 days before. If you keep using Mutuals after that, the new terms apply. If you do not agree, you can close your account.
        </p>
      </DocSection>
    </DocPage>
  );
}
