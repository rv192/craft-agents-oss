# Runtime-i18n.ts 翻译迁移记录

## 迁移来源
文件：`apps/electron/src/renderer/lib/runtime-i18n.ts`
条目：96 个翻译条目

## 迁移目标
按类别归入以下资源文件：

### 1. settings.json
**Settings 页面专用翻译**
- 'Notifications and updates' → '通知与更新' ✓ 已存在（sections.notifications.title）
- 'Interface' → '界面' ✓ 已存在（未直接对应，但 navigator.items.appearance.label 覆盖）
- 'General' → '常规' ✓ 已存在（navigator.items.app.label）
- 'List Navigation' → '列表导航' ✓ 新增
- 'Chat Input' → '聊天输入' ✓ 新增（input.pageTitle 覆盖）
- 'Default Sources' → '默认来源' ✓ 新增
- 'Settings for new chats...' → '用于新聊天的设置...' ✓ 新增
- 'API connection for new chats' → '新聊天的 API 连接' ✓ 已存在（workspace.defaultModel.description）
- 'Workspace Overrides' → '工作区覆盖' ✓ 已存在（navigator.items.workspace.description）
- 'Override default settings per workspace.' → '按工作区覆盖默认设置。' ✓ 新增
- 'Using defaults' → '使用默认值' ✓ 新增
- 'Use default' → '使用默认值' ✓ 新增
- 'Inherit from app settings' → '继承应用设置' ✓ 新增
- 'Power' → '电源' ✓ 新增
- 'Keep screen awake' → '保持屏幕常亮' ✓ 新增
- 'Model' → '模型' ✓ 已存在（workspace.model.title）
- 'Connections' → '连接' ✓ 已存在（sections.apiConnection.title）
- 'Manage your AI provider connections.' → '管理你的 AI 提供商连接。' ✓ 已存在（sections.apiConnection.description）
- 'Custom Anthropic-Compatible' → '自定义 Anthropic 兼容连接' ✓ 新增
- 'Re-authenticate' → '重新认证' ✓ 新增
- 'Validate Connection' → '验证连接' ✓ 新增
- 'Add Connection' → '添加连接' ✓ 新增
- '+ Add Connection' → '+ 添加连接' ✓ 新增
- 'Ask then edit' → '询问后编辑' ✓ 已存在（workspace.permissions.modeOptions.ask.label）
- 'Ask to Edit' → '询问后编辑' ✓ 已存在
- 'Read-only, no changes allowed' → '只读，不允许更改' ✓ 已存在（workspace.permissions.modeOptions.safe.description）
- 'Prompts before making edits' → '编辑前提示确认' ✓ 已存在（workspace.permissions.modeOptions.ask.description）
- 'Full autonomous execution' → '完全自动执行' ✓ 已存在（workspace.permissions.modeOptions.allowAll.description）
- 'Explore mode rules' → '探索模式规则' ✓ 已存在（permissions.about.paragraph1）
- 'Keyboard shortcuts' → '键盘快捷键' ✓ 已存在（sections.shortcuts.title）
- 'Quit' → '退出' ✓ 已在 menu.json
- 'Quit the application' → '退出应用程序' ✓ 新增
- 'Toggle Theme' → '切换主题' ✓ 新增
- 'Focus Sidebar' → '聚焦侧边栏' ✓ 已存在（shortcuts.sections.global.focusSidebar）
- 'Focus Session List' → '聚焦会话列表' ✓ 已存在（shortcuts.sections.global.focusSessionList）
- 'Focus Chat' → '聚焦聊天' ✓ 新增
- 'Focus Next Zone' → '聚焦下一区域' ✓ 已存在（shortcuts.sections.navigation.moveNextZone）
- 'Select All Sessions' → '选择所有会话' ✓ 新增
- 'Clear Selection' → '清除选择' ✓ 新增
- 'Stop Processing' → '停止处理' ✓ 新增
- 'Cycle Permission Mode' → '切换权限模式' ✓ 已存在（shortcuts.sections.navigation.cyclePermissionMode）
- 'Next Search Match' → '下一个搜索匹配' ✓ 新增
- 'Previous Search Match' → '上一个搜索匹配' ✓ 新增
- 'Open context menu' → '打开上下文菜单' ✓ 新增
- 'Go Back' → '返回' ✓ 已在 menu.json
- 'Go Forward' → '前进' ✓ 已在 menu.json
- 'Name' → '名称' ✓ 已在 common.json
- 'Icon' → '图标' ✓ 已在 common.json
- 'working directory' → '工作目录' ✓ 已存在（workspace.advanced.workingDirectory.label）
- 'spell check' → '拼写检查' ✓ 已存在（settings.input.typing.spellCheck.label）
- 'Send key' → '发送键' ✓ 已在 common.json（chatInput.sendKey）
- 'Manage session labels' → '管理会话标签' ✓ 已在 common.json（common.manageSessionLabels）
- 'Language' → '语言' ✓ 已在 settings.json
- 'Display language for the app interface.' → '应用界面的显示语言。' ✓ 已存在（settings.sections.language.description）
- 'Follow System' → '跟随系统' ✓ 新增
- 'Notes' → '备注' ✓ 已在 settings.json（preferences.notes.title）
- 'Connection icons' → '连接图标' ✓ 新增
- 'Show provider icons...' → '在会话列表和模型选择器中显示提供商图标' ✓ 新增
- 'Rich tool descriptions' → '丰富工具描述' ✓ 新增
- 'Sources auto-enabled...' → '新会话自动启用的来源' ✓ 新增
- 'No sources configured...' → '此工作区尚未配置来源。' ✓ 已在 common.json

