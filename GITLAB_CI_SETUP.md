# GitLab CI/CD Setup Guide

This guide explains how to set up and configure the GitLab CI/CD pipeline for automatic builds and deployments.

## Overview

The `.gitlab-ci.yml` pipeline includes:

| Stage | Job | Purpose |
|-------|-----|---------|
| **build** | `build` | Builds the Nuxt application and generates output |
| **lint** | `lint` | Runs ESLint code quality checks |
| **deploy** | `deploy:staging` | Deploys to Railway staging environment |
| **deploy** | `deploy:production` | Deploys to Railway production environment |
| **build** | `build:docker` | Builds and pushes Docker image to GitLab Registry |

## Prerequisites

1. **GitLab Repository**: Push this project to GitLab
2. **GitLab Runner**: Set up a runner (shared or specific)
3. **Railway** (for Railway deployment jobs)
4. **GitLab Container Registry** (optional, for Docker builds)

## Configuration Steps

### Step 1: Basic Setup

1. **Push to GitLab**:
   ```bash
   git remote add gitlab https://gitlab.com/your-username/sysreg-frontend.git
   git push -u gitlab main
   ```

2. **Enable CI/CD**:
   - Go to GitLab project → Settings → General → Visibility
   - Ensure "Pipelines" is enabled

### Step 2: Configure for Railway Deployment

To enable automatic deployment to Railway, set these **CI/CD Variables** in GitLab:

1. Go to **Project Settings** → **CI/CD** → **Variables**
2. Add the following variables:

| Variable | Value | Protected | Masked |
|----------|-------|-----------|--------|
| `RAILWAY_TOKEN` | Your Railway API token | Yes | Yes |
| `RAILWAY_SERVICE_NAME_STAGING` | Name of your staging service (e.g., `rawooh-ui`) | No | No |
| `RAILWAY_SERVICE_NAME_PROD` | Name of your production service | No | No |

**To get Railway Token**:
```bash
# Login to Railway
railway login

# Get token from Railway CLI
railway token
```

### Step 3 (Optional): Docker Registry Setup

For the `build:docker` job, configure GitLab Container Registry:

1. **Enable Container Registry**:
   - Project Settings → General → Container Registry

2. **Add Registry Variables**:
   - Go to **Settings** → **CI/CD** → **Variables**
   - Ensure GitLab automatically provides: `CI_REGISTRY`, `CI_REGISTRY_IMAGE`

## Running the Pipeline

### Automatic Triggers

- **Develop branch**: Builds and runs lint on push/merge request
- **Main branch**: Builds, lints, and can deploy to production

### Manual Deployment

1. Go to **CI/CD** → **Pipelines**
2. Find the desired pipeline
3. Click the deployment job
4. Click **Play** button to trigger deployment

