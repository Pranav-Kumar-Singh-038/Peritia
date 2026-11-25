# Peritia

> **Prove your proficiency.**  
> Real skills. Real levels.

Peritia is a personal life-RPG that turns real-world skill development into a character sheet. Every skill has a 0–100 proficiency level, ten ranks, a metric profile, quests, and optional evidence. Practice earns XP, but rank gates require you to demonstrate the metrics.

**Status:** v1 implemented — Android release APK built and verified  
**Last updated:** 2026-11-22

---

## 1. How to use this document

This README is the **source of truth** for the project.

- Every product, design, technical, and scope decision belongs here.
- Future decisions must be appended to the **Decision Log** and reflected in the relevant section.
- Superseded decisions must be marked as such, not deleted.
- If a mockup or implementation conflicts with this document, this document wins until it is explicitly updated.
- The static HTML files in `mockups/` are design references only. They are not production code.
- Known issues and future releases are tracked in section 15.

### Current workflow

1. Update this README before or alongside any product, design, or technical change.
2. Implement the change in `App.tsx` and `src/`.
3. Run `npm run typecheck` and `npx expo-doctor`.
4. Build and test the Android app.
5. Append any new decision to the Decision Log.

### Run locally

```bash
npm install
npm start          # Expo development server
npm run android    # native debug build on a connected device
npm run typecheck  # TypeScript check
npx expo-doctor    # Expo project health check
```

### Design reference

The approved Character dashboard mockup lives at `mockups/character.html`. The remaining screens were implemented directly from the shared visual system instead of one-by-one HTML mockups.

```bash
xdg-open mockups/character.html
```

The default browser in this environment is **Brave Origin**.

---

## 2. Product summary

Peritia is a **proficiency-first life RPG**, not an XP-first habit tracker.

The core loop:

> Open a skill → see the next rank requirements → choose a main quest → complete side quests → earn practice XP → re-assess the metrics → rank up → earn badges.

The character sheet is a dashboard of:

- Eight derived attributes
- Skill levels and ranks
- Metric profiles
- Active main and side quests
- Streaks and badges

### Product principles

1. **Proficiency over streaks.** A level should mean something.
2. **Metrics over vibes.** Each skill has observable dimensions and rubrics.
3. **Practice matters.** Practice XP moves you within a rank.
4. **Rank gates are earned.** You cannot grind past a rank without demonstrating the standard.
5. **One main quest at a time.** Focus is part of the game.
6. **Attributes are summaries.** They are derived from skills and check-ins, not ground directly.
7. **Trust-based with optional evidence.** The app is personal-first.
8. **Local-first.** Your data lives on your device in v1.
9. **No punishment in v1.** No skill decay yet.
10. **Modern RPG, not fantasy clutter.** Premium, restrained, readable.
11. **Start from zero.** A new character owns no skills until the user chooses them.

---

## 3. Locked decisions

### Identity

| Decision | Value |
|---|---|
| App name | **Peritia** |
| Primary tagline | **Prove your proficiency.** |
| Secondary tagline | **Real skills. Real levels.** |
| Meaning | Latin for skill, expertise, proficiency |
| Tone | Modern RPG, premium, calm, focused |
| Visual direction | Dark-first, restrained gamification |

### Platform and audience

| Decision | Value |
|---|---|
| First platform | Android |
| App framework | React Native + Expo |
| Language | TypeScript |
| First audience | Personal use |
| Social features | None in v1 |
| Monetization | None in v1 |
| AI features | None in v1 |
| Accounts | None in v1 |
| Cloud sync | None in v1 |
| Backup | Local JSON export/import |

### Scope

In scope for v1:

- Character dashboard
- Nine skills
- Eight attributes
- Metric profiles
- Initial assessment
- Practice XP
- Rank gates and re-assessment
- Main quest + side quests
- Curated and custom quests
- Badges
- Journal and history
- Finance metric skill
- JSON export/import

Out of scope for v1:

- Social features
- Leaderboards
- Cloud sync
- Authentication
- AI quest generation
- Skill decay
- Sleep, Nutrition, and Work/Career as full skills
- Public profiles
- Monetization
- Wearables and health-platform integrations
- Web app

### Technology

| Layer | Choice |
|---|---|
| App framework | Expo SDK 58 + React Native 0.88 |
| Runtime | React 19.3, Hermes, New Architecture |
| Language | TypeScript 6 |
| Navigation | Custom tab + stack state in `App.tsx` (no router library) |
| Local database | `expo-sqlite` — one JSON `AppState` document in `app_state` |
| ORM | None; typed domain model in `src/types.ts` |
| UI state | React Context + hooks (`AppProvider`) |
| Forms | Controlled React Native inputs and a native slider |
| Charts | Custom `react-native-svg` radar chart, progress ring, and heatmap |
| Animation | React Native `Animated` (toast and transitions only) |
| Icons | `lucide-react-native` |
| Fonts | Sora (UI) and Fraunces (display) via `@expo-google-fonts` |
| Haptics | `expo-haptics` |
| Reminders | In-app 90-day re-assessment reminders (no push notifications) |
| File export/import | `expo-file-system`, `expo-sharing`, `expo-document-picker` |
| Styling | Custom `StyleSheet` theme tokens in `src/theme.ts` |
| Testing | TypeScript check + `expo-doctor`; automated test suite not yet added |
| Backend | None in v1 |
| Build | Local Expo prebuild + Gradle release build; no EAS dependency |

### Design

