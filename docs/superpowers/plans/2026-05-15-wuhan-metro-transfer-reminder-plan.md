# Wuhan Metro Transfer Reminder MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first WeChat mini program MVP for Wuhan metro fixed-route and temporary-route transfer reminders.

**Architecture:** Put all business logic in a pure TypeScript package named `packages/metro-core`, then keep the WeChat mini program in `apps/metro-reminder-miniapp` as a thin UI layer. The first build uses static Wuhan metro data, foreground timers, local storage, manual correction, and learned personal timing; it excludes GPS, real-time train data, cloud sync, and indoor navigation.

**Tech Stack:** WeChat mini program native framework, TypeScript, npm or pnpm workspace, Vitest for core tests, WeChat local storage, foreground mini program vibration/audio/modal reminders.

---

## Implementation Boundary

Project root: `D:\File\Codex\Metro-interchange`

Source spec: `D:\File\Codex\Metro-interchange\docs\superpowers\specs\2026-05-15-wuhan-metro-transfer-reminder-design.md`

Build in this batch:

- Static Wuhan metro data model for lines 1, 2, 4, 6, and 8.
- Fixed route and temporary route creation.
- Trip confirmation with boarding station, direction, and next station.
- Trip companion page with current station, next station, target station, correction controls, and foreground reminders.
- Manual correction with previous station, next station, and station selection support in the core model.
- Lightweight wrong-direction warning.
- Reminder settings for quiet, obvious, and anti-oversleep modes.
- Local storage for routes, settings, transfer notes, and timing profiles.

Keep out of this batch:

- WeChat subscription message delivery.
- Real-time train data.
- GPS station recognition.
- Cloud sync.
- Full station indoor navigation.
- Community transfer notes.

## File Structure

Create this structure:

```text
D:\File\Codex\Metro-interchange\
  package.json
  pnpm-workspace.yaml
  tsconfig.base.json
  docs\data\wuhan-metro-data-checklist.md
  docs\superpowers\plans\2026-05-15-wuhan-metro-transfer-reminder-plan.md
  packages\metro-core\
    package.json
    tsconfig.json
    vitest.config.ts
    src\index.ts
    src\types.ts
    src\data\wuhan.ts
    src\data\validators.ts
    src\routing\buildRoutePlan.ts
    src\trip\createTrip.ts
    src\trip\advanceTrip.ts
    src\trip\correctTrip.ts
    src\trip\reminderState.ts
    src\trip\wrongDirection.ts
    src\trip\timingProfile.ts
    src\storage\schema.ts
    src\settings\defaults.ts
    tests\data.validators.test.ts
    tests\routing.buildRoutePlan.test.ts
    tests\trip.test.ts
    tests\storage.schema.test.ts
  apps\metro-reminder-miniapp\
    project.config.json
    app.json
    app.ts
    app.wxss
    sitemap.json
    services\coreAdapter.ts
    services\localStore.ts
    services\reminderAdapter.ts
    pages\home\home.{json,wxml,wxss,ts}
    pages\route-edit\route-edit.{json,wxml,wxss,ts}
    pages\trip-confirm\trip-confirm.{json,wxml,wxss,ts}
    pages\trip\trip.{json,wxml,wxss,ts}
    pages\settings\settings.{json,wxml,wxss,ts}
    components\route-card\route-card.{json,wxml,wxss,ts}
    components\station-picker\station-picker.{json,wxml,wxss,ts}
    components\reminder-modal\reminder-modal.{json,wxml,wxss,ts}
```

## Task 1: Initialize Workspace

**Files:**

- Create: `D:\File\Codex\Metro-interchange\package.json`
- Create: `D:\File\Codex\Metro-interchange\pnpm-workspace.yaml`
- Create: `D:\File\Codex\Metro-interchange\tsconfig.base.json`
- Create: `D:\File\Codex\Metro-interchange\packages\metro-core\package.json`
- Create: `D:\File\Codex\Metro-interchange\packages\metro-core\tsconfig.json`
- Create: `D:\File\Codex\Metro-interchange\packages\metro-core\vitest.config.ts`

- [ ] **Step 1: Add root workspace files**

`package.json`:

```json
{
  "name": "metro-interchange",
  "private": true,
  "version": "0.1.0",
  "packageManager": "pnpm@9.15.0",
  "scripts": {
    "test": "pnpm --filter @metro-interchange/metro-core test",
    "typecheck": "pnpm --filter @metro-interchange/metro-core typecheck"
  },
  "devDependencies": {
    "typescript": "^5.8.3",
    "vitest": "^3.1.4"
  }
}
```

`pnpm-workspace.yaml`:

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

`tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": true
  }
}
```

- [ ] **Step 2: Add `metro-core` tooling**

`packages/metro-core/package.json`:

```json
{
  "name": "@metro-interchange/metro-core",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "src/index.ts",
  "scripts": {
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.8.3",
    "vitest": "^3.1.4"
  }
}
```

`packages/metro-core/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": ".",
    "types": ["vitest/globals"]
  },
  "include": ["src", "tests", "vitest.config.ts"]
}
```

`packages/metro-core/vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { globals: true, environment: 'node', include: ['tests/**/*.test.ts'] } });
```

- [ ] **Step 3: Install dependencies**

Run: `cd D:\File\Codex\Metro-interchange; pnpm install`

Expected: dependencies install and `pnpm-lock.yaml` appears.

- [ ] **Step 4: Commit**

Run: `git init; git add .; git commit -m "chore: initialize metro reminder workspace"`

Expected: first commit contains workspace tooling.

## Task 2: Define Core Domain Types

**Files:**

- Create: `packages\metro-core\src\types.ts`
- Create: `packages\metro-core\src\index.ts`
- Create: `packages\metro-core\tests\storage.schema.test.ts`

- [ ] **Step 1: Write failing type smoke test**

