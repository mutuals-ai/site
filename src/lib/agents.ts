export type AgentListing = {
  slug: string;
  name: string;
  status: "Planned" | "Beta" | "Available";
  summary: string;
  detail: string;
  marketplace: string;
};

// A vendor's MCP support is not evidence that the Mutuals integration has passed acceptance.
export const agents: readonly AgentListing[] = [
  { slug: "claude-code", name: "Claude Code", status: "Beta", summary: "Relationship context alongside your work.", detail: "Owner-test beta over remote HTTP MCP and OAuth. Local authentication and authenticated tool discovery passed with Claude Code 2.1.274 on 19 September 2026. The endpoint is deployed; broader hosted-user acceptance is still pending. Setup is in Mutuals Settings → Connections.", marketplace: "No directory listing or endorsement." },
  { slug: "codex", name: "Codex", status: "Beta", summary: "A shared memory beyond a single session.", detail: "Owner-test beta over remote HTTP MCP and OAuth. Codex 0.154.0 passed local authentication plus actual save, source-backed recall and undo tool calls on 19 September 2026, using synthetic notes and scripted extraction. The endpoint is deployed; broader hosted-user acceptance is still pending.", marketplace: "No marketplace listing or endorsement." },
  { slug: "hermes", name: "Hermes Agent", status: "Beta", summary: "The same people, remembered across agents.", detail: "Owner-test beta. Hermes 0.21.3 passed local OAuth authentication and authenticated tool discovery on 19 September 2026. The endpoint is deployed; broader hosted-user acceptance and agent-driven conversations remain pending. Setup is in Mutuals Settings → Connections.", marketplace: "Not submitted to the Nous catalog." },
  { slug: "grok-bot", name: "Grok Bot", status: "Planned", summary: "On the compatibility roadmap.", detail: "The exact client, supported transport and authorization flow still need verification. No working Mutuals connection is advertised yet.", marketplace: "No partnership or listing." },
  { slug: "muse", name: "Muse", status: "Planned", summary: "A connector application is being prepared.", detail: "Submission and technical review are separate from approval. Muse is not available through Mutuals today; requirements and the review package must be completed first.", marketplace: "Application not yet submitted." },
];
