import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const repo = path.resolve(new URL("..", import.meta.url).pathname);
const assets = path.join(repo, "assets");
const previewDir = path.join(repo, ".preview");
await fs.mkdir(assets, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

const wb = Workbook.create();
const overview = wb.worksheets.add("汇总");
const detail = wb.worksheets.add("任务明细");
const rules = wb.worksheets.add("规则");
const state = wb.worksheets.add("运行状态");
const log = wb.worksheets.add("运行日志");
for (const s of [overview, detail, rules, state, log]) s.showGridLines = false;

const ink = "#17202A";
const cream = "#F6EBD8";
const blue = "#DDEBF7";
const green = "#E2F0D9";
const yellow = "#FFF2CC";
const border = "#D9D9D9";
const bodyFormat = { font: { color: ink, size: 10 }, verticalAlignment: "center", borders: { insideHorizontal: { style: "thin", color: border } } };
const headerFormat = { fill: blue, font: { bold: true, color: ink }, wrapText: true, verticalAlignment: "center", borders: { preset: "all", style: "thin", color: border } };
function title(sheet, range, text) {
  sheet.getRange(range).merge();
  sheet.getRange(range.split(":")[0]).values = [[text]];
  sheet.getRange(range).format = { fill: cream, font: { bold: true, color: ink, size: 16 }, verticalAlignment: "center" };
  sheet.getRange(range).format.rowHeight = 28;
}
function header(sheet, range) { sheet.getRange(range).format = headerFormat; sheet.getRange(range).format.rowHeight = 34; }

title(overview, "A1:F1", "Agent 价值记账｜保守汇总");
overview.getRange("A3:C3").values = [["指标", "当前值", "说明"]]; header(overview, "A3:C3");
overview.getRange("A4:C17").values = [
  ["已记录任务数", null, "只统计 verified / partial"],
  ["节省时间-低（分钟）", null, "默认对外口径"],
  ["节省时间-低（小时）", null, "由分钟换算"],
  ["节省金额-低", null, "时间价值，不等于现金收入"],
  ["本周节省时间-低（小时）", null, "按当前日期所在周"],
  ["本周节省金额-低", null, "按当前日期所在周"],
  ["本月节省时间-低（小时）", null, "按当前日期所在月"],
  ["本月节省金额-低", null, "按当前日期所在月"],
  ["参考时间区间（小时）", null, "中、高值仅作内部参考"],
  ["参考金额区间", null, "中、高值仅作内部参考"],
  ["低置信度任务数", null, "需要谨慎解释"],
  ["待审阅任务数", null, "不计入主结论"],
  ["当前时薪", null, "来自规则表"],
  ["最近更新", null, "来自运行状态"]
];
const accepted = "('任务明细'!$Z$2:$Z$501,\"verified\")+SUMIFS('任务明细'!$R$2:$R$501,'任务明细'!$Z$2:$Z$501,\"partial\")";
overview.getRange("B4").formulas = [["=COUNTIF('任务明细'!$Z$2:$Z$501,\"verified\")+COUNTIF('任务明细'!$Z$2:$Z$501,\"partial\")"]];
overview.getRange("B5").formulas = [["=SUMIFS('任务明细'!$R$2:$R$501,'任务明细'!$Z$2:$Z$501,\"verified\")+SUMIFS('任务明细'!$R$2:$R$501,'任务明细'!$Z$2:$Z$501,\"partial\")"]];
overview.getRange("B6").formulas = [["=B5/60"]];
overview.getRange("B7").formulas = [["=SUMIFS('任务明细'!$W$2:$W$501,'任务明细'!$Z$2:$Z$501,\"verified\")+SUMIFS('任务明细'!$W$2:$W$501,'任务明细'!$Z$2:$Z$501,\"partial\")"]];
overview.getRange("B8").formulas = [["=(SUMIFS('任务明细'!$R$2:$R$501,'任务明细'!$B$2:$B$501,\">=\"&TODAY()-WEEKDAY(TODAY(),2)+1,'任务明细'!$B$2:$B$501,\"<=\"&TODAY(),'任务明细'!$Z$2:$Z$501,\"verified\")+SUMIFS('任务明细'!$R$2:$R$501,'任务明细'!$B$2:$B$501,\">=\"&TODAY()-WEEKDAY(TODAY(),2)+1,'任务明细'!$B$2:$B$501,\"<=\"&TODAY(),'任务明细'!$Z$2:$Z$501,\"partial\"))/60"]];
overview.getRange("B9").formulas = [["=SUMIFS('任务明细'!$W$2:$W$501,'任务明细'!$B$2:$B$501,\">=\"&TODAY()-WEEKDAY(TODAY(),2)+1,'任务明细'!$B$2:$B$501,\"<=\"&TODAY(),'任务明细'!$Z$2:$Z$501,\"verified\")+SUMIFS('任务明细'!$W$2:$W$501,'任务明细'!$B$2:$B$501,\">=\"&TODAY()-WEEKDAY(TODAY(),2)+1,'任务明细'!$B$2:$B$501,\"<=\"&TODAY(),'任务明细'!$Z$2:$Z$501,\"partial\")"]];
overview.getRange("B10").formulas = [["=(SUMIFS('任务明细'!$R$2:$R$501,'任务明细'!$B$2:$B$501,\">=\"&EOMONTH(TODAY(),-1)+1,'任务明细'!$B$2:$B$501,\"<=\"&TODAY(),'任务明细'!$Z$2:$Z$501,\"verified\")+SUMIFS('任务明细'!$R$2:$R$501,'任务明细'!$B$2:$B$501,\">=\"&EOMONTH(TODAY(),-1)+1,'任务明细'!$B$2:$B$501,\"<=\"&TODAY(),'任务明细'!$Z$2:$Z$501,\"partial\"))/60"]];
overview.getRange("B11").formulas = [["=SUMIFS('任务明细'!$W$2:$W$501,'任务明细'!$B$2:$B$501,\">=\"&EOMONTH(TODAY(),-1)+1,'任务明细'!$B$2:$B$501,\"<=\"&TODAY(),'任务明细'!$Z$2:$Z$501,\"verified\")+SUMIFS('任务明细'!$W$2:$W$501,'任务明细'!$B$2:$B$501,\">=\"&EOMONTH(TODAY(),-1)+1,'任务明细'!$B$2:$B$501,\"<=\"&TODAY(),'任务明细'!$Z$2:$Z$501,\"partial\")"]];
overview.getRange("B12").formulas = [["=SUMIFS('任务明细'!$S$2:$S$501,'任务明细'!$Z$2:$Z$501,\"verified\")+SUMIFS('任务明细'!$S$2:$S$501,'任务明细'!$Z$2:$Z$501,\"partial\")"]];
overview.getRange("B13").formulas = [["=SUMIFS('任务明细'!$X$2:$X$501,'任务明细'!$Z$2:$Z$501,\"verified\")+SUMIFS('任务明细'!$X$2:$X$501,'任务明细'!$Z$2:$Z$501,\"partial\")"]];
overview.getRange("B14").formulas = [["=COUNTIFS('任务明细'!$H$2:$H$501,\"low\",'任务明细'!$Z$2:$Z$501,\"verified\")+COUNTIFS('任务明细'!$H$2:$H$501,\"low\",'任务明细'!$Z$2:$Z$501,\"partial\")"]];
overview.getRange("B15").formulas = [["=COUNTIF('任务明细'!$Z$2:$Z$501,\"needs_review\")"]];
overview.getRange("B16").formulas = [["='规则'!$B$4"]];
overview.getRange("B17").formulas = [["=IF('运行状态'!$B$5=\"\",\"\",'运行状态'!$B$5)"]];
overview.getRange("E3:F3").values = [["敏感性参考", "值"]]; header(overview, "E3:F3");
overview.getRange("E4:E8").values = [["中值节省分钟"],["高值节省分钟"],["中值金额"],["高值金额"],["成本口径"]];
overview.getRange("F4").formulas = [["=SUMIFS('任务明细'!$S$2:$S$501,'任务明细'!$Z$2:$Z$501,\"verified\")+SUMIFS('任务明细'!$S$2:$S$501,'任务明细'!$Z$2:$Z$501,\"partial\")"]];
overview.getRange("F5").formulas = [["=SUMIFS('任务明细'!$T$2:$T$501,'任务明细'!$Z$2:$Z$501,\"verified\")+SUMIFS('任务明细'!$T$2:$T$501,'任务明细'!$Z$2:$Z$501,\"partial\")"]];
overview.getRange("F6").formulas = [["=SUMIFS('任务明细'!$X$2:$X$501,'任务明细'!$Z$2:$Z$501,\"verified\")+SUMIFS('任务明细'!$X$2:$X$501,'任务明细'!$Z$2:$Z$501,\"partial\")"]];
overview.getRange("F7").formulas = [["=SUMIFS('任务明细'!$Y$2:$Y$501,'任务明细'!$Z$2:$Z$501,\"verified\")+SUMIFS('任务明细'!$Y$2:$Y$501,'任务明细'!$Z$2:$Z$501,\"partial\")"]];
overview.getRange("F8").formulas = [["='规则'!$B$5"]];
overview.getRange("A4:F17").format = bodyFormat; overview.getRange("B7:B11").format = { fill: green, font: { bold: true, color: ink } }; overview.getRange("B14:B15").format = { fill: yellow, font: { bold: true, color: ink } };
overview.getRange("B4").setNumberFormat("#,##0"); overview.getRange("B5:B6").setNumberFormat("#,##0.0"); overview.getRange("B7").setNumberFormat("#,##0"); overview.getRange("B8").setNumberFormat("#,##0.0"); overview.getRange("B9").setNumberFormat("#,##0"); overview.getRange("B10").setNumberFormat("#,##0.0"); overview.getRange("B11").setNumberFormat("#,##0"); overview.getRange("B12:B15").setNumberFormat("General"); overview.getRange("B16").setNumberFormat("#,##0.0"); overview.getRange("B17").setNumberFormat("yyyy-mm-dd hh:mm"); overview.getRange("F4:F7").setNumberFormat("#,##0.0");
overview.getRange("A:A").format.columnWidth = 28; overview.getRange("B:B").format.columnWidth = 20; overview.getRange("C:C").format.columnWidth = 32; overview.getRange("E:E").format.columnWidth = 20; overview.getRange("F:F").format.columnWidth = 18;

const headers = ["task_id","work_date","task_title","task_content","task_category","source_refs","deliverables","confidence","manual_low","manual_mid","manual_high","user_active_low","user_active_mid","user_active_high","review_low","review_mid","review_high","saved_low","saved_mid","saved_high","hourly_rate","allocated_cost","saved_cny_low","saved_cny_mid","saved_cny_high","evidence_status","dedupe_key","assumptions","review_flag"];
detail.getRange("A1:AC1").values = [headers]; header(detail, "A1:AC1");
detail.getRange("A2:AC501").values = Array.from({ length: 500 }, () => Array(29).fill(null));
detail.getRange("R2").formulas = [["=IF(A2=\"\",\"\",MAX(0,I2-L2-O2))"]]; detail.getRange("R2:R501").fillDown();
detail.getRange("S2").formulas = [["=IF(A2=\"\",\"\",MAX(0,J2-M2-P2))"]]; detail.getRange("S2:S501").fillDown();
detail.getRange("T2").formulas = [["=IF(A2=\"\",\"\",MAX(0,K2-N2-Q2))"]]; detail.getRange("T2:T501").fillDown();
detail.getRange("W2").formulas = [["=IF(A2=\"\",\"\",R2/60*U2-V2)"]]; detail.getRange("W2:W501").fillDown();
detail.getRange("X2").formulas = [["=IF(A2=\"\",\"\",S2/60*U2-V2)"]]; detail.getRange("X2:X501").fillDown();
detail.getRange("Y2").formulas = [["=IF(A2=\"\",\"\",T2/60*U2-V2)"]]; detail.getRange("Y2:Y501").fillDown();
detail.getRange("Z2").values = [[null]]; detail.getRange("A2:AC501").format = bodyFormat; detail.freezePanes.freezeRows(1); detail.freezePanes.freezeColumns(3);
detail.getRange("A:A").format.columnWidth = 24; detail.getRange("B:B").format.columnWidth = 13; detail.getRange("C:C").format.columnWidth = 30; detail.getRange("D:D").format.columnWidth = 42; detail.getRange("E:G").format.columnWidth = 32; detail.getRange("H:H").format.columnWidth = 13; detail.getRange("I:Y").format.columnWidth = 14; detail.getRange("Z:Z").format.columnWidth = 18; detail.getRange("AA:AA").format.columnWidth = 28; detail.getRange("AB:AC").format.columnWidth = 36;
detail.getRange("B2:B501").setNumberFormat("yyyy-mm-dd"); detail.getRange("I2:Y501").setNumberFormat("#,##0.0"); detail.getRange("H2:H501").dataValidation = { rule: { type: "list", values: ["high", "medium", "low"] } }; detail.getRange("Z2:Z501").dataValidation = { rule: { type: "list", values: ["verified", "partial", "needs_review", "skipped"] } };

title(rules, "A1:C1", "规则｜请在使用前确认"); rules.getRange("A3:C9").values = [["参数","值","说明"],["hourly_rate_cny",0,"必填：使用者确认后填写"],["allocated_cost_default",0,"未知成本填0，并在假设中说明"],["timezone","Asia/Shanghai","按用户实际时区修改"],["default_public_value","low","日常主结论只用低值"],["rescan_days",7,"每次回扫最近N天以防摘要晚落盘"],["template_version","0.1.0","模板版本"]]; header(rules, "A3:C3"); rules.getRange("A4:C9").format = bodyFormat; rules.getRange("A:A").format.columnWidth = 28; rules.getRange("B:B").format.columnWidth = 22; rules.getRange("C:C").format.columnWidth = 42;
rules.getRange("A12:B19").values = [["task_category","label"],["simple_lookup_or_command","简单查询/解释"],["feishu_lookup_or_schedule","查询/日程/任务"],["doc_wiki_minutes_synthesis","文档/Wiki/纪要整理"],["report_or_research","调研/方案分析"],["automation_or_workflow_setup","自动化/工作流搭建"],["coding_or_debugging","代码/排障/发布"],["local_setup_or_cleanup","本机安装/清理/维护"]]; header(rules, "A12:B12"); rules.getRange("A13:B19").format = bodyFormat;

title(state, "A1:C1", "运行状态"); state.getRange("A3:C9").values = [["字段","值","说明"],["last_scan_at",null,"最近一次扫描时间"],["last_success_at",null,"最近一次成功写入时间"],["scan_window",null,"本次扫描覆盖范围"],["candidate_count",0,"候选任务数"],["created_count",0,"新增任务数"],["needs_review_count",0,"待审阅数量"]]; header(state, "A3:C3"); state.getRange("A4:C9").format = bodyFormat; state.getRange("A:A").format.columnWidth = 24; state.getRange("B:B").format.columnWidth = 28; state.getRange("C:C").format.columnWidth = 36;
log.getRange("A1:E1").values = [["timestamp","event","status","short_detail","source_ref"]]; header(log, "A1:E1"); log.getRange("A2:E101").values = Array.from({ length: 100 }, () => Array(5).fill(null)); log.getRange("A2:E101").format = bodyFormat; log.freezePanes.freezeRows(1); log.getRange("A:A").format.columnWidth = 22; log.getRange("B:B").format.columnWidth = 20; log.getRange("C:C").format.columnWidth = 14; log.getRange("D:E").format.columnWidth = 44;

const preview = await wb.render({ sheetName: "汇总", range: "A1:F17", scale: 1, format: "png" });
await fs.writeFile(path.join(previewDir, "overview.png"), new Uint8Array(await preview.arrayBuffer()));
const errors = await wb.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A", options: { useRegex: true, maxResults: 100 }, summary: "template formula error scan" });
console.log(errors.ndjson);
const output = await SpreadsheetFile.exportXlsx(wb);
await output.save(path.join(assets, "agent-value-ledger-template.xlsx"));
console.log("saved agent-value-ledger-template.xlsx");
