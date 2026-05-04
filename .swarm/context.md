

## Agent Activity

| Tool | Calls | Success | Failed | Avg Duration |
|------|-------|---------|--------|--------------|
| read | 369 | 369 | 0 | 27ms |
| bash | 356 | 356 | 0 | 2273ms |
| update_task_status | 121 | 121 | 0 | 10ms |
| edit | 103 | 103 | 0 | 3072ms |
| glob | 97 | 97 | 0 | 39ms |
| grep | 82 | 82 | 0 | 24ms |
| write | 80 | 80 | 0 | 2274ms |
| task | 64 | 64 | 0 | 169253ms |
| declare_scope | 38 | 38 | 0 | 6ms |
| search | 26 | 26 | 0 | 1569ms |
| todowrite | 22 | 22 | 0 | 8ms |
| pre_check_batch | 18 | 18 | 0 | 1710ms |
| save_plan | 10 | 10 | 0 | 26ms |
| check_gate_status | 10 | 10 | 0 | 4ms |
| phase_complete | 9 | 9 | 0 | 16714ms |
| syntax_check | 9 | 9 | 0 | 37ms |
| set_qa_gates | 7 | 7 | 0 | 7ms |
| test_runner | 7 | 7 | 0 | 1372ms |
| lint | 6 | 6 | 0 | 3123ms |
| write_retro | 6 | 6 | 0 | 11ms |
| get_approved_plan | 6 | 6 | 0 | 15ms |
| write_drift_evidence | 6 | 6 | 0 | 24ms |
| diff | 6 | 6 | 0 | 139ms |
| req_coverage | 5 | 5 | 0 | 6ms |
| knowledge_add | 5 | 5 | 0 | 24ms |
| build_check | 4 | 4 | 0 | 4492ms |
| placeholder_scan | 4 | 4 | 0 | 50ms |
| get_qa_gate_profile | 4 | 4 | 0 | 4ms |
| todo_extract | 2 | 2 | 0 | 35ms |
| detect_domains | 2 | 2 | 0 | 7ms |
| sbom_generate | 2 | 2 | 0 | 46ms |
| batch_symbols | 2 | 2 | 0 | 15ms |
| imports | 2 | 2 | 0 | 2ms |
| evidence_check | 2 | 2 | 0 | 16ms |
| question | 2 | 2 | 0 | 16217ms |
| complexity_hotspots | 1 | 1 | 0 | 389ms |
| doc_scan | 1 | 1 | 0 | 759ms |
| lint_spec | 1 | 1 | 0 | 8ms |
| sast_scan | 1 | 1 | 0 | 10ms |
| secretscan | 1 | 1 | 0 | 137ms |
| pkg_audit | 1 | 1 | 0 | 3123ms |
| test_impact | 1 | 1 | 0 | 55ms |
| invalid | 1 | 1 | 0 | 2ms |
## QA Gates Applied (SectorOne)
- reviewer: true, test_engineer: true, sast_enabled: true, sme_enabled: true
- critic_pre_plan: true, drift_check: true
- applied_at: 2026-05-01

## Pending QA Gate Selection
- Lint + Typecheck: enabled
- Unit tests: disabled
- Build check: disabled
- SAST/Secret scan: disabled
