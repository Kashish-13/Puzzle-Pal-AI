import {
  Challenge,
  ChallengeCategory,
  ChallengeDifficulty,
  ReasoningEvaluation,
  UserType,
} from "./types";

// Curated high-caliber offline fallback challenges across all Student and Kids categories
const FALLBACK_CHALLENGES: Record<ChallengeCategory, Record<ChallengeDifficulty, Challenge>> = {
  // ================= STUDENT & CORE CATEGORIES =================
  business: {
    easy: {
      title: "Pricing Tier Rebalancing",
      category: "business",
      difficulty: "easy",
      userType: "student",
      scenario:
        "A SaaS tool currently offers two tiers: Free (unlimited basic features) and Pro ($40/month). Conversion from Free to Pro is hovering at 0.8%. Customer surveys show users love the product, but rarely upgrade because the Free tier satisfies 95% of their daily needs without friction.",
      question:
        "What specific changes would you make to the tier structure or feature boundaries to improve monetization without destroying user goodwill? Defend your approach.",
      context:
        "Competitors charge between $15–$30/month for mid-tier plans and have stricter usage quotas.",
      expectedReasoningPoints: [
        "Introduce usage-based thresholds (e.g. storage, team seats, or export limits) instead of binary feature paywalls",
        "Introduce a mid-tier (e.g. Starter at $15/mo) to reduce price shock",
        "Grandfather existing active power users to avoid negative community backlash",
      ],
      hint: "Consider whether the gap between $0 and $40 is too wide, and examine which usage limits (seats, exports, projects) correlate with user willingness to pay.",
      estimatedTime: 5,
    },
    medium: {
      title: "The Retention vs Acquisition Dilemma",
      category: "business",
      difficulty: "medium",
      userType: "student",
      scenario:
        "A B2B analytics startup has scaled from 10,000 to 28,000 monthly active users over the last two quarters through aggressive paid marketing. However, cohort data reveals that 90-day retention has plummeted from 46% to 27%. Meanwhile, sales demands three enterprise compliance features to unlock $400K in pending enterprise pipeline. The engineering team has capacity to ship only one major initiative this quarter.",
      question:
        "Which initiative should the product leadership prioritize: doubling down on onboarding/retention, shipping the enterprise compliance features, or maintaining acquisition momentum? Justify your decision with tradeoff analysis.",
      context:
        "Current runway is 11 months. The next fundraising round is scheduled in 6 months, where VCs will scrutinize net dollar retention and cohort health.",
      expectedReasoningPoints: [
        "A leaky bucket makes future marketing spend increasingly wasteful (high CAC with declining LTV)",
        "Enterprise deals could extend runway, but delivering custom features for unproven retention risks long-term product-market fit",
        "VCs in Series A/B evaluate retention cohorts as the primary proxy for enduring defensibility",
      ],
      hint: "Evaluate what happens if you pour more users into a leaky bucket, and weigh immediate enterprise cash against the valuation impact of falling cohort retention.",
      estimatedTime: 8,
    },
    hard: {
      title: "Marketplace Disintermediation Crisis",
      category: "business",
      difficulty: "hard",
      userType: "student",
      scenario:
        "An on-demand marketplace connecting freelance senior software architects with enterprise clients charges a 20% take rate on all billings. Platform metrics show that after an average of 45 days, 62% of client-contractor pairs quietly take their relationship off-platform, bypassing the fee via direct invoicing.",
      question:
        "How should executive leadership resolve this disintermediation crisis? Evaluate options including legal enforcement, reducing take rates, offering workflow SaaS incentives, or changing the business model entirely.",
      context:
        "Contractors complain that the 20% ongoing rake provides zero value once the initial match is made. Invoicing and dispute management are currently primitive.",
      expectedReasoningPoints: [
        "Punitive or legal enforcement is virtually unenforceable and breeds customer hostility",
        "The take rate must scale down over time (e.g. 20% month 1, 10% month 2, 5% thereafter)",
        "The platform must add sticky ongoing value (automated tax compliance, escrow insurance, instant payouts, IP indemnification) that makes staying on-platform cheaper than leaving",
      ],
      hint: "Focus on incentive alignment rather than punishment. Ask: what continuous value does the platform provide after day 45?",
      estimatedTime: 10,
    },
    expert: {
      title: "Multi-Sided Platform Subsidy Architecture",
      category: "business",
      difficulty: "expert",
      userType: "student",
      scenario:
        "A health-tech platform connects specialized radiologists, private diagnostic clinics, and health insurance payers. High-demand radiologists will only join if guaranteed at least 15 scan evaluations per day at premium rates. Clinics are reluctant to install the integration hardware without a guaranteed 4-hour turnaround time. Payers agree to subsidize 50% of scan costs only if over 80% of clinic volume in a metropolitan area routes through the platform.",
      question:
        "Design a sequencing and subsidy strategy to break this three-sided cold start problem in a test city of 1.2M people without exhausting the company's $2M seed budget.",
      context:
        "Competitor incumbents hold long-term exclusive contracts with 3 of the 5 largest regional hospital networks.",
      expectedReasoningPoints: [
        "Subsidize the marquee side first (radiologists with minimum revenue guarantees in exchange for on-call SLA)",
        "Offer clinics free lightweight cloud integration rather than heavy hardware to remove upfront capital friction",
        "Establish an exclusive pilot with mid-tier independent clinics rather than entrenched hospital networks to hit the 80% density threshold in a dense sub-region",
      ],
      hint: "Identify the critical constraint side whose presence automatically attracts the other two, and create density in a small geographical wedge.",
      estimatedTime: 12,
    },
  },

  technical: {
    easy: {
      title: "Memory Leak in Event Listener Loop",
      category: "technical",
      difficulty: "easy",
      userType: "student",
      scenario:
        "A frontend dashboard renders real-time telemetry from IoT sensors. After running in an operator tab for 3 hours, the browser tab consumes over 2.4 GB of RAM and crashes with 'Out of Memory'. An inspection of the component lifecycle reveals repeated subscriptions created inside a window resize listener.",
      question:
        "Analyze the code snippet below. Identify the exact mechanism causing the memory leak and describe the correct architectural remediation.",
      context:
        "The application uses modern React and WebSockets. The sensor updates fire up to 10 times per second.",
      codeSnippet: {
        language: "javascript",
        code: `function SensorMonitor({ sensorId }) {\n  useEffect(() => {\n    const onResize = () => {\n      const socket = new WebSocket('wss://api.sensors.io/live/' + sensorId);\n      socket.onmessage = (e) => updateChart(JSON.parse(e.data));\n    };\n    window.addEventListener('resize', onResize);\n  }, [sensorId]);\n}`,
      },
      expectedReasoningPoints: [
        "A new WebSocket connection is instantiated on every single window resize event without closing previous sockets",
        "Event listener is never cleaned up in the useEffect return teardown function",
        "Chart state updates continue firing from orphaned background sockets, preventing garbage collection",
      ],
      hint: "Look at what happens every time the user slightly resizes their browser window, and observe whether previous sockets are ever terminated.",
      estimatedTime: 5,
    },
    medium: {
      title: "Database Deadlock Under Concurrent Checkout",
      category: "technical",
      difficulty: "medium",
      userType: "student",
      scenario:
        "During a flash sale event, an e-commerce platform encounters a surge in HTTP 500 errors. Postgres transaction logs show recurring 'deadlock detected' errors occurring between the inventory deduction service and the gift card redemption service.",
      question:
        "Review the transaction operations below. Explain why the deadlock is occurring under concurrent traffic, and propose two distinct architectural solutions to guarantee deadlock-free execution.",
      context:
        "Transaction A (Order Processing) locks 'inventory_items' row then locks 'user_wallet' row. Transaction B (Wallet Rebalancing) locks 'user_wallet' row then queries and locks 'inventory_items' row.",
      codeSnippet: {
        language: "sql",
        code: `-- Tx A (Order Processing)\nBEGIN;\nUPDATE inventory_items SET reserved = reserved + 1 WHERE sku = 'ITEM-99';\n-- Concurrent delay\nUPDATE user_wallets SET balance = balance - 50 WHERE user_id = 42;\nCOMMIT;\n\n-- Tx B (Gift Card Redemption Check)\nBEGIN;\nUPDATE user_wallets SET pending_rewards = pending_rewards + 10 WHERE user_id = 42;\n-- Concurrent delay\nUPDATE inventory_items SET holds = holds + 1 WHERE sku = 'ITEM-99';\nCOMMIT;`,
      },
      expectedReasoningPoints: [
        "Circular resource dependency caused by inverted lock acquisition order across services",
        "Enforce strict global lock ordering across all application transactions (e.g. always lock user_wallets before inventory_items)",
        "Decouple operations using event-driven eventual consistency (e.g. Sagas with compensating transactions) instead of distributed ACID locks",
      ],
      hint: "Notice the order in which Tx A and Tx B acquire exclusive row locks. When two operations lock resources in opposing order, concurrent execution can create a cycle.",
      estimatedTime: 8,
    },
    hard: {
      title: "Distributed Cache Stampede Mitigation",
      category: "technical",
      difficulty: "hard",
      userType: "student",
      scenario:
        "A high-traffic social platform serves the top 100 trending hashtags from a Redis cluster with an exact TTL of 60 seconds. When the key expires, 15,000 incoming requests per second simultaneously miss the cache and hammer the underlying primary PostgreSQL database, causing connection pool exhaustion and complete cascade failure.",
      question:
        "Evaluate three distinct strategies (e.g. mutex locking, probabilistic early expiration/XFetch, and background asynchronous warming) to eliminate this cache stampede. Which would you deploy and why?",
      context:
        "Generating the trending list requires an expensive aggregative query across 4 million recent post rows and takes 850ms.",
      expectedReasoningPoints: [
        "Mutex/single-flight locking prevents thundering herd but introduces latency spikes on the single worker",
        "Probabilistic early expiration (XFetch algorithm) proactively computes the new value before strict TTL expiry without cold misses",
        "Decoupled background worker cron completely removes cache regeneration from the user-facing request path",
      ],
      hint: "Consider decoupling cache population from client requests entirely, or using probabilistic math to recompute the value shortly before expiration.",
      estimatedTime: 10,
    },
    expert: {
      title: "Split-Brain Resolution in Consensus Protocol",
      category: "technical",
      difficulty: "expert",
      userType: "student",
      scenario:
        "A 5-node Raft consensus cluster operating across three availability zones (2 nodes in AZ-A, 2 nodes in AZ-B, 1 node in AZ-C) experiences a network partition. AZ-A loses all communication with AZ-B and AZ-C, while AZ-B and AZ-C maintain full connectivity with each other. Before the partition, Node 1 in AZ-A was the cluster leader.",
      question:
        "Detail the exact sequence of state transitions across both partitions: election terms, vote quorums, log uncommitted states, client write acknowledgments, and eventual partition reunification.",
      context:
        "Clients have configured retries with 500ms timeouts. Both partitions continue to receive write traffic from regional load balancers.",
      expectedReasoningPoints: [
        "AZ-A has only 2 of 5 nodes, lacking majority quorum (>= 3), so it cannot commit any new log entries",
        "AZ-B + AZ-C form a quorum of 3 nodes, elect a new leader with a higher term, and commit writes safely",
        "Upon reunification, Node 1 discovers the higher term, steps down to follower, and truncates its uncommitted divergent log entries to match the majority leader",
      ],
      hint: "Calculate majority quorum for 5 nodes (5/2 + 1 = 3). Determine which partition can assemble 3 votes and what happens to uncommitted writes in the minority partition.",
      estimatedTime: 12,
    },
  },

  data: {
    easy: {
      title: "Marketing Channel CAC Anomaly",
      category: "data",
      difficulty: "easy",
      userType: "student",
      scenario:
        "A growth team evaluates customer acquisition metrics across four paid advertising channels. The team lead proposes reallocating 80% of next month's $100K budget to Paid Search because it has the lowest Cost Per Acquisition ($18) compared to YouTube ($45) and LinkedIn ($92).",
      question:
        "Analyze the performance table below. Why would reallocating 80% of budget to Paid Search be a potentially catastrophic mistake? Provide a data-driven justification.",
      context:
        "The company sells an enterprise collaboration tool with an annual contract value of $1,200.",
      dataTable: {
        caption: "Q3 Channel Performance Summary",
        headers: ["Channel", "Spend", "New Signups", "CPA", "90-Day LTV", "Payback Period"],
        rows: [
          ["Paid Search", "$36,000", "2,000", "$18", "$42", "4.2 months"],
          ["Meta Ads", "$28,000", "800", "$35", "$110", "2.8 months"],
          ["YouTube", "$22,000", "488", "$45", "$290", "1.6 months"],
          ["LinkedIn", "$14,000", "152", "$92", "$1,450", "0.9 months"],
        ],
      },
      expectedReasoningPoints: [
        "Paid Search has the lowest CPA but an abysmal LTV ($42) yielding an LTV:CAC ratio of only 2.3x",
        "LinkedIn has a high CPA ($92) but an extraordinary LTV ($1,450, 15.7x ratio) and the fastest payback period (0.9 months)",
        "Optimizing purely for top-of-funnel conversion without factoring unit economics and net dollar retention drives unprofitable growth",
      ],
      hint: "Look beyond CPA alone: compare the LTV to CAC ratio and payback period across each row.",
      estimatedTime: 5,
    },
    medium: {
      title: "Simpson's Paradox in Medical Trial",
      category: "data",
      difficulty: "medium",
      userType: "student",
      scenario:
        "A biotechnology firm tests Treatment Alpha vs Treatment Beta for a respiratory illness across 1,000 total patients. Aggregate headline numbers show Treatment Alpha has an overall recovery rate of 78% vs 83% for Treatment Beta. However, when stratified by severity, Treatment Alpha outperformed Beta in both Mild cases AND Severe cases.",
      question:
        "Explain how and why Simpson's Paradox manifests in this data table. Which treatment should clinicians adopt, and what confounding variable distorted the aggregate headline?",
      dataTable: {
        caption: "Clinical Trial Outcomes by Severity",
        headers: ["Condition", "Treatment Alpha (Recovered / Total)", "Treatment Beta (Recovered / Total)"],
        rows: [
          ["Mild Cases", "270 / 300 (90%)", "560 / 700 (80%)"],
          ["Severe Cases", "260 / 400 (65%)", "60 / 100 (60%)"],
          ["Aggregate Total", "530 / 700 (75.7%)", "620 / 800 (77.5%)"],
        ],
      },
      expectedReasoningPoints: [
        "Severity is an unstratified confounding variable that dictated patient assignment",
        "Treatment Alpha was disproportionately assigned to severe cases (400 of 700 patients = 57%), which have a baseline lower recovery rate",
        "Clinicians should choose Treatment Alpha because it consistently delivers superior conditional recovery rates (90% vs 80%, 65% vs 60%)",
      ],
      hint: "Examine the distribution of patient counts in each group. Was Treatment Alpha tested on a much higher proportion of difficult, severe patients?",
      estimatedTime: 8,
    },
    hard: {
      title: "Churn Attribution and Feature Cannibalization",
      category: "data",
      difficulty: "hard",
      userType: "student",
      scenario:
        "A fintech app introduced 'Auto-Invest', an automated algorithmic savings tool. Following the release, overall 60-day user churn increased from 8% to 14%. The product team notices that users who actively adopted Auto-Invest actually churned at only 3%. However, users who viewed the Auto-Invest prompt but declined churned at 22%.",
      question:
        "Diagnose whether Auto-Invest caused the churn increase or whether self-selection bias is masking another underlying systemic issue. Outline the experimentation framework you would run to prove causality.",
      context:
        "The prompt for Auto-Invest required linking a primary checking bank account via Plaid, which experienced a 34% authorization error rate during the release window.",
      expectedReasoningPoints: [
        "Selection bias: power users who adopt automated tools are already inherently low-churn profiles",
        "Friction/distrust: users confronted with aggressive bank-linking prompts without sufficient trust or who failed Plaid auth became alienated",
        "Run a true randomized controlled trial (A/B test with holdout) where only the treatment group receives the prompt, measuring net retention across all cohort intents",
      ],
      hint: "Consider whether the prompt itself introduced friction or security anxiety for casual users, and evaluate selection bias among early adopters.",
      estimatedTime: 10,
    },
    expert: {
      title: "Algorithmic Pricing Elasticity Discontinuity",
      category: "data",
      difficulty: "expert",
      userType: "student",
      scenario:
        "A ride-hailing company deploys dynamic multiplier surge pricing. Standard microeconomic modeling assumes a smooth convex price elasticity curve. However, telemetry reveals an acute drop-off cliff: conversion drops by 4% between 1.2x and 1.4x, but drops precipitously by 38% at exactly 1.5x, then remains flat between 1.5x and 1.8x.",
      question:
        "Formulate three behavioral or technological hypotheses for this non-linear elasticity discontinuity. How should the pricing engine algorithmically adapt its surge multiplier calculation to maximize driver supply without triggering the cancellation cliff?",
      context:
        "Rival apps display surge multipliers in discrete increments of 0.25x. Consumer psychology heuristics show round number anchoring.",
      expectedReasoningPoints: [
        "Behavioral anchoring: 1.5x represents a psychological threshold ('50% more than normal') that triggers conscious price search on competitor apps",
        "Competitor price-checking latency: at 1.5x, consumers open alternative apps or public transit maps rather than booking instantly",
        "Continuous micro-pricing or absolute dollar displays ($22.40 instead of 1.5x) eliminate the visual psychological multiplier anchor",
      ],
      hint: "Look at psychological round numbers and what actions a user takes when they see '1.5x' on their screen compared to '1.4x'.",
      estimatedTime: 12,
    },
  },

  logic: {
    easy: {
      title: "The Island Truth-Teller Paradox",
      category: "logic",
      difficulty: "easy",
      userType: "student",
      scenario:
        "You meet two island residents, A and B. Every resident is either a Knight (always tells the truth) or a Knave (always lies). A makes the following single statement: 'At least one of us is a Knave.'",
      question:
        "Determine the exact identities of both A and B with step-by-step deductive proof. Show why no other combination is logically possible.",
      expectedReasoningPoints: [
        "Assume A is a Knave: then A's statement must be false, meaning neither is a Knave (both are Knights), creating an immediate contradiction since A cannot be both",
        "Therefore, A must be a Knight, and A's statement is true",
        "Since A is a Knight and the statement 'at least one is a Knave' is true, B must be a Knave",
      ],
      hint: "Test the two possible identities of A: what contradiction arises if you assume A is a Knave?",
      estimatedTime: 5,
    },
    medium: {
      title: "Three Logicians and the Colored Dots",
      category: "logic",
      difficulty: "medium",
      userType: "student",
      scenario:
        "Three perfectly rational logicians (A, B, C) sit in a circle. A master has 5 hats: 3 red and 2 white. The master places a hat on each logician's head while their eyes are closed, hiding the remaining 2 hats. Each logician can see the other two hats but not their own. When asked in turn: A says 'I do not know my hat color.' B then says 'I do not know my hat color.' C, who is blindfolded or speaks third, immediately states with certainty: 'I know my hat color.'",
      question:
        "What color is C's hat, and what was C's deductive chain of reasoning after hearing A and B?",
      expectedReasoningPoints: [
        "If B and C both had white hats, A would have immediately known A had red (since only 2 white hats exist). A's ignorance proves B and C cannot both be white",
        "B hears A's answer and knows: 'If C had a white hat, I would know my hat is red (because B and C cannot both be white)'. Since B also does not know, C's hat cannot be white",
        "Therefore, C deduces with certainty that C's hat is Red",
      ],
      hint: "Work backwards from what A would have deduced if both B and C had white hats, then consider what B deduced from A's answer.",
      estimatedTime: 8,
    },
    hard: {
      title: "The Poisoned Wine Bottle Binary Search",
      category: "logic",
      difficulty: "hard",
      userType: "student",
      scenario:
        "A king has 1,000 bottles of vintage wine. Exactly one bottle has been tainted with a lethal poison. You have 10 test strips. Even a single drop of poisoned wine turns a test strip permanently purple. The test takes exactly 24 hours to develop, and you have exactly 24 hours total before the royal banquet begins (you can only conduct one round of simultaneous tests).",
      question:
        "Formulate a test plan to pinpoint the exact poisoned bottle within 24 hours using only the 10 test strips. Explain the mathematical principle and mapping protocol.",
      expectedReasoningPoints: [
        "10 binary bits can represent 2^10 = 1,024 distinct states, which is greater than 1,000 bottles",
        "Label each bottle in binary from 1 to 1,000 (10 bits: 0000000001 to 1111101000)",
        "Strip i receives a drop from every bottle whose binary representation has a 1 in position i",
        "After 24 hours, the binary pattern of positive strips spells out the exact poisoned bottle index",
      ],
      hint: "Calculate 2 to the power of 10. How can each of the 10 test strips correspond to a binary bit position in numbers from 1 to 1000?",
      estimatedTime: 10,
    },
    expert: {
      title: "The Blue-Eyed Islanders Inductive Countdown",
      category: "logic",
      difficulty: "expert",
      userType: "student",
      scenario:
        "An island has 100 inhabitants with blue eyes and 900 with brown eyes. Everyone can see everyone else's eye color, but no one knows their own. There are no mirrors or reflective surfaces. A sacred law dictates that if anyone discovers their own eye color, they must leave the island at midnight. A foreign visitor arrives and announces to the assembled crowd: 'At least one of you has blue eyes.'",
      question:
        "What happens, on which night, and why? Prove by mathematical induction why the announcement revealed critical new common knowledge even though every single islander already visually saw 99 or 100 people with blue eyes.",
      expectedReasoningPoints: [
        "Base case (n=1): if 1 blue-eyed person existed, they would see zero blue eyes and leave on night 1",
        "Inductive step (n=k): if k blue-eyed people existed, each sees k-1 blue eyes and expects them to leave on night k-1. When no one leaves, they deduce they are the kth blue-eyed person and all leave on night k",
        "For n=100, on the 100th midnight, all 100 blue-eyed islanders leave simultaneously",
        "The visitor's announcement did not introduce mutual knowledge (everyone knew it), but created common knowledge (everyone knows that everyone knows that everyone knows...)",
      ],
      hint: "Start with a simple hypothetical island of just 1 blue-eyed person, then 2, then 3. Notice how the absence of departures on previous days provides information.",
      estimatedTime: 12,
    },
  },

  mystery: {
    easy: {
      title: "The Alibi of the Clockmaker",
      category: "mystery",
      difficulty: "easy",
      userType: "student",
      scenario:
        "At 10:15 PM, a rare diamond watch was stolen from an estate vault. Suspect Marcus claims he was at an analog cinema watching a classic film from 9:30 PM to 11:00 PM without leaving his seat. When questioned, Marcus states: 'I looked up at the theater's grand wall clock during the intermission; it was exactly 10:15 PM, and the hands were pointing in exactly opposite directions forming a straight line across the face.'",
      question:
        "Deduce why Marcus's alibi is physically impossible based on mechanical analog clock geometry.",
      expectedReasoningPoints: [
        "At 10:15, the minute hand points directly at the 3 (90 degrees from top)",
        "The hour hand at 10:15 is one quarter of the way between 10 and 11 (approx 307.5 degrees)",
        "For hands to be in a straight line (180 degrees apart) when the minute hand is at 15 minutes (90 degrees), the hour hand would have to point at the 9 (270 degrees)",
        "At 10:15, the hour hand has long passed the 9. A straight line around 10:00 occurs around 10:21 or 10:22",
      ],
      hint: "Calculate the exact angle of the hour hand when the minute hand points at 3 (15 minutes). Does it point directly at 9?",
      estimatedTime: 5,
    },
    medium: {
      title: "The Vanishing Server Room Backup",
      category: "mystery",
      difficulty: "medium",
      userType: "student",
      scenario:
        "An encrypted cold-storage hard drive was stolen from an air-gapped corporate data room between 2:00 AM and 3:30 AM on a Sunday. Keycard access logs show three employees entered the corridor: Sarah (Database Admin, keycard in at 2:05, out at 2:20), David (DevOps, in at 2:40, out at 3:10), and Elena (SecOps, in at 3:15, out at 3:28). The room requires a biometric thumbprint and a physical brass key.",
      question:
        "Forensic evidence reveals the brass lock was picked using tension wrenches, the biometric scanner was bypassed using an unlinked silicon mold, and the thermal camera shows the room temperature dropped from 65°F to 58°F during the intruder's presence. Who is the most probable culprit and why?",
      context:
        "The data room AC unit automatically ramps up to maximum cooling when the inner server door is left ajar for more than 15 minutes.",
      expectedReasoningPoints: [
        "Sarah was only present for 15 minutes, which is insufficient to pick a high-security lock, bypass biometrics, and trigger the 15-minute door ajar AC ramp",
        "Elena was only present for 13 minutes",
        "David was present for 30 minutes (2:40 to 3:10), the only time window long enough to leave the door ajar for >=15 minutes and execute the multi-step bypass",
      ],
      hint: "Cross-reference the duration of each suspect's stay with the air conditioning cooling threshold.",
      estimatedTime: 8,
    },
    hard: {
      title: "The Counterfeit Treasury Bond Audit",
      category: "mystery",
      difficulty: "hard",
      userType: "student",
      scenario:
        "During an internal banking audit, an investigator uncovers four negotiable bearer bonds dated November 14, 1982, valued at $2.5M. The watermark, paper weight, and chemical ink age all match authentic 1982 federal reserve stock. However, the audit director immediately flags the bonds as modern counterfeits after reading three sentences in the legal covenant clause.",
      question:
        "The covenant text states: 'Payments shall be indexed to the Euro currency benchmark, authorized by the European Central Bank, and transferred via SWIFT MT103 messaging.' Identify the anachronisms that expose this forgery.",
      expectedReasoningPoints: [
        "The Euro currency did not exist in 1982 (introduced in 1999 as accounting currency, 2002 as physical currency)",
        "The European Central Bank was established in 1998 under the Treaty of Amsterdam",
        "SWIFT MT103 standard message type was introduced in late 2000 to replace MT100",
      ],
      hint: "Check historical launch dates for the Euro, the ECB, and modern SWIFT message protocols against the 1982 date on the bonds.",
      estimatedTime: 10,
    },
    expert: {
      title: "The High-Frequency Front-Running Syndicate",
      category: "mystery",
      difficulty: "expert",
      userType: "student",
      scenario:
        "An algorithmic exchange watchdog detects front-running on large institutional market orders routed between Chicago and New York. Orders submitted to the Chicago matching engine at t=0 are consistently preempted at the New York exchange 4.1 milliseconds later by an obscure proprietary trading desk. The fastest known fiber-optic route via laser microwave link achieves 3.98 milliseconds one-way latency.",
      question:
        "Reconstruct the architectural leak: how is the proprietary desk detecting the Chicago order, transmitting the signal to New York, and executing before the institutional order arrives? Detail the physics, packet sniffing, or exchange colocation vectors.",
      expectedReasoningPoints: [
        "The predatory desk has collocated sniffing hardware at intermediate microwave towers across the Appalachian line",
        "They decode partial TCP header syn packets or market feed multicast datagrams without waiting for full packet assembly",
        "They execute via pre-positioned capital orders already queued at the New York matching engine using predictive tick signals",
      ],
      hint: "Analyze the difference between total packet transit time and partial packet header decoding over direct microwave line-of-sight.",
      estimatedTime: 12,
    },
  },

  decision: {
    easy: {
      title: "Security Patch vs Zero-Downtime SLA",
      category: "decision",
      difficulty: "easy",
      userType: "student",
      scenario:
        "A critical remote code execution (RCE) vulnerability (CVSS score 9.8) has been disclosed in an open-source library used by your primary payment API. A patch is available, but applying it requires restarting the core payment gateway cluster, incurring an estimated 12 minutes of complete transaction downtime on a Saturday afternoon ($90,000 in lost revenue and potential SLA penalties).",
      question:
        "What decision do you make as VP of Engineering: patch immediately, delay until 3:00 AM off-peak, or implement temporary web application firewall (WAF) mitigation? Justify your decision.",
      expectedReasoningPoints: [
        "CVSS 9.8 RCE with public exploit vectors represents existential breach risk that dwarfs the $90,000 downtime cost",
        "Immediate WAF virtual patch rule can be deployed in minutes with zero downtime to block known exploit signatures",
        "Follow with rolling cluster restart or scheduled off-peak deployment while under active WAF shielding",
      ],
      hint: "Can you shield the vulnerability immediately without restarting the servers, using your edge or WAF layer?",
      estimatedTime: 5,
    },
    medium: {
      title: "Whistleblower Leak vs Regulatory Settlement",
      category: "decision",
      difficulty: "medium",
      userType: "student",
      scenario:
        "You are Chief Compliance Officer at an autonomous drone delivery company. A senior safety engineer reveals that collision-avoidance telemetry in dense fog fails 14% of the time, double the safety threshold reported to civil aviation regulators. The CEO urges you to remain quiet for 30 days while a software hotfix is trained, warning that public disclosure right now will sink a $60M Series C funding round closing in two weeks.",
      question:
        "Evaluate your legal, ethical, and fiduciary responsibilities. What exact course of action do you take within the next 48 hours?",
      expectedReasoningPoints: [
        "Public safety and regulatory reporting requirements legally supersede investor closing timelines",
        "Concealing known safety failures while actively closing an investment round constitutes fraudulent misrepresentation to Series C investors",
        "Immediately suspend drone operations in fog conditions (weather-specific operational limitation), notify the board audit committee, and brief regulators with the hotfix timeline",
      ],
      hint: "Look at whether grounding operations specifically during fog removes immediate public danger while preserving legal integrity.",
      estimatedTime: 8,
    },
    hard: {
      title: "Ransomware Attack on Critical Infrastructure",
      category: "decision",
      difficulty: "hard",
      userType: "student",
      scenario:
        "A municipal water treatment facility serving 450,000 residents has its operational SCADA network partially infected with BlackCat ransomware. The attackers demand $4.5M in Monero within 18 hours or threaten to wipe pump calibration firmware and dump chemical dosing records online. Manual backup pumps can maintain safe clean water pressure for only 36 hours before reservoir exhaustion.",
      question:
        "As incident commander, structure your 18-hour response protocol across law enforcement coordination, manual override transition, cyber insurance negotiation, and public crisis messaging.",
      expectedReasoningPoints: [
        "Air-gap operational SCADA network from administrative network immediately to prevent infection spread to dosing sensors",
        "Mobilize manual override teams immediately to secure the 36-hour window without waiting for negotiation outcomes",
        "Coordinate with FBI/CISA cyber incident teams; paying ransom rarely guarantees working decryption keys and violates OFAC sanctions",
      ],
      hint: "Focus first on physical containment and manual overrides to control the timer, rather than bargaining with malicious actors.",
      estimatedTime: 10,
    },
    expert: {
      title: "Autonomous Vehicle Moral Dilemma Algorithm",
      category: "decision",
      difficulty: "expert",
      userType: "student",
      scenario:
        "You lead the Autonomous Safety Systems group at a tier-1 automaker. During sudden catastrophic brake failure on an icy downhill road, the vehicle's computer has 300 milliseconds to choose between two unavoidable trajectories: Trajectory A stays the course and impacts a school bus carrying 18 passengers at 45 mph (probable minor-to-moderate injuries); Trajectory B steers into a concrete retaining wall, resulting in certain fatality for the single vehicle occupant.",
      question:
        "Defend an algorithmic decision framework for this scenario from utilitarian, deontological, and contractarian ethical perspectives. How should this policy be coded into autonomous vehicle standard regulations?",
      expectedReasoningPoints: [
        "Utilitarianism seeks minimization of total expected harm/fatalities (Trajectory A has lower probability of catastrophic loss)",
        "Deontological ethics rejects using the vehicle occupant as a sacrificed instrument without active agency",
        "Standard regulatory framework must prioritize predictability, non-discriminatory collision mitigation, and speed dissipation rather than targeted trolley problem calculations",
      ],
      hint: "Contrast the raw aggregate injury probability with the ethical duty owed by a product to its own passenger.",
      estimatedTime: 12,
    },
  },

  aptitude: {
    easy: {
      title: "Coding-Decoding Pattern Deduction",
      category: "aptitude",
      difficulty: "easy",
      userType: "student",
      scenario:
        "In a placement reasoning test, a specific cipher encodes words by applying a systematic mathematical shift to alternating letters. Under this code rule: 'REASON' is encrypted as 'TFCTQP'. Under the identical cryptographic rule, how is the word 'LOGICAL' encoded?",
      question:
        "Determine the exact encoded string for 'LOGICAL' and provide the formal letter-shift derivation for each character.",
      expectedReasoningPoints: [
        "Examine the letter shifts for REASON -> TFCTQP: R(+2)=T, E(+1)=F, A(+2)=C, S(+1)=T, O(+2)=Q, N(+2)=P",
        "The pattern alternates between +2 and +1 shifts across character indices",
        "Applying to LOGICAL: L(+2)=N, O(+1)=P, G(+2)=I, I(+1)=J, C(+2)=E, A(+1)=B, L(+2)=N -> 'NPIJEBN'",
      ],
      hint: "Calculate the alphabetical index offset for each letter of REASON and check if the shift follows an alternating sequence.",
      estimatedTime: 5,
    },
    medium: {
      title: "Multi-Generational Blood Relations",
      category: "aptitude",
      difficulty: "medium",
      userType: "student",
      scenario:
        "In a family of seven members (P, Q, R, S, T, U, V), there are two married couples and three generations. R is the mother-in-law of U. P is the father of T, who is the brother of S. V is the granddaughter of Q, who is married to R. S is the sister of T and is married to U.",
      question:
        "Draw out the genealogical lineage. How is P related to U, and what is the exact gender of each family member?",
      expectedReasoningPoints: [
        "Generation 1: Q (male) married to R (female)",
        "Generation 2: P and S are children of Q and R. S (female) is married to U (male)",
        "Generation 3: V (female) is daughter of S and U, granddaughter of Q",
        "P is the brother-in-law of U",
      ],
      hint: "Start with the married couples: Q and R form generation 1, while S and U form generation 2.",
      estimatedTime: 8,
    },
    hard: {
      title: "Circular Seating Arrangement with Variable Professions",
      category: "aptitude",
      difficulty: "hard",
      userType: "student",
      scenario:
        "Eight professionals (A, B, C, D, E, F, G, H) sit facing the center of a circular table. They hold 8 distinct professions: Doctor, Engineer, Lawyer, Pilot, Architect, Banker, Scientist, and Teacher. Conditions: 1. The Doctor sits third to the right of A. 2. F sits opposite the Lawyer. 3. B is an Engineer and sits adjacent to both the Pilot and C. 4. D sits second to the left of the Scientist. 5. E is the Architect and sits opposite A.",
      question:
        "Determine the exact clockwise seating order starting from A and match each individual to their verified profession.",
      expectedReasoningPoints: [
        "Fix A at position 1. Since E is opposite A, E is at position 5 (Architect)",
        "The Doctor is third to the right of A (position 4)",
        "Resolve B, C, F, and D step-by-step using constraint elimination across the circle",
      ],
      hint: "Anchor A and E across positions 1 and 5, then eliminate positions for B (who must sit between two specific neighbors).",
      estimatedTime: 10,
    },
    expert: {
      title: "Dynamic Number Sequence with Non-Linear Polynomial Terms",
      category: "aptitude",
      difficulty: "expert",
      userType: "student",
      scenario:
        "A quantitative hedge fund test presents this sequence: 3, 11, 38, 131, 466, 1711, ?\nStandard difference operations do not yield immediate constants on the first derivative.",
      question:
        "Discover the mathematical rule governing each successive transition, state the next number in the series, and prove your formula mathematically.",
      expectedReasoningPoints: [
        "Calculate step multiples: 3 * 3 + 2 = 11; 11 * 3 + 5 = 38; 38 * 3 + 17 = 131; 131 * 3 + 73 = 466",
        "Analyze the additive offsets: 2, 5, 17, 73, 313. Notice the offsets follow their own recurrence: 2*3-1=5, 5*3+2=17, 17*4+5=73",
        "Alternative exponential model: n_k = 3^(k) + k^3 terms. Next number is 6,422",
      ],
      hint: "Examine the ratio of each term to the previous term. Notice it hovers close to 3 with a growing residual.",
      estimatedTime: 12,
    },
  },

  word: {
    easy: {
      title: "Verbal Nuance and Argument Strength",
      category: "word",
      difficulty: "easy",
      userType: "student",
      scenario:
        "Read the claim: 'All groundbreaking technologies inevitably create temporary unemployment; therefore, governments should resist regulating artificial intelligence until the market achieves equilibrium.'",
      question:
        "Identify the primary unstated logical leap in this argument. What critical assumption must hold true for this conclusion to be valid?",
      expectedReasoningPoints: [
        "Assumes that market self-correction is guaranteed without catastrophic irreversible societal harm during the transition",
        "Equates past historical technology transitions (e.g. agricultural mechanization) to cognitive automation without establishing structural equivalence",
        "Conflates the inevitability of temporary displacement with the claim that regulation cannot mitigate harm",
      ],
      hint: "Look at the word 'inevitably' and what the argument assumes about whether the market will automatically correct itself safely.",
      estimatedTime: 5,
    },
    medium: {
      title: "Syllogistic Deduction and Quantifier Traps",
      category: "word",
      difficulty: "medium",
      userType: "student",
      scenario:
        "Consider three premises:\n1. Some ethical leaders are ambitious visionaries.\n2. No ambitious visionaries are careless administrators.\n3. All careless administrators are reckless spenders.",
      question:
        "Evaluate which of the following conclusions logically follows with certainty:\nConclusion I: Some ethical leaders are not careless administrators.\nConclusion II: No ethical leaders are reckless spenders.\nConclusion III: Some ambitious visionaries are not reckless spenders.",
      expectedReasoningPoints: [
        "From Premise 1, there exists at least one ethical leader who is an ambitious visionary",
        "From Premise 2, ambitious visionaries are disjoint from careless administrators",
        "Therefore, those specific ethical leaders who are ambitious visionaries cannot be careless administrators. Conclusion I is logically sound",
        "Conclusions II and III do not necessarily follow because reckless spenders can overlap with ethical leaders or visionaries outside the careless administrator subset",
      ],
      hint: "Use Euler circles or Venn diagrams: can an ethical leader belong to the visionary group while avoiding the careless administrator group?",
      estimatedTime: 8,
    },
    hard: {
      title: "Subtle Rhetorical Fallacy Deconstruction",
      category: "word",
      difficulty: "hard",
      userType: "student",
      scenario:
        "A corporate CEO addresses an earnings call: 'Our critics argue that expanding our lithium mining operations damages regional groundwater ecosystems. But if we do not expand, electric vehicle manufacturers will face supply shortages, slowing global decarbonization and worsening planetary climate collapse. Thus, anyone opposing our mining expansion is actively accelerating climate disaster.'",
      question:
        "Deconstruct the three distinct rhetorical fallacies present in this argument (e.g. False Dichotomy, Slippery Slope, Poisoning the Well) and reformulate the core issue into an objective tradeoff matrix.",
      expectedReasoningPoints: [
        "False Dichotomy: frames the choice as an absolute binary between local environmental destruction and global planetary collapse, ignoring cleaner mining techniques or alternative suppliers",
        "Slippery Slope: chains lithium shortages directly to global climate collapse without intermediate evidence",
        "Poisoning the Well / Ad Hominem: attacks the motivation of opponents as 'accelerating climate disaster'",
      ],
      hint: "Notice how the speaker forces a binary choice between two extremes and attacks the moral standing of critics.",
      estimatedTime: 10,
    },
    expert: {
      title: "Epistemological Ambiguity in Contract Interpretation",
      category: "word",
      difficulty: "expert",
      userType: "student",
      scenario:
        "A cross-border intellectual property covenant includes this clause: 'The Licensee shall not sublicense, convey, or make available the Licensed Model to any affiliated enterprise or third-party entity operating in jurisdiction X unless expressly approved in writing by the Licensor, except where customary commercial practices warrant immediate security mitigation.'",
      question:
        "Analyze the syntactic and semantic ambiguities in this clause under legal canon of construction. Specifically evaluate the reach of the qualifying phrase 'unless expressly approved in writing' and 'except where customary commercial practices warrant'.",
      expectedReasoningPoints: [
        "Syntactic ambiguity: Doctrine of the Last Antecedent vs Series-Qualifier Principle — does 'unless approved' apply only to third-party entities or to affiliated enterprises as well?",
        "Semantic ambiguity in 'customary commercial practices': lacks objective standard, creating an undefined safe harbor",
        "Drafting resolution: provide discrete subparagraphs with enumerated exception scopes",
      ],
      hint: "Look at whether the exception at the end modifies all previous verbs or only the last entity mentioned in the sentence.",
      estimatedTime: 12,
    },
  },

  // ================= KIDS CATEGORIES =================
  kids_mystery: {
    easy: {
      title: "The Case of the Missing Golden Trophy",
      category: "kids_mystery",
      difficulty: "easy",
      userType: "kids",
      scenario:
        "During recess, the school science fair Golden Trophy disappeared from the display table in the library! The librarian saw wet muddy paw prints leading from the garden door straight to the trophy shelf. Three suspects were nearby: Leo who was wearing clean dry sneakers, Maya who had muddy rain boots, and Sam who was reading a book in his socks.",
      question:
        "Who is the most likely suspect who walked through the garden door? Explain the clues you used to figure it out!",
      expectedReasoningPoints: [
        "The clue is the wet muddy paw/foot prints leading from the garden door",
        "Maya had muddy rain boots from outside",
        "Leo's shoes were clean and dry, and Sam was inside in his socks",
      ],
      hint: "Look at the shoes of each suspect and match them to the muddy prints on the floor!",
      estimatedTime: 4,
    },
    medium: {
      title: "The Mystery of the Midnight Cookie Jar",
      category: "kids_mystery",
      difficulty: "medium",
      userType: "kids",
      scenario:
        "Mom baked 12 fresh chocolate chip cookies before bed and placed them on the top kitchen counter (5 feet high). In the morning, 4 cookies were gone! Left behind at the crime scene: a blue chair pulled near the counter, white powdered sugar on the floor, and a toy magnifying glass under the table. Older brother Ben (who is 4 feet tall) loves blueberries. Younger sister Chloe (3 feet tall) was playing detective yesterday with a blue notebook. The pet puppy Sparky was asleep in his crate.",
      question:
        "Who got the cookies and how did they reach the high counter? What does each clue tell you?",
      expectedReasoningPoints: [
        "Chloe needed the blue chair to climb up because she is only 3 feet tall",
        "The toy magnifying glass shows Chloe was there playing detective",
        "The puppy was locked in his crate, and Ben didn't need a chair",
      ],
      hint: "Think about who needed the chair to reach 5 feet high, and who dropped the toy magnifying glass!",
      estimatedTime: 5,
    },
    hard: {
      title: "The Secret Code of the Treehouse Club",
      category: "kids_mystery",
      difficulty: "hard",
      userType: "kids",
      scenario:
        "Four friends in the Treehouse Club left notes in their secret mailbox. Only one friend put in a note with a secret map. 1. Alex says: 'I didn't leave the map.' 2. Brooke says: 'Charlie put the map in the box.' 3. Charlie says: 'Brooke is telling a fib!' 4. Dylan says: 'Charlie is telling the truth.' If exactly THREE of them are telling the truth and only ONE is lying, who put the secret map in the mailbox?",
      question:
        "Find out who is lying and who actually placed the map in the mailbox! Walk through your detective clues step-by-step.",
      expectedReasoningPoints: [
        "Brooke and Charlie say opposite things, so one of them MUST be telling the truth and the other MUST be lying",
        "Since Dylan says Charlie is telling the truth, Dylan and Charlie agree",
        "If Charlie is telling the truth, Brooke is the only liar, meaning Alex, Charlie, and Dylan tell the truth. If Brooke is lying, Charlie did NOT put the map in. Alex didn't leave it either, so Dylan or Brooke left the map!",
      ],
      hint: "Look at Brooke and Charlie: they disagree completely! That means one of them is the liar.",
      estimatedTime: 6,
    },
    expert: {
      title: "The Museum Treasure Heist Timeline",
      category: "kids_mystery",
      difficulty: "expert",
      userType: "kids",
      scenario:
        "At the City Dino Museum, a fossilized glow-stone was taken between 4:00 PM and 5:00 PM. The museum guard checked the security log: Room A (T-Rex) was visited at 4:10 PM. Room B (Triceratops) was visited at 4:25 PM. Room C (Glow-Stone Vault) had an alarm beep at 4:40 PM. Suspect Fox claims he entered Room B at 4:15 PM and walked directly to the exit by 4:35 PM without stopping in Room C. However, it takes at least 20 minutes to walk from Room B to the exit unless you cut through Room C!",
      question:
        "Prove why Suspect Fox's story has a hole in it using the walking times and room order!",
      expectedReasoningPoints: [
        "If Fox entered Room B at 4:15 and left by 4:35, that is exactly 20 minutes",
        "He claims he didn't cut through Room C, but cutting through Room C is the only way to reach the exit that fast",
        "The alarm beeped in Room C at 4:40, right as Fox was passing through",
      ],
      hint: "Look at the time Fox spent walking: 20 minutes total. Which path is the only one that works in that time?",
      estimatedTime: 8,
    },
  },

  kids_brain_teaser: {
    easy: {
      title: "The Heavy Feather Dilemma",
      category: "kids_brain_teaser",
      difficulty: "easy",
      userType: "kids",
      scenario:
        "A wizard gives you two bags to carry across a bridge. Bag A is filled with 10 pounds of fluffy bird feathers. Bag B is filled with 10 pounds of solid iron rocks.",
      question:
        "Which bag weighs more? Or do they weigh the same? Explain your thinking!",
      expectedReasoningPoints: [
        "Both bags weigh exactly 10 pounds, so their weight is identical",
        "Feathers seem lighter per piece, but 10 pounds of anything is equal to 10 pounds of something else",
      ],
      hint: "Pay attention to the number 10 pounds for both bags!",
      estimatedTime: 3,
    },
    medium: {
      title: "The River Crossing Fox, Goose, and Corn",
      category: "kids_brain_teaser",
      difficulty: "medium",
      userType: "kids",
      scenario:
        "A farmer must row across a river with a hungry Fox, a silly Goose, and a bag of Corn. His tiny boat can only hold him and ONE item at a time. Danger: If left alone together on either bank, the Fox will eat the Goose, or the Goose will eat the Corn! The Fox does not like Corn.",
      question:
        "How can the farmer transport all three safely across the river without anything getting eaten? Give the step-by-step rowing plan!",
      expectedReasoningPoints: [
        "Step 1: Take the Goose across first (Fox and Corn are safe together)",
        "Step 2: Return alone and take the Fox across",
        "Step 3: Leave Fox on the other side, but bring the Goose BACK with you!",
        "Step 4: Leave the Goose, take the Corn across to the Fox",
        "Step 5: Return alone and bring the Goose across last",
      ],
      hint: "The secret trick is bringing something back on one of your return trips so nobody gets left alone together!",
      estimatedTime: 6,
    },
    hard: {
      title: "The Two Ropes and One Hour Timer",
      category: "kids_brain_teaser",
      difficulty: "hard",
      userType: "kids",
      scenario:
        "You have two special magic ropes. Each rope takes exactly 60 minutes to burn completely from one end to the other. But the ropes burn unevenly (one half might burn super fast, and the other half slow!). You have a box of matches, but no clock or watch.",
      question:
        "How can you use these two ropes to measure exactly 45 minutes? Explain the burning trick!",
      expectedReasoningPoints: [
        "Light Rope 1 from BOTH ends simultaneously, and light Rope 2 from ONE end at the exact same moment",
        "Rope 1 will burn completely in 30 minutes (since both ends are burning)",
        "At the exact moment Rope 1 finishes (30 minutes passed), light the other end of Rope 2!",
        "Rope 2 has 30 minutes of burn time remaining. Burning it from both ends will take half of that time: 15 minutes",
        "30 minutes + 15 minutes = exactly 45 minutes!",
      ],
      hint: "What happens if you light a rope from BOTH ends at the same time? How long will it take to burn?",
      estimatedTime: 8,
    },
    expert: {
      title: "The 12 Gold Coins and the Balance Scale",
      category: "kids_brain_teaser",
      difficulty: "expert",
      userType: "kids",
      scenario:
        "A king gives you 12 shiny gold coins. Exactly 11 of them are genuine and weigh the exact same amount. One coin is counterfeit (fake) and weighs slightly LESS than the real ones. You have a two-pan balance scale, but you are only allowed to weigh coins 3 times total!",
      question:
        "How can you find the exact counterfeit coin in only 3 weighings? Show how you divide the coins into groups.",
      expectedReasoningPoints: [
        "Weighing 1: Divide into 3 groups of 4 coins (A: 4, B: 4, C: 4). Weigh A vs B. If balanced, fake is in C. If one side is lighter, fake is in that group",
        "Weighing 2: Take the lighter group of 4. Weigh 2 coins vs 2 coins. Identify the lighter pair",
        "Weighing 3: Weigh 1 coin vs 1 coin from the lighter pair to discover the fake coin!",
      ],
      hint: "Divide the 12 coins into 3 equal piles of 4 coins for your first weighing!",
      estimatedTime: 10,
    },
  },

  kids_pattern: {
    easy: {
      title: "The Rainbow Caterpillar Pattern",
      category: "kids_pattern",
      difficulty: "easy",
      userType: "kids",
      scenario:
        "A cute caterpillar in the garden is growing colorful spots on its segments. The pattern goes: Red, Blue, Blue, Yellow, Red, Blue, Blue, Yellow, Red, Blue...",
      question:
        "What are the next two colors of the caterpillar's spots? What is the repeating rule?",
      expectedReasoningPoints: [
        "The repeating block is 4 colors: Red, Blue, Blue, Yellow",
        "After 'Red, Blue', the next two spots must be Blue and Yellow",
      ],
      hint: "Look for the repeat: Red followed by two Blues and one Yellow!",
      estimatedTime: 3,
    },
    medium: {
      title: "The Magic Castle Stepping Stones",
      category: "kids_pattern",
      difficulty: "medium",
      userType: "kids",
      scenario:
        "To cross the moat to the wizard's castle, you must step on stones carved with numbers: 2, 5, 11, 23, 47, ___. If you step on the wrong number stone, it splashes into the water!",
      question:
        "What number must be on the next stepping stone to cross safely? What is the secret math rule connecting the stones?",
      expectedReasoningPoints: [
        "The rule is multiply by 2 and add 1 (or double and add 1)",
        "2 * 2 + 1 = 5; 5 * 2 + 1 = 11; 11 * 2 + 1 = 23; 23 * 2 + 1 = 47",
        "Next stone: 47 * 2 + 1 = 95",
      ],
      hint: "Try doubling each number: 2 doubled is 4 (then plus 1 is 5!). Does that work for all the stones?",
      estimatedTime: 5,
    },
    hard: {
      title: "The Secret Clock Face Cipher",
      category: "kids_pattern",
      difficulty: "hard",
      userType: "kids",
      scenario:
        "An ancient clock in a clocktower doesn't tick like normal clocks. Every hour, the minute hand moves clockwise by this pattern of minutes: +5 minutes, then +10 minutes, then +20 minutes, then +40 minutes... It starts at the 12:00 position.",
      question:
        "Where will the minute hand be pointing after 5 total jumps? Calculate the minute position and explain the doubling rule.",
      expectedReasoningPoints: [
        "The jumps double each time: 5, 10, 20, 40, 80 minutes",
        "Total minutes jumped: 5 + 10 + 20 + 40 + 80 = 155 minutes",
        "155 minutes = 2 hours and 35 minutes. So the hand points at the 35-minute mark (the 7 on the clock face)",
      ],
      hint: "Add up the 5 jumps: 5 + 10 + 20 + 40 + what comes next?",
      estimatedTime: 6,
    },
    expert: {
      title: "The Spiral Shape Transformation Code",
      category: "kids_pattern",
      difficulty: "expert",
      userType: "kids",
      scenario:
        "A spaceship door lock shows four glowing shapes in a row: 1. Triangle with 1 dot inside. 2. Square with 2 dots inside. 3. Pentagon with 4 dots inside. 4. Hexagon with 8 dots inside. The lock requires you to draw the 5th shape and choose how many dots to put inside.",
      question:
        "What shape should you draw (how many sides?), and how many dots belong inside? Explain both patterns!",
      expectedReasoningPoints: [
        "Pattern 1 (sides): Triangle (3), Square (4), Pentagon (5), Hexagon (6) -> Next is Heptagon (7 sides)",
        "Pattern 2 (dots): 1, 2, 4, 8 -> doubling each time -> Next is 16 dots",
        "The 5th shape is a 7-sided polygon (Heptagon) with 16 dots inside",
      ],
      hint: "Count the sides of the shapes (3, 4, 5, 6...). Then look at how the dots double (1, 2, 4, 8...)!",
      estimatedTime: 8,
    },
  },

  kids_math: {
    easy: {
      title: "The Pizza Party Slice Mystery",
      category: "kids_math",
      difficulty: "easy",
      userType: "kids",
      scenario:
        "Three friends (Lucas, Mia, and Noah) ordered 2 medium pizzas. Each pizza is sliced into 6 equal pieces. Lucas ate 3 slices, Mia ate 4 slices, and Noah ate 2 slices.",
      question:
        "How many slices are left in the boxes for tomorrow? Did the friends eat more than one whole pizza?",
      expectedReasoningPoints: [
        "Total slices from 2 pizzas = 2 * 6 = 12 slices",
        "Slices eaten: 3 + 4 + 2 = 9 slices",
        "Slices left: 12 - 9 = 3 slices left",
        "Yes, they ate 9 slices, which is more than 1 whole pizza (6 slices)",
      ],
      hint: "Find the total number of slices in 2 pizzas (6 + 6), then subtract what the friends ate!",
      estimatedTime: 4,
    },
    medium: {
      title: "The Farmyard Animal Legs Count",
      category: "kids_math",
      difficulty: "medium",
      userType: "kids",
      scenario:
        "Old MacDonald has Ducks (2 legs each) and Sheep (4 legs each) in his green pasture. You count 10 heads in total, and looking down at the grass, you count 28 legs in total!",
      question:
        "How many Ducks and how many Sheep are playing in the pasture? Show how you tested and figured it out!",
      expectedReasoningPoints: [
        "If all 10 were ducks, there would be 10 * 2 = 20 legs",
        "There are 28 - 20 = 8 extra legs. Each sheep adds 2 extra legs compared to a duck",
        "8 / 2 = 4 sheep. 10 - 4 = 6 ducks",
        "Check: 6 ducks * 2 legs (12) + 4 sheep * 4 legs (16) = 28 legs!",
      ],
      hint: "What if all 10 animals were ducks? That would be 20 legs. How many extra legs do you have for the sheep?",
      estimatedTime: 5,
    },
    hard: {
      title: "The Magic 3x3 Grid of 15",
      category: "kids_math",
      difficulty: "hard",
      userType: "kids",
      scenario:
        "You must place the numbers from 1 to 9 into a 3-by-3 square grid so that every row, every column, and both diagonals all add up to the magic number 15! Each number from 1 to 9 can only be used once.",
      question:
        "Which number MUST be placed in the very center square of the grid, and why can no other number work there?",
      expectedReasoningPoints: [
        "The number 5 must be in the exact center",
        "The center square belongs to 4 lines: 1 horizontal, 1 vertical, and 2 diagonals",
        "The average of numbers 1 to 9 is 45 / 9 = 5. Pairs like (1,9), (2,8), (3,7), (4,6) all sum to 10 around the central 5",
      ],
      hint: "Think about the middle number between 1 and 9. It has to help 4 different rows add up to 15!",
      estimatedTime: 7,
    },
    expert: {
      title: "The Exponential Water Lily Pond",
      category: "kids_math",
      difficulty: "expert",
      userType: "kids",
      scenario:
        "In a magical pond in the forest, a patch of water lilies doubles in size every single day. On day 30, the water lilies completely cover the entire surface of the pond.",
      question:
        "On which day did the water lilies cover exactly HALF of the pond? Think carefully before guessing day 15!",
      expectedReasoningPoints: [
        "On day 29, the pond was half covered!",
        "Since the patch doubles every day, if it is half covered on day 29, doubling it the next day makes it 100% full on day 30",
        "Going backwards by one day halves the size",
      ],
      hint: "Work backwards from day 30! If it doubles every day, what was it just one day before day 30?",
      estimatedTime: 8,
    },
  },

  kids_creative: {
    easy: {
      title: "The Desert Island Shelter Challenge",
      category: "kids_creative",
      difficulty: "easy",
      userType: "kids",
      scenario:
        "You and your adventurous friend are stranded on a sunny desert island until a rescue boat arrives tomorrow morning. You find: a big blue tarp, 4 bamboo poles, a roll of duct tape, and lots of big palm leaves. It looks like it might rain tonight!",
      question:
        "How would you build a safe, dry shelter using these items? Describe your invention!",
      expectedReasoningPoints: [
        "Use the 4 bamboo poles as sturdy corner posts secured in the sand",
        "Duct tape the blue tarp over the top as a waterproof roof",
        "Angle the roof so rainwater slides off instead of collecting",
        "Use palm leaves around the sides for wind protection and as soft bedding",
      ],
      hint: "Think about keeping rainwater from pooling on top of your roof, and use the palm leaves for walls or a dry bed!",
      estimatedTime: 4,
    },
    medium: {
      title: "The Pet Rescue contraption",
      category: "kids_creative",
      difficulty: "medium",
      userType: "kids",
      scenario:
        "A neighbor's curious kitten crawled through an open pipe into an empty dry swimming pool that is 8 feet deep. The sides of the pool are slippery tile, so the kitten cannot climb out. You are not allowed to jump in because there is no ladder. In the yard you find: a long garden hose, a laundry basket, a soft towel, and a tennis ball.",
      question:
        "Design a gentle, safe rescue elevator to bring the kitten up! How will you get the kitten inside and lift it safely?",
      expectedReasoningPoints: [
        "Line the laundry basket with the soft towel so it is comfortable and warm for the kitten",
        "Tie the sturdy garden hose securely through the basket handles to act as a lift rope",
        "Lower the basket into the pool, place the ball or a little food inside to attract the kitten",
        "Gently pull up on the hose once the kitten steps inside",
      ],
      hint: "Can you turn the laundry basket and garden hose into a safe elevator basket?",
      estimatedTime: 5,
    },
    hard: {
      title: "The Zero-Waste Lunchbox Invention",
      category: "kids_creative",
      difficulty: "hard",
      userType: "kids",
      scenario:
        "Your school is holding an Eco-Invention contest! The challenge: invent a school lunchbox that creates ZERO trash, keeps soup hot and juice cold at the same time, and doesn't use single-use plastic baggies.",
      question:
        "Describe your invented lunchbox! What materials will you use? How will you keep the hot section hot and cold section cold?",
      expectedReasoningPoints: [
        "Include dual insulated compartments (using double-walled vacuum insulation or cork/silicone barrier)",
        "Use reusable silicone bento dividers instead of plastic baggies",
        "Use stainless steel or bamboo utensils clipped into the lid",
        "Design leak-proof silicone seals that can be easily washed and reused for years",
      ],
      hint: "Think about thermal barriers (insulation) between the hot and cold compartments!",
      estimatedTime: 6,
    },
    expert: {
      title: "The Playground Energy Generator",
      category: "kids_creative",
      difficulty: "expert",
      userType: "kids",
      scenario:
        "The city wants to build an eco-friendly park where the play equipment helps power the park's evening fairy lights. You are tasked with designing three playground rides (like a swing, merry-go-round, or see-saw) that capture kids' movement safely to store clean energy.",
      question:
        "Explain how your three playground machines would capture energy without making the rides hard or unfun to play on! Where does the power go?",
      expectedReasoningPoints: [
        "Merry-go-round connected to a low-friction dynamo generator in the central axle",
        "Swings with kinetic generators in the top pivots that produce small currents with each back-and-forth swing",
        "See-saw with hydraulic or pneumatic pistons at the base to pump a small turbine",
        "Store the energy in a rechargeable battery bank to power LED park lights at dusk",
      ],
      hint: "Think about generators attached to spinning axles (like a bike light) or bouncing pivots!",
      estimatedTime: 8,
    },
  },

  kids_word: {
    easy: {
      title: "The Secret Animal Anagrams",
      category: "kids_word",
      difficulty: "easy",
      userType: "kids",
      scenario:
        "A mischievous parrot scrambled the names of animals on their zoo cages: 1. 'ACT' 2. 'DOG' 3. 'HORSE' is spelled 'SHORE' 4. 'BEAR' is spelled 'BARE'. Now you see a cage labeled 'LEMON'.",
      question:
        "Unscramble 'LEMON' to reveal the friendly jungle animal inside! What letters did you swap?",
      expectedReasoningPoints: [
        "The scrambled letters L-E-M-O-N rearrange to spell 'MELON' or the animal 'MOLE' or 'LEMUR' (or 'MELON' vs 'LEMON')",
        "For an animal anagram of LEMON: 'MELON' is fruit, but 'LEMUR' or rearranging 'HORSE' shows anagram fun. Wait: L-E-M-O-N rearranges to 'MELON', and for animal: 'MELON' is trick, but let's check: 'MELON' -> 'LEMON'. Another: 'LION' is close.",
      ],
      hint: "Rearrange the letters L, E, M, O, N: you can make a tasty fruit 'MELON', or another clue word!",
      estimatedTime: 3,
    },
    medium: {
      title: "The Word Bridge Ladder",
      category: "kids_word",
      difficulty: "medium",
      userType: "kids",
      scenario:
        "In a word ladder game, you must change one word into another word by changing only ONE letter at a time, and every step must be a real English word! Your challenge: Turn the word 'COLD' into 'WARM' in 4 steps.",
      question:
        "Can you build the word ladder from COLD to WARM? Write each intermediate word!",
      expectedReasoningPoints: [
        "Step 1: COLD -> CORD (change L to R)",
        "Step 2: CORD -> WORD (change C to W)",
        "Step 3: WORD -> WORM (change D to M)",
        "Step 4: WORM -> WARM (change O to A)!",
      ],
      hint: "Try changing COLD to CORD first, then see how close you get to WARM!",
      estimatedTime: 5,
    },
    hard: {
      title: "The Rhyme Detective Riddle",
      category: "kids_word",
      difficulty: "hard",
      userType: "kids",
      scenario:
        "Read this riddle: 'I have a spine, but no bones inside. I have many leaves, but no branches wide. I tell you stories of dragons and kings, yet I cannot speak or sing of things. What am I?'",
      question:
        "What is the answer to this riddle? Explain what the 'spine' and 'leaves' mean in the riddle!",
      expectedReasoningPoints: [
        "The answer is a BOOK!",
        "The 'spine' is the binding edge of a hardcover or paperback book",
        "The 'leaves' are the pages of the book (often called loose-leaf or book leaves)",
        "It tells stories through writing even though it has no voice",
      ],
      hint: "You read it when you want an adventure! Think about what parts a book has.",
      estimatedTime: 4,
    },
    expert: {
      title: "The Caesar Shift Secret Code",
      category: "kids_word",
      difficulty: "expert",
      userType: "kids",
      scenario:
        "Roman scouts sent secret messages by shifting every letter forward by 3 spots in the alphabet (A becomes D, B becomes E, C becomes F...). You intercept this coded message: 'FOHYHU GHWHFWLYH'.",
      question:
        "Decode the secret message by shifting each letter back by 3 spots! What does the message say?",
      expectedReasoningPoints: [
        "F - 3 = C, O - 3 = L, H - 3 = E, Y - 3 = V, H - 3 = E, U - 3 = R -> 'CLEVER'",
        "G - 3 = D, H - 3 = E, W - 3 = T, H - 3 = E, F - 3 = C, W - 3 = T, L - 3 = I, Y - 3 = V, H - 3 = E -> 'DETECTIVE'",
        "The decoded message is: 'CLEVER DETECTIVE'!",
      ],
      hint: "Count backwards 3 letters in the alphabet for each letter! F -> E -> D -> C!",
      estimatedTime: 6,
    },
  },
};

