---
name: agent-value-ledger
description: Automatically discover completed agent work, deduplicate it, estimate conservative time and monetary value, and maintain an auditable local Excel ledger. Use when the user asks for agent value accounting, ROI/time-saved tracking, unattended work logging, a value ledger, or a reviewable Excel record of completed AI-assisted work.
---

# Agent 价值记账

用一个本地 Excel 工作簿维护 Agent 已完成工作的价值账本。Agent 负责发现、去重、估算和更新；用户只需审阅异常项，不手工逐条填写。

## 设计边界

- 只依赖本地 Excel；不依赖 Feishu、Base、数据库或外部同步服务。
- 账本记录“可审计的时间替代价值”，不把估算金额表述成现金收入、利润或确定收益。
- 默认对外展示保守低值 `saved_minutes_low` 与 `saved_cny_low`；中、高值只放在 Excel 的参考区间。
- 只记录有明确完成态或交付物的工作。需求讨论、偏好记录、失败尝试、重复维护和只有建议没有产出的对话默认跳过。
- 不保存完整聊天、敏感原文、凭证、私密财务明细或不必要的个人数据；证据只保存短标题、日期、来源 ID、本地路径或交付物类型。

## 工作簿结构

优先使用随 Skill 提供的 `assets/agent-value-ledger-template.xlsx`。用户已有工作簿时，先读取并保持其结构；缺少必要工作表时再补建。

- `汇总`：低值主结论、周/月汇总、参考区间、低置信度和待审阅数量。全部由公式驱动。
- `任务明细`：一行一项已完成任务。时间、价值、置信度、证据和假设分列保存。
- `规则`：时薪、默认成本、分类、置信度和估算边界。改规则后应保留更新时间。
- `运行状态`：最近扫描时间、扫描窗口、已处理来源数、最近错误和待审阅说明。用来支持回扫，不依赖额外 state 文件。
- `运行日志`：仅记录短事件、结果和错误摘要，不写入完整原文。

必要字段与公式见 [references/workbook-schema.md](references/workbook-schema.md)。估算口径见 [references/estimation-policy.md](references/estimation-policy.md)，脱敏与证据边界见 [references/redaction-and-evidence.md](references/redaction-and-evidence.md)。

## 标准流程

### 1. 读取工作簿与规则

1. 找到用户指定的 `.xlsx`；未指定时在当前工作目录或配置目录寻找 `agent-value-ledger.xlsx`。
2. 先读取 `规则`、`运行状态`、`任务明细` 和 `汇总`，确认公式、字段和最近运行状态。
3. 若工作簿不存在，从模板复制到用户明确的本地路径；不要悄悄写入个人目录。
4. 读取当前日期、时区、时薪和 reporting policy。不得把 Skill 内的示例时薪当作用户实际时薪。

### 2. 扫描与回扫

1. 扫描可用的本地会话摘要、任务记录、项目日志、交付物目录和版本记录。
2. 默认回扫最近 7 个自然日，覆盖“摘要晚于会话完成时间落盘”的情况；每次都以 `任务ID`、来源 ID 和交付物指纹去重。
3. 先形成候选清单，再判断完成态。不要边扫描边直接写入 Excel。
4. 对每项候选标记 `accepted`、`skipped` 或 `needs_review`，并保留一句原因。

### 3. 形成任务记录

每条任务至少写入：任务 ID、工作日期、任务标题、短摘要、分类、来源、交付物、置信度、三档人工耗时、三档用户投入、三档审核返工、时薪、分摊成本、假设、证据状态和去重键。

计算规则：

```text
saved_minutes = max(0, manual_minutes - user_active_minutes - review_minutes)
saved_cny = saved_minutes / 60 * hourly_rate_cny - allocated_cost_cny
```

Excel 中保留公式，不把计算结果硬编码。若无法分摊订阅/API 成本，成本填 0，并在假设中写明“未分摊订阅/API成本”。

### 4. 写入前检查

- 任务 ID、去重键或交付物指纹已经存在：更新证据或跳过，不新增重复价值。
- 缺少完成证据：进入 `needs_review`，不计入主汇总。
- `saved_minutes` 小于 0：按 0 处理并记录异常。
- 低值高于中值或中值高于高值：停止写入并修正估算。
- 手工输入的“代码行数、文件数、运行时长”只能作为证据，不能直接等价成节省时间。

### 5. 更新与验证

1. 先写 `任务明细`，再让 `汇总` 公式重算。
2. 记录 `运行状态` 与 `运行日志`，包括扫描窗口、候选数、新增数、跳过数、待审阅数和错误摘要。
3. 回读新增行、汇总关键单元格和公式错误扫描结果。
4. 发生文件不可读、公式错误、来源不可访问或写入失败时，停止猜测；在 `运行日志` 标记失败和未验证范围。
5. 对用户只报告低值主结论、实际新增任务数、待审阅项和阻塞；不要输出原始 JSON 或长日志。

## 任务分类

使用 `规则` 工作表的分类表。默认分类包括：

- `simple_lookup_or_command`：简单查询、解释、一条命令
- `feishu_lookup_or_schedule`：消息、日程、任务和工作台查询
- `doc_wiki_minutes_synthesis`：文档、Wiki、纪要、翻译和结构整理
- `report_or_research`：调研、分析、方案和判断框架
- `automation_or_workflow_setup`：自动化、数据管线、批处理、部署和流程搭建
- `coding_or_debugging`：代码修改、排障、测试、发布和修复
- `local_setup_or_cleanup`：本机安装、清理、迁移和维护

## 安全与发布边界

- 脱敏后才允许进入公开仓库：移除姓名、邮箱、手机号、路径中的用户名、令牌、Base URL、内部域名、公司客户名和私有文档标题。
- 示例工作簿只能使用虚构任务和示例数字；不得从用户真实账本复制历史记录。
- GitHub 发布前执行敏感信息扫描、Excel 公式错误扫描、Skill 结构校验和公开内容复核。
- GitHub 发布不是本 Skill 的自动副作用；只有用户明确要求发布并完成审阅后才执行。

## 资源

- [references/workbook-schema.md](references/workbook-schema.md)：工作簿字段、公式和状态值。
- [references/estimation-policy.md](references/estimation-policy.md)：三档估算、价值校准和反作弊边界。
- [references/redaction-and-evidence.md](references/redaction-and-evidence.md)：脱敏、证据最小化和公开发布检查。
- [scripts/build_template.mjs](scripts/build_template.mjs)：生成或重建脱敏 Excel 模板。
