import type { Metadata } from "next";
import Link from "next/link";
import { Command, DocList, DocPage, DocSection, docLink } from "@/components/DocPage";

export const metadata: Metadata = {
  title: "Connect an agent · Mutuals",
  description: "Connect Mutuals to an AI agent over MCP: endpoint, sign-in, permissions, tools and limits.",
};

const ENDPOINT = "https://app.getmutuals.ai/mcp";

const tools = [
  { name: "search_relationships", scope: "relationships:read", text: "Keyword search over saved people and dated note excerpts. Results are candidates, not answers." },
  { name: "get_person_context", scope: "relationships:read", text: "Current fields, recent source notes and open follow-ups for one exact person." },
  { name: "get_capture", scope: "relationships:read", text: "The status of a note this connection saved. Safe to poll after an interruption." },
  { name: "remember", scope: "relationships:remember", text: "Save a note you asked Mutuals to remember, in your wording. It either saves or comes back with a question." },
  { name: "resolve_capture", scope: "relationships:remember", text: "Apply your answer to a pending question, for example which of two Mayas you meant." },
  { name: "undo_capture", scope: "relationships:remember", text: "Undo a note saved through this same connection. It refuses if later edits would be lost." },
] as const;

export default function DocsPage() {
  return (
    <DocPage
      title="Connect an agent"
      updated="19 September 2026"
      lede="Mutuals is a relationship memory your agents share. It speaks the Model Context Protocol, so any agent that supports remote MCP servers with OAuth can read and write to it with your permission."
    >
      <DocSection id="endpoint" title="Endpoint">
        <Command>{ENDPOINT}</Command>
        <DocList>
          <li>Transport: Streamable HTTP.</li>
          <li>Sign-in: OAuth 2.1 authorization code with PKCE (S256). Clients register themselves through dynamic client registration, so there is no API key to copy and nothing to paste into a config file.</li>
          <li>Discovery: <code className="font-mono text-[14px]">/.well-known/oauth-authorization-server</code> and <code className="font-mono text-[14px]">/.well-known/oauth-protected-resource/mcp</code> on the same host.</li>
        </DocList>
        <p>You need a Mutuals account first. Mutuals is in private beta, so sign-in is limited to invited accounts for now. <Link className={docLink} href="/#waitlist">Ask for early access</Link> if you do not have one.</p>
      </DocSection>

      <DocSection id="setup" title="Setup">
        <p>Add the endpoint, then finish sign-in in the browser window your agent opens.</p>
        <p className="font-medium text-ink">Claude Code</p>
        <Command>{`claude mcp add --scope user --transport http mutuals ${ENDPOINT}\nclaude mcp login mutuals`}</Command>
        <p className="font-medium text-ink">Codex</p>
        <Command>{`codex mcp add mutuals --url ${ENDPOINT}`}</Command>
        <p className="font-medium text-ink">Hermes</p>
        <Command>{`hermes mcp add mutuals --url ${ENDPOINT} --auth oauth`}</Command>
        <p className="font-medium text-ink">Any other agent</p>
        <p>Look for &quot;add custom connector&quot; or &quot;remote MCP server&quot; in its settings and paste the endpoint. If it supports OAuth with dynamic client registration, the rest is the same browser sign-in.</p>
        <p>Then try it with a fictional person: &quot;Remember that Maya Testbrook enjoys sailing.&quot; followed by &quot;What do I know about Maya Testbrook?&quot;</p>
      </DocSection>

      <DocSection id="status" title="What we have tested">
        <p>We only list a client as working after running its real, installed version against Mutuals.</p>
        <DocList>
          <li>Claude Code 2.1.274: sign-in, consent and tool discovery.</li>
          <li>Codex 0.154.0: sign-in, consent, save, recall with sources, and undo.</li>
          <li>Hermes Agent 0.21.3: sign-in, consent and tool discovery.</li>
          <li>Muse and Grok: not verified yet. They are not listed as supported until they are.</li>
        </DocList>
      </DocSection>

      <DocSection id="permissions" title="Permissions">
        <p>The consent screen shows exactly what the agent is asking for. Reading is always disclosed. Writing is optional and starts unchecked.</p>
        <DocList>
          <li><code className="font-mono text-[14px]">relationships:read</code> lets the agent search people and read one person&apos;s context.</li>
          <li><code className="font-mono text-[14px]">relationships:remember</code> lets it save, resolve and undo notes.</li>
          <li><code className="font-mono text-[14px]">followups:write</code> lets a saved note create follow-ups. It is asked for separately.</li>
        </DocList>
        <p>Each connection is tied to one person and one workspace. An agent never sees another user&apos;s data.</p>
      </DocSection>

      <DocSection id="tools" title="Tools">
        <div className="space-y-5">
          {tools.map((t) => (
            <div key={t.name}>
              <p className="font-mono text-[14px] text-ink">{t.name} <span className="text-ink-faint">· {t.scope}</span></p>
              <p>{t.text}</p>
            </div>
          ))}
        </div>
        <p>No tool can message your contacts, delete your account or export your whole database.</p>
      </DocSection>

      <DocSection id="limits" title="Limits and behaviour">
        <DocList>
          <li>120 requests per minute per connection. Beyond that the server answers 429 and asks the agent to wait a minute.</li>
          <li>Saving a note uses a language model, and each workspace has a daily model budget. When it is used up, saves are refused until the next day. Reading keeps working.</li>
          <li>Every save carries an idempotency key. A retry of the same note reuses its key, so an interrupted request never saves twice.</li>
          <li>If a name matches more than one person, Mutuals asks which one. It does not guess.</li>
          <li>Saved notes are data. If a note contains instructions, agents are told to treat them as text, not as commands.</li>
        </DocList>
      </DocSection>

      <DocSection id="disconnect" title="Disconnect">
        <p>Open Mutuals, then Settings, then Connections, and disconnect the agent. Its future requests fail immediately. This does not recall anything the agent already received, which is governed by that agent&apos;s own privacy terms.</p>
      </DocSection>

      <DocSection id="help" title="Help">
        <p>Write to <a className={docLink} href="mailto:hello@getmutuals.ai">hello@getmutuals.ai</a>. See also our <a className={docLink} href="/privacy">privacy policy</a> and <a className={docLink} href="/terms">terms</a>.</p>
      </DocSection>
    </DocPage>
  );
}
