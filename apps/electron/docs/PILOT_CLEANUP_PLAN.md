# PILOT Cleanup Plan (Technical-only)

## Goal
Keep `feat/runtime-i18n-injection-pilot` minimal and conflict-resistant.

## Allowed in runtime-i18n.ts
1. Guard/route/locale enablement logic
2. DOM translation traversal mechanism
3. Minimal emergency fallback for **true dynamic** text only (if unavoidable)

## Not Allowed
- Static UI translations that belong to locale JSON
- Bulk literal dictionaries duplicating pure resources
- Branch-specific content that should be in pure

## Current Target State
- `RUNTIME_LITERAL_OVERRIDES`: empty by default
- `RUNTIME_SUBSTRING_OVERRIDES`: keep only if proven necessary for long prose fragments not key-addressable

## Re-introduction Policy (if fallback must be added)
Every new runtime fallback entry must include:
- reason why not key-based
- source location that emits dynamic text
- removal condition

## Merge-Safety Notes
- Smaller pilot diff means lower conflict probability against main.
- All translation growth should happen in pure branch.
