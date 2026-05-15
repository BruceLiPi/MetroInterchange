# Metro Interchange Pre-Implementation Checklist

This checklist keeps the project in planning mode until the remaining product and technical decisions are clear enough to begin implementation.

## Current Baseline

- Product: Wuhan metro transfer and destination reminder.
- First platform: WeChat mini program.
- First data scope: Wuhan metro lines 1, 2, 4, 6, and 8.
- Reminder strategy: foreground page reminders first, subscription messages deferred.
- Progress strategy: static station order, default timing, manual correction, personal timing learning.
- Storage strategy: local-first mini program storage.

## Decisions To Confirm Before Development

### 1. Mini Program Project Type

Recommended decision: use native WeChat mini program with TypeScript.

Reason:

- It matches the MVP scope.
- It avoids framework setup overhead.
- WeChat DevTools can preview real mini program behavior.
- The business logic can still stay in a reusable TypeScript core package for later App migration.

Confirm before development:

- Use native WeChat mini program.
- Use TypeScript.
- Use local development first with tourist or test app id.

### 2. Package Manager

Recommended decision: use `pnpm`.

Reason:

- The implementation plan already assumes a small workspace.
- `packages/metro-core` and `apps/metro-reminder-miniapp` can live together cleanly.
- Core tests can run without opening WeChat DevTools.

Confirm before development:

- `pnpm` is installed on the machine.
- If not installed, switch the implementation plan commands to `npm` before coding.

### 3. Wuhan Metro Data Source

Recommended decision: manually enter the five MVP lines from current public references, then cross-check against an official or operator-published Wuhan metro line map before treating the data as usable.

Reason:

- The product depends on station order and transfer station IDs being correct.
- Real-time APIs are not part of the MVP.
- Data mistakes will directly cause wrong reminders.

Confirm before development:

- Which current source is considered the primary source.
- Which source is used as cross-check.
- Whether to enter complete five-line data immediately or start with skeleton data and complete it before UI testing.

Recommended approach:

- Start with skeleton data for core tests and UI flow.
- Complete the real five-line data before any real-world trial.

### 4. First Real Test Route

Confirmed route for the first real-world test:

- Start station: 汪家墩站.
- Destination station: 国博中心北站, also commonly referred to by the user as 国博北站.
- Segment 1: Line 8 from 汪家墩站 to 岳家嘴站, direction 军运村.
- Transfer 1: 岳家嘴站, transfer from Line 8 to Line 4.
- Segment 2: Line 4 from 岳家嘴站 to 钟家村站, direction 黄金口.
- Transfer 2: 钟家村站, transfer from Line 4 to Line 6.
- Segment 3: Line 6 from 钟家村站 to 国博中心北站, direction 东风公司.
- Initial transfer note: none yet.

Reason:

- The first route becomes the anchor for testing route creation, confirmation, reminders, correction, and transfer notes.
- It covers the product's main complexity: two transfers across three lines.
- It verifies that the MVP data scope really needs Line 8, Line 4, and Line 6 before Line 1 and Line 2 are fully exercised.

Confirm during data entry:

- 汪家墩 appears on Line 8.
- 岳家嘴 is represented as one shared station ID for Line 8 and Line 4.
- 钟家村 is represented as one shared station ID for Line 4 and Line 6.
- 国博中心北 appears on Line 6.
- The direction labels 军运村, 黄金口, and 东风公司 match the current Wuhan metro line map.

### 5. Reminder Sound Asset

Recommended decision: do not include a custom sound in the first coding pass.

Reason:

- Vibration, modal, and toast are enough to validate the foreground reminder flow.
- Custom audio adds asset management and platform behavior questions.

Confirm before development:

- First pass uses vibration and modal only.
- Sound toggle can exist but stay disabled or use WeChat-supported behavior later.

### 6. Subscription Messages

Recommended decision: defer WeChat subscription messages until foreground reminders are working.

Reason:

- Subscription messages require template setup and authorization flow.
- Mini program notification rules can limit precision.
- The core product value can be tested in foreground first.

Confirm before development:

- Subscription messages are not part of the first implementation milestone.
- UI copy should not promise background precision.

### 7. Personal Timing Learning Scope

Recommended decision: implement timing profile logic in the core first, then wire end-of-trip learning after trip page flow is stable.

Reason:

- Core logic is easy to test.
- UI learning needs careful decisions about what counts as observed timing.
- A simple MVP can still work with default timing and manual correction.

Confirm before development:

- Core timing profile helpers are included in MVP.
- Full end-of-trip learning UI can be a follow-up task if needed.

## Suggested Milestones

### Milestone 1: Core Logic Runs In Tests

Deliverables:

- Workspace initialized.
- Domain types complete.
- Static data skeleton validates.
- Route planning works.
- Trip creation, correction, reminder state, wrong-direction warning, and timing profile helpers pass tests.

Exit criteria:

- `pnpm test` passes for `packages/metro-core`.
- No WeChat UI required yet.

### Milestone 2: Mini Program Flow Is Clickable

Deliverables:

- Mini program scaffold opens in WeChat DevTools.
- Home page displays saved routes.
- Route edit page saves a simple route.
- Trip confirmation page shows direction and next station.
- Trip page shows current station and correction buttons.
- Settings page persists reminder preferences.

Exit criteria:

- Manual DevTools flow works from route creation to trip page.

### Milestone 3: Real Data Trial Ready

Deliverables:

- Complete Wuhan lines 1, 2, 4, 6, and 8 station data entered.
- Transfer stations verified.
- One real commute route tested in DevTools.
- Foreground reminder behavior verified with shortened test timing.

Exit criteria:

- Static data validation passes.
- Manual real-route simulation works.

### Milestone 4: Phone Trial

Deliverables:

- Load mini program on a test phone.
- Run a real or simulated ride with foreground page open.
- Record whether reminders are early, late, duplicated, or missed.
- Adjust default timing and reminder thresholds if needed.

Exit criteria:

- A real user can complete one route without missing transfer or destination reminder while the mini program stays foregrounded.

## Recommended Next Planning Step

Before writing code, choose the first real test route. The most useful format is:

```text
起点站：
终点站：
途经线路：
换乘站：
换乘后方向：
备注：
```

After that, the implementation plan can be adjusted so the first clickable prototype is tested against this actual route instead of generic sample data.

