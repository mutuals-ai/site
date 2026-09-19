"use client";

import { useState } from "react";
import styles from "./agent-first.module.css";

export function CrossAgentDemo() {
  const [mode, setMode] = useState<"remember" | "recall">("remember");
  return (
    <section className={styles.demo} aria-label="Illustrative cross-agent memory demo">
      <div className={styles.demoTop}><span>One memory, across your agents</span><span>Illustrative demo</span></div>
      <div className={styles.demoBody}>
        <div className={styles.demoSwitch} aria-label="Example workflow">
          <button type="button" aria-pressed={mode === "remember"} onClick={() => setMode("remember")}>After a conversation</button>
          <button type="button" aria-pressed={mode === "recall"} onClick={() => setMode("recall")}>Before the next one</button>
        </div>
        <div className={styles.crossAgentContent} aria-live="polite">
          <p className={styles.clientLabel}>{mode === "remember" ? "In your first agent" : "In another agent"}</p>
          <div className={styles.prompt}>{mode === "remember" ? "Remember: I caught up with Maya from Lantern Labs. She’s learning to sail and visiting Lisbon in October." : "I’m catching up with Maya from Lantern Labs. Where did we leave off?"}</div>
          <div className={styles.memoryAnswer}>
            <span className={styles.memoryMark} aria-hidden="true">M</span>
            <div><strong>{mode === "remember" ? "Remembered for next time." : "A little context before you catch up."}</strong>
              <p>{mode === "remember" ? "Maya’s sailing plans and Lisbon trip are saved with your original note." : "Maya was learning to sail and planning an October trip to Lisbon. You could ask how both are going."}</p>
              <details><summary>Meeting note · 19 September 2026</summary><blockquote>“She’s learning to sail and visiting Lisbon in October.”</blockquote></details>
            </div>
          </div>
        </div>
      </div>
      <p className={styles.demoFoot}>Fictional example of the planned cross-agent experience. No account is connected.</p>
    </section>
  );
}
