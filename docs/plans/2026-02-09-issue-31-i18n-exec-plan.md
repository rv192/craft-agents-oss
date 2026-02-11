# Issue 31 i18n Exec Plan (Reconstructed) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Finish remaining i18n coverage for Issue 31 by localizing all UI surfaces and confirming behavior with tests and manual verification.

**Architecture:** Keep renderer strings sourced via react-i18next keys, extend existing locale JSON namespaces, and map any remaining defaults/menus/dialogs through the shared locale resources. Use small helper label functions where needed for testability. Avoid refactors while localizing.

**Tech Stack:** React, i18next/react-i18next, Electron main process, shared locale JSON, Bun test.

---

## i18n Boundary & Decoupling Guardrails (for minimal blast radius)

1. **Feature-local by default**
   - Keep label helpers next to components (e.g., `getXxxLabels` in the same feature folder).
   - Only extract to shared helper when a label map is reused by **3+ independent surfaces**.

2. **Dependency direction is one-way**
   - Renderer UI must depend on: `component -> label helper -> t()`.
   - Avoid importing broad shared UI entrypoints just to test labels.
   - For tests, prefer pure helper imports to avoid runtime-heavy transitive dependencies.

3. **Main-process i18n must be runtime-safe**
   - Do not rely on a single `process.cwd()` locale path.
   - Use candidate path resolution for dev + packaged runtimes (`process.resourcesPath`, `app.getAppPath()`, monorepo dev paths).
   - Keep main-process i18n limited to menu/dialog/chrome text in this phase.

4. **No behavior refactors under i18n scope**
   - Replace text plumbing only.
   - Avoid changing business logic or control flow while localizing.

5. **Regression guardrails are mandatory**
   - For each new i18n boundary helper in main/renderer, add focused tests.
   - At minimum, verify fallback behavior and key-path mapping for both `en` and `zh-CN` resource expectations.

---

## Completed Foundation (already done on this branch)
- ✅ Locales added: `packages/shared/locales/*` (en + zh-CN) (`8210987 locales`).
- ✅ Renderer i18n init + UI label utilities (`9d4d4a8 renderer i18n`).
- ✅ Main i18n loader + logging utilities (`f8021f4 main i18n`).
- ✅ Language plumbing across IPC/preload/config (`7641d8c language plumbing`).
- ✅ Settings pages i18n (`36d8e7e settings i18n`).
- ✅ Status defaults localized + tests (`e0dc88a status defaults`).
- ✅ Label defaults localized + tests (`1e0cd40 label defaults`).
- ✅ Workspace default name seed localized + tests (`621ef96 workspace seed`).

---

### Task 1: Common dialog/action labels (buttons, toasts, generic strings)

**Files:**
- Modify: `packages/shared/locales/en/common.json`
- Modify: `packages/shared/locales/zh-CN/common.json`
- Modify: `apps/electron/src/renderer/components/ui/rename-dialog.tsx`
- Modify: `apps/electron/src/renderer/components/ResetConfirmationDialog.tsx`

**Step 1: Write the failing test**

Create: `apps/electron/src/renderer/components/ui/__tests__/common-dialog-i18n.test.ts`

```ts
import { describe, expect, it } from 'bun:test'
import { getRenameDialogLabels } from '../rename-dialog'

describe('common dialog labels', () => {
  it('returns localized labels', () => {
    const t = (key: string) => ({
      'common:actions.cancel': '取消',
      'common:actions.save': '保存',
      'common:rename.title': '重命名',
    } as Record<string, string>)[key] || key

    const labels = getRenameDialogLabels(t)
    expect(labels.title).toBe('重命名')
    expect(labels.cancel).toBe('取消')
    expect(labels.save).toBe('保存')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `bun test apps/electron/src/renderer/components/ui/__tests__/common-dialog-i18n.test.ts`
Expected: FAIL.

**Step 3: Implement minimal code**

- Add `getRenameDialogLabels(t)` helper in `rename-dialog.tsx`, replace hardcoded strings with `t()`.
- Replace hardcoded strings in `ResetConfirmationDialog.tsx` with `t()`.
- Add keys to `common.json` (en/zh-CN):
  - `actions.cancel`, `actions.save`, `actions.done`, `actions.delete`, `actions.reset`
  - `rename.title`, `rename.placeholder`
  - `reset.title`, `reset.description`, `reset.confirm`

**Step 4: Run test to verify it passes**

Run: `bun test apps/electron/src/renderer/components/ui/__tests__/common-dialog-i18n.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/shared/locales/en/common.json \
  packages/shared/locales/zh-CN/common.json \
  apps/electron/src/renderer/components/ui/rename-dialog.tsx \
  apps/electron/src/renderer/components/ResetConfirmationDialog.tsx \
  apps/electron/src/renderer/components/ui/__tests__/common-dialog-i18n.test.ts