| Decision | Value |
|---|---|
| Theme | Dark-first modern RPG |
| Mockup frame | 390 × 844 mobile viewport |
| Mockup stack | Static HTML + shared CSS |
| Implementation | React Native `StyleSheet`, safe-area aware, edge-to-edge dark system bars |
| Typography | Sora for UI, Fraunces for display/rank numerals |
| Background | Obsidian / charcoal |
| Primary accent | Warm gold |
| Secondary accents | Teal, violet, rose |
| Gamification | Subtle glows, progress rings, rank chips |
| Avoid | Cartoon fantasy, heavy textures, noisy gradients |

### Design tokens

```css
--bg: #080b10;
--bg-deep: #05070a;
--surface: #121924;
--surface-2: #17202d;
--border: rgba(255, 255, 255, 0.08);
--border-strong: rgba(255, 255, 255, 0.14);
--text: #f2f5f8;
--muted: #8e9aab;
--faint: #5e6a7a;
--gold: #e9b872;
--gold-2: #f6d9a8;
--gold-deep: #b8863b;
--teal: #5eead4;
--violet: #a78bfa;
--rose: #fb7185;
--green: #34d399;
```

---

## 4. Skills

### Launch roster

Nine skills at launch. All skills are metric-based. Finance is the only continuous metric-driven skill.

| Skill | Category | Type | Metric profile |
|---|---|---|---|
| Guitar | Music | Assessed | Technique, Repertoire, Rhythm, Theory/Improvisation, Performance |
| Harmonica | Music | Assessed | Technique, Tone, Repertoire, Improvisation, Performance |
| Sketching | Creative | Assessed | Line/Form, Perspective, Value/Light, Composition, Finished Work |
| 3D Design | Creative | Assessed | Modeling, Materials, Lighting, Design, Pipeline |
| Language Learning | Knowledge | Assessed | Listening, Speaking, Reading, Writing, Grammar/Vocabulary |
| DSA | Knowledge | Assessed | Problem Solving, Implementation, Complexity, Data Structures, Communication |
| Bodybuilding | Physical | Assessed | Strength, Hypertrophy, Technique, Programming, Consistency |
| Martial Arts | Physical | Assessed | Technique, Sparring, Conditioning, Strategy, Discipline |
| Finance | Life | Continuous | Income, Expenses, Savings, Assets, Passive Income, Debt |

### Skill types

**Assessed skills**

- Have 3–5 metrics.
- Each metric is scored 0–100 using a rubric.
- Overall score is a weighted average.
- Initial assessment establishes the starting level and rank.
- Practice XP raises the displayed level within the current rank.
- The rank ceiling cannot be crossed without a new metric assessment.
- Evidence is optional.

**Continuous metric skills**

- Finance only in v1.
- Metrics are numeric and update from a monthly check-in.
- Level is calculated from the financial score.
- No practice XP is used for Finance.
- Rank gates are minimum metric thresholds.

### Metric rules

- Metrics are **curated defaults + editable**.
- Each metric has a 0–100 score and a rubric.
- Overall skill score = weighted average of metrics.
- Rank gates require **minimum scores in key metrics**, not just a high average.
- This prevents a strong average from hiding a weak area.
- The metric profile and weights can be edited later.

### Assessment and practice model

The accepted model is:

> **Assessment baseline + practice within rank.**

1. **Initial assessment** scores each metric.
2. The weighted score becomes the starting level and rank immediately.
3. **Practice XP** raises the displayed level inside the current rank.
4. Practice cannot push the level past the current rank ceiling (9, 19, 29, … 99).
5. To enter the next rank, the user must meet the **rank gate**:
   - an overall weighted score at or above the next rank’s entry level,
   - minimum scores in the skill’s key metrics,
   - and a completed main-quest demonstration logged as three deliberate attempts.
6. A **rank trial** re-assessment resolves the gate. If every criterion is met, the skill advances exactly one rank.
7. If the gate is not met, the skill stays at its current rank ceiling and the unmet criteria are shown.
8. Re-assessment can also lower the displayed level if the user records a weaker demonstration.
9. Finance uses the same one-rank-at-a-time rule, but its gate is evaluated from the monthly check-in instead of a rank trial.

This lets an already-proficient person start at their true level instead of level 0, while still making practice meaningful.

---

## 5. Progression

### Levels and ranks

- Level range: **0–100**
- Structure: **10 ranks × 10 levels**
- Rank gates occur at **10, 20, 30, 40, 50, 60, 70, 80, 90, and 100**
- Default practice XP: **100 XP per sub-level**
- Side quest XP: **10 easy, 20 medium, 30 hard**
- Main quest XP: **50 XP** plus demonstration progress
- Practice XP is capped at the current rank ceiling; the cap resets only after a successful rank trial
- Rank labels include the overall rank numeral: level 34 is **Skilled IV**, level 90 is **Grandmaster X**
- Character level is the rounded average of the active skill levels; with no active skills it is 0
- XP constants live in `src/logic/progression.ts` and `src/data/quests.ts` and will be tuned after first use

### Generic rank names

| Level | Rank |
|---|---|
| 0–9 | Novice |
| 10–19 | Apprentice |
| 20–29 | Adept |
| 30–39 | Skilled |
| 40–49 | Proficient |
| 50–59 | Advanced |
| 60–69 | Expert |
| 70–79 | Elite |
| 80–89 | Master |
| 90–100 | Grandmaster |

### Rank gates

- A rank gate has three kinds of criteria: overall score, key-metric minimums, and a demonstration.
- The overall target is the next rank’s entry level (`targetRank × 10`).
- Each key metric must reach `min(90, 20 + targetRank × 7)`.
- The demonstration is the skill’s rank-specific demo title, completed as a main quest with **three logged attempts**.
- All criteria must be met before the rank trial passes.
- The rank trial is the resolution step; there is no separate manual claim.
- Optional evidence is a text receipt attached at quest completion. Files are not attached in v1.
- A re-assessment can be done at any time.
- A 90-day re-assessment reminder is optional and shown in-app.

