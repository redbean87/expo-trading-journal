# Trading Journal Analytics Gap Analysis

> **Context:** Novice trader using broker imports + manual supplementation. Goal: find simple, actionable patterns to lean into or avoid. Avoid overwhelm.

## Current Analytics (What's Working)

The app already has strong analytics coverage for a novice:

| Category           | Coverage                                                    | Value                                 |
| ------------------ | ----------------------------------------------------------- | ------------------------------------- |
| **Performance**    | Win rate, profit factor, avg P&L, streaks, best/worst trade | Core metrics every trader needs       |
| **Timing**         | Day of week, hour of day, hold time                         | Find your optimal trading windows     |
| **Strategy**       | Per-strategy comparison                                     | Which setups to focus on              |
| **Market Context** | Market condition, HTF context                               | What environments you thrive in       |
| **Psychology**     | Setup quality correlation, mistake tracking                 | Are you learning? What's costing you? |
| **Charts**         | Equity curve, drawdown, daily P&L, distribution             | Visualize trajectory                  |

**Verdict:** The foundation is solid. The remaining gaps are refinements, not blockers.

---

## Gap Analysis

### Fields with NO Analytics

| Field                      | Type                         | Data Source      | Analytics Potential            | Novice Value  |
| -------------------------- | ---------------------------- | ---------------- | ------------------------------ | ------------- |
| `symbol`                   | Required string              | Broker import    | Per-ticker performance         | **HIGH**      |
| `wouldTakeTradeAgain`      | Enum (yes/no/withAdjustment) | Manual entry     | Retrospective decision quality | **HIGH**      |
| `structureBreakBeforeExit` | Enum (yes/no/unsure)         | Manual entry     | Post-trade technical review    | Medium        |
| `stopLoss`                 | Number                       | Manual entry     | Planned vs realized risk       | Low-Medium    |
| `orderType`                | String                       | TOS import only  | Limit vs Market performance    | Low           |
| `accountBalanceAfter`      | Number                       | TOS Cash Balance | Actual balance equity curve    | Low           |
| `whatWorked`               | Free text                    | Manual entry     | Needs categorization first     | Low (for now) |
| `whatFailed`               | Free text                    | Manual entry     | Needs categorization first     | Low (for now) |
| `psychology`               | Free text                    | Manual entry     | Needs categorization first     | Low (for now) |
| `notes`                    | Free text                    | Manual entry     | Needs categorization first     | Low (for now) |

---

## Phased Implementation Plan

### Phase 1: Symbol Performance

**Priority:** High | **Complexity:** Low | **Value:** Immediate pattern discovery

**What:** Add a "Symbols" analytics tab following the same table + bar chart pattern as Strategy/Market Condition tabs.

**Why for a novice:**

- Every trade has a symbol
- Simple question: "Which stocks do I trade best?"
- Actionable: Stop trading symbols you lose on, double down on winners
- Zero new concepts to learn

**Deliverables:**

- [x] `use-symbol-performance.ts` hook (group by symbol, compute count/win rate/total P&L/avg P&L/profit factor)
- [x] `SymbolSection` component (table + bar chart)
- [x] `app/(tabs)/analytics/symbols.tsx` route
- [x] Update analytics tab navigator to include new route
- [x] Update `use-ai-report.ts` to include symbol data

---

### Phase 2: Trade Again Analysis

**Priority:** High | **Complexity:** Low | **Value:** Behavioral feedback loop

**What:** Add a card to the Psychology tab analyzing performance by `wouldTakeTradeAgain`.

**Why for a novice:**

- You already fill this in during review
- Directly answers: "Am I learning from my mistakes?"
- Compare P&L of "Yes" vs "No" vs "With Adjustment"
- Builds self-awareness without complexity

**Deliverables:**

- [ ] `use-trade-again-analytics.ts` hook (group by response, compute count/win rate/avg P&L)
- [ ] `TradeAgainCard` component (simple stat rows + insight text)
- [ ] Add to `PsychologySection`
- [ ] Update `use-ai-report.ts` to include trade-again data

---

### Phase 3: Stop Loss / Planned R:R (Optional / Defer)

**Priority:** Medium | **Complexity:** Medium | **Value:** Risk management insight

**What:** Compare planned risk (from stop loss) to realized R:R.

**Why deferred:**

- Requires understanding of planned vs. realized risk
- Most novices move stops mid-trade, making planned R:R misleading
- Can create confusion: "My planned R:R was 2:1 but I lost because I moved my stop"
- Better to master the simpler patterns first

**Revisit when:** You consistently set stops and hold them.

---

### Phase 4: Structure Break Analysis (Optional / Conditional)

**Priority:** Medium | **Complexity:** Low | **Value:** Niche technical insight

**What:** Analyze performance by whether structure broke before exit.

**Why conditional:**

- Only valuable if you trade SMC/ICT style
- If you don't know what "structure break" means, this is noise
- Easy to implement if you want it, easy to skip if you don't

**Implement if:** You actively use and understand this field.

---

## What to Skip Entirely

| Field                                                | Reason                                                                                                                                                                                                                                      |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `orderType`                                          | TOS import only (sparse). Mild edge, easily confounded by symbol/strategy. Not a priority for pattern-finding.                                                                                                                              |
| `accountBalanceAfter`                                | Redundant with calculated equity curve. Only populated on Cash Balance imports.                                                                                                                                                             |
| `whatWorked` / `whatFailed` / `psychology` / `notes` | Free text requires NLP or manual tagging to be analytically useful. Building a categorization system is a larger project. Better to rely on the existing `ruleViolation` (mistakes) and `setupQuality` fields which are already structured. |

---

## Success Criteria

For each phase:

1. Works with your existing data (no new fields needed)
2. Simple to understand at a glance
3. Immediately actionable
4. Doesn't clutter the UI with niche concepts

---

## Notes for Implementation

- Follow existing patterns: `use-[field]-analytics.ts` hook + section component + route
- No backend changes required
- No new trade fields needed
- Update AI report composition after each phase
- Test on both iOS and Android

---

_Last updated: June 2026_