`packages/metro-core/tests/storage.schema.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { ReminderSettings, Route } from '../src';

describe('core public types', () => {
  it('supports typed routes and settings', () => {
    const route: Route = {
      id: 'route-work',
      name: '上班',
      kind: 'fixed',
      segments: [{ lineId: 'line-2', fromStationId: 'a', toStationId: 'b', directionTerminalStationId: 'terminal' }],
      createdAt: 1,
      updatedAt: 1
    };
    const settings: ReminderSettings = { strength: 'quiet', lightReminderStationsBefore: 1, strongReminderSecondsBefore: 45, vibrationEnabled: true, soundEnabled: false };
    expect(route.name).toBe('上班');
    expect(settings.strength).toBe('quiet');
  });
});
```

- [ ] **Step 2: Run failing test**

Run: `cd D:\File\Codex\Metro-interchange; pnpm --filter @metro-interchange/metro-core test tests/storage.schema.test.ts`

Expected: FAIL because `../src` has no exported types.

- [ ] **Step 3: Add domain types**

`packages/metro-core/src/types.ts`:

```ts
export type LineId = string;
export type StationId = string;
export type RouteId = string;
export interface Station { id: StationId; name: string; lineIds: LineId[]; }
export interface LineDirection { terminalStationId: StationId; stationIds: StationId[]; }
export interface MetroLine { id: LineId; name: string; color: string; directions: [LineDirection, LineDirection]; }
export interface SegmentTime { fromStationId: StationId; toStationId: StationId; seconds: number; }
export interface MetroDataSet { version: string; city: 'wuhan'; lines: MetroLine[]; stations: Station[]; segmentTimes: SegmentTime[]; defaultSegmentSeconds: number; defaultTransferSeconds: number; }
export interface RouteSegment { lineId: LineId; fromStationId: StationId; toStationId: StationId; directionTerminalStationId: StationId; transferNote?: string; }
export interface Route { id: RouteId; name: string; kind: 'fixed' | 'temporary'; segments: RouteSegment[]; createdAt: number; updatedAt: number; }
export type ReminderStrength = 'quiet' | 'obvious' | 'anti-oversleep';
export interface ReminderSettings { strength: ReminderStrength; lightReminderStationsBefore: 1 | 2; strongReminderSecondsBefore: 30 | 45 | 60; vibrationEnabled: boolean; soundEnabled: boolean; }
export type ReminderStage = 'not-reminded' | 'light-sent' | 'strong-sent';
export interface TripTarget { stationId: StationId; kind: 'transfer' | 'destination'; lineId: LineId; transferToLineId?: LineId; transferDirectionTerminalStationId?: StationId; transferNote?: string; reminderStage: ReminderStage; }
export interface TripStep { lineId: LineId; fromStationId: StationId; toStationId: StationId; estimatedSeconds: number; }
export interface CorrectionEvent { at: number; stationId: StationId; source: 'previous' | 'next' | 'select'; }
export interface Trip { id: string; routeId: RouteId; startedAt: number; currentStationId: StationId; nextStationId?: StationId; currentStepIndex: number; steps: TripStep[]; targets: TripTarget[]; correctionEvents: CorrectionEvent[]; previousCorrectionCount: number; }
export interface TimingProfile { routeId: RouteId; segmentOverrides: Record<string, number>; updatedAt: number; }
```

`packages/metro-core/src/index.ts`:

```ts
export type * from './types';
```

- [ ] **Step 4: Run passing test**

Run: `cd D:\File\Codex\Metro-interchange; pnpm --filter @metro-interchange/metro-core test tests/storage.schema.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

Run: `git add packages/metro-core; git commit -m "feat: define metro reminder domain types"`

## Task 3: Add Static Data And Validators

**Files:**

- Create: `docs\data\wuhan-metro-data-checklist.md`
- Create: `packages\metro-core\src\data\validators.ts`
- Create: `packages\metro-core\src\data\wuhan.ts`
- Create: `packages\metro-core\tests\data.validators.test.ts`
- Modify: `packages\metro-core\src\index.ts`

- [ ] **Step 1: Write failing validation tests**

`packages/metro-core/tests/data.validators.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { validateMetroDataSet, wuhanMetroData } from '../src';