### Decay

- No decay in v1.
- The persisted state keeps assessment and practice dates so per-skill soft decay can be added later.
- Future decay will be per-skill, not global.

### Re-assessment

- Manual, optional, and user-initiated.
- Can confirm the current level, lower it, or promote it by one rank if the higher criteria are met.
- Stored in assessment history with previous and new level/rank.
- Finance does not use re-assessment; its monthly check-in updates the score and gate.

---

## 6. Attributes

Eight attributes. They are **derived summaries**, not directly grindable.

| Attribute | Main sources |
|---|---|
| Strength | Bodybuilding 60%, Martial Arts 40% |
| Endurance | Bodybuilding 50%, Martial Arts 50% |
| Agility | Martial Arts 80%, Bodybuilding 20% |
| Dexterity | Guitar 35%, Harmonica 25%, Sketching 25%, 3D Design 15% |
| Focus | DSA 40%, Language 30%, 3D Design 15%, Guitar 15% |
| Discipline | Quest completion 35%, streak 20%, sleep check-in 15%, nutrition check-in 15%, finance check-in 15% |
| Creativity | Sketching 30%, 3D Design 30%, Guitar 25%, Harmonica 15% |
| Vitality | Sleep check-in 40%, nutrition check-in 30%, Bodybuilding 20%, Martial Arts 10% |

Rules:

- Attributes display as rounded, clamped 0–100 scores in v1.
- No separate attribute levels in v1.
- Weights are fixed in `src/logic/attributes.ts`; editing UI is deferred.
- Finance is a standalone skill card; it contributes to Discipline through check-in consistency.
- Sleep and nutrition are lightweight daily check-ins in v1, not full skills.
- Discipline inputs: quests completed in the last 30 days (20 completions = 100), current streak (30 days = 100), 14-day average sleep quality and nutrition (×10), and finance check-ins across the last six months.
- Vitality uses the same 14-day sleep and nutrition averages plus Bodybuilding and Martial Arts levels.
- A ninth “Wealth” attribute is a possible future addition, not a v1 decision.

---

## 7. Quests

### Main quest

- One active at a time, globally.
- Generated from the selected skill’s next rank gate.
- Represents the rank-gate demonstration.
- Logged as three deliberate attempts; each attempt increments progress.
- Completing the third attempt marks the demonstration criterion met and awards 50 XP.
- Starting a new main quest replaces the previous one.
- Finance uses its monthly check-in instead of a main quest.

### Side quests

- Multiple active at once.
- Repeatable practice and support tasks.
- Award practice XP.
- Can target a specific skill metric.
- Can be completed without a rank gate.
- 33 curated side quests ship in v1; three are active on a fresh character.
- Finance side quests are milestones with 0 XP.

### Quest sources

- Curated starter quests.
- Custom user-created quests.

### Cross-skill credit

- Primary skill receives 100% of XP.
- Secondary skills receive 25% of XP.
- Secondary credit is configured per quest or selected at completion.

### Completion flow

1. Open the quest and log the next attempt (multi-step quests) or complete it.
2. Optionally add notes and a text evidence receipt.
3. Award primary XP and 25% secondary XP (floored) where configured.
4. Apply practice XP within the current rank cap.
5. Update the daily streak and evaluate badges.
6. Check whether the rank gate is now ready and offer the rank trial.

### Quest examples

- Guitar: practice scales for 20 minutes.
- Guitar: record three clean takes.
- DSA: solve one unseen problem.
- Bodybuilding: complete a 45-minute push session.
- Language: 20-minute speaking drill.
- Finance: complete the monthly check-in.

---

## 8. Badges

Badges represent **milestones + streaks**.

### Badge categories

- Rank-up badges
- Streak badges: 7, 30, 100 days
- Firsts: first quest, first evidence, first rank-up, first finance check-in
- Cross-skill milestones: 3 skills at level 20, 5 skills at level 40, all eight attributes above 50
- Finance badges: first budget, 3-month emergency fund, 6-month runway, passive income unlocked, 100% FI ratio

### Badge trigger types

- `rank_up`
- `streak`
- `skill_level`
- `quest_count`
- `metric_threshold`
- `attribute_score`
- `custom`

### Implementation

- 22 badges ship in v1 (`src/data/badges.ts`).
- The badge engine runs after each state-changing action.
- Earned badges are stored with an ID, timestamp, and optional skill ID.
- Newly earned badges appear in the toast and in the Badges screen.
- Locked badges remain visible with their requirement.

---

## 9. Finance

Finance is a **continuous metric-driven skill**. It is not career tracking. It tracks financial independence and resilience.

### Metrics

- Monthly income
- Monthly expenses
- Savings rate (derived from income and expenses)
- Net worth (recorded, not weighted in v1)
- Emergency fund months
- Passive income
- Runway years
- Debt-to-income ratio

### Finance score

```text
incomeScore     = min(income / expenses, 1) × 100
savingsScore    = min(savingsRate / 0.40, 1) × 100
emergencyScore  = min(emergencyMonths / 12, 1) × 100
passiveScore    = min(passiveIncome / expenses, 1) × 100
runwayScore     = min(runwayYears / 25, 1) × 100
debtScore       = max(0, 1 - debtToIncome / 0.50) × 100

financeLevel =
  0.15 × incomeScore +
  0.20 × savingsScore +
  0.20 × emergencyScore +
  0.20 × passiveScore +
  0.15 × runwayScore +
  0.10 × debtScore
```

### Finance implementation

