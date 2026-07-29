# 工作簿结构

## `任务明细`

一行一项任务。建议字段如下：

| 字段 | 含义 |
|---|---|
| `task_id` | 稳定的任务 ID，优先使用来源系统 ID；没有时由日期、标题和交付物指纹生成 |
| `work_date` | 任务完成日期，使用真实日期值 |
| `task_title` / `task_content` | 短标题与短摘要，不放完整聊天 |
| `task_category` | 规则表中的分类值 |
| `source_refs` / `deliverables` | 最小证据，短标题、来源 ID、本地路径或交付物类型 |
| `confidence` | `high`、`medium`、`low` |
| `manual_minutes_low/mid/high` | 人工完成同等工作所需时间 |
| `user_active_minutes_low/mid/high` | 用户主动参与时间，不含 Agent 后台运行时间 |
| `review_minutes_low/mid/high` | 用户检查、返工和验收时间 |
| `saved_minutes_low/mid/high` | 公式计算：`MAX(0,人工-用户投入-审核返工)` |
| `hourly_rate_cny` | 当前规则中的时薪；可按任务覆盖，但必须写假设 |
| `allocated_cost_cny` | 可分摊的订阅/API成本；未知时填 0 |
| `saved_cny_low/mid/high` | 公式计算：`节省分钟/60*时薪-成本` |
| `evidence_status` | `verified`、`partial`、`needs_review`、`skipped` |
| `dedupe_key` | 来源 ID、任务 ID 和交付物指纹组合 |
| `assumptions` | 估算边界、未验证项和成本口径 |
| `review_flag` | 需要用户审阅时填简短原因 |

模板预留 500 行，扩展时复制最后一行公式和格式；不要把公式写到整列。

## `汇总`

主指标必须由 `任务明细` 公式生成：已记录任务数、保守节省分钟/小时、保守金额、本周、本月、参考区间、低置信度数量、待审阅数量。主数字只引用 `saved_minutes_low` 和 `saved_cny_low`。

## `规则`

保存 `timezone`、`hourly_rate_cny`、`allocated_cost_default`、`default_public_value`、扫描回扫天数和分类映射。示例时薪只用于模板演示，使用前必须由用户确认或替换。

## `运行状态` 与 `运行日志`

`运行状态`保存最近扫描时间、扫描窗口、最近成功时间、已处理来源指纹数量、最近新增数量和最近错误。`运行日志`只保存短事件；敏感原文和完整堆栈放在本地临时目录，不进入工作簿或仓库。
