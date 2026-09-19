import type { Metadata } from "next";
import { DocList, DocPage, DocSection, docLink } from "@/components/DocPage";

export const metadata: Metadata = {
  title: "Privacy · Mutuals",
  description: "What Mutuals stores, who processes it, and how to have it deleted.",
};

export default function PrivacyPage() {
  return (
    <DocPage
      title="Privacy"
      updated="19 September 2026"
      lede="Mutuals holds notes about the people in your life. That is sensitive, so this page says plainly what we store, who else touches it, and what is not built yet."
    >
      <DocSection id="who" title="Who is responsible">
        <p>
          Mutuals is operated by WeAmplify e.U., Lange Gasse 3/22, 1080 Vienna, Austria (company register number FN 609504f), owned by Kyrillus Mehanni. WeAmplify e.U. is the controller for your account data. Contact: <a className={docLink} href="mailto:hello@getmutuals.ai">hello@getmutuals.ai</a>. Full company details are in the <a className={docLink} href="/imprint">imprint</a>.
        </p>
        <p>
          For the notes you keep about other people, you decide what goes in and why. We store and process that content on your behalf, for you, and do not use it for our own purposes.
        </p>
      </DocSection>

      <DocSection id="what" title="What we store">
        <p className="font-medium text-ink">Your account</p>
        <DocList>
          <li>From Google sign-in: your email address, whether Google has verified it, your name, your profile picture address and your Google account identifier. We ask Google for your identity only. We do not request access to your Google contacts, calendar or email.</li>
          <li>Your sessions: a hashed session token, the browser user agent and the IP address of the sign-in.</li>
          <li>Your settings, such as time zone.</li>
        </DocList>
        <p className="font-medium text-ink">Your relationship data</p>
        <DocList>
          <li>The people, organizations, notes, interactions and follow-ups you add, whether typed in the app, imported from a file, sent through a chat channel or saved by an agent you connected.</li>
          <li>Every value keeps its history and its source, so that you can see where a fact came from. Undoing or correcting something adds to that history.</li>
          <li>Imported files are read in memory and are not kept as files. The rows you uploaded are stored with the import so you can review, fix and re-export them.</li>
        </DocList>
        <p className="font-medium text-ink">Chat channels, if you link one</p>
        <DocList>
          <li>The phone number or Telegram identifier you link, the messages you send to the Mutuals number or bot, and our replies.</li>
          <li>Voice notes are transcribed and the transcript is stored. The audio itself is not kept.</li>
          <li>Linking a channel does not import your chat history, and Mutuals never messages your contacts.</li>
        </DocList>
        <p className="font-medium text-ink">Connected agents</p>
        <DocList>
          <li>Which agent you authorized, the permissions you granted, when it expires, and hashed access credentials.</li>
        </DocList>
        <p className="font-medium text-ink">Operations</p>
        <DocList>
          <li>Request logs contain the method, the path without its query string, and a request identifier.</li>
          <li>For each AI request we record which model was used, token counts, cost and timing. The content of the request is not recorded in that trace by default.</li>
          <li>If you send feedback from inside the app, your description, any screenshots you attach, the page you were on, your name and email, and technical details of your browser are filed in a private issue tracker.</li>
        </DocList>
        <p className="font-medium text-ink">This website</p>
        <DocList>
          <li>If you join the waitlist: the email address or phone number you enter, the referring page and campaign tags, and your referral code.</li>
          <li>Visits are counted with Plausible, which does not use cookies and does not build a profile of you.</li>
        </DocList>
      </DocSection>

      <DocSection id="why" title="Why, and on what legal basis">
        <DocList>
          <li>To provide the service you signed up for: performance of our contract with you (Art. 6(1)(b) GDPR).</li>
          <li>To keep the service secure and working, for example rate limiting, session records and logs: our legitimate interest in running a safe service (Art. 6(1)(f) GDPR).</li>
          <li>To answer you when you write to us or join the waitlist: your request or consent (Art. 6(1)(a) and (b) GDPR).</li>
        </DocList>
        <p>We do not sell personal data, we do not show advertising, and we do not use your relationship data to train models.</p>
      </DocSection>

      <DocSection id="ai" title="AI processing">
        <p>
          Understanding a note takes a language model. When you save a note, the text of that note, your own name and the names of people you were recently in touch with are sent to a model provider so the right person can be recognized. When you send a voice note, the audio and a list of names from your workspace, used as spelling hints, are sent for transcription. Summaries send the fields and recent notes of the one record being summarized.
        </p>
        <p>
          These requests go through OpenRouter to the model providers behind it, currently OpenAI and Google models. Those companies process the content under their own terms and may do so outside the European Union. Real names are included, because matching a note to a person does not work without them.
        </p>
      </DocSection>

      <DocSection id="agents" title="Agents you connect">
        <p>
          If you connect an agent such as Claude Code or Codex, it can read what you permitted on the consent screen, including real names and notes, and that information reaches the agent&apos;s provider. Its own privacy policy then applies. You can disconnect an agent at any time in Settings, then Connections. That stops future requests. It cannot recall what the agent already received.
        </p>
      </DocSection>

      <DocSection id="processors" title="Who processes data for us">
        <DocList>
          <li>Fly.io: application hosting, Frankfurt, Germany.</li>
          <li>Neon: PostgreSQL database, Frankfurt, Germany (AWS eu-central-1).</li>
          <li>Google: sign-in.</li>
          <li>OpenRouter and the model providers it routes to: AI processing as described above.</li>
          <li>Meta (WhatsApp), Twilio and Telegram: only if you link that chat channel. Telegram bot chats are not end-to-end encrypted.</li>
          <li>GitHub: in-app feedback reports, in a private repository.</li>
          <li>Vercel, Plausible, Cloudflare Turnstile and Resend: this website, its visit counts, its spam check and waitlist emails.</li>
        </DocList>
        <p>Some of these providers are based in the United States. Where data leaves the European Economic Area, the transfer relies on the European Commission&apos;s standard contractual clauses or an adequacy decision that covers the provider.</p>
      </DocSection>

      <DocSection id="cookies" title="Cookies">
        <p>
          The app sets one session cookie to keep you signed in, for up to 30 days, and a short-lived cookie during Google sign-in to protect that exchange. Both are strictly necessary. There are no advertising or analytics cookies. Your theme preference and unsent feedback drafts are kept in your browser&apos;s local storage and never leave it.
        </p>
      </DocSection>

      <DocSection id="retention" title="How long we keep it">
        <p>
          Your account and relationship data stay until you delete them or ask us to delete your account. Sessions expire after 30 days without use. Agent connections expire after 30 days unless renewed, and their access tokens after 15 minutes. Waitlist entries are kept until access is granted or you ask us to remove them.
        </p>
      </DocSection>

      <DocSection id="rights" title="Your rights, and deleting your account">
        <p>
          You have the right to access, correct, export and delete your data, to restrict or object to processing, and to withdraw consent. Self-service account deletion and full export are not built into the app yet. Until they are, write to <a className={docLink} href="mailto:hello@getmutuals.ai">hello@getmutuals.ai</a> from the address you signed in with and we will export or delete your account and everything in your workspace within 30 days.
        </p>
        <p>
          You can also complain to a supervisory authority. Ours is the Austrian Data Protection Authority (Datenschutzbehörde), <a className={docLink} href="https://www.dsb.gv.at">dsb.gv.at</a>.
        </p>
      </DocSection>

      <DocSection id="others" title="People you take notes about">
        <p>
          Mutuals is a private notebook. The people in it are not users and are not contacted by us. If you believe someone keeps information about you in Mutuals and you want to exercise your rights, write to us and we will pass your request to the account holder where we can identify them.
        </p>
      </DocSection>

      <DocSection id="security" title="Security">
        <p>
          Data is encrypted in transit. Every read and write is scoped to your workspace, so one account cannot reach another&apos;s data. Session and agent tokens are stored only as hashes. No system is perfectly secure; if a breach affects you, we will tell you.
        </p>
      </DocSection>

      <DocSection id="age" title="Age">
        <p>Mutuals is for adults. You must be at least 18 to create an account.</p>
      </DocSection>

      <DocSection id="changes" title="Changes">
        <p>When this page changes in a way that matters, we will update the date at the top and tell account holders by email before it takes effect.</p>
      </DocSection>
    </DocPage>
  );
}
