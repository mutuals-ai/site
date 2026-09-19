import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { RelationshipDemo } from "@/components/RelationshipDemo";
import { CrossAgentDemo } from "@/components/CrossAgentDemo";
import { AgentDirectory } from "@/components/AgentDirectory";
import { WaitlistForm } from "@/components/WaitlistForm";
import styles from "@/components/agent-first.module.css";

export default function Page() {
  return (
    <>
      <Nav />
      <main className={styles.shell}>
        <section className={styles.hero}>
          <div><h1>Relationship memory for your AI.</h1><p className={styles.intro}>Remember the people you meet, what matters to them, and where you left off. Bring that context into the agents you already use.</p><a href="#waitlist" className={styles.primary}>Join agent early access</a><a href="#agents" className={styles.secondary}>Explore agent connections</a></div>
          <CrossAgentDemo />
        </section>
        <AgentDirectory />
        <section className={`${styles.section} ${styles.identityFeature}`}>
          <div><h2>Details remembered.<br />The right person, too.</h2><p>Mutuals adds context to the people you already know. If a name could mean more than one person, it asks a small question before saving.</p></div>
          <RelationshipDemo />
        </section>
        <section id="your-data" className={`${styles.section} ${styles.privacy}`}>
          <h2>Your permission.<br />Your relationship memory.</h2>
          <div><p>Connect an agent deliberately. Choose what it can read or remember, review the original notes and revoke access from Mutuals.</p><p>Reading shares real names and context with the agent you authorize. Revoking access stops new requests; it cannot erase what that agent already received. Mutuals does not message your contacts through the connector.</p><p>We are preparing the public launch disclosures. Early access is not an invitation to upload sensitive relationship data yet.</p></div>
        </section>
        <section id="waitlist" className={styles.section}>
          <div className={styles.waitlist}><h2>Be part of the first connections.</h2><p>We are starting with people who use agents every day and want to remember their relationships across them.</p><WaitlistForm id="agent-waitlist" /><p className={styles.note}>Joining the list does not authorize access to contacts or messages.</p></div>
        </section>
      </main>
      <Footer />
    </>
  );
}
