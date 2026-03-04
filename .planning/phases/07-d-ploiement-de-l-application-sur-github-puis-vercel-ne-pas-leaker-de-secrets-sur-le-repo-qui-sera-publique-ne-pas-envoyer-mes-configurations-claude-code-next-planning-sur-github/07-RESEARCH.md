# Phase 7: Deploiement GitHub + Vercel - Research

**Researched:** 2026-03-04
**Domain:** Deployment (GitHub + Vercel)
**Confidence:** HIGH

## Summary

This phase deploys the Jumper Points Tracker to a public GitHub repository and Vercel. The core challenges are ensuring sensitive files (Claude Code configs, planning docs, build caches, environment files) are not pushed to the public repo.

The existing repository `ttresse/jumper-watchoor` is already public on GitHub but has no remote configured locally. The deployment workflow is: (1) configure .gitignore to exclude sensitive directories, (2) add GitHub remote, (3) push to GitHub, (4) connect Vercel to the repo for automatic deployments.

**Primary recommendation:** Update .gitignore to exclude `.claude/`, `.planning/`, and any other sensitive files before adding the remote and pushing. Vercel auto-detects Next.js and requires zero configuration.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Repo already exists: `ttresse/jumper-watchoor`
- README already present in current directory
- LICENSE file already exists
- Deploy from main branch only (no preview deployments)
- Exclude `.claude/` - Claude Code configuration
- Exclude `.planning/` - GSD planning documents
- Exclude `.next/` - Next.js build cache
- Exclude all `.env*` files - no environment files in repo
- Exclude `node_modules/` - standard npm exclusion
- Use Vercel default domain (*.vercel.app)
- Personal Vercel account
- Auto-deploy on push to main
- Vercel auto-detect Next.js settings (no custom build config)
- No API keys required (LiFi API is public)
- No environment variables needed for deployment
- App works without any configuration

### Claude's Discretion
- Exact .gitignore formatting
- Vercel project naming
- Any additional standard exclusions (coverage, logs, etc.)

### Deferred Ideas (OUT OF SCOPE)
None - discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Git | any | Version control | Universal standard |
| GitHub | - | Repository hosting | User's chosen platform, repo already exists |
| Vercel | - | Deployment platform | Built by Next.js creators, zero-config for Next.js |
| Vercel CLI | latest | Local deployment management | Optional but useful for `vercel link` |

### Supporting
| Tool | Purpose | When to Use |
|------|---------|-------------|
| gh CLI | GitHub operations from terminal | For pushing, checking repo status |
| vercel CLI | Link local project to Vercel | If deploying manually first time |

**Installation (optional):**
```bash
npm install -g vercel
```

## Architecture Patterns

### File Exclusion Strategy

There are two complementary exclusion mechanisms:

1. **.gitignore** - Prevents files from being committed to Git repository
2. **.vercelignore** - Prevents files from being uploaded to Vercel during deployment

For this project, .gitignore is sufficient because:
- Files excluded from Git are never committed
- Files never in the repo cannot be deployed
- No files need to be in Git but excluded from Vercel

### Recommended .gitignore Additions

```gitignore
# Claude Code configuration
.claude/

# GSD planning documents
.planning/

# Already present in default Next.js .gitignore:
# /.next/
# /node_modules
# .env*
```

### Vercel Auto-Detection

Vercel automatically detects Next.js and configures:
- Build command: `next build`
- Output directory: `.next`
- Install command: `npm install` (or detected package manager)
- Framework preset: Next.js

**No vercel.json required** - defaults work perfectly for standard Next.js apps.

### Vercel Default Exclusions

Vercel automatically ignores these during deployment (no .vercelignore needed):
- `.git`, `.hg`, `.svn`
- `.next`, `.vercel`, `.now`
- `node_modules`
- `.env.local`, `.env.*.local`
- `.gitignore`, `.vercelignore`
- `npm-debug.log`, `yarn-debug.log`
- `.DS_Store`
- `__pycache__`, `venv`

