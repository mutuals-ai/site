import { agents } from "@/lib/agents";
import styles from "./agent-first.module.css";

export function AgentDirectory() {
  return <section id="agents" className={styles.section} aria-labelledby="agents-title">
    <div className={styles.sectionIntro}><h2 id="agents-title">Your people.<br />Your choice of agent.</h2><p>One relationship memory, with access you control. Beta connections are currently restricted to owner testing. Compatibility and marketplace approval are listed separately.</p></div>
    <div className={styles.directory}>{agents.map((agent) => <details key={agent.slug} id={agent.slug} className={styles.agent}>
      <summary><strong>{agent.name}</strong><span className={styles.agentSummary}>{agent.summary}</span><span className={styles.status}>{agent.status}</span><span className={styles.expand} aria-hidden="true">+</span></summary>
      <div className={styles.agentDetails}><p>{agent.detail}</p><p>{agent.marketplace}</p><p>Intended permissions: read relationship details; optionally remember notes and create follow-ups. No contact messaging.</p><a href="#waitlist">Join agent early access</a></div>
    </details>)}</div>
    <p className={styles.note}>Prefer a quick voice note? Telegram is in owner testing. Worldwide production WhatsApp is pending provider approval. Neither imports your chat history.</p>
  </section>;
}
