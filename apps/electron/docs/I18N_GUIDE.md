# Craft Agents i18n 开发规范

## 分支架构（重要！）

本项目使用**三分支并行**策略管理国际化（i18n）工作：

```
┌─────────────────────────────────────────────────────────────────┐
│                        main 分支                                 │
│                     （主线代码，不直接修改）                        │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  i18n-pure    │    │  feat/runtime-   │    │ integration/i18n-│
│  分支         │    │  i18n-injection- │    │ pilot-check      │
│               │    │  pilot 分支      │    │ 分支             │
├───────────────┤    ├──────────────────┤    ├──────────────────┤
│ • 资源文件     │    │ • 技术代码        │    │ • 合并观察分支    │
│ • 翻译 JSON   │    │ • runtime-i18n.ts│    │ • main+pilot+pure │
│ • 静态内容    │    │ • PanelHeader    │    │ • 用于验证结果    │
│               │    │ • 技术实现        │    │                  │
└───────────────┘    └──────────────────┘    └──────────────────┘
```

### 各分支职责

#### 1. `i18n-pure` 分支 —— 资源文件专用
- **存放内容**：所有翻译字符串（JSON 资源文件）
- **路径**：`packages/shared/locales/{en,zh-CN}/*.json`
- **修改原则**：
  - ✅ 添加新的翻译键值对
  - ✅ 修改现有翻译
  - ✅ 添加新的语言文件
  - ❌ 不修改任何代码文件
- **合并目标**：最终会合并到 main 分支作为标准资源

#### 2. `feat/runtime-i18n-injection-pilot` 分支 —— 技术实现专用
- **存放内容**：运行时 i18n 技术代码
- **核心文件**：
  - `apps/electron/src/renderer/lib/runtime-i18n.ts`
  - `apps/electron/src/renderer/components/app-shell/PanelHeader.tsx`
  - `apps/electron/src/renderer/main.tsx`
- **修改原则**：
  - ✅ 添加技术实现（如 MutationObserver、路由白名单）
  - ✅ 修复技术 bug
  - ⚠️ **谨慎添加** `RUNTIME_LITERAL_OVERRIDES` 条目（见下文）
  - ❌ 不添加大量翻译字符串
- **设计目标**：尽量简单，避免与 main 分支产生冲突
- **生命周期**：pilot 阶段临时方案，最终可能部分代码合并到 main

#### 3. `integration/i18n-pilot-check` 分支 —— 合并观察专用
- **用途**：查看最终效果（main + pilot + pure）
- **工作方式**：
  - 合并 main 分支最新代码
  - 合并 pilot 分支技术实现
  - 合并 pure 分支资源文件
- **修改原则**：
  - ❌ **禁止直接修改**
  - ✅ 只用于验证和测试
  - ✅ 冲突解决在各自源分支完成

---

## POC 标准作业（强制执行）

> 本节为 i18n 落地的**标准作业流程**。后续所有 i18n 变更必须遵循。

### 0) 目标
- 资源与机制彻底解耦：
  - `i18n-pure` 只承载翻译资产
  - `feat/runtime-i18n-injection-pilot` 只承载 runtime 机制
  - `integration/i18n-pilot-check` 只承载验收合流

### 1) 分支作业顺序（固定）
1. **先改 pure**（`i18n-pure`）
   - 修改 `packages/shared/locales/{en,zh-CN}/*.json`
   - 包含 `runtimeFallback.literalMap/substringMap` 的键值补齐
2. **再改 injection**（`feat/runtime-i18n-injection-pilot`）
   - 仅修改 runtime 机制代码（如 `runtime-i18n.ts`、loader、observer、normalize）
   - 不承载翻译资产编辑
3. **最后合流 integration**（`integration/i18n-pilot-check`）
   - 先 merge `i18n-pure`，再 merge `feat/runtime-i18n-injection-pilot`
   - 仅做冲突解算与验收，不做临时功能改造

### 2) 变更归属判定（必须遵守）
- **文本值变化**（翻译新增/修正）→ `i18n-pure`
- **匹配机制变化**（DOM 扫描、属性翻译、路由守卫、加载路径）→ `injection`
- **验收分支发现问题**：
  - 资源问题回流 `pure`
  - 机制问题回流 `injection`
  - 禁止在 `integration` 长留补丁