Source: [Vercel Ignored Files Documentation](https://vercel.com/docs/deployments/build-features#ignored-files-and-folders)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CI/CD pipeline | GitHub Actions workflow | Vercel GitHub integration | Vercel handles build/deploy automatically |
| Build configuration | Custom next.config.js for Vercel | Vercel auto-detection | Zero config needed |
| Domain management | Manual DNS | Vercel automatic *.vercel.app | Instant deployment URL |
| SSL certificates | Manual cert provisioning | Vercel auto-SSL | Handled automatically |

**Key insight:** Vercel is purpose-built for Next.js. Manual configuration almost always makes things worse.

## Common Pitfalls

### Pitfall 1: Pushing Sensitive Files
**What goes wrong:** Claude Code configs, planning docs, or env files get committed to public repo
**Why it happens:** .gitignore not updated before first push
**How to avoid:** Update .gitignore BEFORE adding remote and pushing
**Warning signs:** `git status` shows .claude/ or .planning/ as untracked

### Pitfall 2: Committing Before Ignoring
**What goes wrong:** Files already staged before adding to .gitignore
**Why it happens:** Running `git add .` before updating .gitignore
**How to avoid:** Always update .gitignore first, then stage files
**Warning signs:** `git diff --cached` shows sensitive files

### Pitfall 3: Force Pushing to Existing Repo
**What goes wrong:** Overwriting existing commits with `--force`
**Why it happens:** Local and remote histories diverge
**How to avoid:** If repo has content, fetch first and merge/rebase
**Warning signs:** Git push rejected, temptation to use --force

### Pitfall 4: Vercel Environment Variables for Public APIs
**What goes wrong:** Overcomplicating setup by adding unnecessary env vars
**Why it happens:** Habit of hiding all API endpoints
**How to avoid:** LiFi API is public, no secrets needed
**Warning signs:** Adding NEXT_PUBLIC_ variables that aren't needed

### Pitfall 5: Custom Build Configuration
**What goes wrong:** Adding vercel.json that overrides working defaults
**Why it happens:** Assuming configuration is required
**How to avoid:** Trust Vercel auto-detection for standard Next.js
**Warning signs:** Build fails after adding vercel.json

## Code Examples

### Updated .gitignore
```gitignore
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# Claude Code configuration (ADDED)
.claude/

# GSD planning documents (ADDED)
.planning/
```

### Git Remote Setup
```bash
# Add remote (repo already exists on GitHub)
git remote add origin https://github.com/ttresse/jumper-watchoor.git

# Verify remote
git remote -v

# Push to main
git push -u origin main
```

### Vercel Connection (Two Options)

**Option A: Web UI (Recommended)**
1. Go to vercel.com/new
2. Import from GitHub
3. Select ttresse/jumper-watchoor
4. Click Deploy (no settings changes needed)

**Option B: CLI**
```bash
# Login to Vercel
vercel login

# Link to existing project (or create new)
vercel link

# Deploy (optional - GitHub integration handles this)
vercel --prod
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual CI/CD | Vercel GitHub integration | 2020+ | Zero config deployments |
| Custom domain setup | Automatic *.vercel.app | Standard | Instant preview URLs |
| Environment management | Dashboard env vars | Current | Secure secrets handling |

**Current best practice:**
- Connect GitHub repo to Vercel through web UI
- Let Vercel auto-detect everything
- Only add env vars if secrets are needed (not needed here)

## Open Questions

1. **Existing repo content**
   - What we know: Repo `ttresse/jumper-watchoor` exists and is public
   - What's unclear: Does it have existing commits that might conflict?
   - Recommendation: Check repo state with `gh repo view`, fetch before push if content exists

2. **Vercel account status**
   - What we know: Personal Vercel account will be used
   - What's unclear: Is account already set up and logged in?
   - Recommendation: Verify with `vercel whoami` or login fresh

## Sources

### Primary (HIGH confidence)
- [Vercel Git Integration](https://vercel.com/docs/git/vercel-for-github) - GitHub deployment workflow
- [Vercel Project Configuration](https://vercel.com/docs/projects/project-configuration) - Auto-detection behavior
- [Vercel Ignored Files](https://vercel.com/docs/deployments/build-features#ignored-files-and-folders) - Default exclusions list
- [Vercel CLI Deployment](https://vercel.com/docs/cli/deploying-from-cli) - CLI commands
- [Vercel .vercelignore](https://vercel.com/docs/deployments/vercel-ignore) - File exclusion syntax

### Secondary (MEDIUM confidence)
- [Complete Guide to Deploying Next.js Apps in 2026](https://dev.to/zahg_81752b307f5df5d56035/the-complete-guide-to-deploying-nextjs-apps-in-2026-vercel-self-hosted-and-everything-in-between-48ia) - Current deployment patterns
- [Deploying Next.js to Vercel Safely](https://medium.com/@meiyee715/deploying-next-js-to-vercel-safely-fe9f3bb30897) - Security best practices

## Metadata

**Confidence breakdown:**
- .gitignore patterns: HIGH - Standard Git behavior, well-documented
- Vercel auto-detection: HIGH - Official Vercel docs, widely used
- Deployment workflow: HIGH - Standard GitHub + Vercel flow
- Security (no secrets leaked): HIGH - Clear exclusion patterns prevent exposure

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (stable domain, patterns change slowly)

---
*Phase: 07-deploiement-github-vercel*
*Research complete: 2026-03-04*
