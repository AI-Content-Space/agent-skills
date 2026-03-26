# AI Change Log

## 2026-03-26

Change: 新增顶层 `.gitignore`，忽略 `.DS_Store` 与未纳入管理的嵌套 Git 目录。由于记录脚本运行时缺少目标文件，本次改为手工记录。
Risk Analysis: 风险较低。变更只影响顶层仓库的忽略规则，不修改业务代码。但如果后续本来希望把 `Trellis` 或 `planning-with-files` 纳入顶层版本管理，需要先调整仓库组织方式，否则这些目录会继续被忽略。
Risk Level: S3-低
Changed Files: `.gitignore`, `docs/AI_CHANGELOG.md`