### 3) 验收门禁（全部通过才算完成）
1. **分支对齐检查**
   - `integration` 的 locale 资产必须与 `i18n-pure` 对齐
2. **关键字符串覆盖检查**（示例）
   - `Search commands...`
   - `Filter statuses...`
   - `Press ⌘/Ctrl + B to toggle the sidebar`
   - `Press ⌘/Ctrl + . for focus mode`
3. **自动化验证**
   - `bun test apps/electron/src/renderer/lib/__tests__/runtime-i18n-loader.test.ts apps/electron/src/renderer/lib/__tests__/runtime-i18n.test.ts`
   - `bun run --cwd apps/electron build:renderer`
4. **人工验收点位**
   - 权限模式菜单顶部搜索框 placeholder
   - Todo 状态菜单顶部过滤框 placeholder

### 4) 事故复盘经验（必须记住）
- 仅补 locale 不一定生效：若 runtime 只翻译新增节点本身、未递归翻译后代元素属性，会漏掉 popover/cmdk 中的嵌套 `input placeholder`。
- 因此，遇到“资源已存在但界面仍英文”，应优先排查 runtime 机制是否覆盖到**后代元素属性**。

### 5) 禁止事项
- ❌ 在 `integration` 直接做长期修复
- ❌ 将静态 UI 文案持续堆到 runtime 代码里
- ❌ 跳过 pure/injection 分责，直接在单分支混改

---

## 如何添加翻译（关键决策树）

```
发现需要翻译的文本
        │
        ▼
是否存在对应的资源文件键？
（检查 packages/shared/locales/zh-CN/*.json）
        │
    ┌───┴───┐
    │       │
   是      否
    │       │
    ▼       ▼
资源已有   资源缺失
    │       │
    ▼       ▼
无需修改   能否用现有 i18n 框架？
           （React Context / Hook）
        ┌───┴───┐
        │       │
       是      否
        │       │
        ▼       ▼
    使用框架    必须是 runtime
    添加翻译    i18n 覆盖？
                    │
                ┌───┴───┐
                │       │
               是      否
                │       │
                ▼       ▼
            添加到      先尝试
            runtime-   其他方案
            i18n.ts    （如组件修改）
```

### 决策原则

1. **优先使用资源文件**（i18n-pure 分支）
   - 适用于：菜单项、按钮标签、提示文本等静态内容
   - 示例：`common.json` 中的 `"menu.share": "分享"`

2. **次选 React i18n 框架**
   - 适用于：组件内部动态文本
   - 如果项目已有 i18n provider，优先使用

3. **最后考虑 runtime-i18n.ts**（pilot 分支）
   - 适用于：无法通过上述两种方式处理的硬编码文本
   - 必须是运行时动态生成的文本
   - 示例：从配置读取的动态状态标签

---

## runtime-i18n.ts 使用规范

### 什么是 RUNTIME_LITERAL_OVERRIDES？

`RUNTIME_LITERAL_OVERRIDES` 是 pilot 方案的**兜底机制**，用于覆盖那些在运行时才能确定的英文文本。

### 当前约束（2026-02）

- `RUNTIME_LITERAL_OVERRIDES` 默认应保持为空。
- 翻译归档统一在 `packages/shared/locales/{en,zh-CN}/*.json`。
- 迁移期映射可放在 `common.json` 的 `runtimeFallback` 下作为可追溯清单。
- 若必须回填 runtime 条目，必须满足：
  1. 该文本无法通过 key-based 资源获取；
  2. 已记录来源与移除条件；
  3. 不得批量引入静态 UI 文案。

### 什么时候可以添加？

✅ **可以添加的情况**：
1. 文本来自外部配置（如状态系统的动态标签）
2. 第三方库返回的英文文本
3. 运行时动态生成的、无法提前知道的文本

❌ **不应该添加的情况**：
1. 纯静态 UI 文本（应该放资源文件）
2. 已经有资源文件对应的键
3. 可以修改源代码使用翻译框架的地方
4. 仅因历史遗留而临时“凑覆盖率”的批量文案

### 添加流程

