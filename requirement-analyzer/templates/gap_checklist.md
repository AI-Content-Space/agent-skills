# {{doc_title}}需求缺口清单

> 文档版本：{{doc_version}}  
> 创建时间：{{analysis_date}}  
> 状态：待业务方确认

---

## 一、输入与触发机制（P0）

### 1.1 文件输入规格

| 编号 | 问题 | 业务方答复 |
|------|------|-----------|
| {{input_id_1}} | {{input_question_1}} | |
| {{input_id_2}} | {{input_question_2}} | |

### 1.2 触发时机

| 编号 | 问题 | 业务方答复 |
|------|------|-----------|
| {{trigger_id_1}} | {{trigger_question_1}} | |
| {{trigger_id_2}} | {{trigger_question_2}} | |

---

## 二、数据依赖与前置条件（P0）

### 2.1 客户数据依赖

| 编号 | 问题 | 业务方答复 |
|------|------|-----------|
| {{data_id_1}} | {{data_question_1}} | |
| {{data_id_2}} | {{data_question_2}} | |

### 2.2 合约与主数据

| 编号 | 问题 | 业务方答复 |
|------|------|-----------|
| {{master_id_1}} | {{master_question_1}} | |
| {{master_id_2}} | {{master_question_2}} | |

---

## 三、输出与下游对接（P0）

### 3.1 输出物清单

| 编号 | 问题 | 业务方答复 |
|------|------|-----------|
| {{output_id_1}} | {{output_question_1}} | |
| {{output_id_2}} | {{output_question_2}} | |

### 3.2 接口规格

| 编号 | 问题 | 业务方答复 |
|------|------|-----------|
| {{interface_id_1}} | {{interface_question_1}} | |
| {{interface_id_2}} | {{interface_question_2}} | |

---

## 四、异常与边界场景（P1）

### 4.1 数据异常

| 编号 | 问题 | 业务方答复 |
|------|------|-----------|
| {{exception_id_1}} | {{exception_question_1}} | |
| {{exception_id_2}} | {{exception_question_2}} | |

### 4.2 处理异常与重试

| 编号 | 问题 | 业务方答复 |
|------|------|-----------|
| {{retry_id_1}} | {{retry_question_1}} | |
| {{retry_id_2}} | {{retry_question_2}} | |

---

## 五、对账、审计与监控（P1）

### 5.1 对账与审计

| 编号 | 问题 | 业务方答复 |
|------|------|-----------|
| {{audit_id_1}} | {{audit_question_1}} | |
| {{audit_id_2}} | {{audit_question_2}} | |

### 5.2 运行监控与告警

| 编号 | 问题 | 业务方答复 |
|------|------|-----------|
| {{monitor_id_1}} | {{monitor_question_1}} | |
| {{monitor_id_2}} | {{monitor_question_2}} | |

---

## 六、配置化与人工干预（P2）

### 6.1 规则配置

| 编号 | 问题 | 业务方答复 |
|------|------|-----------|
| {{config_id_1}} | {{config_question_1}} | |
| {{config_id_2}} | {{config_question_2}} | |

### 6.2 人工处理与查询

| 编号 | 问题 | 业务方答复 |
|------|------|-----------|
| {{manual_id_1}} | {{manual_question_1}} | |
| {{manual_id_2}} | {{manual_question_2}} | |

---

## 七、补充说明

### 7.1 总结

{{summary}}

### 7.2 关键阻塞点

- {{blocking_issue_1}}
- {{blocking_issue_2}}

### 7.3 证据与依据

| 结论 | 证据位置 | 判断性质 |
|------|----------|----------|
| {{finding_1}} | {{evidence_1}} | fact/inference/assumption |
| {{finding_2}} | {{evidence_2}} | fact/inference/assumption |

---

## 附录：优先级说明

| 优先级 | 说明 |
|--------|------|
| P0 | 缺少这些信息无法开始开发 |
| P1 | 影响核心业务流程，需要在开发中期前确认 |
| P2 | 影响用户体验和运维，可以在开发后期确认 |
| P3 | 可以在上线后迭代完善 |

---

## 待办事项

- [ ] 与业务方确认 P0 级别问题
- [ ] 与业务方确认 P1 级别问题
- [ ] 与业务方确认 P2 级别问题
- [ ] 更新需求文档