### 2. common.json（需要添加的条目）
**通用翻译**
- 'thinking' → '思考' ✓ 新增到 navigation 或 workspace.model
- 'Model,thinking,connections' → '模型、思考、连接' ✓ 新增
- 'Ask Then Edit' → '询问后编辑' ✓ 已存在（permissions.modeOptions.ask.label）
- 'User preferences' → '用户偏好' ✓ 新增
- 'User preferencences' → '用户偏好' ✓ 新增（拼写错误版本）
- 'Name,icon,working directory' → '名称、图标、工作目录' ✓ 新增
- 'Send key,spell check' → '发送键、拼写检查' ✓ 新增
- 'Development' → '开发' ✓ 已在 labels 中
- 'Bug' → '缺陷' ✓ 已在 labels 中
- 'Automation' → '自动化' ✓ 已在 labels 中
- 'Content' → '内容' ✓ 已在 labels 中
- 'Writing' → '写作' ✓ 已在 labels 中
- 'Research' → '研究' ✓ 已在 labels 中
- 'Design' → '设计' ✓ 已在 labels 中
- 'Priority' → '优先级' ✓ 已在 labels 中
- 'Project' → '项目' ✓ 已在 labels 中
- 'Number' → '数字' ✓ 已在 labels 中
- 'String' → '字符串' ✓ 已在 labels 中
- 'Code' → '代码' ✓ 已在 labels 中
- 'Allowed' → '允许' ✓ 新增到 permissions 相关
- 'Read-only exploration...' → '只读探索。阻止写入，且从不提示。' ✓ 已在 permissions.about
- 'Promptsbefore making edits.' → '编辑前提示确认。' ✓ 新增（拼接文本）
- 'Automatic execution,no prompts.' → '自动执行，不提示。' ✓ 新增（拼接文本）

### 3. 从 RUNTIME_SUBSTRING_OVERRIDES 迁移
**这些是长文本片段，应放入合适的描述字段**
- 权限说明段落 → 已存在于 permissions.about.paragraph1

## 分析结论

**实际上，大部分翻译已经存在于资源文件中！**

runtime-i18n.ts 中真正需要迁移的新增条目只有：
1. 少数界面元素（如 'Toggle Theme', 'Focus Chat'）
2. 一些描述性文本（如 'Custom Anthropic-Compatible'）
3. 拼接文本的修正版本

**说明之前的开发者已经在资源文件中添加了翻译，但 runtime-i18n.ts 作为"兜底"机制保留了副本。**

## 建议

1. **删除 runtime-i18n.ts 中已存在于资源文件的重复条目**（约 70% 可以删除）
2. **仅保留以下条目**：
   - 动态生成的文本（如从配置读取的标签）
   - 拼接生成的文本片段
   - 第三方库返回的文本

3. **将剩余的独特翻译补充到资源文件**

这样可以大幅减少 pilot 分支的代码量，同时保证功能正常。
