import Image from "next/image";
import s from "./landing.module.css";

const logos: Record<string, { src: string; name: string }> = {
  "claude-code": { src: "/brands/claude.svg", name: "Claude Code" },
  codex: { src: "/brands/openai.svg", name: "Codex" },
  hermes: { src: "/brands/hermes.png", name: "Hermes" },
  openclaw: { src: "/brands/openclaw.svg", name: "OpenClaw" },
  grok: { src: "/brands/grok.svg", name: "Grok Bot" },
  muse: { src: "/brands/muse.svg", name: "Muse" },
};

export function AgentLogo({ agent }: { agent: string }) {
  const logo = logos[agent];
  if (!logo)
    return (
      <svg
        className={s.agentLogo}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    );
  return (
    <span className={`${s.agentLogo} ${agent === "codex" ? s.openaiLogo : ""}`}>
      <Image src={logo.src} alt="" width={28} height={28} />
    </span>
  );
}

export function HeroAgents() {
  return (
    <div className={s.heroAgents}>
      <div>
        {Object.entries(logos).map(([slug, logo]) => (
          <a href="#agents" key={slug}>
            <AgentLogo agent={slug} />
            <span>{logo.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