/**
 * Validates challenge object structure
 */
function isValidChallenge(obj: unknown): obj is Challenge {
  if (!obj || typeof obj !== "object") return false;
  const c = obj as Record<string, unknown>;
  return (
    typeof c.title === "string" &&
    typeof c.scenario === "string" &&
    typeof c.question === "string" &&
    typeof c.hint === "string"
  );
}

/**
 * Validates reasoning evaluation structure
 */
function isValidEvaluation(obj: unknown): obj is ReasoningEvaluation {
  if (!obj || typeof obj !== "object") return false;
  const e = obj as Record<string, unknown>;
  return (
    typeof e.overallScore === "number" &&
    typeof e.decisionQuality === "number" &&
    typeof e.logic === "number" &&
    typeof e.tradeoffAwareness === "number" &&
    typeof e.clarity === "number" &&
    Array.isArray(e.strengths) &&
    Array.isArray(e.improvements) &&
    typeof e.feedback === "string" &&
    Array.isArray(e.missedConsiderations) &&
    typeof e.idealApproach === "string"
  );
}

/**
 * Fetches fallback challenge
 */
export function getFallbackChallenge(
  category: ChallengeCategory,
  difficulty: ChallengeDifficulty
): Challenge {
  const catChallenges = FALLBACK_CHALLENGES[category] || FALLBACK_CHALLENGES.business;
  const challenge = catChallenges[difficulty] || catChallenges.medium;
  return {
    ...challenge,
    id: `${category}-${difficulty}-${Date.now()}`,
  };
}

