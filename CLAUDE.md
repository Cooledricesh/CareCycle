<vooster-docs>
- @vooster-docs/prd.md
- @vooster-docs/architecture.md
- @vooster-docs/step-by-step.md
- @vooster-docs/tdd.md
- @vooster-docs/clean-code.md
- @vooster-docs/git-commit-message.md
</vooster-docs>

# Supabase API Keys Migration (2025)

## Important: Supabase Key System Change
Supabase is migrating from legacy JWT-based keys to new API key system:

### Legacy Keys (Being Phased Out)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Client-side key (public)
- `SUPABASE_SERVICE_ROLE_KEY`: Server-side key (secret)

### New Keys (Current Standard)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`): Replaces anon key
- `SUPABASE_SECRET_KEY` (`sb_secret_...`): Replaces service_role key

### Migration Timeline
- **2025년 6월**: 새 API 키 시스템 프리뷰
- **2025년 7월**: 정식 출시
- **2025년 11월**: 새 프로젝트는 레거시 키 없음
- **2026년 말**: 레거시 키 완전 폐기

### Security Note
- Never commit `.env.local` to git
- Secret keys must never be exposed in client-side code
- Rotate keys immediately if exposed