- The first monthly check-in sets the Finance level directly from the weighted score.
- Later check-ins can promote at most one rank.
- A check-in above the current rank ceiling is held at the ceiling unless every finance gate criterion is met.
- Gate criteria include the overall score plus rank-specific thresholds: income coverage, savings rate, emergency months, passive-income coverage, runway, and debt-to-income.
- Finance awards no practice XP and has no main quest.
- Currency follows the profile setting (`USD`, `EUR`, `GBP`, `INR`, `JPY`, `AUD`, `CAD`).
- Finance check-ins are stored by month; re-checking the same month updates that month.
- Net worth is captured for history but does not affect the score in v1.

### Finance ranks

| Level | Rank | Gate |
|---|---|---|
| 0–9 | Survival | No stable income, or expenses exceed income |
| 10–19 | Stability | Income covers essentials; tracking started |
| 20–29 | Control | Income ≥ expenses; savings started |
| 30–39 | Buffer | 3-month emergency fund; debt under control |
| 40–49 | Builder | 20%+ savings rate; consistent investing |
| 50–59 | Compounder | 6-month runway; passive income started |
| 60–69 | Optionality | Passive income covers ~25% of expenses |
| 70–79 | Leverage | Passive income covers ~50% |
| 80–89 | Independence | Passive income covers baseline expenses |
| 90–100 | Abundance | 25+ year runway; assets sustain lifestyle indefinitely |

Top ranks use a **creator-entrepreneur archetype**—multiple income streams, owned assets, passive/royalty income, work becoming optional. This is a reference archetype, not a literal net-worth target.

### Finance quests

- Complete the monthly finance check-in.
- Track expenses for 30 days.
- Build a one-month emergency fund.
- Automate a savings transfer.
- Create a side income stream.

### Finance UX rules

- Monthly check-in form.
- Currency is selected during onboarding and can be changed in Settings.
- Financial data is local-only in v1.
- Finance is displayed as a prominent life skill card.
- Finance does not use practice XP.
- Finance rank gates combine the weighted score with rank-specific threshold criteria.

---

## 10. Data model

### Persistence

Peritia uses a **single-document SQLite store**, not normalized tables.

- Database: `peritia.db`.
- Table: `app_state (id INTEGER PRIMARY KEY, json TEXT NOT NULL, updated_at TEXT NOT NULL)`.
- The app reads and writes one JSON document with `id = 1`.
- WAL journaling is enabled.
- State is saved after every successful action through the central `AppProvider`.
- Startup loads the document; a missing or unreadable document sends the user to onboarding.
- Schema evolution is handled by the `version` field and `normalizeImported`, not by table migrations.

### AppState shape

| Field | Purpose |
|---|---|
| `version` | Document version (`1`) |
| `profile` | Name, character title, creation date, onboarding flag, demo flag |
| `settings` | Currency, haptics, re-assessment reminders |
| `skills` | All nine skill definitions and states with embedded metrics, scores, level, XP, assessment date |
| `activeSkillIds` | Planned v1.1: IDs of the skills the user has chosen to track; empty on a fresh character |
| `activeQuests` | Current main and side quests, including step progress |
| `customQuests` | User-created quest definitions |
| `completions` | Quest completion history, notes, text evidence, XP, demo key |
| `assessments` | Initial, re-assessment, and rank-trial history |
| `financeCheckins` | Monthly finance snapshots and computed scores |
| `dailyCheckins` | Sleep, nutrition, mood, and energy by date |
| `earnedBadges` | Badge ID, earned timestamp, optional skill ID |
| `events` | Activity timeline used by the Journal |
| `streak` | Current streak, longest streak, last active date |
| `metDemoKeys` | Rank-gate demonstrations that have been completed |

### Logical entities

- **Skills and metrics** are embedded in `skills`; curated defaults come from `src/data/skills.ts`.
- **Rank gates** are derived at runtime from the skill state and `metDemoKeys`; they are not stored.
- **Curated quests** live in `src/data/quests.ts`; custom quests live in `customQuests`.
- **Attributes, character level, rank labels, reminders, and badge eligibility** are derived on render.
- **Badge definitions** live in `src/data/badges.ts`; only earned badges are persisted.
- **Evidence** is a text receipt stored on the completion. No files or URIs are attached in v1.

### Export and import

- Export writes the full `AppState` as pretty-printed JSON to `peritia-backup-YYYY-MM-DD.json`.
- Export uses the cache directory and the Android share sheet.
- Import accepts JSON or plain text, validates the document shape, and normalizes missing optional arrays.
- Import replaces the entire character; there is no partial merge.
- Erasing all data clears the SQLite row and returns to onboarding.
- Demo mode can be loaded or reset from Settings; it replaces the current character, so export first.

### Sync readiness

- The document already carries `version` and ISO timestamps on history records.
- Cloud sync is out of scope for v1.
- If sync is added later, the document can be migrated to per-entity tables or per-record documents with `updated_at`, `deleted_at`, and `sync_status`.

### Local-first rules

- SQLite is the source of truth in v1.
- JSON export/import is the backup mechanism.
- No auth, network, or cloud dependency for core flows.
- Evidence stays on-device as text.

---

## 11. Screens

### Implemented screens

