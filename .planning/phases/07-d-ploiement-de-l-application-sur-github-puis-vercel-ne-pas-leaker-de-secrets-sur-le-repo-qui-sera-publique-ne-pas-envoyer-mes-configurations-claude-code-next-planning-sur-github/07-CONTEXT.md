# Phase 7: Déploiement GitHub + Vercel - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Deploy the Jumper Points Tracker to GitHub (public repo) then Vercel, ensuring no secrets or development configurations are leaked. The app should be publicly accessible with automatic deployments from main branch.

</domain>

<decisions>
## Implementation Decisions

### Repository setup
- Repo already exists: `ttresse/jumper-watchoor`
- README already present in current directory
- LICENSE file already exists
- Deploy from main branch only (no preview deployments)

### File exclusions
- Exclude `.claude/` — Claude Code configuration
- Exclude `.planning/` — GSD planning documents
- Exclude `.next/` — Next.js build cache
- Exclude all `.env*` files — no environment files in repo
- Exclude `node_modules/` — standard npm exclusion

### Vercel configuration
- Use Vercel default domain (*.vercel.app)
- Personal Vercel account
- Auto-deploy on push to main
- Vercel auto-detect Next.js settings (no custom build config)

### Environment secrets
- No API keys required (LiFi API is public)
- No environment variables needed for deployment
- App works without any configuration

### Claude's Discretion
- Exact .gitignore formatting
- Vercel project naming
- Any additional standard exclusions (coverage, logs, etc.)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — straightforward deployment with standard exclusions.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-deploiement-github-vercel*
*Context gathered: 2026-03-04*