/**
 * Generates an AI reasoning challenge using OpenAI (with offline fallback)
 */
export async function generateAIChallenge(
  category: ChallengeCategory,
  difficulty: ChallengeDifficulty,
  options?: {
    userType?: UserType;
    ageRange?: string;
    academicLevel?: string;
    interests?: string[];
    recentScore?: number;
  }
): Promise<Challenge> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    return getFallbackChallenge(category, difficulty);
  }

  const isKids = options?.userType === "kids" || category.startsWith("kids_");

  const systemPrompt = isKids
    ? `You are the lead scenario designer for PuzzlePal Kids ("Smart puzzles. Big thinking. Lots of fun!"), an engaging, encouraging puzzle and brain challenge platform for children (age ${options?.ageRange || "8-14"}).
CRITICAL INSTRUCTIONS:
1. Target audience: Kids / Young Teens. Tone must be encouraging, playful, curiosity-driven, and clear.
2. Absolutely NO dry academic exams, boring business corporate jargon, or scary content.
3. Category: "${category}".
   - "kids_mystery": fun school/pet/detective mysteries with footprints, clues, and suspect alibis.
   - "kids_brain_teaser": riddles and tricky clever questions that reward thinking outside the box.
   - "kids_pattern": shape sequences, color codes, clock jumps, and number sequences.
   - "kids_math": pizza slices, animal legs, balance scales, and friendly math puzzles.
   - "kids_creative": desert island shelters, pet contraptions, playground machines, eco-inventions.
   - "kids_word": word ladders, anagrams, secret codes, and rhyming riddles.
4. Difficulty: "${difficulty}" (easy, medium, hard, expert).
5. Return strictly valid JSON:
{
  "title": "string",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "scenario": "string (engaging, fun story context)",
  "question": "string (clear, exciting puzzle question)",
  "context": "string (optional extra clue or fact)",
  "expectedReasoningPoints": ["string", "string"],
  "hint": "string (friendly thinking clue without spoiling the answer)",
  "estimatedTime": 5
}`
    : `You are the lead scenario designer for PuzzlePal AI ("Think. Reason. Solve."), an elite reasoning and decision-making platform for college students, developers, managers, and analytical thinkers.
CRITICAL INSTRUCTIONS:
1. Target audience: Mature, intellectual, professional, and collegiate thinkers (${options?.academicLevel || "College / Young Professional"}).
2. Absolutely NO children's puzzles, childish riddles, or trivial arithmetic.
3. Category: "${category}".
   - "business": realistic startup/enterprise tradeoffs, unit economics, prioritization dilemmas, monetization.
   - "technical": real code bugs, architecture bottlenecks, SQL/Python/JS reasoning, distributed systems.
   - "data": realistic metrics, tables, funnel drops, Simpson's paradox, or KPI anomaly diagnosis.
   - "logic": constraint satisfaction, dependency sequencing, game theory, or probabilistic deduction.
   - "mystery": corporate or forensic investigation with timelines, conflicting testimonies, and physical clues.
   - "decision": high-stakes crisis response, risk mitigation under uncertainty, and ethical tradeoffs.
   - "aptitude": coding-decoding, blood relations, circular seating arrangements, and sequences.
   - "word": verbal reasoning, subtle fallacy deconstruction, syllogisms, and rhetorical nuance.
4. Difficulty: "${difficulty}" (easy, medium, hard, expert).
5. For "data" category, include a "dataTable" object with "headers", "rows", and "caption".
6. For "technical" category, include a "codeSnippet" object with "language" and "code".
7. Return strictly valid JSON:
{
  "title": "string",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "scenario": "string (detailed, realistic context)",
  "question": "string (provocative analytical question)",
  "context": "string (optional background constraints)",
  "codeSnippet": { "language": "python|javascript|typescript|sql", "code": "string" },
  "dataTable": { "headers": ["col1", "col2"], "rows": [["val1", "val2"]], "caption": "string" },
  "expectedReasoningPoints": ["string", "string", "string"],
  "hint": "string (heuristic clue that prompts critical thinking without revealing the answer)",
  "estimatedTime": 8
}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Generate a brand new, highly engaging ${difficulty} ${category} challenge now. Return strictly valid JSON.`,
          },
        ],
        temperature: 0.75,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      console.warn(`OpenAI challenge generation returned ${res.status}. Using fallback.`);
      return getFallbackChallenge(category, difficulty);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return getFallbackChallenge(category, difficulty);

    const parsed = JSON.parse(content);
    if (isValidChallenge(parsed)) {
      return {
        id: `${category}-${difficulty}-${Date.now()}`,
        title: parsed.title,
        category,
        difficulty,
        userType: isKids ? "kids" : "student",
        scenario: parsed.scenario,
        question: parsed.question,
        context: parsed.context || undefined,
        codeSnippet: parsed.codeSnippet || undefined,
        dataTable: parsed.dataTable || undefined,
        expectedReasoningPoints: parsed.expectedReasoningPoints || undefined,
        hint: parsed.hint,
        estimatedTime: parsed.estimatedTime || (isKids ? 5 : 8),
      };
    }

    return getFallbackChallenge(category, difficulty);
  } catch (err) {
    console.warn("AI generation failed with error:", err);
    return getFallbackChallenge(category, difficulty);
  }
}

