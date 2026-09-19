"use client";

import { useState } from "react";
import { ArrowIcon } from "./ArrowIcon";
import { AgentLogo } from "./AgentLogo";
import { agents } from "@/lib/agents";
import s from "./landing.module.css";

const clients = [
  {
    slug: "claude-code",
    name: "Claude Code",
    instruction:
      "Add Mutuals as a remote MCP server in Claude Code. Sign in when prompted and choose the permissions you want to grant.",
    command:
      "claude mcp add --scope user --transport http mutuals https://app.getmutuals.ai/mcp\nclaude mcp login mutuals",
  },
  {
    slug: "codex",
    name: "Codex",
    instruction:
      "Add the Mutuals server, then run the login command. Your browser opens so you can review and approve access.",
    command:
      "codex mcp add mutuals --url https://app.getmutuals.ai/mcp\ncodex mcp login mutuals",
  },
  {
    slug: "hermes",
    name: "Hermes",
    instruction:
      "Add the Mutuals server in Hermes, then sign in through your browser to review and approve access.",
    command:
      "hermes mcp add mutuals --url https://app.getmutuals.ai/mcp --auth oauth",
  },
  {
    slug: "openclaw",
    name: "OpenClaw",
    instruction:
      "OpenClaw compatibility is planned. We’re checking the connection and permission flow before publishing setup instructions.",
    command: null,
  },
  {
    slug: "grok",
    name: "Grok Bot",
    instruction:
      "Grok Bot support is planned. Setup instructions will follow once the connection and permission flow have been verified.",
    command: null,
  },
  {
    slug: "muse",
    name: "Muse",
    instruction:
      "Muse support is planned. The connector application and technical review are still pending.",
    command: null,
  },
  {
    slug: "other",
    name: "Other agents",
    instruction:
      "Mutuals uses MCP, an open standard for connecting agents to tools. Support depends on each client’s transport and authentication. Grok and Muse are planned; neither is available yet.",
    command: null,
  },
];

export function AgentShowcase() {
  const [selected, setSelected] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const client = clients[selected];
  const listing = agents.find((agent) => agent.slug === client.slug);
  async function copyCommand() {
    if (!client.command) return;
    try {
      await navigator.clipboard.writeText(client.command);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <div className={s.showcase}>
      <div className={s.agentTabs} aria-label="Choose an agent">
        {clients.map((item, i) => (
          <button
            key={item.slug}
            type="button"
            aria-pressed={selected === i}
            onClick={() => {
              setSelected(i);
              setCopied(false);
              setCopyError(false);
            }}
          >
            <AgentLogo agent={item.slug} />
            {item.name}
          </button>
        ))}
      </div>
      <div className={s.setupPanel}>
        <div className={s.setupHeading}>
          <span>
            Add Mutuals to{" "}
            {client.name === "Other agents" ? "your agent" : client.name}
          </span>
          <span className={s.status}>{listing?.status ?? "Planned"}</span>
        </div>
        <div className={s.setupGrid}>
          <div>
            <h3>
              Relationship context in{" "}
              {client.name === "Other agents"
                ? "your own workflow"
                : client.name}
              .
            </h3>
            <p>{client.instruction}</p>
            <a
              className={s.darkButton}
              href={
                client.command
                  ? "https://app.getmutuals.ai/settings/connections"
                  : "#waitlist"
              }
            >
              {client.command ? "Open Connections" : "Get availability updates"}
              <ArrowIcon />
            </a>
          </div>
          <div className={s.codePane}>
            {client.command ? (
              <>
                <div className={s.codeHeading}>
                  <span>Terminal</span>
                  <button type="button" onClick={copyCommand}>
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre>
                  <code>{client.command}</code>
                </pre>
                <p aria-live="polite">
                  {copyError
                    ? "Copy unavailable. Select the command above to copy it."
                    : "Approve access in your browser. No shared API key."}
                </p>
              </>
            ) : (
              <div className={s.planned}>
                <span aria-hidden="true">◇</span>
                <strong>One memory. More ways in.</strong>
                <p>Join early access to hear when new connections are ready.</p>
              </div>
            )}
          </div>
        </div>
        <div className={s.setupFoot}>
          {client.command && (
            <p className={s.betaNote}>
              Owner-test beta. Access is limited while hosted sign-in is being
              tested.
            </p>
          )}
          {listing ? (
            <details>
              <summary>Beta testing details</summary>
              <p>
                {listing.detail} {listing.marketplace}
              </p>
            </details>
          ) : (
            <p>
              Planned compatibility. No connection or platform endorsement is
              implied.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