| # | Screen | File | Purpose |
|---|---|---|---|
| 1 | Onboarding | `OnboardingScreen.tsx` | Name, currency, fresh or demo character |
| 2 | Character | `CharacterScreen.tsx` | Radar, level, rank, main quest, side quests, top skills, streak, due reminders |
| 3 | Skills | `SkillsScreen.tsx` | All nine skills with level, rank, metric score, progress |
| 4 | Skill detail | `SkillDetailScreen.tsx` | Metrics, rank gate, quests, history, re-assess |
| 5 | Finance detail | `FinanceDetailScreen.tsx` | Finance score, ladder, gate, check-in history |
| 6 | Assessment | `AssessmentScreen.tsx` | Initial assessment, re-assessment, rank trial |
| 7 | Quest board | `QuestBoardScreen.tsx` | Main quest, active side quests, available quests |
| 8 | Quest completion | `QuestCompletionScreen.tsx` | Log attempt, notes, evidence, result |
| 9 | Add quest | `AddQuestScreen.tsx` | Custom side quest with skill, difficulty, secondary credit |
| 10 | Journal | `JournalScreen.tsx` | Heatmap, weekly XP, stats, timeline |
| 11 | Badges | `BadgesScreen.tsx` | Earned and locked badges |
| 12 | More | `MoreScreen.tsx` | Hub for badges, finance, check-ins, settings |
| 13 | Settings | `SettingsScreen.tsx` | Name, currency, haptics, reminders, export/import, demo/reset |
| 14 | Daily check-in | `DailyCheckinScreen.tsx` | Sleep, nutrition, mood, energy |
| 15 | Finance check-in | `FinanceCheckinScreen.tsx` | Monthly finance values and score preview |

### Navigation

- Five tabs: Character, Skills, Quests, Journal, More.
- Detail flows are stack routes above the tabs.
- The stack is custom state in `App.tsx`; there is no router library.
- Android back pops the stack, then returns to the Character tab, then exits.
- Full-screen flows are used instead of native modal sheets for reliability.

### Mockup status

| Screen | Status |
|---|---|
| Character dashboard | `mockups/character.html` built and approved |
| All other screens | Implemented directly from the shared design system |

The per-screen HTML mockup gate was superseded after the Character mockup was approved. `mockups/styles.css` remains a design reference only.

---

## 12. Build plan

### Phase status

| Phase | Status | Notes |
|---|---|---|
| 0 — Design lock | Complete | README, approved Character mockup, tokens, seed data |
| 1 — App shell | Complete | Expo 58, custom navigation, theme, SQLite document store, nine skills |
| 2 — Character and skills | Complete | Dashboard, skills list, detail, attributes, radar, rings |
| 3 — Metric progression | Complete | Assessments, practice XP cap, rank gates, rank trials, history |
| 4 — Quests | Complete | Generated main quest, curated/custom side quests, secondary credit, completion flow |
| 5 — Finance | Complete | Monthly check-in, score, ladder, gates, finance quests |
| 6 — History and backup | Complete | Journal, heatmap, badges, export/import, in-app reminders |
| 7 — Polish | Complete | Haptics, empty states, toasts, loading, Android back handling |
| 8 — Release build | Complete | Signed standalone APK built; on-device smoke test pending |

### Release build (Android)

Prerequisites:

- Expo SDK 58 / React Native 0.88.1 / Hermes / New Architecture
- JDK 21
- Android SDK Platform 37 and Build Tools 37.0.0
- NDK `27.1.12297006`
- CMake `3.22.1`

Commands:

```bash
npx expo prebuild --platform android --no-install
npm run android:release
```

Artifacts:

```text
dist/Peritia-1.0.0.apk
dist/Peritia-1.0.0.apk.sha256
android/app/build/outputs/apk/release/app-release.apk
```

`dist/Peritia-1.0.0.apk` is the stable copy for sideloading.

Build configuration:

| Item | Value |
|---|---|
| Package ID | `com.peritia.app` |
| Version | `1.0.0` (`versionCode` 1) |
| Min SDK | 24 |
| Target SDK | 36 |
| Compile SDK | 37 |
| ABIs | `arm64-v8a`, `armeabi-v7a`, `x86`, `x86_64` |
| Signing | Local debug keystore via `signingConfigs.debug` |
| Distribution | Personal sideload; not Play Store ready |

The release build is signed with the local debug keystore so it is installable on a personal device. A Play Store release will need a dedicated upload keystore and a new version code.

Install when a device is connected:

```bash
adb install -r dist/Peritia-1.0.0.apk
```

If installing directly on the phone, enable “Install unknown apps” for the file manager or browser used to open the APK.

Verify the artifact:

```bash
$ANDROID_HOME/build-tools/37.0.0/apksigner verify --print-certs \
  dist/Peritia-1.0.0.apk
$ANDROID_HOME/build-tools/37.0.0/zipalign -c -v 4 dist/Peritia-1.0.0.apk
sha256sum -c dist/Peritia-1.0.0.apk.sha256
```

### Build status

- TypeScript: `npx tsc --noEmit` passes.
- Expo health: `npx expo-doctor` passes 20/20.
- Prebuild: Android project generated successfully.
- Release APK: **built successfully** on 2026-11-22 in 30m 44s.
- APK size: 85,044,677 bytes (~81.1 MiB).
- Signature: APK Signature Scheme v2, debug certificate (`CN=Android Debug`).
- Package check: `com.peritia.app`, version `1.0.0` (`versionCode` 1), min SDK 24, target SDK 36, compile SDK 37.
- Alignment: `zipalign` verification passes.
- ABI coverage: ARM64, ARMv7, x86, and x86_64 native libraries present.
- SHA-256: `405666da64cd137d35f6793e422209117ea14da220b373cb7482852adce7cb6d`.
- On-device smoke test: pending until the phone is reconnected.

### MVP acceptance criteria

- Character with eight derived attributes — implemented.
- Nine skills with level, rank, and metric progress — implemented.
- Initial metric assessment establishes a true starting rank — implemented.
- Side quest awards practice XP within the rank cap — implemented.
- Rank criteria and rank trial promote one rank — implemented.
- Main quest and side quests can be added — implemented.
- Finance check-in updates the Finance level and gate — implemented.
- Badges can be earned — implemented.
- JSON export and import — implemented.
- Re-assessment can adjust level or rank — implemented.
- Full flow verified on an Android device — pending.

---

## 13. Decision log

> Append-only. Do not delete rows. Mark superseded decisions clearly.

