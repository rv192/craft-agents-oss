# i18n Classification Table

## Categories
- **A (Static UI)**: Must live in pure locale JSON.
- **B (Key-able Variants)**: Should be normalized by key-based calls; temporary fallback allowed only during transition.
- **C (Dynamic)**: Truly runtime/user-defined/3rd-party dynamic text; fallback allowed with explicit reason.

## Classified Buckets

### A — Static UI (move/keep in pure only)
- Settings labels/titles:
  - `Notifications and updates`, `Interface`, `General`, `Keyboard shortcuts`, `Language`, `Follow System`, `Notes`
- Workspace/settings labels:
  - `Default Sources`, `Workspace Overrides`, `Use default`, `Inherit from app settings`, `Keep screen awake`
- Navigation/menu:
  - `All Sessions`, `All Skills`, `Flagged`, `Archived`, `Status`, `Labels`, `Sources`, `Skills`, `Views`, `Settings`, `APIs`, `MCPs`, `Local Folders`, `New Session`
- Session/context actions:
  - `Share`, `Rename`, `Delete`, `Regenerate Title`, `Open in New Window`, `Copy Path`, etc.
- Empty/chat literals:
  - `No sessions yet`, source-empty variants, chat placeholders

**Decision**: Keep in `packages/shared/locales/zh-CN/*.json`; remove from runtime literal map.

### B — Key-able Variants (normalize calls, remove fallback later)
- Case/spacing variants:
  - `Using defaults` / `Using Defaults`
  - `Name,icon,working directory` / spaced variant
  - `Send key,spell check` / spaced variant
- Malformed concatenation artifacts:
  - `Promptsbefore making edits.`
  - `Automatic execution,no prompts.`
  - `Read-only exploration.Blockswrites,never prompts.`
- Typo variant:
  - `User preferencences`

**Decision**: Keep canonical keys in pure; fix call sites progressively; runtime fallback only as temporary migration aid.

### C — Dynamic (allow minimal runtime fallback if required)
- Status labels from user/workspace configuration:
  - `Backlog`, `Todo`, `In Progress`, `Needs Review`, `Done`, `Cancelled`

**Decision**: Prefer pure mapping when canonical states are known; allow runtime fallback only for truly user-defined states.

## Branch Placement Rules
- `i18n-pure`: A + canonical B + canonical C labels.
- `feat/runtime-i18n-injection-pilot`: technical mechanism only; fallback as exception.
- `integration/i18n-pilot-check`: merge/verify only.
