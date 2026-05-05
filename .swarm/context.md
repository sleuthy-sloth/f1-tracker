

## Agent Activity

| Tool | Calls | Success | Failed | Avg Duration |
|------|-------|---------|--------|--------------|
| read | 419 | 419 | 0 | 25ms |
| bash | 359 | 359 | 0 | 2222ms |
| edit | 134 | 134 | 0 | 3263ms |
| update_task_status | 119 | 119 | 0 | 11ms |
| glob | 105 | 105 | 0 | 25ms |
| grep | 85 | 85 | 0 | 25ms |
| task | 80 | 80 | 0 | 159990ms |
| write | 79 | 79 | 0 | 2240ms |
| declare_scope | 44 | 44 | 0 | 6ms |
| todowrite | 33 | 33 | 0 | 9ms |
| pre_check_batch | 21 | 21 | 0 | 1704ms |
| save_plan | 11 | 11 | 0 | 39ms |
| test_runner | 9 | 9 | 0 | 1067ms |
| search | 9 | 9 | 0 | 2017ms |
| phase_complete | 8 | 8 | 0 | 18802ms |
| check_gate_status | 7 | 7 | 0 | 5ms |
| lint | 6 | 6 | 0 | 3047ms |
| get_approved_plan | 6 | 6 | 0 | 15ms |
| syntax_check | 6 | 6 | 0 | 88ms |
| apply_patch | 6 | 6 | 0 | 4191ms |
| write_retro | 5 | 5 | 0 | 12ms |
| req_coverage | 5 | 5 | 0 | 6ms |
| write_drift_evidence | 5 | 5 | 0 | 26ms |
| knowledge_add | 5 | 5 | 0 | 24ms |
| build_check | 4 | 4 | 0 | 4225ms |
| diff | 4 | 4 | 0 | 159ms |
| imports | 4 | 4 | 0 | 2ms |
| todo_extract | 3 | 3 | 0 | 24ms |
| set_qa_gates | 3 | 3 | 0 | 13ms |
| detect_domains | 2 | 2 | 0 | 7ms |
| sbom_generate | 2 | 2 | 0 | 46ms |
| batch_symbols | 2 | 2 | 0 | 15ms |
| placeholder_scan | 2 | 2 | 0 | 234ms |
| get_qa_gate_profile | 2 | 2 | 0 | 6ms |
| complexity_hotspots | 1 | 1 | 0 | 389ms |
| doc_scan | 1 | 1 | 0 | 759ms |
| lint_spec | 1 | 1 | 0 | 8ms |
| sast_scan | 1 | 1 | 0 | 10ms |
| secretscan | 1 | 1 | 0 | 137ms |
| pkg_audit | 1 | 1 | 0 | 3123ms |
| evidence_check | 1 | 1 | 0 | 9ms |
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
