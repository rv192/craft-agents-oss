# i18n Migration Inventory (resx + runtime + pure)

## Scope
- Runtime source: `apps/electron/src/renderer/lib/runtime-i18n.ts`
- Resource source: `packages/shared/locales/{en,zh-CN}/*.json` (on `i18n-pure`)
- Historical reference branch: `i18n-resx`

## Branch/Commit Evidence
- `i18n-resx` core commit: `5042ac7` (only `apps/electron/resources/permissions/default.zh-CN.json`)
- Runtime expansion commits (same day sequence):
  - `9f609fc` initial large runtime literal map
  - `6fc1381`, `664ac55`, `9b46334`, `d58530a`, `c2aa60f`, `9c87bdf`, `a4b3433`, `18d76c3` and related follow-ups
- Runtime cleanup commits:
  - `a283cb3` reduce literal map substantially
  - `03a76a3` empty `RUNTIME_LITERAL_OVERRIDES`

## Source-of-Truth Status
1. **resx branch coverage**
   - Contains permissions zh-CN asset only.
   - Does **not** contain runtime UI literal overrides.

2. **runtime historical coverage (before cleanup)**
   - `RUNTIME_LITERAL_OVERRIDES` had broad UI strings (settings, sidebar, sessions, chat placeholders, todo states, empty states).
   - `RUNTIME_SUBSTRING_OVERRIDES` had long permission prose fragments.

3. **pure branch coverage (current)**
   - zh-CN locale files present: `chat/common/dialogs/menu/onboarding/settings`.
   - Includes migrated fallback namespace in `common.json`:
     - `runtimeFallback.statusLabels`
     - `runtimeFallback.concatenated`
     - `runtimeFallback.typos`

## Inventory Summary (High-Level)

### A) Static UI literals (historically in runtime, now expected in pure)
- Settings labels/titles/descriptions (language, permissions, workspace, shortcuts, connection labels)
- Sidebar/menu labels (`All Sessions`, `Sources`, `Skills`, etc.)
- Session/context menu actions (`Share`, `Rename`, `Delete`, `Open in New Window`, ...)
- Empty states (`No sessions yet`, source empty variants)
- Chat placeholders

### B) Variant/concatenated literals
- Case/punctuation/spacing variants:
  - `Using defaults` / `Using Defaults`
  - `Name,icon,working directory` / spaced variant
  - `Send key,spell check` / spaced variant
  - malformed concatenations (`Promptsbefore...`, `Automatic execution,no prompts.`)

### C) Dynamic or semi-dynamic labels
- Todo/status labels (`Backlog`, `Todo`, `In Progress`, `Needs Review`, `Done`, `Cancelled`)

### D) Long prose substring fragments
- Permission explanatory sentence fragments from `RUNTIME_SUBSTRING_OVERRIDES`

## Current Runtime State (pilot)
- `RUNTIME_LITERAL_OVERRIDES`: intentionally empty.
- `RUNTIME_SUBSTRING_OVERRIDES`: still present for prose fragment fallback.

## Practical Implication
- All translation assets now belong in pure resources.
- Runtime file should remain minimal and technical; only emergency fallback permitted.