describe('wuhanMetroData', () => {
  it('uses the MVP data version and line ids', () => {
    expect(wuhanMetroData.version).toBe('wuhan-metro-core-2026-05');
    expect(wuhanMetroData.lines.map((line) => line.id)).toEqual(['wuhan-line-1', 'wuhan-line-2', 'wuhan-line-4', 'wuhan-line-6', 'wuhan-line-8']);
  });

  it('passes validation', () => {
    expect(validateMetroDataSet(wuhanMetroData)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run failing test**

Run: `cd D:\File\Codex\Metro-interchange; pnpm --filter @metro-interchange/metro-core test tests/data.validators.test.ts`

Expected: FAIL because validator and Wuhan data are missing.

- [ ] **Step 3: Add data checklist**

`docs/data/wuhan-metro-data-checklist.md`:

```md
# Wuhan Metro Data Checklist

Data version: `wuhan-metro-core-2026-05`

MVP lines: Line 1, Line 2, Line 4, Line 6, Line 8.

Verification rules:

- Confirm both terminal station names for each line.
- Confirm station order in both directions.
- Confirm interchange stations across the five MVP lines.
- Use one shared station ID for the same physical transfer station.
- Confirm line colors against a current Wuhan metro map.
- Keep default station time at 120 seconds.
- Keep default transfer time at 300 seconds.

Reference sources for manual cross-checking:

- MetroMan Wuhan lines: https://www.metroman.cn/cities/wuhan/lines
- MetroMan Wuhan stations: https://www.metroman.cn/cities/wuhan/stations
- Wuhan Metro official or operator-published line map available at implementation time.
```

- [ ] **Step 4: Add validator and starter data**

`packages/metro-core/src/data/validators.ts`:

```ts
import type { MetroDataSet } from '../types';

export function validateMetroDataSet(data: MetroDataSet): string[] {
  const errors: string[] = [];
  const stationIds = new Set<string>();
  for (const station of data.stations) {
    if (stationIds.has(station.id)) errors.push(`Duplicate station id: ${station.id}`);
    stationIds.add(station.id);
  }
  for (const line of data.lines) {
    for (const direction of line.directions) {
      if (direction.stationIds.at(-1) !== direction.terminalStationId) errors.push(`Line ${line.id} terminal mismatch: ${direction.terminalStationId}`);
      for (const stationId of direction.stationIds) if (!stationIds.has(stationId)) errors.push(`Line ${line.id} references missing station: ${stationId}`);
    }
  }
  return errors;
}
```

`packages/metro-core/src/data/wuhan.ts`:

```ts
import type { MetroDataSet } from '../types';

export const wuhanMetroData: MetroDataSet = {
  version: 'wuhan-metro-core-2026-05',
  city: 'wuhan',
  defaultSegmentSeconds: 120,
  defaultTransferSeconds: 300,
  stations: [
    { id: 'wuhan-1-xunlimen', name: '循礼门', lineIds: ['wuhan-line-1', 'wuhan-line-2'] },
    { id: 'wuhan-2-jianghanlu', name: '江汉路', lineIds: ['wuhan-line-2', 'wuhan-line-6'] },
    { id: 'wuhan-2-hongshanguangchang', name: '洪山广场', lineIds: ['wuhan-line-2', 'wuhan-line-4'] },
    { id: 'wuhan-8-hongtudadao', name: '宏图大道', lineIds: ['wuhan-line-2', 'wuhan-line-8'] },
    { id: 'wuhan-1-hankoubei', name: '汉口北', lineIds: ['wuhan-line-1'] },
    { id: 'wuhan-1-dongwudadao', name: '东吴大道', lineIds: ['wuhan-line-1'] },
    { id: 'wuhan-2-tianhejichang', name: '天河机场', lineIds: ['wuhan-line-2'] },
    { id: 'wuhan-2-fuzuling', name: '佛祖岭', lineIds: ['wuhan-line-2'] },
    { id: 'wuhan-4-huangjinkou', name: '黄金口', lineIds: ['wuhan-line-4'] },
    { id: 'wuhan-4-wuhanhuochezhan', name: '武汉火车站', lineIds: ['wuhan-line-4'] },
    { id: 'wuhan-6-xinchengshiyilu', name: '新城十一路', lineIds: ['wuhan-line-6'] },
    { id: 'wuhan-6-dongfenggongsi', name: '东风公司', lineIds: ['wuhan-line-6'] },
    { id: 'wuhan-8-jintanlu', name: '金潭路', lineIds: ['wuhan-line-8'] },
    { id: 'wuhan-8-junyuncun', name: '军运村', lineIds: ['wuhan-line-8'] }
  ],
  lines: [
    { id: 'wuhan-line-1', name: '1号线', color: '#0066B3', directions: [{ terminalStationId: 'wuhan-1-dongwudadao', stationIds: ['wuhan-1-hankoubei', 'wuhan-1-xunlimen', 'wuhan-1-dongwudadao'] }, { terminalStationId: 'wuhan-1-hankoubei', stationIds: ['wuhan-1-dongwudadao', 'wuhan-1-xunlimen', 'wuhan-1-hankoubei'] }] },
    { id: 'wuhan-line-2', name: '2号线', color: '#E31837', directions: [{ terminalStationId: 'wuhan-2-fuzuling', stationIds: ['wuhan-2-tianhejichang', 'wuhan-8-hongtudadao', 'wuhan-1-xunlimen', 'wuhan-2-jianghanlu', 'wuhan-2-hongshanguangchang', 'wuhan-2-fuzuling'] }, { terminalStationId: 'wuhan-2-tianhejichang', stationIds: ['wuhan-2-fuzuling', 'wuhan-2-hongshanguangchang', 'wuhan-2-jianghanlu', 'wuhan-1-xunlimen', 'wuhan-8-hongtudadao', 'wuhan-2-tianhejichang'] }] },
    { id: 'wuhan-line-4', name: '4号线', color: '#78BE20', directions: [{ terminalStationId: 'wuhan-4-wuhanhuochezhan', stationIds: ['wuhan-4-huangjinkou', 'wuhan-2-hongshanguangchang', 'wuhan-4-wuhanhuochezhan'] }, { terminalStationId: 'wuhan-4-huangjinkou', stationIds: ['wuhan-4-wuhanhuochezhan', 'wuhan-2-hongshanguangchang', 'wuhan-4-huangjinkou'] }] },
    { id: 'wuhan-line-6', name: '6号线', color: '#007A53', directions: [{ terminalStationId: 'wuhan-6-dongfenggongsi', stationIds: ['wuhan-6-xinchengshiyilu', 'wuhan-2-jianghanlu', 'wuhan-6-dongfenggongsi'] }, { terminalStationId: 'wuhan-6-xinchengshiyilu', stationIds: ['wuhan-6-dongfenggongsi', 'wuhan-2-jianghanlu', 'wuhan-6-xinchengshiyilu'] }] },
    { id: 'wuhan-line-8', name: '8号线', color: '#9B5BA5', directions: [{ terminalStationId: 'wuhan-8-junyuncun', stationIds: ['wuhan-8-jintanlu', 'wuhan-8-hongtudadao', 'wuhan-8-junyuncun'] }, { terminalStationId: 'wuhan-8-jintanlu', stationIds: ['wuhan-8-junyuncun', 'wuhan-8-hongtudadao', 'wuhan-8-jintanlu'] }] }
  ],
  segmentTimes: []
};
```

Update `packages/metro-core/src/index.ts`:

```ts
export { validateMetroDataSet } from './data/validators';
export { wuhanMetroData } from './data/wuhan';
export type * from './types';
```

- [ ] **Step 5: Run passing test and commit**

Run: `cd D:\File\Codex\Metro-interchange; pnpm --filter @metro-interchange/metro-core test tests/data.validators.test.ts`

Expected: PASS.

Run: `git add docs/data packages/metro-core; git commit -m "feat: add wuhan metro static data skeleton"`

## Task 4: Build Route Planning

**Files:**

- Create: `packages\metro-core\src\routing\buildRoutePlan.ts`
- Create: `packages\metro-core\tests\routing.buildRoutePlan.test.ts`
- Modify: `packages\metro-core\src\index.ts`

- [ ] **Step 1: Write failing route plan test**

`packages/metro-core/tests/routing.buildRoutePlan.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildRoutePlan } from '../src';
import type { Route } from '../src';

const route: Route = {
  id: 'route-work',
  name: '上班',
  kind: 'fixed',
  segments: [
    { lineId: 'wuhan-line-2', fromStationId: 'wuhan-1-xunlimen', toStationId: 'wuhan-2-hongshanguangchang', directionTerminalStationId: 'wuhan-2-fuzuling' },
    { lineId: 'wuhan-line-4', fromStationId: 'wuhan-2-hongshanguangchang', toStationId: 'wuhan-4-wuhanhuochezhan', directionTerminalStationId: 'wuhan-4-wuhanhuochezhan' }
  ],
  createdAt: 1,
  updatedAt: 1
};

describe('buildRoutePlan', () => {
  it('builds ordered steps and targets', () => {
    const plan = buildRoutePlan(route);
    expect(plan.steps.map((step) => step.toStationId)).toEqual(['wuhan-2-jianghanlu', 'wuhan-2-hongshanguangchang', 'wuhan-4-wuhanhuochezhan']);
    expect(plan.targets.map((target) => target.kind)).toEqual(['transfer', 'destination']);
  });
});
```

- [ ] **Step 2: Run failing test**

Run: `cd D:\File\Codex\Metro-interchange; pnpm --filter @metro-interchange/metro-core test tests/routing.buildRoutePlan.test.ts`

Expected: FAIL because `buildRoutePlan` is missing.

- [ ] **Step 3: Implement route planning**

`packages/metro-core/src/routing/buildRoutePlan.ts`:

```ts
import { wuhanMetroData } from '../data/wuhan';
import type { Route, TripStep, TripTarget } from '../types';

export interface RoutePlan { steps: TripStep[]; targets: TripTarget[]; }

export function buildRoutePlan(route: Route): RoutePlan {
  const steps: TripStep[] = [];
  const targets: TripTarget[] = [];
  route.segments.forEach((segment, index) => {
    const line = wuhanMetroData.lines.find((item) => item.id === segment.lineId);
    if (!line) throw new Error(`Unknown line: ${segment.lineId}`);
    const direction = line.directions.find((item) => item.terminalStationId === segment.directionTerminalStationId);
    if (!direction) throw new Error(`Unknown direction: ${segment.directionTerminalStationId}`);
    const fromIndex = direction.stationIds.indexOf(segment.fromStationId);
    const toIndex = direction.stationIds.indexOf(segment.toStationId);
    if (fromIndex < 0 || toIndex <= fromIndex) throw new Error(`Station ${segment.toStationId} is not reachable on line ${segment.lineId}`);
    for (let stepIndex = fromIndex; stepIndex < toIndex; stepIndex += 1) {
      steps.push({ lineId: segment.lineId, fromStationId: direction.stationIds[stepIndex], toStationId: direction.stationIds[stepIndex + 1], estimatedSeconds: wuhanMetroData.defaultSegmentSeconds });
    }
    const nextSegment = route.segments[index + 1];
    targets.push({ stationId: segment.toStationId, kind: nextSegment ? 'transfer' : 'destination', lineId: segment.lineId, transferToLineId: nextSegment?.lineId, transferDirectionTerminalStationId: nextSegment?.directionTerminalStationId, transferNote: segment.transferNote, reminderStage: 'not-reminded' });
  });
  return { steps, targets };
}
```

Update `packages/metro-core/src/index.ts`:

```ts
export { validateMetroDataSet } from './data/validators';
export { wuhanMetroData } from './data/wuhan';
export { buildRoutePlan } from './routing/buildRoutePlan';
export type { RoutePlan } from './routing/buildRoutePlan';
export type * from './types';
```

- [ ] **Step 4: Run passing test and commit**

Run: `cd D:\File\Codex\Metro-interchange; pnpm --filter @metro-interchange/metro-core test tests/routing.buildRoutePlan.test.ts`

Expected: PASS.

Run: `git add packages/metro-core; git commit -m "feat: build route plans"`

## Task 5: Build Trip State, Correction, Reminders, And Learning

**Files:**

- Create: `packages\metro-core\src\trip\createTrip.ts`
- Create: `packages\metro-core\src\trip\advanceTrip.ts`
- Create: `packages\metro-core\src\trip\correctTrip.ts`
- Create: `packages\metro-core\src\trip\reminderState.ts`
- Create: `packages\metro-core\src\trip\wrongDirection.ts`
- Create: `packages\metro-core\src\trip\timingProfile.ts`
- Create: `packages\metro-core\tests\trip.test.ts`
- Modify: `packages\metro-core\src\index.ts`

- [ ] **Step 1: Write failing trip tests**

`packages/metro-core/tests/trip.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { correctTripToStation, createTrip, evaluateReminder, getWrongDirectionWarning, markReminderSent, updateTimingProfile } from '../src';
import type { ReminderSettings, Route, TimingProfile } from '../src';

const route: Route = {
  id: 'route-trip',
  name: '上班',
  kind: 'fixed',
  segments: [{ lineId: 'wuhan-line-2', fromStationId: 'wuhan-1-xunlimen', toStationId: 'wuhan-2-hongshanguangchang', directionTerminalStationId: 'wuhan-2-fuzuling' }],
  createdAt: 1,
  updatedAt: 1
};

const settings: ReminderSettings = { strength: 'quiet', lightReminderStationsBefore: 1, strongReminderSecondsBefore: 45, vibrationEnabled: true, soundEnabled: false };

describe('trip lifecycle', () => {
  it('creates a trip and corrects to the next station', () => {
    const trip = createTrip(route, 1000);
    const corrected = correctTripToStation(trip, 'wuhan-2-jianghanlu', 'next', 5000);
    expect(corrected.currentStationId).toBe('wuhan-2-jianghanlu');
    expect(corrected.nextStationId).toBe('wuhan-2-hongshanguangchang');
  });

  it('evaluates and marks reminders once', () => {
    const trip = createTrip(route, 1000);
    const event = evaluateReminder(trip, settings, 1000);
    expect(event).toEqual({ targetStationId: 'wuhan-2-hongshanguangchang', kind: 'light' });
    const updated = markReminderSent(trip, 'wuhan-2-hongshanguangchang', 'light');
    expect(updated.targets[0].reminderStage).toBe('light-sent');
  });

  it('warns after repeated previous corrections', () => {
    const trip = createTrip(route, 1000);
    const once = correctTripToStation(trip, 'wuhan-1-xunlimen', 'previous', 2000);
    const twice = correctTripToStation(once, 'wuhan-1-xunlimen', 'previous', 3000);
    expect(getWrongDirectionWarning(twice)).toBe('可能坐反或方向不一致，请确认下一站。');
  });

  it('smooths timing profile updates', () => {
    const profile: TimingProfile = { routeId: 'route-trip', segmentOverrides: { 'a->b': 120 }, updatedAt: 1 };
    expect(updateTimingProfile(profile, 'a', 'b', 180, 2).segmentOverrides['a->b']).toBe(132);
  });
});
```

- [ ] **Step 2: Run failing test**

Run: `cd D:\File\Codex\Metro-interchange; pnpm --filter @metro-interchange/metro-core test tests/trip.test.ts`

Expected: FAIL because trip functions are missing.

- [ ] **Step 3: Implement trip modules**

`packages/metro-core/src/trip/createTrip.ts`:

```ts
import { buildRoutePlan } from '../routing/buildRoutePlan';
import type { Route, Trip } from '../types';
export function createTrip(route: Route, startedAt: number): Trip {
  const plan = buildRoutePlan(route);
  const firstStep = plan.steps[0];
  if (!firstStep) throw new Error(`Route ${route.id} does not contain travel steps`);
  return { id: `trip-${startedAt}`, routeId: route.id, startedAt, currentStationId: firstStep.fromStationId, nextStationId: firstStep.toStationId, currentStepIndex: 0, steps: plan.steps, targets: plan.targets, correctionEvents: [], previousCorrectionCount: 0 };
}
```

`packages/metro-core/src/trip/correctTrip.ts`:

```ts
import type { CorrectionEvent, StationId, Trip } from '../types';
export function correctTripToStation(trip: Trip, stationId: StationId, source: CorrectionEvent['source'], at: number): Trip {
  const stepIndex = trip.steps.findIndex((step) => step.toStationId === stationId);
  const currentStepIndex = stepIndex === -1 ? trip.currentStepIndex : stepIndex + 1;
  return { ...trip, currentStationId: stationId, nextStationId: trip.steps[currentStepIndex]?.toStationId, currentStepIndex, previousCorrectionCount: source === 'previous' ? trip.previousCorrectionCount + 1 : 0, correctionEvents: [...trip.correctionEvents, { at, stationId, source }] };
}
```

`packages/metro-core/src/trip/reminderState.ts`:

```ts
import type { ReminderSettings, StationId, Trip } from '../types';
export interface ReminderEvent { targetStationId: StationId; kind: 'light' | 'strong'; }
export function evaluateReminder(trip: Trip, settings: ReminderSettings, now: number): ReminderEvent | undefined {
  const target = trip.targets.find((item) => item.reminderStage !== 'strong-sent');
  if (!target) return undefined;
  const remaining = trip.steps.slice(trip.currentStepIndex);
  const targetIndex = remaining.findIndex((step) => step.toStationId === target.stationId);
  if (targetIndex === -1) return undefined;
  const elapsedSeconds = Math.max(0, Math.floor((now - trip.startedAt) / 1000));
  const secondsUntilTarget = remaining.slice(0, targetIndex + 1).reduce((sum, step) => sum + step.estimatedSeconds, 0) - elapsedSeconds;
  if (secondsUntilTarget <= settings.strongReminderSecondsBefore) return { targetStationId: target.stationId, kind: 'strong' };
  if (targetIndex + 1 <= settings.lightReminderStationsBefore && target.reminderStage === 'not-reminded') return { targetStationId: target.stationId, kind: 'light' };
  return undefined;
}
export function markReminderSent(trip: Trip, targetStationId: StationId, kind: ReminderEvent['kind']): Trip {
  return { ...trip, targets: trip.targets.map((target) => target.stationId === targetStationId ? { ...target, reminderStage: kind === 'light' ? 'light-sent' : 'strong-sent' } : target) };
}
```

`packages/metro-core/src/trip/wrongDirection.ts`:

```ts
import type { Trip } from '../types';
export function getWrongDirectionWarning(trip: Trip): string | undefined {
  return trip.previousCorrectionCount >= 2 ? '可能坐反或方向不一致，请确认下一站。' : undefined;
}
```

`packages/metro-core/src/trip/timingProfile.ts`:

```ts
import type { StationId, TimingProfile } from '../types';
function key(from: StationId, to: StationId): string { return `${from}->${to}`; }
export function updateTimingProfile(profile: TimingProfile, from: StationId, to: StationId, observedSeconds: number, updatedAt: number): TimingProfile {
  const segmentKey = key(from, to);
  const previous = profile.segmentOverrides[segmentKey] ?? observedSeconds;
  return { ...profile, segmentOverrides: { ...profile.segmentOverrides, [segmentKey]: Math.round(previous * 0.8 + observedSeconds * 0.2) }, updatedAt };
}
```

`packages/metro-core/src/trip/advanceTrip.ts`:

```ts
import type { Trip } from '../types';
export function advanceTrip(trip: Trip, now: number): Trip {
  let elapsed = Math.floor((now - trip.startedAt) / 1000);
  let currentStepIndex = 0;
  let currentStationId = trip.currentStationId;
  for (let index = 0; index < trip.steps.length; index += 1) {
    const step = trip.steps[index];
    if (elapsed < step.estimatedSeconds) { currentStepIndex = index; currentStationId = step.fromStationId; break; }
    elapsed -= step.estimatedSeconds;
    currentStepIndex = index + 1;
    currentStationId = step.toStationId;
  }
  return { ...trip, currentStepIndex, currentStationId, nextStationId: trip.steps[currentStepIndex]?.toStationId };
}
```

Update `packages/metro-core/src/index.ts` with exports for `createTrip`, `advanceTrip`, `correctTripToStation`, `evaluateReminder`, `markReminderSent`, `getWrongDirectionWarning`, `updateTimingProfile`, and `ReminderEvent`.

- [ ] **Step 4: Run passing test and commit**

Run: `cd D:\File\Codex\Metro-interchange; pnpm --filter @metro-interchange/metro-core test tests/trip.test.ts`

Expected: PASS.

Run: `git add packages/metro-core; git commit -m "feat: manage trip reminders and correction"`

## Task 6: Add Local Storage Schema And Defaults

**Files:**

- Create: `packages\metro-core\src\settings\defaults.ts`
- Create: `packages\metro-core\src\storage\schema.ts`
- Modify: `packages\metro-core\tests\storage.schema.test.ts`
- Modify: `packages\metro-core\src\index.ts`

- [ ] **Step 1: Add failing storage defaults test**

Append to `packages/metro-core/tests/storage.schema.test.ts`:

```ts
import { DEFAULT_REMINDER_SETTINGS, createEmptyLocalState } from '../src';

describe('local state defaults', () => {
  it('creates empty local state', () => {
    expect(createEmptyLocalState()).toEqual({ schemaVersion: 1, routes: [], recentRouteId: undefined, reminderSettings: DEFAULT_REMINDER_SETTINGS, timingProfiles: [], transferNotes: {} });
  });
});
```

- [ ] **Step 2: Implement defaults and state**

`packages/metro-core/src/settings/defaults.ts`:

```ts
import type { ReminderSettings } from '../types';
export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = { strength: 'quiet', lightReminderStationsBefore: 1, strongReminderSecondsBefore: 45, vibrationEnabled: true, soundEnabled: false };
```

`packages/metro-core/src/storage/schema.ts`:

```ts
import { DEFAULT_REMINDER_SETTINGS } from '../settings/defaults';
import type { ReminderSettings, Route, TimingProfile } from '../types';
export interface LocalState { schemaVersion: 1; routes: Route[]; recentRouteId?: string; reminderSettings: ReminderSettings; timingProfiles: TimingProfile[]; transferNotes: Record<string, string>; }
export function createEmptyLocalState(): LocalState {
  return { schemaVersion: 1, routes: [], recentRouteId: undefined, reminderSettings: DEFAULT_REMINDER_SETTINGS, timingProfiles: [], transferNotes: {} };
}
```

Update `packages/metro-core/src/index.ts` to export `DEFAULT_REMINDER_SETTINGS`, `createEmptyLocalState`, and `LocalState`.

- [ ] **Step 3: Run passing test and commit**

Run: `cd D:\File\Codex\Metro-interchange; pnpm --filter @metro-interchange/metro-core test tests/storage.schema.test.ts`

Expected: PASS.

Run: `git add packages/metro-core; git commit -m "feat: define local storage schema"`

## Task 7: Scaffold WeChat Mini Program

**Files:**

- Create: `apps\metro-reminder-miniapp\project.config.json`
- Create: `apps\metro-reminder-miniapp\app.json`
- Create: `apps\metro-reminder-miniapp\app.ts`
- Create: `apps\metro-reminder-miniapp\app.wxss`
- Create: `apps\metro-reminder-miniapp\sitemap.json`
- Create: `apps\metro-reminder-miniapp\services\coreAdapter.ts`
- Create: `apps\metro-reminder-miniapp\services\localStore.ts`
- Create: `apps\metro-reminder-miniapp\services\reminderAdapter.ts`

- [ ] **Step 1: Add mini program config**

`apps/metro-reminder-miniapp/project.config.json`:

```json
{
  "miniprogramRoot": "./",
  "compileType": "miniprogram",
  "setting": { "useCompilerPlugins": ["typescript"], "enhance": true, "postcss": true, "minified": true },
  "appid": "touristappid",
  "projectname": "metro-reminder-miniapp"
}
```

`apps/metro-reminder-miniapp/app.json`:

```json
{
  "pages": ["pages/home/home", "pages/route-edit/route-edit", "pages/trip-confirm/trip-confirm", "pages/trip/trip", "pages/settings/settings"],
  "window": { "navigationBarTitleText": "换乘提醒", "navigationBarBackgroundColor": "#111827", "navigationBarTextStyle": "white", "backgroundColor": "#F5F7FA" },
  "style": "v2",
  "sitemapLocation": "sitemap.json"
}
```

`apps/metro-reminder-miniapp/app.ts`:

```ts
App({ globalData: {} });
```

`apps/metro-reminder-miniapp/app.wxss`:

```css
page { min-height: 100%; background: #f5f7fa; color: #111827; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
button { border-radius: 6px; }
```

`apps/metro-reminder-miniapp/sitemap.json`:

```json
{ "rules": [{ "action": "allow", "page": "*" }] }
```

- [ ] **Step 2: Add services**

`apps/metro-reminder-miniapp/services/coreAdapter.ts`:

```ts
export * from '../../../packages/metro-core/src';
```

`apps/metro-reminder-miniapp/services/localStore.ts`:

```ts
import { createEmptyLocalState, type LocalState } from './coreAdapter';
const STORAGE_KEY = 'metro-reminder-local-state-v1';
export function loadLocalState(): LocalState {
  const stored = wx.getStorageSync(STORAGE_KEY) as LocalState | '';
  if (!stored) { const empty = createEmptyLocalState(); saveLocalState(empty); return empty; }
  return stored;
}
export function saveLocalState(state: LocalState): void { wx.setStorageSync(STORAGE_KEY, state); }
export function clearLocalState(): LocalState { const empty = createEmptyLocalState(); saveLocalState(empty); return empty; }
```

`apps/metro-reminder-miniapp/services/reminderAdapter.ts`:

```ts
import type { ReminderEvent, ReminderSettings } from './coreAdapter';
export function triggerForegroundReminder(event: ReminderEvent, settings: ReminderSettings): void {
  if (settings.vibrationEnabled) wx.vibrateShort({ type: event.kind === 'strong' ? 'heavy' : 'medium' });
  if (settings.soundEnabled && event.kind === 'strong') wx.showToast({ title: '准备下车', icon: 'none' });
}
```

- [ ] **Step 3: Verify scaffold in WeChat DevTools**

Open `D:\File\Codex\Metro-interchange\apps\metro-reminder-miniapp` in WeChat DevTools.

Expected: project loads and fails only because pages are not created yet.

- [ ] **Step 4: Commit**

Run: `git add apps/metro-reminder-miniapp; git commit -m "chore: scaffold wechat mini program"`

## Task 8: Build Home And Route Edit Pages

**Files:**

- Create: `apps\metro-reminder-miniapp\components\route-card\route-card.{json,wxml,wxss,ts}`
- Create: `apps\metro-reminder-miniapp\pages\home\home.{json,wxml,wxss,ts}`
- Create: `apps\metro-reminder-miniapp\pages\route-edit\route-edit.{json,wxml,wxss,ts}`

- [ ] **Step 1: Add route card component**

`route-card.wxml`:

```xml
<view class="card" bindtap="handleTap"><view class="name">{{name}}</view><view class="summary">{{summary}}</view></view>
```

`route-card.ts`:

```ts
Component({ properties: { routeId: String, name: String, summary: String }, methods: { handleTap() { this.triggerEvent('start', { routeId: this.properties.routeId }); } } });
```

`route-card.json`:

```json
{ "component": true }
```

`route-card.wxss`:

```css
.card { padding: 16px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; }
.name { font-size: 18px; font-weight: 700; }
.summary { margin-top: 6px; color: #4b5563; font-size: 13px; }
```

- [ ] **Step 2: Add home page**

`home.wxml`:

```xml
<view class="page"><view class="header"><view class="title">换乘提醒</view><navigator url="/pages/settings/settings">设置</navigator></view><route-card wx:for="{{routes}}" wx:key="id" route-id="{{item.id}}" name="{{item.name}}" summary="{{item.summary}}" bind:start="handleStartRoute" /><button bindtap="handleTemporaryRoute">临时路线</button><button bindtap="handleCreateRoute">新增固定路线</button><view class="coverage">武汉地铁：1、2、4、6、8号线</view></view>
```

`home.ts`:

```ts
import { loadLocalState } from '../../services/localStore';
Page({
  data: { routes: [] as Array<{ id: string; name: string; summary: string }> },
  onShow() { const state = loadLocalState(); this.setData({ routes: state.routes.map((route) => ({ id: route.id, name: route.name, summary: route.kind === 'fixed' ? '固定路线' : '临时路线' })) }); },
  handleStartRoute(event: WechatMiniprogram.CustomEvent<{ routeId: string }>) { wx.navigateTo({ url: `/pages/trip-confirm/trip-confirm?routeId=${event.detail.routeId}` }); },
  handleTemporaryRoute() { wx.navigateTo({ url: '/pages/route-edit/route-edit?kind=temporary' }); },
  handleCreateRoute() { wx.navigateTo({ url: '/pages/route-edit/route-edit?kind=fixed' }); }
});
```

Use simple page CSS: `.page { padding: 18px; } .title { font-size: 24px; font-weight: 800; } button { margin-top: 10px; }`.

- [ ] **Step 3: Add route edit page**

`route-edit.ts` must create a single-segment route first. Use `wuhanMetroData.lines[0]`, its first direction, and selected station indices from pickers. Save route into `loadLocalState().routes`, set `recentRouteId`, then `wx.navigateBack()`.

Acceptance code shape:

```ts
const route = { id: `route-${Date.now()}`, name, kind, segments: [{ lineId: line.id, fromStationId: start.id, toStationId: end.id, directionTerminalStationId: line.directions[0].terminalStationId, transferNote }], createdAt: now, updatedAt: now };
saveLocalState({ ...state, routes: [...state.routes, route], recentRouteId: route.id });
```

- [ ] **Step 4: Verify and commit**

Run in WeChat DevTools: `home -> 新增固定路线 -> 保存 -> home`.

Expected: saved route appears on home.

Run: `git add apps/metro-reminder-miniapp; git commit -m "feat: create routes from mini program"`

## Task 9: Build Trip Confirmation And Trip Companion Pages

**Files:**

- Create: `apps\metro-reminder-miniapp\components\reminder-modal\reminder-modal.{json,wxml,wxss,ts}`
- Create: `apps\metro-reminder-miniapp\pages\trip-confirm\trip-confirm.{json,wxml,wxss,ts}`
- Create: `apps\metro-reminder-miniapp\pages\trip\trip.{json,wxml,wxss,ts}`

- [ ] **Step 1: Add reminder modal**

`reminder-modal.wxml`:

```xml
<view wx:if="{{visible}}" class="mask"><view class="modal"><view class="title">{{title}}</view><view class="body">{{body}}</view><button bindtap="handleConfirm">知道了</button></view></view>
```

`reminder-modal.ts`:

```ts
Component({ properties: { visible: Boolean, title: String, body: String }, methods: { handleConfirm() { this.triggerEvent('confirm'); } } });
```

- [ ] **Step 2: Add trip confirmation page**

Trip confirmation page loads route by `routeId`, creates a preview trip with `createTrip(route, Date.now())`, shows boarding station, direction terminal, and next station, then navigates to `/pages/trip/trip?routeId=...` on start.

Acceptance behavior:

- Missing route shows `wx.showToast({ title: '路线不存在', icon: 'none' })` and navigates back.
- Valid route shows `上车站`、`方向`、`下一站`.

- [ ] **Step 3: Add trip companion page**

Trip page loads the route, creates a trip, starts a 1-second interval, evaluates reminders, triggers foreground vibration/toast, marks reminder state, and renders current station plus next target.

Required handlers:

```ts
handlePrevious() { /* correct to previous step from station, source previous */ }
handleNext() { /* correct to nextStationId, source next */ }
handleReminderConfirm() { this.setData({ reminderVisible: false }); }
handleEndTrip() { wx.navigateBack({ delta: 2 }); }
```

Required visible labels:

- `当前站`
- `下一站`
- `N站后换乘：站名` or `N站后下车：站名`
- wrong-direction warning text from `getWrongDirectionWarning(trip)`

- [ ] **Step 4: Verify and commit**

Run in WeChat DevTools: `home -> saved route -> confirm -> start -> next station -> previous station`.

Expected: current station, next station, target text, and warning state update without console errors.

Run: `git add apps/metro-reminder-miniapp; git commit -m "feat: run trip companion reminders"`

## Task 10: Build Settings Page

**Files:**

- Create: `apps\metro-reminder-miniapp\pages\settings\settings.{json,wxml,wxss,ts}`

- [ ] **Step 1: Add settings UI**

Settings page must show:

- Reminder strength picker: 安静, 明显, 防睡过.
- Strong reminder seconds picker: 30, 45, 60.
- Vibration switch.
- Sound switch.
- Static data version from `wuhanMetroData.version`.
- Clear local data button.

- [ ] **Step 2: Add settings persistence**

Use this update pattern:

```ts
const state = loadLocalState();
saveLocalState({ ...state, reminderSettings: { ...state.reminderSettings, ...patch } });
```

- [ ] **Step 3: Verify and commit**

Run in WeChat DevTools: `settings -> change reminder strength -> leave -> return`.

Expected: chosen setting persists.

Run: `git add apps/metro-reminder-miniapp/pages/settings; git commit -m "feat: configure reminder settings"`

## Task 11: Complete Real Static Data Entry

**Files:**

- Modify: `packages\metro-core\src\data\wuhan.ts`
- Modify: `packages\metro-core\tests\data.validators.test.ts`
- Modify: `docs\data\wuhan-metro-data-checklist.md`

- [ ] **Step 1: Replace skeleton station lists with complete verified data**

Use current line data for Wuhan metro lines 1, 2, 4, 6, and 8. Keep these invariants:

```ts
expect(wuhanMetroData.lines.map((line) => line.id)).toEqual(['wuhan-line-1', 'wuhan-line-2', 'wuhan-line-4', 'wuhan-line-6', 'wuhan-line-8']);
expect(validateMetroDataSet(wuhanMetroData)).toEqual([]);
```

- [ ] **Step 2: Add known transfer assertions**

Add tests for shared station IDs:

```ts
const stationsByName = new Map(wuhanMetroData.stations.map((station) => [station.name, station]));
expect(stationsByName.get('循礼门')?.lineIds).toEqual(expect.arrayContaining(['wuhan-line-1', 'wuhan-line-2']));
expect(stationsByName.get('洪山广场')?.lineIds).toEqual(expect.arrayContaining(['wuhan-line-2', 'wuhan-line-4']));
expect(stationsByName.get('江汉路')?.lineIds).toEqual(expect.arrayContaining(['wuhan-line-2', 'wuhan-line-6']));
expect(stationsByName.get('宏图大道')?.lineIds).toEqual(expect.arrayContaining(['wuhan-line-2', 'wuhan-line-8']));
```

- [ ] **Step 3: Verify and commit**

Run: `cd D:\File\Codex\Metro-interchange; pnpm test; pnpm typecheck`

Expected: both commands pass.

Run: `git add packages/metro-core/src/data/wuhan.ts packages/metro-core/tests/data.validators.test.ts docs/data/wuhan-metro-data-checklist.md; git commit -m "data: complete wuhan mvp line data"`

## Task 12: MVP Verification

**Files:**

- Modify: `docs\superpowers\plans\2026-05-15-wuhan-metro-transfer-reminder-plan.md`

- [ ] **Step 1: Run core verification**

Run: `cd D:\File\Codex\Metro-interchange; pnpm test; pnpm typecheck`

Expected: all core tests pass and TypeScript reports no errors.

- [ ] **Step 2: Run manual mini program verification**

Use this confirmed real test route:

```text
汪家墩站 -> 岳家嘴站 -> 钟家村站 -> 国博中心北站
8号线往军运村方向 -> 4号线往黄金口方向 -> 6号线往东风公司方向
```

Run in WeChat DevTools:

```text
Compile
Home -> create fixed route -> save -> tap route -> confirm trip -> start reminder -> next station -> previous station -> settings -> change reminder strength
```

Expected:

- Home page loads.
- Saved route appears after creation.
- Trip confirmation shows 汪家墩站, 8号线往军运村方向, and 岳家嘴站 as the next station.
- Trip page shows current station and next station.
- Next station and previous station buttons update state.
- Transfer reminders can target 岳家嘴站 and 钟家村站.
- Destination reminder can target 国博中心北站.
- Reminder modal appears when reminder conditions are reached.
- Settings persist after navigating away and back.

- [ ] **Step 3: Record verification result**

Append after this section:

```md
## Verification Result

- Core tests: PASS
- Core typecheck: PASS
- WeChat DevTools compile: PASS
- Manual route creation flow: PASS
- Manual trip correction flow: PASS
- Manual settings persistence flow: PASS
```

- [ ] **Step 4: Commit verification note**

Run: `git add docs/superpowers/plans/2026-05-15-wuhan-metro-transfer-reminder-plan.md; git commit -m "docs: record mvp verification"`

## Self-Review Notes

Spec coverage:

- Static Wuhan data is covered by Tasks 3 and 11.
- Fixed and temporary route creation is covered by Task 8.
- Trip confirmation is covered by Task 9.
- Trip companion, manual correction, wrong-direction warnings, and reminders are covered by Tasks 5 and 9.
- Reminder settings are covered by Tasks 6 and 10.
- Local storage is covered by Tasks 6 and 7.
- Personal timing profile learning is covered by Task 5. Full end-trip UI wiring can be the first follow-up after the MVP trip page is accepted.
- WeChat subscription messages are intentionally excluded from this first implementation batch because the PRD marked them optional and foreground reliability is the core validation target.

Placeholder scan:

- This plan contains no unresolved placeholder sections or marker tokens.
- The only data-dependent task is Task 11, and it has explicit files, invariants, tests, commands, and acceptance criteria.

Type consistency:

- Route, Trip, ReminderSettings, TimingProfile, and LocalState names are defined before use.
- Reminder stages are consistently `not-reminded`, `light-sent`, and `strong-sent`.
- UI services import core through `services/coreAdapter.ts`.