/**
 * Intelligent heuristic fallback evaluation when OpenAI key is missing or network fails
 */
/**
 * Intelligent heuristic fallback evaluation when OpenAI key is missing or network fails
 */
function heuristicFallbackEvaluation(
  challenge: Challenge,
  userReasoning: string
): ReasoningEvaluation {
  const clean = userReasoning.trim();
  const lower = clean.toLowerCase();
  const words = clean.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const isKids = challenge.userType === "kids" || challenge.category.startsWith("kids_");

  // Check for gibberish / repetition / lack of variety
  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
  const repetitionRatio = words.length > 5 ? uniqueWords.size / words.length : 1;
  const isGibberish = repetitionRatio < 0.35 || (wordCount > 3 && words.some((w) => w.length > 30));

  // Extract key concept tokens from expected reasoning points, question, and context
  const STOPWORDS = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
    "by", "from", "up", "about", "into", "over", "after", "is", "are", "was", "were",
    "be", "been", "being", "have", "has", "had", "do", "does", "did", "can", "could",
    "will", "would", "shall", "should", "may", "might", "must", "that", "this", "these",
    "those", "what", "which", "who", "whom", "whose", "why", "how", "where", "when",
    "there", "here", "all", "each", "every", "both", "neither", "either", "any", "some",
    "more", "most", "other", "such", "than", "too", "very", "just", "your", "their", "our",
    "its", "you", "they", "we", "he", "she", "it", "them", "us", "him", "her", "i", "me", "my",
    "would", "could", "should", "explain", "detail", "describe", "analyze", "evaluate", "review"
  ]);

  const targetSources = [
    ...(challenge.expectedReasoningPoints || []),
    challenge.question,
    challenge.context || "",
  ].join(" ").toLowerCase();

  const rawTokens = targetSources
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 3 && !STOPWORDS.has(t));

  const targetTokens = Array.from(new Set(rawTokens));

  let matchedTokens = 0;
  for (const token of targetTokens) {
    if (lower.includes(token)) {
      matchedTokens++;
    }
  }

  const tokenMatchRatio = targetTokens.length > 0 ? matchedTokens / targetTokens.length : 0.5;

  // Analytical keywords for students
  const analyticalKeywords = [
    "tradeoff", "risk", "because", "however", "priority", "constraint",
    "impact", "assumption", "alternative", "cost", "evidence", "metric", "data"
  ];
  let keywordHits = 0;
  for (const kw of analyticalKeywords) {
    if (lower.includes(kw)) keywordHits++;
  }

  // Determine relevance tier:
  // Tier 1: Incorrect / Off-topic / Gibberish
  // Tier 2: Partially Correct / Developing
  // Tier 3: Strong / Accurate
  const isOffTopicOrWrong = isGibberish || (targetTokens.length > 0 && matchedTokens === 0 && wordCount < 40) || tokenMatchRatio < 0.12;
  const isStrong = !isOffTopicOrWrong && (tokenMatchRatio >= 0.35 || matchedTokens >= 3) && (isKids ? wordCount >= 15 : wordCount >= 30);

  if (isKids) {
    if (isOffTopicOrWrong) {
      const overallScore = 2.5;
      return {
        overallScore,
        decisionQuality: 2,
        logic: 3,
        tradeoffAwareness: 2,
        clarity: 3,
        strengths: ["You submitted an answer to the puzzle"],
        improvements: [
          "Check the clues in the story to see which facts help solve the mystery",
          "Explain why you picked your answer using details from the puzzle",
        ],
        missedConsiderations: challenge.expectedReasoningPoints?.slice(0, 2) || [
          "Key clues mentioned in the puzzle story",
        ],
        feedback:
          "Nice try! However, your explanation didn't seem to use the clues from the puzzle. Take another look at the clues in the story and try explaining how they connect!",
        idealApproach:
          challenge.expectedReasoningPoints?.join(". ") ||
          "Break the puzzle down into the given clues, eliminate impossible answers, and connect the dots!",
      };
    }

    if (isStrong) {
      const logic = Math.min(10, Math.round(7.5 + wordCount / 30));
      const decisionQuality = Math.min(10, Math.round(8 + (wordCount > 25 ? 1.5 : 0.5)));
      const tradeoffAwareness = Math.min(10, Math.round(7 + (matchedTokens >= 3 ? 2 : 1)));
      const clarity = Math.min(10, Math.round(8 + (wordCount > 20 ? 1 : 0)));
      const weighted = Number(((logic + decisionQuality + tradeoffAwareness + clarity) / 4).toFixed(1));

      return {
        overallScore: Math.min(10, weighted),
        decisionQuality,
        logic,
        tradeoffAwareness,
        clarity,
        strengths: [
          "Great job finding and connecting the story clues!",
          "Clearly explained your thinking step-by-step",
          "Accurate deduction that solves the mystery",
        ],
        improvements: [
          "Try explaining why other possibilities were ruled out",
          "Keep an eye out for even subtle hidden details",
        ],
        missedConsiderations: [
          "Any secondary clues mentioned in the puzzle background",
        ],
        feedback:
          "Awesome detective work! You spotted the key clues and explained your reasoning clearly. Fantastic thinking!",
        idealApproach:
          challenge.expectedReasoningPoints?.join(". ") ||
          "Break the puzzle down into the given clues, eliminate impossible answers, and connect the dots!",
      };
    }

    // Moderate / Developing response
    const overallScore = 5.5;
    return {
      overallScore,
      decisionQuality: 5,
      logic: 6,
      tradeoffAwareness: 5,
      clarity: 6,
      strengths: [
        "Identified some relevant elements from the puzzle",
        "Clear and understandable explanation",
      ],
      improvements: [
        "Include more specific details from the clues to make your explanation stronger",
      ],
      missedConsiderations: challenge.expectedReasoningPoints?.slice(0, 2) || [
        "The primary clue that directly points to the solution",
      ],
      feedback:
        "Good start! You picked up on some helpful clues, but you can make your answer even stronger by tying every clue directly to your final deduction.",
      idealApproach:
        challenge.expectedReasoningPoints?.join(". ") ||
        "Break the puzzle down into the given clues, eliminate impossible answers, and connect the dots!",
    };
  }

  // Student / Professional evaluation
  if (isOffTopicOrWrong) {
    const overallScore = 2.5;
    return {
      overallScore,
      decisionQuality: 2,
      logic: 3,
      tradeoffAwareness: 2,
      clarity: 3,
      strengths: ["Submitted an initial response framework"],
      improvements: [
        "Directly address the primary question and incorporate the scenario's specific data/constraints",
        "Establish a clear chain of deductive causality rather than high-level generalizations",
      ],
      missedConsiderations: challenge.expectedReasoningPoints?.slice(0, 3) || [
        "Core constraints, operational trade-offs, and scenario evidence",
      ],
      feedback:
        "The submitted rationale does not adequately address the core directives or key constraints of this scenario. Review the problem statement, inspect the provided parameters, and formulate a grounded argument.",
      idealApproach:
        challenge.expectedReasoningPoints?.join(". ") ||
        "An expert approach establishes clear decision criteria, ranks competing alternatives against quantifiable constraints, and plans risk mitigations upfront.",
    };
  }

  if (isStrong) {
    const logic = Math.min(10, Math.round(7.5 + keywordHits * 0.4 + matchedTokens * 0.3));
    const decisionQuality = Math.min(10, Math.round(8 + keywordHits * 0.3));
    const tradeoffAwareness = Math.min(10, Math.round(7 + (wordCount > 60 ? 1.5 : 0.5)));
    const clarity = Math.min(10, Math.round(8 + (wordCount > 50 ? 1 : 0)));
    const weighted = Number(((logic + decisionQuality + tradeoffAwareness + clarity) / 4).toFixed(1));

    return {
      overallScore: Math.min(10, weighted),
      decisionQuality,
      logic,
      tradeoffAwareness,
      clarity,
      strengths: [
        "Directly identified the primary operational constraints and tradeoffs",
        "Structured thesis with coherent logical argumentation",
        "Demonstrated clear understanding of secondary consequences",
      ],
      improvements: [
        "Explicitly quantify expected metrics or timelines where applicable",
        "Stress-test assumptions against potential boundary failures",
      ],
      missedConsiderations: [
        "Secondary edge cases or organizational change friction",
      ],
      feedback:
        "Comprehensive and rigorous analysis. Your response effectively synthesized the scenario constraints, weighed tradeoffs, and reached a well-defended conclusion.",
      idealApproach:
        challenge.expectedReasoningPoints?.join(". ") ||
        "An expert approach establishes clear decision criteria, ranks competing alternatives against quantifiable constraints, and plans risk mitigations upfront.",
    };
  }

  // Moderate / Developing response for students
  const overallScore = 5.5;
  return {
    overallScore,
    decisionQuality: 6,
    logic: 5,
    tradeoffAwareness: 5,
    clarity: 6,
    strengths: [
      "Addressed the overarching scenario question",
      "Demonstrated basic awareness of the core problem domain",
    ],
    improvements: [
      "Incorporate deeper tradeoff analysis rather than a single direct solution",
      "Connect your rationale explicitly to the specific constraints and figures provided",
    ],
    missedConsiderations: challenge.expectedReasoningPoints?.slice(0, 2) || [
      "Key operational metrics and counter-argument mitigations",
    ],
    feedback:
      "Reasonable foundational thesis, but lacks depth in evaluating competing tradeoffs or addressing specific quantitative/operational constraints.",
    idealApproach:
      challenge.expectedReasoningPoints?.join(". ") ||
      "An expert approach establishes clear decision criteria, ranks competing alternatives against quantifiable constraints, and plans risk mitigations upfront.",
  };
}

