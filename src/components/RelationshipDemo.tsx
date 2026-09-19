"use client";

import { useState } from "react";
import styles from "./agent-first.module.css";

export function RelationshipDemo() {
  const [person, setPerson] = useState<"Lantern Labs" | "Sunday running club" | null>(null);
  const [recall, setRecall] = useState(false);
  return (
    <section className={styles.demo} aria-label="Fictional relationship memory demonstration">
      <div className={styles.demoTop}><span>One memory. Your choice of agent.</span><span>Illustrative demo</span></div>
      <div className={styles.demoBody}>
        <div className={styles.prompt}>Remember that Maya enjoys sailing.</div>
        <p className={styles.question}>Which Maya do you mean?</p>
        <div className={styles.choices}>
          {(["Lantern Labs", "Sunday running club"] as const).map((label) => (
            <button key={label} type="button" aria-pressed={person === label} onClick={() => { setPerson(label); setRecall(false); }}>
              <span className={styles.avatar} aria-hidden="true">M</span><span><strong>Maya</strong><small>{label}</small></span>
            </button>
          ))}
        </div>
        <div className={styles.receipt} aria-live="polite">
          {person === null ? <p>No guessing. No change to the wrong person.</p> : recall ? <>
            <p className={styles.receiptLabel}>Before your next conversation</p>
            <p>Maya from {person} enjoys sailing. You mentioned it in your meeting note.</p>
            <details><summary>View source · 19 September 2026</summary><blockquote>“Maya enjoys sailing.”</blockquote></details>
          </> : <><p className={styles.receiptLabel}>Saved to Maya · {person}</p><p>Your original note stays with the memory.</p><button type="button" className={styles.textButton} onClick={() => setRecall(true)}>Recall it in another agent</button></>}
        </div>
      </div>
      <p className={styles.demoFoot}>Fictional people and example outputs. No account is connected by this demo.</p>
    </section>
  );
}