| Date | Decision | Status | Notes |
|---|---|---|---|
| 2026-11-22 | Build a personal life-RPG skill tracker | Accepted | Core product concept |
| 2026-11-22 | Consider Flutter/Dart first | Superseded | User is familiar with JS/TS; React Native chosen |
| 2026-11-22 | Use React Native + Expo + TypeScript | Accepted | Best fit for existing JS/TS experience |
| 2026-11-22 | Android-first platform | Accepted | iOS later |
| 2026-11-22 | Personal use for v1 | Accepted | No public onboarding, social, or monetization |
| 2026-11-22 | Local-first data with JSON export/import | Accepted | No accounts or cloud in v1 |
| 2026-11-22 | No social features in v1 | Accepted | Solo experience |
| 2026-11-22 | No monetization in v1 | Accepted | Validate the core loop first |
| 2026-11-22 | No AI features in v1 | Accepted | Keep the core deterministic and cheap |
| 2026-11-22 | Modern RPG visual direction | Accepted | Dark-first, premium, restrained |
| 2026-11-22 | Eight attributes: Strength, Endurance, Agility, Dexterity, Focus, Discipline, Creativity, Vitality | Accepted | Derived summaries, not directly grindable |
| 2026-11-22 | Skills-first stats architecture | Accepted | Attributes derive from skills and check-ins |
| 2026-11-22 | 0–100 levels with 10 ranks × 10 levels | Accepted | Rank gates at each ten-level boundary |
| 2026-11-22 | Rank gates require criteria + optional evidence | Accepted | Trust-based |
| 2026-11-22 | Optional re-test, no decay in v1 | Accepted | Soft decay later, per skill |
| 2026-11-22 | One main quest + side quests | Accepted | Focus mechanic |
| 2026-11-22 | Curated + custom quests | Accepted | Starter content plus personal quests |
| 2026-11-22 | Primary + secondary skill credit | Accepted | Primary 100%, secondary 25% |
| 2026-11-22 | Badges represent milestones + streaks | Accepted | Rank-ups, firsts, consistency, long-term goals |
| 2026-11-22 | Nine launch skills: eight listed skills + Finance | Accepted | Guitar, Harmonica, Sketching, 3D Design, Language, DSA, Bodybuilding, Martial Arts, Finance |
| 2026-11-22 | Initial model: one 0–100 level + criteria | Superseded | Replaced by all-skills metric profiles |
| 2026-11-22 | All skills are metric-based | Accepted | Each skill has 3–5 metrics and rubrics |
| 2026-11-22 | Metric profiles: curated defaults + editable | Accepted | 3–5 metrics per skill |
| 2026-11-22 | Overall skill score: weighted average + minimum gates | Accepted | Prevents a high average from hiding weak areas |
| 2026-11-22 | Progression: assessment baseline + practice XP within rank | Accepted | Re-assess to cross rank gates |
| 2026-11-22 | Finance is continuous metric-driven | Accepted | Monthly check-in; no practice XP |
| 2026-11-22 | Finance only life skill in v1 | Accepted | Sleep, Nutrition, Work/Career deferred to v1.1 |
| 2026-11-22 | App name: Peritia | Accepted | Tagline: “Prove your proficiency.” |
| 2026-11-22 | HTML mockups before app implementation | Accepted | One screen at a time, opened in browser for review |
| 2026-11-22 | Use static HTML + shared CSS for mockups | Accepted | No framework in mockups |
| 2026-11-22 | Mockup design system: dark-first modern RPG | Accepted | Sora + Fraunces; gold, teal, violet, rose accents |
| 2026-11-22 | Character dashboard mockup built | Accepted | `mockups/character.html`; awaiting user review |
| 2026-11-22 | README is the project source of truth | Accepted | Append future decisions here |
| 2026-11-22 | Character dashboard mockup approved | Accepted | Visual direction locked from `mockups/character.html` |
| 2026-11-22 | Per-screen HTML mockup gate superseded | Superseded | Remaining screens implemented directly from the shared design system after Character approval |
| 2026-11-22 | Custom tab + stack navigation | Accepted | Replaces Expo Router; implemented in `App.tsx` with Android back handling |
| 2026-11-22 | SQLite single JSON document store | Accepted | Replaces Drizzle/normalized tables; table `app_state` holds one `AppState` document |
| 2026-11-22 | React Context state container | Accepted | Replaces Zustand; central `AppProvider` owns actions and persistence |
| 2026-11-22 | Controlled native inputs | Accepted | Replaces React Hook Form + Zod; custom validation and slider controls |
| 2026-11-22 | Custom SVG charts | Accepted | Replaces Victory/gifted-charts; radar, ring, and heatmap built with `react-native-svg` |
| 2026-11-22 | Custom `StyleSheet` theme | Accepted | Replaces NativeWind/Unistyles consideration; tokens live in `src/theme.ts` |
| 2026-11-22 | Demo character on first launch | Accepted | Fresh or seeded demo profile; demo is marked and resettable in Settings |
| 2026-11-22 | Main quests are generated demonstrations | Accepted | One active globally; three logged attempts satisfy the demonstration criterion |
| 2026-11-22 | Practice XP capped at rank ceiling | Accepted | 100 XP per sub-level; assessments and finance check-ins promote at most one rank |
| 2026-11-22 | Rank label includes overall numeral | Accepted | Level 34 = “Skilled IV”; level 90 = “Grandmaster X” |
| 2026-11-22 | Character level is average of nine skills | Superseded | Replaced by active-skill average after fresh-profile skill selection |
| 2026-11-22 | Character level averages active skills | Accepted | Rounded mean of selected skills; 0 when no skills are active |
| 2026-11-22 | Finance uses weighted metrics + rank thresholds | Accepted | Six weighted scores; first check-in sets level; later check-ins respect gates |
| 2026-11-22 | In-app re-assessment reminders | Accepted | 90-day cadence; no push notifications or `expo-notifications` dependency |
| 2026-11-22 | UI stack: Sora, Fraunces, Lucide, haptics | Accepted | Fonts, icon map, expo-haptics, sharing, document picker, slider |
| 2026-11-22 | Android package `com.peritia.app` | Accepted | Version `1.0.0`, `versionCode` 1 |
| 2026-11-22 | Local debug keystore for release | Accepted | Personal sideload build; Play Store upload keystore still required later |
| 2026-11-22 | Pin NDK 27.1.12297006 and CMake 3.22.1 | Accepted | Required for the RN 0.88 New Architecture native build |
| 2026-11-22 | Edge-to-edge is always on in SDK 58 | Accepted | Removed deprecated `edgeToEdgeEnabled` and `androidNavigationBar` config; added `expo-system-ui` |
| 2026-11-22 | Android release APK built and verified | Accepted | `dist/Peritia-1.0.0.apk`; debug-signed, 85,044,677 bytes, SHA-256 `405666da…7cb6d` |
| 2026-11-22 | Fresh characters start with zero active skills | Accepted | User selects skills during onboarding; no implicit nine-skill roster |
| 2026-11-22 | Hide Skills tab when no skills are active | Accepted | Tab appears after the first skill is selected; Character shows a selection CTA |
| 2026-11-22 | Skill Atlas is display-only | Accepted | Albion-style radial map planned for v1.2; no unlock, respec, or new XP mechanics |
| 2026-11-22 | Albion Destiny Board is a layout reference only | Accepted | Research notes in section 15; no assets or mechanics copied |
| 2026-11-22 | Backlog section added to README | Accepted | Bugs and future features tracked with IDs, expected behavior, and acceptance criteria |

