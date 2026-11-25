# Peritia — Stress Test Notes

> Working session log, not the product source of truth. The canonical backlog remains
> `README.md` section 15. Merge confirmed items there when work resumes.

**Last updated:** 2026-11-22
**Status:** Paused for the day. No bug fixes are applied to the installed build.

## Test environment

| Item | Value |
|---|---|
| Device | Pixel 9a |
| ADB serial | `61241XEBF9XF2B` |
| Package | `com.peritia.app` |
| Installed build | `1.0.0` (`versionCode` 1) |
| APK | `dist/Peritia-1.0.0.apk` |
| APK size | 85,044,677 bytes |
| APK SHA-256 | `405666da64cd137d35f6793e422209117ea14da220b373cb7482852adce7cb6d` |
| Signing | Debug keystore, personal sideload only |

## What was covered

- All five tabs, scrolling, empty states, and tab switching.
- Skill detail, baseline assessment, slider input, result, and rank promotion.
- Main quest activation, attempt logging, and progress.
- One-step side quest completion.
- Custom quest creation and activation.
- Badges list and badge awards.
- Finance detail and monthly check-in preview.
- Daily check-in save.
- Settings: rename, currency, haptics, reminders, export picker, import picker.
- Demo character load, erase/reset, onboarding, and demo persistence.
- Force-stop and relaunch persistence.
- 40 rapid tab/back actions.
- `logcat` scan for `FATAL EXCEPTION`, Android runtime crashes, ANR, and React Native JS errors.
- `dumpsys meminfo` and `dumpsys gfxinfo`.

## Bugs found

### BUG-003 — Completed quest loses its result screen

**Area:** Quests / quest completion
**Priority:** High
**Status:** Open, not fixed

**Reproduction**

1. Open **Quests**.
2. Tap a one-step side quest, for example **Practice scales for 20 min**.
3. Tap **Complete quest**.
4. The screen shows **“Quest not found — This quest may have been cleared or completed already.”** instead of the result.

The same failure applies to the final attempt of a three-step main quest: once progress reaches
`targetCount`, the active quest is removed and the result screen falls through to “Quest not found.”

**Root cause**

`completeQuest()` in `src/state/AppState.tsx` removes the active quest when
`nextProgress >= targetCount`. `QuestCompletionScreen` recomputes `active` from
`state.activeQuests`, then checks `if (!active)` **before** rendering the stored `result`.
After the state update, the component no longer finds the quest and renders the not-found
fallback, even though `result` is already set.

**Expected behavior**

- A completed side quest shows its result card.
- The final main-quest attempt shows its result card and any rank-trial-ready state.
- The result remains visible until the user taps **Back to quests** / **Continue**.

**Likely fix**

- Render the `result` branch before the `!active` fallback.
- Snapshot the skill identity used by the result screen, or add `skillId` to
  `QuestActionResult`, so the result does not depend on the removed active quest.
- Keep the not-found fallback only for the case where there is no result and no active quest.

**Files**

- `src/screens/QuestCompletionScreen.tsx`
- `src/state/AppState.tsx` (`completeQuest`, `QuestActionResult`)

### BUG-004 — Blank finance check-in previews at level 10

**Area:** Finance / monthly check-in
**Priority:** High
**Status:** Open, not fixed

**Reproduction**

1. Open **More → Finance**.
2. Tap **Log Nov 2026 check-in** (or **Log my first month**).
3. Leave every field blank.

The live preview shows:

- Finance score `10`
- Projected level `10`
- Rank `Stability II`
- `DEB` metric `100`

**Root cause**

In `src/logic/finance.ts`:

```ts
const debtScore = clamp((1 - debtToIncome / 0.5) * 100, 0, 100);
```

With `debtToIncome = 0`, the formula returns `100` even when income and expenses are also `0`.
That contributes `100 × 0.1 = 10` to the weighted score, which lands exactly on level 10 and
“Stability II.” A blank ledger should not imply perfect debt control.

**Expected behavior**

- A completely blank check-in previews at `0` and `Survival I`.
- Debt control is only meaningful when income is known.
- A real first check-in with income still scores normally.

**Likely fix**

```ts
const debtScore =
  income > 0 ? clamp((1 - debtToIncome / 0.5) * 100, 0, 100) : 0;
```

**Files**

- `src/logic/finance.ts` (`computeFinance`)
- `src/screens/FinanceCheckinScreen.tsx` (preview display)

### BUG-001 — Fresh profile is seeded with all nine skills

**Area:** Onboarding / skills
**Priority:** High
**Status:** Known, not fixed

A fresh profile creates all nine `SkillState` entries at level 0, so the character implies every
skill is already tracked before the user chooses any. Expected v1.1 behavior:

- Fresh profiles start with zero active skills.
- Onboarding offers a skippable skill selection.
- Only active skills appear in Skills, Level, Attributes, and quest candidates.
- Demo profiles keep all nine.

