# 需求文档分析报告

> 分析时间：{{analysis_date}}  
> 分析人：{{analyst}}  
> 文档版本：{{doc_version}}

---

## 一、文档概述

| 项目 | 内容 |
|------|------|
| 文档主题 | {{doc_title}} |
| 分析对象 | {{doc_path}} |
| 分析深度 | {{analysis_depth}} |
| 业务领域 | {{business_domain}} |

### 1.1 文档摘要

{{doc_summary}}

### 1.2 核心业务流程

{{business_process_description}}

---

## 二、业务闭环分析

### 2.1 输入环节

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 数据来源 | {{status}} | {{description}} |
| 触发条件 | {{status}} | {{description}} |
| 输入格式 | {{status}} | {{description}} |
| 前置依赖 | {{status}} | {{description}} |
| 输入异常处理 | {{status}} | {{description}} |

**问题清单**：
{{input_issues}}

### 2.2 处理环节

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 业务规则完整性 | {{status}} | {{description}} |
| 异常分支覆盖 | {{status}} | {{description}} |
| 边界条件定义 | {{status}} | {{description}} |
| 并发控制 | {{status}} | {{description}} |
| 事务边界 | {{status}} | {{description}} |
| 恢复机制 | {{status}} | {{description}} |

**问题清单**：
{{process_issues}}

### 2.3 输出环节

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 输出物定义 | {{status}} | {{description}} |
| 接收方明确 | {{status}} | {{description}} |
| 输出格式 | {{status}} | {{description}} |
| 通知机制 | {{status}} | {{description}} |
| 存储策略 | {{status}} | {{description}} |

**问题清单**：
{{output_issues}}

### 2.4 反馈环节

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 结果确认 | {{status}} | {{description}} |
| 对账机制 | {{status}} | {{description}} |
| 错误处理 | {{status}} | {{description}} |
| 可追溯性 | {{status}} | {{description}} |
| 监控告警 | {{status}} | {{description}} |

**问题清单**：
{{feedback_issues}}

---

## 三、需求不明确点

| 编号 | 位置 | 模糊描述 | 类别 | 建议明确为 | 优先级 |
|------|------|----------|------|-----------|--------|
| A01 | {{section}} | {{original_text}} | {{category}} | {{suggestion}} | P{{priority}} |

### 3.1 时间相关不明确

{{time_ambiguities}}

### 3.2 数量相关不明确

{{quantity_ambiguities}}

### 3.3 状态相关不明确

{{status_ambiguities}}

### 3.4 主体相关不明确

{{subject_ambiguities}}

### 3.5 条件相关不明确

{{condition_ambiguities}}

---

## 四、影响范围分析

### 4.1 数据影响

**影响程度**：高/中/低

- **新增数据实体**：
  {{new_data_entities}}

- **修改现有表结构**：
  {{modified_tables}}

- **数据迁移需求**：
  {{data_migration}}

### 4.2 接口影响

**影响程度**：高/中/低

- **新增 API**：
  {{new_apis}}

- **修改现有接口**：
  {{modified_apis}}

- **外部依赖**：
  {{external_dependencies}}

### 4.3 流程影响

**影响程度**：高/中/低

- **现有流程变更**：
  {{process_changes}}

- **流程冲突点**：
  {{process_conflicts}}

### 4.4 用户影响

**影响程度**：高/中/低

- **受影响角色**：
  {{affected_roles}}

- **UI/UX 变更**：
  {{ui_changes}}

### 4.5 运维影响

**影响程度**：高/中/低

- **新增监控指标**：
  {{new_metrics}}

- **新增告警规则**：
  {{new_alerts}}

---

## 五、可行性分析

### 5.1 技术可行性

**评估**：可行 / 需调研 / 不可行

**理由**：
{{technical_feasibility_reasons}}

**技术风险**：
{{technical_risks}}

### 5.2 数据可行性

**评估**：可行 / 需调研 / 不可行

**理由**：
{{data_feasibility_reasons}}

### 5.3 依赖可行性

**评估**：可行 / 需调研 / 不可行

**依赖清单**：
{{dependencies}}

**风险评估**：
{{dependency_risks}}

### 5.4 时间可行性

**评估**：可行 / 需调研 / 不可行

**时间窗口分析**：
{{timeline_analysis}}

### 5.5 非功能与质量门槛

**性能/SLA**：
{{performance_requirements}}

**权限与角色边界**：
{{auth_and_roles}}

**幂等/重试/补偿**：
{{reliability_requirements}}

**监控/审计/告警**：
{{observability_requirements}}

**兼容性/迁移/发布/回滚**：
{{rollout_requirements}}

### 5.6 验收就绪度

**评估**：明确 / 部分明确 / 不明确

**验收标准**：
{{acceptance_criteria}}

**成功判定方式**：
{{success_metrics}}

---

## 六、历史一致性检查

### 6.1 与历史文档对比

**对比结果**：一致 / 存在冲突 / 无法判断

**冲突点**：
{{conflicts_with_docs}}

### 6.2 与现有代码对比

**对比结果**：支持 / 需重构 / 不支持

**架构影响**：
{{architecture_impact}}

---

## 七、问题清单

### P0 问题（阻塞开发）

1. {{p0_issue_1}}
2. {{p0_issue_2}}

### P1 问题（影响设计）

1. {{p1_issue_1}}
2. {{p1_issue_2}}

### P2 问题（影响体验）

1. {{p2_issue_1}}
2. {{p2_issue_2}}

---

## 八、建议与下一步

### 8.1 立即行动项

1. {{action_item_1}}
2. {{action_item_2}}

### 8.2 需要业务方确认

1. {{confirmation_1}}
2. {{confirmation_2}}

### 8.3 建议在详细设计中补充
{{design_followups}}

---

## 九、假设与未知项

| 编号 | 类型 | 内容 | 影响 |
|------|------|------|------|
| U01 | 假设/未知项 | {{assumption_or_unknown}} | {{impact}} |

---

## 十、证据与依据

| 结论 | 证据位置 | 类型 | 判断性质 |
|------|----------|------|----------|
| {{finding}} | {{evidence_location}} | 文档/代码/历史文档 | fact/inference/assumption |

---

## 附录

### A. 检查清单完成度

| 分类 | 完成项/总项 | 完成度 |
|------|------------|--------|
| 输入环节 | {{in_completed}}/{{in_total}} | {{in_percent}}% |
| 处理环节 | {{proc_completed}}/{{proc_total}} | {{proc_percent}}% |
| 输出环节 | {{out_completed}}/{{out_total}} | {{out_percent}}% |
| 反馈环节 | {{fb_completed}}/{{fb_total}} | {{fb_percent}}% |

### B. 参考资料

- {{reference_1}}
- {{reference_2}}

---

*本报告由 Requirement Analyzer Skill 生成*