```typescript
// runtime-i18n.ts 中的 RUNTIME_LITERAL_OVERRIDES

const RUNTIME_LITERAL_OVERRIDES: Record<string, string> = {
  // ✅ 正确示例：动态状态标签
  'Backlog': '待办事项',
  'In Progress': '进行中',
  
  // ❌ 错误示例：静态菜单项（应该放资源文件）
  // 'Share': '分享',  // 不要在这里加！
}
```

### 检查清单

添加新条目前，请确认：

- [ ] 资源文件中确实没有这个翻译
- [ ] 无法通过修改组件代码使用翻译框架
- [ ] 这是运行时动态生成的文本
- [ ] 已记录添加原因（建议加注释）

---

## 开发工作流程

### 场景 1：添加新的菜单翻译

```bash
# 1. 切到资源文件分支
git checkout i18n-pure

# 2. 修改资源文件
# 编辑 packages/shared/locales/zh-CN/menu.json

# 3. 提交并推送
git add packages/shared/locales/zh-CN/menu.json
git commit -m "feat: add context menu translations"
git push origin i18n-pure
```

### 场景 2：修复 runtime i18n 技术 bug

```bash
# 1. 切到 pilot 分支
git checkout feat/runtime-i18n-injection-pilot

# 2. 修改技术代码
# 编辑 apps/electron/src/renderer/lib/runtime-i18n.ts

# 3. 提交并推送
git add apps/electron/src/renderer/lib/runtime-i18n.ts
git commit -m "fix: resolve MutationObserver memory leak"
git push origin feat/runtime-i18n-injection-pilot
```

### 场景 3：验证整体效果

```bash
# 1. 切到 check 分支
git checkout integration/i18n-pilot-check

# 2. 合并最新代码
git merge main
git merge feat/runtime-i18n-injection-pilot
git merge i18n-pure

# 3. 解决冲突（如有），然后测试
# 不要直接修改代码！

# 4. 如果发现需要修改的内容：
# - 资源问题 → 切到 i18n-pure 分支修改
# - 技术问题 → 切到 pilot 分支修改
```

---

## 常见错误

### ❌ 错误 1：在 check 分支直接修改

```bash
# 不要这样做！
git checkout integration/i18n-pilot-check
# 编辑文件...
git commit -m "add translations"  # ❌ 错误！
```

**后果**：check 分支的修改会在下次合并时被覆盖。

### ❌ 错误 2：把静态翻译都放到 runtime-i18n.ts

```typescript
// runtime-i18n.ts
const RUNTIME_LITERAL_OVERRIDES = {
  // 不要这样做！
  'Share': '分享',           // ❌ 这是静态文本
  'Delete': '删除',          // ❌ 应该放资源文件
  'Open in New Window': '...' // ❌ 应该放资源文件
}
```

**后果**：pilot 分支变得臃肿，难以合并到 main。

### ❌ 错误 3：重复添加

```typescript
// runtime-i18n.ts
const RUNTIME_LITERAL_OVERRIDES = {
  'Status': '状态',  // 第 1 次
  // ... 其他条目 ...
  'Status': '状态',  // ❌ 重复！会导致 JS 错误
}
```

**后果**：JavaScript 对象字面量不能有重复键，会报错。

---

## 文件对应关系速查

| 内容类型 | 资源文件位置 | 代码位置 |
|---------|------------|---------|
| 菜单项 | `packages/shared/locales/zh-CN/menu.json` | 组件使用 t('menu.xxx') |
| 通用文本 | `packages/shared/locales/zh-CN/common.json` | 组件使用 t('common.xxx') |
| 设置页面 | `packages/shared/locales/zh-CN/settings.json` | SettingsPage.tsx |
| 对话框 | `packages/shared/locales/zh-CN/dialogs.json` | 各对话框组件 |
| 聊天界面 | `packages/shared/locales/zh-CN/chat.json` | Chat 相关组件 |
| 动态状态标签 | N/A（运行时） | `runtime-i18n.ts` |

---

## 联系与反馈

如有疑问或需要调整此规范，请：
1. 在此文档添加注释
2. 与维护者讨论
3. 更新此文档

---

**最后更新**：2026-02-13
**维护者**：Craft Agents 团队
