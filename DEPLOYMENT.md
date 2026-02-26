# Railway Deployment Guide

This guide explains how to deploy the SisReg Frontend to Railway.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Railway CLI** (optional but recommended):
   ```bash
   npm install -g @railway/cli
   # or
   curl -L railway.app/install.sh | bash
   ```
3. **Git Repository**: Ensure all changes are committed

## Deployment Methods

### Method 1: Deploy via Railway Dashboard (Recommended for Beginners)

1. **Connect Repository**:
   - Go to [railway.app](https://railway.app) and log in
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository (`gumelarix/sysreg-fe` or similar)
   - Authorize Railway to access your GitHub account

2. **Configure Environment Variables**:
   - In the Railway dashboard, go to Variables
   - Add the required environment variables:
     ```
     NUXT_SESSION_PASSWORD=<your-32-character-random-string>
     EXTERNAL_API_URL=<your-backend-api-url>
     NODE_ENV=production
     ```
   
   **To generate a secure session password**:
   ```bash
   openssl rand -base64 32
   ```

3. **Configure Service Settings**:
   - **Root Directory**: Leave empty (defaults to root)
   - **Port**: 3000 (automatically detected)
   - **Build Command**: Already configured in `railway.json`
   - **Start Command**: Already configured in `railway.json`

4. **Deploy**:
   - Click "Deploy" or wait for automatic deployment on git push
   - Monitor build progress in the logs
   - Once deployed, you'll receive a public URL

### Method 2: Deploy via Railway CLI (Recommended for Advanced Users)

1. **Login to Railway**:
   ```bash
   railway login
   ```

2. **Initialize Railway Project**:
   ```bash
   railway init
   ```
   - Create a new project or select existing
   - Follow the prompts

3. **Set Environment Variables**:
   ```bash
   railway variables set NUXT_SESSION_PASSWORD "<your-32-char-password>"
   railway variables set EXTERNAL_API_URL "<your-backend-url>"
   railway variables set NODE_ENV "production"
   ```

4. **Deploy**:
   ```bash
   railway up
   ```
   - This will build and deploy your application
   - Monitor the deployment in Railway dashboard

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NUXT_SESSION_PASSWORD` | Yes | Session encryption key (min 32 chars) | `abc123...xyz` |
| `EXTERNAL_API_URL` | Yes | Backend API endpoint | `https://api.example.com` |
| `NODE_ENV` | No | Environment mode | `production` |

## Project Structure for Railway

The following files support Railway deployment:

- **`Dockerfile`**: Multi-stage Docker build for optimal image size
- **`railway.json`**: Railway-specific build and deploy configuration
- **`railway.toml`**: Additional Railway configuration and health checks
- **`.env.example`**: Example environment variables

## Build & Deployment Process

### Build Stage:
1. Installs dependencies using pnpm
2. Builds the Nuxt application
3. Optimizes output for production

### Deployment Stage:
1. Starts the Node.js server on port 3000
2. Serves the built Nuxt application
3. Health checks monitor application availability

## Post-Deployment

### Verify Deployment:
```bash
# Test the application URL
curl https://<your-railway-url>

# Check logs
railway logs
```

### Connect to Backend:
- Ensure `EXTERNAL_API_URL` points to your production backend
- Verify CORS settings if backend is on different domain
- Test API endpoints from the web interface

### Monitor Application:
- Use Railway Dashboard to view logs
- Check CPU and memory usage
- Configure alerts for high resource usage

## Troubleshooting

### Build Fails
- **Issue**: `pnpm: command not found`
  - **Solution**: Railway should auto-install pnpm. Check Node.js version in logs.
- **Issue**: `package-lock.json or yarn.lock conflicts`
  - **Solution**: Ensure only `pnpm-lock.yaml` exists in repo

### Application Won't Start
- **Issue**: Port 3000 already in use
  - **Solution**: Railway automatically handles port mapping
- **Issue**: Missing required environment variables
  - **Solution**: Add `NUXT_SESSION_PASSWORD` and `EXTERNAL_API_URL` in Railway dashboard

### API Requests Fail
- **Issue**: `EXTERNAL_API_URL` points to localhost
  - **Solution**: Update to actual backend URL in Railway variables
- **Issue**: CORS errors
  - **Solution**: Configure backend to allow requests from your Railway domain

### Performance Issues
- **Issue**: Slow build times
  - **Solution**: Enable Railway's build cache, consider optimizing dependencies
- **Issue**: High memory usage
  - **Solution**: Increase memory allocation in Railway dashboard → settings

## Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Nuxt Deployment Guide](https://nuxt.com/docs/getting-started/deployment)
- [Node.js on Railway](https://docs.railway.app/deploy/deployments#nodejs)

## Continuous Deployment

Once connected via GitHub, any push to your deployment branch will automatically:
1. Trigger a build on Railway
2. Run the build command
3. Deploy the new version
4. Keep your application up to date

### Set Deployment Branch:
In Railway dashboard → Settings → "Auto-deploy from branch" and select your branch.

## Rollback

If something goes wrong:
1. Go to Railway Dashboard → Deployments
2. Find the previous successful deployment
3. Click the deployment to expand options
4. Select "Redeploy" to rollback

---

**Last Updated**: February 26, 2026  
**Nuxt Version**: 4.3.0  
**Node Version**: 22 (Alpine)