git commit -m "Localize common dialogs"
```

---

### Task 2: Onboarding (Welcome / API Setup / Credentials / Completion / Git Bash / Reauth)

**Files:**
- Modify: `packages/shared/locales/en/onboarding.json`
- Modify: `packages/shared/locales/zh-CN/onboarding.json`
- Modify: `apps/electron/src/renderer/components/onboarding/WelcomeStep.tsx`
- Modify: `apps/electron/src/renderer/components/onboarding/APISetupStep.tsx`
- Modify: `apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx`
- Modify: `apps/electron/src/renderer/components/onboarding/CompletionStep.tsx`
- Modify: `apps/electron/src/renderer/components/onboarding/GitBashWarning.tsx`
- Modify: `apps/electron/src/renderer/components/onboarding/ReauthScreen.tsx`

**Step 1: Write the failing test**

Create: `apps/electron/src/renderer/components/onboarding/__tests__/onboarding-i18n.test.ts`

```ts
import { describe, expect, it } from 'bun:test'
import { getWelcomeLabels } from '../WelcomeStep'

describe('onboarding i18n', () => {
  it('returns localized welcome labels', () => {
    const t = (key: string) => ({
      'onboarding:welcome.title': '欢迎使用 Craft Agents',
      'onboarding:welcome.cta': '开始',
    } as Record<string, string>)[key] || key
    const labels = getWelcomeLabels(t)
    expect(labels.title).toBe('欢迎使用 Craft Agents')
    expect(labels.cta).toBe('开始')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `bun test apps/electron/src/renderer/components/onboarding/__tests__/onboarding-i18n.test.ts`
Expected: FAIL.

**Step 3: Implement minimal code**

- Add helper functions (`getWelcomeLabels`, `getApiSetupLabels`, `getCredentialLabels`, `getCompletionLabels`, `getGitBashLabels`).
- Replace all hardcoded onboarding strings with `t()` and map to `onboarding.json`.

**Step 4: Run test to verify it passes**

Run: `bun test apps/electron/src/renderer/components/onboarding/__tests__/onboarding-i18n.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/shared/locales/en/onboarding.json \
  packages/shared/locales/zh-CN/onboarding.json \
  apps/electron/src/renderer/components/onboarding/WelcomeStep.tsx \
  apps/electron/src/renderer/components/onboarding/APISetupStep.tsx \
  apps/electron/src/renderer/components/onboarding/CredentialsStep.tsx \
  apps/electron/src/renderer/components/onboarding/CompletionStep.tsx \
  apps/electron/src/renderer/components/onboarding/GitBashWarning.tsx \
  apps/electron/src/renderer/components/onboarding/__tests__/onboarding-i18n.test.ts
git commit -m "Localize onboarding flow"
```

---

### Task 3: Settings pages (App Settings + Notifications + Appearance)

**Status:** ✅ Completed in `36d8e7e settings i18n` (no action needed; do not execute)

---

### Task 4: Sources UI (Add Source modal + menus + empty state)

**Files:**
- Modify: `packages/shared/locales/en/common.json`
- Modify: `packages/shared/locales/zh-CN/common.json`
- Modify: `apps/electron/src/renderer/components/ui/EditPopover.tsx`
- Modify: `apps/electron/src/renderer/components/app-shell/SourcesListPanel.tsx`
- Modify: `apps/electron/src/renderer/components/app-shell/SidebarMenu.tsx`

**Step 1: Write the failing test**

Create: `apps/electron/src/renderer/components/app-shell/__tests__/sources-i18n.test.tsx`

```tsx
import { describe, expect, it } from 'bun:test'
import { getSourcesLabels } from '../SourcesListPanel'

describe('sources i18n labels', () => {
  it('returns localized labels', () => {
    const t = (key: string) => ({
      'common:sources.add': 'Add Source Localized',
      'common:sources.emptyTitle': 'Empty Localized',
    } as Record<string, string>)[key] || key

    const labels = getSourcesLabels(t)
    expect(labels.add).toBe('Add Source Localized')
    expect(labels.emptyTitle).toBe('Empty Localized')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `bun test apps/electron/src/renderer/components/app-shell/__tests__/sources-i18n.test.tsx`
Expected: FAIL (function not found / not localized).

**Step 3: Implement minimal code**

- Add a `getSourcesLabels(t)` helper to `SourcesListPanel.tsx`.
- Replace hardcoded strings in `SourcesListPanel.tsx` and `SidebarMenu.tsx` with `t()`.
- In `EditPopover.tsx`, replace `EDIT_CONFIGS` strings with `t()` keys under `common:sources.*`.
- Add keys to `common.json` (en/zh-CN):
  - `sources.add`, `sources.learnMore`, `sources.emptyTitle`, `sources.emptyDescription`
  - `sources.addApi.title`, `sources.addApi.placeholder`, `sources.addApi.example`
  - `sources.addMcp.title`, `sources.addMcp.placeholder`, `sources.addMcp.example`
  - `sources.addLocal.title`, `sources.addLocal.placeholder`, `sources.addLocal.example`
  - `sources.addGeneric.title`, `sources.addGeneric.placeholder`, `sources.addGeneric.example`

**Step 4: Run test to verify it passes**

Run: `bun test apps/electron/src/renderer/components/app-shell/__tests__/sources-i18n.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/shared/locales/en/common.json \
  packages/shared/locales/zh-CN/common.json \
  apps/electron/src/renderer/components/ui/EditPopover.tsx \
  apps/electron/src/renderer/components/app-shell/SourcesListPanel.tsx \
  apps/electron/src/renderer/components/app-shell/SidebarMenu.tsx \
  apps/electron/src/renderer/components/app-shell/__tests__/sources-i18n.test.tsx
git commit -m "Localize source add flows"
```

---

### Task 5: Workspace creation flow (Add Workspace / My Workspace)

**Files:**
- Modify: `packages/shared/locales/en/settings.json`
- Modify: `packages/shared/locales/zh-CN/settings.json`
- Modify: `apps/electron/src/renderer/components/app-shell/WorkspaceSwitcher.tsx`
- Modify: `apps/electron/src/renderer/components/workspace/AddWorkspaceStep_Choice.tsx`
- Modify: `apps/electron/src/renderer/components/workspace/AddWorkspaceStep_CreateNew.tsx`
- Modify: `apps/electron/src/renderer/components/workspace/AddWorkspaceStep_OpenFolder.tsx`
- Modify: `apps/electron/src/main/onboarding.ts`

**Step 1: Write the failing test**

Create: `apps/electron/src/renderer/components/workspace/__tests__/workspace-i18n.test.ts`

```ts
import { describe, expect, it } from 'bun:test'
import { getWorkspaceLabels } from '../AddWorkspaceStep_Choice'

describe('workspace i18n labels', () => {
  it('returns localized labels', () => {
    const t = (key: string) => ({
      'settings:workspace.add.title': 'Add Workspace Localized',
      'settings:workspace.add.createNew': 'Create New Localized',
    } as Record<string, string>)[key] || key
    const labels = getWorkspaceLabels(t)
    expect(labels.title).toBe('Add Workspace Localized')
    expect(labels.createNew).toBe('Create New Localized')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `bun test apps/electron/src/renderer/components/workspace/__tests__/workspace-i18n.test.ts`
Expected: FAIL.

**Step 3: Implement minimal code**

- Add `getWorkspaceLabels(t)` helpers to the workspace step components.
- Replace hardcoded labels in workspace UI.
- Localize default workspace name in `apps/electron/src/main/onboarding.ts` using i18n config (use `getAppLanguage()` to resolve locale and map to localized default name key).
- Add keys to `settings.json` (en/zh-CN):
  - `workspace.add.title`, `workspace.add.createNew`, `workspace.add.openFolder`
  - `workspace.add.createTitle`, `workspace.add.openTitle`
  - `workspace.add.placeholder`
  - `workspace.defaultName`

**Step 4: Run test to verify it passes**

Run: `bun test apps/electron/src/renderer/components/workspace/__tests__/workspace-i18n.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/shared/locales/en/settings.json \
  packages/shared/locales/zh-CN/settings.json \
  apps/electron/src/renderer/components/app-shell/WorkspaceSwitcher.tsx \
  apps/electron/src/renderer/components/workspace/AddWorkspaceStep_Choice.tsx \
  apps/electron/src/renderer/components/workspace/AddWorkspaceStep_CreateNew.tsx \
  apps/electron/src/renderer/components/workspace/AddWorkspaceStep_OpenFolder.tsx \
  apps/electron/src/main/onboarding.ts \
  apps/electron/src/renderer/components/workspace/__tests__/workspace-i18n.test.ts
git commit -m "Localize workspace creation flow"
```

---

### Task 6: Status configuration + defaults

**Status:** ✅ Default labels completed in `e0dc88a status defaults`.

**Remaining:** UI strings in `EditPopover.tsx` and `SidebarMenu.tsx` are still English. Fold these into Task 4 (Sources UI) if you prefer, or handle as a tiny follow-up task.

---

### Task 7: Chat UI (input + headings)

**Files:**
- Modify: `packages/shared/locales/en/chat.json`
- Modify: `packages/shared/locales/zh-CN/chat.json`
- Modify: `apps/electron/src/renderer/components/app-shell/input/FreeFormInput.tsx`
- Modify: `apps/electron/src/renderer/pages/ChatPage.tsx`
- Modify: `apps/electron/src/renderer/components/app-shell/ChatDisplay.tsx`

**Step 1: Write the failing test**

Create: `apps/electron/src/renderer/pages/__tests__/chat-i18n.test.ts`

```ts
import { describe, expect, it } from 'bun:test'
import { getChatLabels } from '../ChatPage'

describe('chat labels', () => {
  it('returns localized labels', () => {
    const t = (key: string) => ({
      'chat:panel.title': 'Chat Localized',
    } as Record<string, string>)[key] || key
    const labels = getChatLabels(t)
    expect(labels.title).toBe('Chat Localized')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `bun test apps/electron/src/renderer/pages/__tests__/chat-i18n.test.ts`
Expected: FAIL.

**Step 3: Implement minimal code**

- Add `getChatLabels(t)` helpers for `ChatPage` and `FreeFormInput` labels.
- Replace hardcoded strings in `ChatPage.tsx`, `FreeFormInput.tsx`, and `ChatDisplay.tsx`:
  - Chat panel header labels and menu actions (rename, copy link, open in new window).
  - Input area labels (attach files, choose sources, search sources, model/tooltips).
  - Working directory menu labels (“Working directory”, “Choose working directory”, filter placeholder).
  - Chat empty/placeholder text in `ChatDisplay` (“What would you like to change?”, “Thinking...” etc.).
- Add i18n keys in `chat.json` (en/zh-CN) for all labels above.

**Step 4: Run test to verify it passes**

Run: `bun test apps/electron/src/renderer/pages/__tests__/chat-i18n.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/shared/locales/en/chat.json \
  packages/shared/locales/zh-CN/chat.json \
  apps/electron/src/renderer/components/app-shell/input/FreeFormInput.tsx \
  apps/electron/src/renderer/pages/ChatPage.tsx \
  apps/electron/src/renderer/components/app-shell/ChatDisplay.tsx \
  apps/electron/src/renderer/pages/__tests__/chat-i18n.test.ts
git commit -m "Localize chat input and headers"
```

---

### Task 8: Toasts, banners, inline errors (Session list + auth banners)

**Files:**
- Modify: `packages/shared/locales/en/common.json`
- Modify: `packages/shared/locales/zh-CN/common.json`
- Modify: `apps/electron/src/renderer/components/app-shell/SessionList.tsx`
- Modify: `apps/electron/src/renderer/components/app-shell/SetupAuthBanner.tsx`

**Step 1: Write the failing test**

Create: `apps/electron/src/renderer/components/app-shell/__tests__/toast-i18n.test.ts`

```ts
import { describe, expect, it } from 'bun:test'
import { getToastLabels } from '../SessionList'

describe('toast labels', () => {
  it('returns localized toast labels', () => {
    const t = (key: string) => ({
      'common:toast.sessionDeleted': '对话已删除',
    } as Record<string, string>)[key] || key
    const labels = getToastLabels(t)
    expect(labels.sessionDeleted).toBe('对话已删除')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `bun test apps/electron/src/renderer/components/app-shell/__tests__/toast-i18n.test.ts`
Expected: FAIL.

**Step 3: Implement minimal code**

- Add `getToastLabels(t)` in `SessionList.tsx` and use `t()` in toast calls.
- Replace hardcoded banner text in `SetupAuthBanner.tsx` with `t()`.
- Add keys in `common.json` for toast/banner strings.

**Step 4: Run test to verify it passes**

Run: `bun test apps/electron/src/renderer/components/app-shell/__tests__/toast-i18n.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add packages/shared/locales/en/common.json \
  packages/shared/locales/zh-CN/common.json \
  apps/electron/src/renderer/components/app-shell/SessionList.tsx \
  apps/electron/src/renderer/components/app-shell/SetupAuthBanner.tsx \
  apps/electron/src/renderer/components/app-shell/__tests__/toast-i18n.test.ts
git commit -m "Localize session toasts and auth banner"
```

---

### Task 9: Main process i18n (menus, dialogs, context menus)

**Status:** ✅ Base i18n loader is done (`f8021f4 main i18n`).

**Files:**
- Modify: `apps/electron/src/main/menu.ts`
- Modify: `apps/electron/src/shared/menu-schema.ts`
- Modify: `apps/electron/src/main/window-manager.ts`
- Modify: `apps/electron/src/main/ipc.ts`
- Modify: `packages/shared/locales/en/menu.json`
- Modify: `packages/shared/locales/zh-CN/menu.json`
- Modify: `packages/shared/locales/en/dialogs.json`
- Modify: `packages/shared/locales/zh-CN/dialogs.json`

**Step 1: Write the failing test**

Create: `apps/electron/src/main/__tests__/menu-i18n.test.ts`

```ts
import { describe, expect, it } from 'bun:test'
import { getMenuLabels } from '../menu'

describe('menu labels', () => {
  it('returns localized menu labels', () => {
    const t = (key: string) => ({
      'menu:file': '文件',
      'menu:newChat': '新建对话',
    } as Record<string, string>)[key] || key
    const labels = getMenuLabels(t)
    expect(labels.file).toBe('文件')
    expect(labels.newChat).toBe('新建对话')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `bun test apps/electron/src/main/__tests__/menu-i18n.test.ts`
Expected: FAIL.

**Step 3: Implement minimal code**

- Wire `getMainI18n()` into `menu.ts` and wrap all menu labels with `t()`.
- Update `menu-schema.ts` labels to be key-based or generated via `t()`.
- Localize context menu labels in `window-manager.ts`.
- Localize dialog copy in `ipc.ts` using `dialogs.json` keys.
- Add/extend `menu.json` and `dialogs.json` keys (en/zh-CN).

**Step 4: Run test to verify it passes**

Run: `bun test apps/electron/src/main/__tests__/menu-i18n.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
  apps/electron/src/shared/menu-schema.ts \
  apps/electron/src/main/window-manager.ts \
  apps/electron/src/main/ipc.ts \
  packages/shared/locales/en/menu.json \
  packages/shared/locales/zh-CN/menu.json \
  packages/shared/locales/en/dialogs.json \
  packages/shared/locales/zh-CN/dialogs.json \
  apps/electron/src/main/__tests__/menu-i18n.test.ts
```

---

### Task 10: Sidebar + misc UI strings (navigation, menus, empty states)

**Files:**
- Modify: `packages/shared/locales/en/common.json`
- Modify: `packages/shared/locales/zh-CN/common.json`
- Modify: `apps/electron/src/renderer/components/app-shell/SidebarMenu.tsx`
- Modify: `apps/electron/src/renderer/components/app-shell/SkillMenu.tsx`
- Modify: `apps/electron/src/renderer/components/app-shell/MainContentPanel.tsx`
- Modify: `apps/electron/src/renderer/components/app-shell/input/structured/PermissionRequest.tsx`

**Step 1: Write the failing test**

Create: `apps/electron/src/renderer/components/app-shell/__tests__/sidebar-i18n.test.tsx`

```tsx
import { describe, expect, it } from 'bun:test'
import { getSidebarLabels } from '../SidebarMenu'

describe('sidebar labels', () => {
  it('returns localized labels', () => {
    const t = (key: string) => ({
      'common:sidebar.addSource': '添加来源',
    } as Record<string, string>)[key] || key
    const labels = getSidebarLabels(t)
    expect(labels.addSource).toBe('添加来源')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `bun test apps/electron/src/renderer/components/app-shell/__tests__/sidebar-i18n.test.tsx`
Expected: FAIL.

**Step 3: Implement minimal code**

- Add `getSidebarLabels(t)` helper in `SidebarMenu.tsx` and replace hardcoded menu labels with `t()`.
- Localize `SkillMenu.tsx` context actions (Open in New Window, Show in Finder, Delete Skill).
- Localize `MainContentPanel.tsx` empty state copy (No sources/skills/conversation).
- Localize `PermissionRequest.tsx` labels (Permission Required, Always Allow, Approve, Deny, etc.).
- Add new `common.sidebar.*` and `common.permission.*` keys (en/zh-CN).

**Step 4: Run test to verify it passes**

Run: `bun test apps/electron/src/renderer/components/app-shell/__tests__/sidebar-i18n.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
  packages/shared/locales/zh-CN/common.json \
  apps/electron/src/renderer/components/app-shell/SidebarMenu.tsx \
  apps/electron/src/renderer/components/app-shell/SkillMenu.tsx \
  apps/electron/src/renderer/components/app-shell/MainContentPanel.tsx \
  apps/electron/src/renderer/components/app-shell/input/structured/PermissionRequest.tsx \
  apps/electron/src/renderer/components/app-shell/__tests__/sidebar-i18n.test.tsx
```

---

### Task 11: Final verification

**Step 1: Run renderer tests**

Run:
- `bun test apps/electron/src/renderer/components/ui/__tests__/common-dialog-i18n.test.ts`
- `bun test apps/electron/src/renderer/components/onboarding/__tests__/onboarding-i18n.test.ts`
- `bun test apps/electron/src/renderer/pages/__tests__/chat-i18n.test.ts`
- `bun test apps/electron/src/renderer/components/app-shell/__tests__/sources-i18n.test.tsx`
- `bun test apps/electron/src/renderer/components/workspace/__tests__/workspace-i18n.test.ts`
- `bun test apps/electron/src/renderer/components/app-shell/__tests__/toast-i18n.test.ts`
- `bun test packages/shared/src/statuses/__tests__/status-defaults-i18n.test.ts`

**Step 2: Manual smoke test**

Run: `bun run electron:start`

Verify:
- Onboarding all steps fully translated
- Settings page fully translated (non-language sections too)
- Sidebar, sources, statuses, chat UI translated
- Menus and context menus translated
- Dialogs/toasts/banners translated

---

Plan complete.
