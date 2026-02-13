# PURE Patch Plan (Resource-only)

## Objective
Consolidate all covered translations into pure locale files (no behavior changes, no runtime logic changes).

## Target Files
- `packages/shared/locales/zh-CN/common.json`
- `packages/shared/locales/zh-CN/settings.json`
- `packages/shared/locales/zh-CN/menu.json`
- `packages/shared/locales/zh-CN/chat.json`
- `packages/shared/locales/zh-CN/dialogs.json`
- `packages/shared/locales/zh-CN/onboarding.json` (only if uncovered items appear)

## Planned Actions
1. **Deduplicate by canonical key first**
   - Do not add duplicate semantic translations under different keys unless temporarily required for migration.

2. **Place by domain**
   - Settings-related -> `settings.json`
   - Menu/context/toolbar -> `menu.json` or `common.menu`
   - Chat input/placeholders/session list UI -> `chat.json`/`common.json`

3. **Keep migration fallback grouped**
   - Keep `common.runtimeFallback` for transition only.
   - Mark each fallback with intended removal condition.

4. **No UI code path edits in this phase**
   - This phase is resource-only to minimize merge conflicts.

## Verification Checklist
- JSON valid (no duplicate keys, no syntax errors)
- zh-CN files contain all currently covered literals from prior runtime/resx work
- No runtime file expansion required for static text
