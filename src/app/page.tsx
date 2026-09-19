import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { RelationshipDemo } from "@/components/RelationshipDemo";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { AgentDirectory } from "@/components/AgentDirectory";
import styles from "@/components/agent-first.module.css";

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <div className={styles.shell}><AgentDirectory /></div>
        <HowItWorks />
        <div className={styles.shell}>
        <section className={`${styles.section} ${styles.identityFeature}`}>
          <div><h2>Details remembered.<br />The right person, too.</h2><p>Mutuals adds context to the people you already know. If a name could mean more than one person, it asks a small question before saving.</p></div>
          <RelationshipDemo />
        </section>
        <section id="your-data" className={`${styles.section} ${styles.privacy}`}>
          <h2>Your permission.<br />Your relationship memory.</h2>
          <div><p>Connect an agent deliberately. Choose what it can read or remember, review the original notes and revoke access from Mutuals.</p><p>Reading shares real names and context with the agent you authorize. Revoking access stops new requests; it cannot erase what that agent already received. Mutuals does not message your contacts through the connector.</p><p>We are preparing the public launch disclosures. Early access is not an invitation to upload sensitive relationship data yet.</p></div>
        </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
