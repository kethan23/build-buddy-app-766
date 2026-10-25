# Roadmap — Complete Integration Audit, Bug Fixing & E2E Testing

Source: user-uploads://Complete_Integration_Audit_Bug_Fixing_pasted.md

- [ ] Phase 1: Baseline (build/typecheck/lint) + repo & schema inspection
- [ ] Phase 2: Verify 5 portals (Patient, Admin, Hospital, Agent, Visa workflows)
- [ ] Phase 3: Data architecture / FK / RLS integrity audit
- [ ] Phase 4: Auth & security audit (RLS, storage, IDOR)
- [ ] Phase 5: Cost calculator audit + unit tests
- [ ] Phase 6: E2E workflow verification (referral → inquiry → quote → visa → commission)
- [ ] Phase 7: Regression tests (vitest + Playwright where possible)
- [ ] Phase 8: Fix verified issues, re-test
- [ ] Phase 9: Final audit report to user

Notes:
- External Supabase (ref slgzisdvfsruqlhtafvg). No service_role key stored — some admin-level runtime checks may be BLOCKED.
- app_role has no 'visa' role; visa workflows run through admin + visa_* tables. Document in report.
- Visa approvals must carry embassy-discretion disclaimers (project rule).