---

## 14. Open decisions

These are intentionally unresolved and should be recorded here until decided.

- Exact rubric wording for every metric in every skill.
- Exact metric weights per skill.
- Exact attribute weights after first use.
- XP curve tuning after the first month.
- Whether a ninth “Wealth” attribute is added later.
- Domain and trademark availability for “Peritia.”
- Guided challenge assessments versus self-rating.
- Expanding curated quest content beyond the 33 launch quests.
- Whether onboarding skill selection is mandatory or skippable.
- Whether active skills are capped or all nine can be selected.
- Whether the Skill Atlas shows rank pips or full rank nodes.
- Whether Skill Atlas nodes are tappable in the first release or purely visual.
- Whether inactive skills can be re-enabled without losing history.
- Whether attributes renormalize weights across active skills or treat inactive skills as zero.
- Whether custom skills are in scope for v1.2.
- Whether map pan and zoom use `react-native-gesture-handler` and Reanimated.
- Migration policy for existing level-0 skills beyond the proposed rule.
- Full locale-aware number and date formatting beyond currency selection.
- Re-assessment reminder cadence beyond the default 90 days.
- Whether to show a separate “certified level” alongside the displayed level.
- Finance score formula tuning after real data.
- Whether to support file or image evidence instead of text receipts.
- Whether to add local push notifications for reminders.
- Automated test coverage for progression and finance logic.
- iOS build and App Store readiness.
- Play Store upload keystore and release process.
- Cloud sync and multi-device conflict handling.

---

## 15. Known issues and future releases

> Backlog captured on 2026-11-22. Items here are not implemented unless explicitly marked complete.

### Known issues

| ID | Area | Issue | Expected behavior | Priority | Status |
|---|---|---|---|---|---|
| BUG-001 | Onboarding / skills | A fresh profile is seeded with all nine skills at level 0, implying the user already has every skill before choosing any. | Fresh profiles start with zero active skills. The user selects the skills they actually want to track. | High | Open — planned for v1.1 |
| BUG-002 | Navigation / Skills tab | The Skills tab is visible even when no skills are active, producing a tab full of level-0 cards. | Hide the Skills tab while the active skill list is empty. Show it after the first skill is selected. | High | Open — planned for v1.1 |

#### BUG-001 / BUG-002 — Fresh profile skill selection

Current behavior:

- `createFreshState()` builds all nine `SkillState` entries at level 0.
- The Skills tab is always present.
- The Character dashboard has no “choose your skills” step.

Expected behavior:

1. Onboarding asks which skills the user wants to track after name and currency.
2. A fresh character can start with zero active skills if the user skips selection.
3. The Skills tab is hidden while zero skills are active.
4. Character shows an empty state with a “Choose your first skill” action.
5. Selecting a skill activates it; the Skills tab appears immediately.
6. Demo profiles keep all nine seeded skills.
7. Skills can be added later from the Skills or More area; removal and archiving remain open decisions.

Proposed implementation:

- Add `activeSkillIds: SkillId[]` to `AppState`.
- Keep all nine definitions in `skills` so metrics, rubrics, icons, and demo data remain curated; filter the UI by `activeSkillIds`.
- Derived attributes treat inactive skills as level 0.
- Character level averages active skills only; it is 0 when no skills are active.
- `skillById()` must not fall back to an unrelated skill when an ID is inactive.
- Migration: activate skills with an assessment, level above 0, or completion history; leave untouched level-0 skills inactive. A reset is acceptable while the app is pre-release.
- Hide the tab in `BottomNav` and `App.tsx` when `activeSkillIds.length === 0`.
- Add an onboarding selection step and an empty-state CTA on Character.

Acceptance criteria:

- A new profile with no selected skills shows Character, Quests, Journal, and More, with no Skills tab.
- No level-0 skill cards appear before selection.
- Selecting one skill reveals the Skills tab and its detail screen.
- The demo profile still shows all nine skills.
- Existing assessed or progressed skills survive migration.