Or use GitLab API:
```bash
curl -X POST \
  "https://gitlab.com/api/v4/projects/YOUR_PROJECT_ID/pipelines/PIPELINE_ID/jobs" \
  -H "PRIVATE-TOKEN: YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

## Pipeline Jobs Explained

### Build Job (`build`)
- **Trigger**: All branches
- **Steps**:
  1. Install dependencies with pnpm
  2. Build Nuxt application
  3. Save `.output/` artifacts
- **Artifacts**: Available for 1 hour

### Lint Job (`lint`)
- **Trigger**: Merge requests, main, develop branches
- **Steps**:
  1. Install dependencies
  2. Run ESLint
- **Config**: Allows failure (doesn't block pipeline)

### Deploy to Staging (`deploy:staging`)
- **Trigger**: Manual (click play button)
- **Branch**: `develop` only
- **Steps**:
  1. Install Railway CLI
  2. Authenticate with `RAILWAY_TOKEN`
  3. Deploy service to Railway
- **Environment**: Staging (`rawooh-ui-staging.up.railway.app`)

### Deploy to Production (`deploy:production`)
- **Trigger**: Manual (click play button)
- **Branch**: `main` only
- **Steps**:
  1. Install Railway CLI
  2. Authenticate with `RAILWAY_TOKEN`
  3. Deploy service to Railway
- **Environment**: Production (your production URL)

### Build Docker (`build:docker`)
- **Trigger**: Manual
- **Branches**: main, develop
- **Steps**:
  1. Build Docker image
  2. Push to GitLab Container Registry
  3. Tag with commit SHA and latest

## Enhanced Pipeline Configuration

### Add Status Badges

Add to your `README.md`:
```markdown
[![pipeline status](https://gitlab.com/your-username/sysreg-frontend/badges/main/pipeline.svg)](https://gitlab.com/your-username/sysreg-frontend/-/pipelines)
[![coverage report](https://gitlab.com/your-username/sysreg-frontend/badges/main/coverage.svg)](https://gitlab.com/your-username/sysreg-frontend/-/pipelines)
```

### Schedule Deployments

Create scheduled deployments:
1. Go to **CI/CD** → **Schedules**
2. Click **New schedule**
3. Set:
   - **Description**: "Nightly staging deployment"
   - **Cron**: `0 2 * * *` (2 AM daily)
   - **Target branch**: `develop`
   - **Variables**: Add any custom variables
4. Save

## Troubleshooting

### Pipeline Fails at Build Stage
- **Check logs**: CI/CD → Pipelines → Click job
- **Common issues**:
  - Missing `pnpm-lock.yaml` - Ensure file is committed
  - Node version mismatch - Check `NODE_VERSION` variable
  - Dependency installation - Run `pnpm install` locally first

### Deployment Fails
- **Railway token expired**: Regenerate and update variable
- **Service name mismatch**: Verify service names in Railway dashboard
- **Build artifacts missing**: Ensure `build` job completes successfully

### Runner Issues
- **No runners**: Project Settings → CI/CD → Runners
- **Runner offline**: Check runner status and restart
- **Docker not available**: Use Docker runner or container executor

## Advanced Configuration

### Add Notifications
Create a webhook to Slack/Discord:
1. Project → Settings → Webhooks
2. Add webhook URL
3. Trigger on Pipeline/Deployment events

### Add Quality Gates
Require passing checks before merge:
1. Project → Settings → General → Merge Requests
2. Enable "Pipelines must succeed"
3. Enable "All discussions must be resolved"

### Multi-Environment Testing
Add additional stages:
```yaml
test:unit:
  stage: test
  script:
    - pnpm run test:unit

test:e2e:
  stage: test
  script:
    - pnpm run test:e2e
```

## Performance Optimization

### Cache Strategy
- Docker images are cached by default
- pnpm cache improves install times by ~70%
- Build artifact cache expires after 1 hour

### Parallel Jobs
Jobs run in parallel within the same stage. To see:
- CI/CD → Pipelines → Click pipeline name

### Fast Compression
- `FF_USE_FASTZIP: "true"` - Uses faster compression
- `ARTIFACT_COMPRESSION_LEVEL: "fastest"` - Minimal compression

## Rollback Strategy

If deployment causes issues:
1. Go to **Deployments**
2. Find the deployment to rollback
3. Click **Rollback**
4. Confirm

Or manually through Railway dashboard:
1. Railway → Deployments
2. Select previous deployment
3. Click **Redeploy**

## Security Best Practices

✅ **Protected Variables**:
- `RAILWAY_TOKEN` - Always protected and masked
- Sensitive data never logged

✅ **Branch Protections**:
- Require passing pipeline before merge
- Require approvals for critical branches

✅ **Access Control**:
- Limit who can trigger deployments
- Use environment-specific permissions

## Next Steps

1. **Commit pipeline configuration**:
   ```bash
   git add .gitlab-ci.yml
   git commit -m "ci: add gitlab ci/cd pipeline"
   git push
   ```

2. **Set up variables** in GitLab as described above

3. **Test pipeline**:
   - Push to `develop` branch
   - Monitor pipeline in CI/CD tab

4. **Configure branch protections** (optional but recommended):
   - Project → Settings → Repository → Protected branches

---

**Last Updated**: February 26, 2026  
**GitLab CI Version**: Latest  
**Railway Integration**: Supported
