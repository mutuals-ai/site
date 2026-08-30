/** Final page copy per website-brief.md §3. Change here, log in docs/design-decisions.md. */
export const copy = {
  nav: { brand: "Mutuals", cta: "Join the waitlist" },
  hero: {
    headline: ["Your people,", "remembered."],
    sub: "Send it a voice note after you meet someone. It files the person, the context, and the intro you promised. Then it sends you one message a day. No app to open.",
    placeholder: "Email or WhatsApp number",
    button: "Join the waitlist",
    meta: "Private beta · autumn 2026 · Vienna → everywhere",
    reassurance: "We only message you once, when your spot opens. No newsletter, no spam.",
  },
  demo: {
    transcript: "Met Sarah at the Sequoia dinner, she's building autonomous drones, I want to intro her to Ben.",
    receipt: { title: "Saved to Sarah Lin", lines: ["Sequoia dinner · Aug 28", "+ autonomous drones", "+ intro → Ben Roth"] },
    chips: ["Sarah Lin", "Ben Roth"],
    arcLabel: "intro · pending",
    reminder: "Tomorrow 08:30: reminder to make the intro.",
  },
  steps: [
    { n: "01", title: "You talk.", body: "“Met Sarah at the Sequoia dinner. She's building drones. Intro her to Ben.” That's the whole input: voice note, text, or a forwarded contact." },
    { n: "02", title: "It remembers.", body: "Every note is filed to the right person. Five Sarahs? It asks once, then never again. Nothing is lost in a chat history. Everything lives in one record you can open any time." },
    { n: "03", title: "It connects.", body: "Ask it anything: who do I know in private equity in London? It answers with names and reasons. Every morning, one message: who to reconnect with, which intro you promised, who might help whom.", em: "who do I know in private equity in London?" },
  ],
  digest: {
    label: "08:30 · every day · that's it",
    header: "Mutuals · Tue Sep 2",
    items: [
      { n: "1", who: "Sarah Lin", why: "you promised an intro to Ben 9 days ago." },
      { n: "2", who: "Markus Hofer", why: "7 weeks quiet, you usually talk monthly." },
      { n: "3", who: "Anna Weiss ↔ Tom Adler", why: "Anna is raising for climate hardware. Tom said in June he's looking at exactly that." },
    ],
  },
  who: {
    title: "Who it's for",
    body: "Built for people whose network is the job: founders, investors, operators. People who meet twenty new people a week and refuse to adopt another tool. It lives in WhatsApp and Telegram, reads only your calendar and contacts, and never sends anything on your behalf.",
    reads: { title: "It reads", items: ["your calendar", "your contacts", "what you tell it"] },
    never: { title: "It never", items: ["sends on your behalf", "scrapes LinkedIn", "keeps a copy after you delete"] },
    privacy: "EU-hosted · reads calendar & contacts only · drafts, never sends · delete everything in one tap",
  },
  ticker: [
    "who do I know in climate hardware?",
    "which investor did I meet at Slush?",
    "who promised me an intro?",
    "who's building in Vienna?",
    "who did I meet at the Sequoia dinner?",
    "who should meet Anna?",
    "who went quiet this month?",
  ],
  story: {
    voice: "Met Sarah at the Sequoia dinner, she's building autonomous drones, I want to intro her to Ben.",
    receipt: ["✓ Saved to Sarah Lin", "Sequoia dinner · Aug 28", "+ autonomous drones", "+ intro → Ben Roth"],
    question: "who do I know in private equity in London?",
    answer: [
      { who: "James Whitfield", why: "partner at a mid-market fund in Mayfair, met at Slush" },
      { who: "Amara Okafor", why: "ex-Permira, now runs a family office" },
      { who: "Daniel Levy", why: "closed a secondaries fund in May, you had coffee" },
    ],
  },
  network: {
    title: "It connects the dots.",
    query: "who do I know in private equity in London?",
    names: ["Sarah Lin","Ben Roth","James Whitfield","Amara Okafor","Daniel Levy","Anna Weiss","Tom Adler","Markus Hofer","Nadia Aziz","Felix Stern","Clara Huang","Omar Haddad","Julia Novak","Leon Baptiste","Priya Nair","Jonas Wild","Elif Kaya","Max Reiter","Sofia Ortega","Tim Achebe","Hanna Lund","Noah Fischer","Ava Brandt","Kai Nakamura","Lena Roth","Ivo Petrov","Zoe Marin","Ben Ashford"],
    hits: [
      { name: "James Whitfield", why: "mid-market fund in Mayfair" },
      { name: "Amara Okafor", why: "ex-Permira" },
      { name: "Daniel Levy", why: "closed a secondaries fund in May" },
    ],
  },
  daily: { title: "One message a day." },
  join: { title: "Get on the list." },
  footer: { email: "hello@getmutuals.ai", links: [{ label: "Privacy", href: "/privacy" }, { label: "Imprint", href: "/imprint" }] },
} as const;