### Future releases

| ID | Feature | Target | Status |
|---|---|---|---|
| FEAT-001 | Skill Atlas — display-only Albion-style proficiency map | v1.2 (proposed) | Researched; spec below |
| FEAT-002 | Skill selection and active-skill management | v1.1 | Planned with BUG-001 and BUG-002 |
| FEAT-003 | Custom skills beyond the nine curated skills | v1.2+ | Open decision |

#### FEAT-001 — Skill Atlas (display-only proficiency map)

Goal: a pannable, zoomable map that makes the character’s breadth and rank progress feel like a world map, without changing progression rules. It is a visualization, not a new unlock tree.

Proposed layout:

- Center: character emblem, name, level, and title.
- First ring: five category hubs — Music, Creative, Knowledge, Physical, Life.
- Second ring: active skill nodes, connected to their category hub.
- Each skill node shows its icon, level, rank label, and a ring of ten rank pips (I–X), or a compact branch of rank nodes.
- Metric nodes appear in a detail sheet on tap, not as permanent leaves. This keeps the map readable at nine skills.
- An optional “Show all skills” mode reveals inactive skills as dimmed, non-interactive nodes.
- Node states: current or active (gold), rank-trial ready (teal), completed or mastered (violet or white), future (dim), inactive (faint).
- Edges: solid for the active path, dashed for future ranks, subtle glow for the current node. Edge fill can reflect XP toward the next level.
- Background: obsidian with a faint radial grid; no noisy texture.
- Search: filter by skill, category, or rank.
- Controls: pinch zoom, pan, “Center on character,” “Show all,” category filter, and a legend.
- Tap a skill node: open a bottom sheet with level, rank, next gate criteria, and a button to open the existing Skill Detail screen.
- Tap a rank pip: show that rank’s requirement. No direct editing.
- Empty state: if no active skills exist, show the same “Choose your skills” CTA as the dashboard.

Scope boundaries:

- Read-only in the first release.
- No unlocking, spending, respec, or new XP.
- No custom node editor.
- No separate persistence beyond optional map view preferences.
- No physics simulation; layout is deterministic and precomputed.

Data and performance:

- Derive from `skills`, `activeSkillIds`, `metDemoKeys`, rank gates, and XP.
- Use `react-native-svg` for edges and nodes; add gesture handling only if needed.
- Cull off-screen nodes, cap visible nodes, and test on a mid-range Android device.
- Provide a list fallback for accessibility and small screens.

Acceptance criteria:

- The map opens from Character or More.
- It shows only active skills by default; “Show all” reveals inactive skills dimmed.
- The current skill and rank are visually obvious without reading every label.
- Tapping a node opens the correct skill detail.
- Pan and zoom stay smooth with nine skills and ninety rank pips.
- No progression state can be changed from the map.

### Albion Destiny Board research

Research date: 2026-11-22. Reference: the user-provided Albion Destiny Board screenshot from the same date.

Sources:

- [Albion Online Wiki — Destiny Board](https://wiki.albiononline.com/wiki/Destiny_Board)
- [Albion Online — The Destiny Board guide](https://albiononline.com/guides/article/The-Destiny-Board+96)
- [Albion Online — Follow Your Destiny (layout)](https://albiononline.com/news/followyourdestiny)
- [All Things Albion — Destiny Board](https://allthingsalbion.com/en/destiny)
- [Albion Online Wiki — Version 31.000.1](https://wiki.albiononline.com/wiki/Version_31.000.1)
- [Albion Online Forum — Destiny Board mini-map feedback](https://forum.albiononline.com/index.php/Thread/166847-Destiny-Board-Mini-map-for-easy-scrolling)

What Albion does:

- The board is circular, built around a universal center. “Novice Adventurer” sits at the center and every branch opens from it.
- Main progression branches separate early and are color-coded: Fighting orange, Crafting green, Gathering blue, Farming yellow, and Adventuring white.
- Nodes are connected by lines. Each node represents a mastery or specialization and shows progress and requirements when selected.
- The board is pannable and zoomable, with a search field for finding specific nodes.
- A side tracker shows recent progress during normal play.
- The 2026 Radiant Wilds update hides nodes that cannot yet be progressed, subdues distant areas, shows partial progress on connections to locked nodes, and groups related specializations into combined nodes.
- The current board contains hundreds of nodes (704 in the All Things Albion data). That creates a strong sense of scale, but also navigation and performance problems.

What to borrow:

- The center-and-branches spatial model.
- Category colors and clear node states.
- Search, pan and zoom, and a “show all” toggle.
- Dimming unreachable content instead of hiding it completely.
- Tapping a node for details instead of cramming text onto the map.

What not to copy:

- Hundreds of nodes and deep specialization chains.
- Unlock or respec mechanics; Peritia already has assessments and rank gates.
- Dense icon-only labels without a list fallback.
- Long scrolling distances. Peritia’s map should fit on one or two screens.

Design implication: Peritia’s map should be a compact constellation of at most nine skill branches, not a 700-node board. The visual payoff comes from the radial composition, connected paths, and clear progress states, not from scale.

### Backlog process

- New bugs go in Known issues with an ID, expected behavior, priority, and status.
- New features go in Future releases with a target release and status.
- Research notes stay with the feature they inform.
- When an item is implemented, update its status and append a Decision Log row.

---

## 16. Change protocol

When a new decision is made:

1. Append a row to the **Decision Log**.
2. Update the relevant section of this README.
3. Mark any replaced decision as **Superseded**.
4. Update the **Last updated** date.
5. Update the mockups or implementation if needed.
6. Do not silently change the product model.

This keeps the project reproducible from scratch and prevents design drift.