### BUG-002 — Skills tab is visible with zero active skills

**Area:** Navigation / Skills tab
**Priority:** High
**Status:** Known, not fixed

The Skills tab is always present. Expected v1.1 behavior:

- Hide the Skills tab while the active skill list is empty.
- Show it immediately after the first skill is selected.
- Character shows a “Choose your first skill” empty state with a Manage Skills action.

## Other observations

- No `FATAL EXCEPTION`, Android runtime crash, ANR, or React Native JS error was found in
  `logcat` during the pass.
- The app process remained alive after 40 rapid tab/back actions.
- Rapid navigation measured 109 frames with 41 janky frames (`37.61%`). This is a performance
  note, not a crash. Recheck after the v1.1 navigation changes.
- The Add Quest title showed `By by by` once. This was Gboard glide typing during an automated
  swipe, not app data. Cleared and retested successfully.
- `/tmp/opencode` is a small tmpfs and hit its quota during screenshot capture. Clean old
  screenshots before capturing more.
- Export and import pickers open correctly. A full round-trip restore still needs verification.
- Reset, onboarding demo mode, and SQLite persistence across force-stop all worked.

## Remaining stress-test tasks

### Build and install

- [ ] Run `npx tsc --noEmit`.
- [ ] Run `npx expo-doctor`.
- [ ] Rebuild the release APK after the v1.1 fixes.
- [ ] Install over the existing package with `adb install -r`.
- [ ] Launch and confirm the installed `versionName` / `versionCode`.
- [ ] Scan `logcat` for crashes, ANR, and React Native JS errors.
- [ ] Recheck `dumpsys gfxinfo` after the tab/navigation changes.

### Fresh, zero-skill profile

- [ ] Create a fresh profile with no skills selected.
- [ ] Confirm Character, Quests, Journal, and More are reachable.
- [ ] Confirm the Skills tab is hidden.
- [ ] Confirm no level-0 skill cards appear before selection.
- [ ] Confirm Character shows the “Choose your first skill” empty state.
- [ ] Add one skill and confirm the Skills tab appears immediately.
- [ ] Add a second skill, remove one, and confirm progress/history are retained.
- [ ] Confirm no active quests point at an inactive skill.

### Fresh, selected-skill profile

- [ ] Create a fresh profile with one skill selected.
- [ ] Confirm only that skill appears in Skills, Level, and Attributes.
- [ ] Assess it and confirm the baseline, rank, and main-quest candidate.
- [ ] Create a custom quest for it and complete it.
- [ ] Confirm inactive skills do not contribute to Character level or attributes.

### Demo profile

- [ ] Load the demo profile and confirm all nine skills remain active.
- [ ] Confirm demo quests, finance history, badges, and streaks still render.
- [ ] Reset the demo and confirm it rebuilds cleanly.

### Quest flows

- [ ] Complete a one-step side quest and verify BUG-003 is fixed.
- [ ] Complete the final attempt of a three-step main quest and verify the result.
- [ ] Verify the rank-trial-ready result and the “Back to quests” action.
- [ ] Clear an active main quest.
- [ ] Complete a repeatable side quest and re-add it.
- [ ] Complete a one-time custom quest and confirm it is marked done.
- [ ] Verify secondary-skill credit still applies.
- [ ] Verify a quest for an inactive skill cannot be started or completed.

### Finance flows

- [ ] Open a blank check-in and verify BUG-004 is fixed: score `0`, level `0`, `Survival I`.
- [ ] Save a real first check-in and verify the level and rank.
- [ ] Save a second month and verify the rank gate / held state.
- [ ] Update the current month and confirm it replaces rather than stacks.
- [ ] Change currency and confirm the symbol changes without conversion.
- [ ] Deactivate Finance and confirm its entry points disappear; reactivate and confirm history returns.

### Assessment and progression

- [ ] Run an initial assessment and a re-assessment.
- [ ] Open a rank gate, meet it, and run the rank trial.
- [ ] Verify practice XP is capped at the rank ceiling.
- [ ] Verify inactive skills count as level 0 for attributes.
- [ ] Verify Character level averages active skills only and is 0 with none active.

### Persistence and data

- [ ] Force-stop and relaunch; confirm profile, skills, quests, and history persist.
- [ ] Export a backup, erase everything, and import the backup.
- [ ] Confirm migrations preserve assessed or progressed skills.
- [ ] Confirm reset returns to onboarding.
- [ ] Rapidly navigate all tabs and back actions; confirm no crash or frozen screen.
- [ ] Test long text, empty input, keyboard dismissal, and IME behavior.

## Session note

The v1.1 active-skill implementation was started in this session and then fully reverted at the
user's request so the project remains on the last working build. No partial source changes remain.
`npx tsc --noEmit` passes. Resume by fixing BUG-003 and BUG-004 first, then implement BUG-001 /
BUG-002 and run the remaining checklist above.