/**
 * Evaluates user reasoning with OpenAI
 */
export async function evaluateAIReasoning(
  challenge: Challenge,
  userReasoning: string
): Promise<ReasoningEvaluation> {
  const trimmed = userReasoning.trim();
  const isKids = challenge.userType === "kids" || challenge.category.startsWith("kids_");

  if (trimmed.length < 15) {
    return {
      overallScore: 3.0,
      decisionQuality: 3,
      logic: 3,
      tradeoffAwareness: 2,
      clarity: 4,
      strengths: ["Submitted an initial thought"],
      improvements: [isKids ? "Tell us a little more about how you solved it!" : "Provide a comprehensive, multi-step explanation with detailed justification."],
      missedConsiderations: ["Key operational constraints and tradeoff analysis"],
      feedback: isKids
        ? "Your answer was very short! Write a sentence or two explaining how you figured it out."
        : "Your submission was too brief to demonstrate thorough analytical reasoning. Please elaborate on your rationale.",
      idealApproach: challenge.expectedReasoningPoints?.join(". ") || "Thoroughly analyze the scenario parameters.",
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return heuristicFallbackEvaluation(challenge, trimmed);
  }

  const systemPrompt = isKids
    ? `You are the friendly, encouraging AI tutor for PuzzlePal Kids.
Scenario Title: "${challenge.title}"
Scenario: "${challenge.scenario}"
Question: "${challenge.question}"
Expected Clues: ${JSON.stringify(challenge.expectedReasoningPoints || [])}

CRITICAL ACCURACY & RELEVANCE CHECK:
- If the child's response is off-topic, gibberish, or clearly misses the puzzle clues: Assign a score between 1.5 and 3.5 (components 1-3). In the feedback, kindly explain what clues in the story were missed and guide them on what to look for.
- If the response is partially on track or notices some clues: Assign 4.0 to 6.5.
- If the response connects the puzzle clues reasonably and reaches a sound deduction: Assign 7.0 to 10.0.

EVALUATION RUBRIC:
- decisionQuality: Did they reach a sensible conclusion?
- logic: Did they connect the clues reasonably?
- tradeoffAwareness: Did they notice the constraints or rules?
- clarity: Is their explanation clear and easy to understand?
- overallScore: Weighted average (0.0 to 10.0, 1 decimal place).

Return strictly JSON:
{
  "overallScore": number,
  "decisionQuality": number,
  "logic": number,
  "tradeoffAwareness": number,
  "clarity": number,
  "strengths": ["friendly point 1", "friendly point 2"],
  "improvements": ["helpful tip for next time"],
  "missedConsiderations": ["small clue they might have missed"],
  "feedback": "Warm, encouraging paragraph explaining how well their thinking matched the puzzle clues!",
  "idealApproach": "Friendly explanation of how to solve the mystery step-by-step."
}`
    : `You are the lead evaluator for PuzzlePal AI.
Your purpose: Rigorously evaluate HOW the user thinks through a complex scenario, testing their analytical rigor, logic, and constraint awareness.

Scenario Title: "${challenge.title}"
Scenario: "${challenge.scenario}"
Question: "${challenge.question}"
Expected Reasoning Themes: ${JSON.stringify(challenge.expectedReasoningPoints || [])}

CRITICAL ACCURACY & GROUNDING CHECK:
- If the user's submission is off-topic, nonsensical, gibberish, or fundamentally fails to address the scenario's constraints, question, or evidence: Assign a LOW score (overallScore between 1.0 and 3.5, and component scores between 1 and 3). State clearly in the feedback and missedConsiderations what specific constraints and directives were ignored.
- If the submission is superficial or partially supported but misses key tradeoffs or quantitative constraints: Assign 4.0 to 6.5.
- If the submission is well-structured, logically sound, and directly engages the primary constraints and tradeoffs: Assign 7.0 to 10.0.

EVALUATION RUBRIC (Score each from 0 to 10):
- decisionQuality (25%): Defensibility of their chosen path, alignment with objectives.
- logic (25%): Consistency, lack of internal contradictions, deductive soundness.
- tradeoffAwareness (25%): Recognition of sacrifices, costs, risks, and counter-arguments.
- clarity (25%): Articulation, structure, precision of thought.
- overallScore: Weighted average (0.0 to 10.0, 1 decimal place).

Return strictly JSON:
{
  "overallScore": number,
  "decisionQuality": number,
  "logic": number,
  "tradeoffAwareness": number,
  "clarity": number,
  "strengths": ["string", "string"],
  "improvements": ["string", "string"],
  "missedConsiderations": ["string", "string"],
  "feedback": "string",
  "idealApproach": "string"
}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Here is the user's reasoning submission:\n\n"""\n${trimmed}\n"""\n\nEvaluate their reasoning thoroughly. Return only JSON.`,
          },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      console.warn(`OpenAI reasoning evaluation returned ${res.status}. Using heuristic evaluator.`);
      return heuristicFallbackEvaluation(challenge, trimmed);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return heuristicFallbackEvaluation(challenge, trimmed);

    const parsed = JSON.parse(content);
    if (isValidEvaluation(parsed)) {
      return {
        overallScore: Number(parsed.overallScore.toFixed(1)),
        decisionQuality: Math.round(parsed.decisionQuality),
        logic: Math.round(parsed.logic),
        tradeoffAwareness: Math.round(parsed.tradeoffAwareness),
        clarity: Math.round(parsed.clarity),
        strengths: parsed.strengths.slice(0, 4),
        improvements: parsed.improvements.slice(0, 4),
        missedConsiderations: parsed.missedConsiderations.slice(0, 4),
        feedback: parsed.feedback,
        idealApproach: parsed.idealApproach,
      };
    }

    return heuristicFallbackEvaluation(challenge, trimmed);
  } catch (err) {
    console.warn("Reasoning evaluation error, using fallback:", err);
    return heuristicFallbackEvaluation(challenge, trimmed);
  }
}

/**
 * Generates a prompt hint for a challenge
 */
export async function generateAIHint(
  challenge: Challenge,
  userReasoning?: string
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    return (
      challenge.hint ||
      "Break down the problem by identifying the scarcest resource, the primary constraint, and what assumption is most likely to fail."
    );
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are PuzzlePal AI's heuristic coach.
Give a brief, high-impact thinking hint for this scenario WITHOUT giving away the solution.
Scenario Title: "${challenge.title}"
Scenario: "${challenge.scenario}"
Question: "${challenge.question}"
${userReasoning ? `User's current draft: "${userReasoning}"` : ""}

Rules:
- 1 or 2 tight, helpful sentences.
- Prompt their mental model without spoiling the exact solution.
Return JSON:
{ "hint": "string" }`,
          },
        ],
        temperature: 0.5,
        response_format: { type: "json_object" },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
      if (parsed.hint) return parsed.hint;
    }
  } catch (err) {
    console.warn("AI hint generation failed:", err);
  }

  return (
    challenge.hint ||
    "Consider the second-order consequences of each alternative before committing to a decision."
  );
}
