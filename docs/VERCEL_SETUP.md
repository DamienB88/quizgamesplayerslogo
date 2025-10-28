# Vercel Deployment Setup Guide

This guide covers deploying the Privacy Social web dashboard to Vercel.

## Prerequisites

- A Vercel account (sign up at https://vercel.com)
- GitHub repository connected to Vercel
- Vercel CLI installed: `npm install -g vercel`

## Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

## Step 2: Login to Vercel

```bash
vercel login
```

## Step 3: Link Your Project

In your project directory:

```bash
vercel link
```

Follow the prompts to link to your Vercel project.

## Step 4: Configure Environment Variables

Go to your Vercel dashboard → Project Settings → Environment Variables and add:

### Production Variables

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_URL=https://your-api-url.com
EXPO_PUBLIC_ENV=production
```

### Preview Variables (for branches)

Same as production, but pointing to staging/preview environments.

### Development Variables

```
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-local-anon-key
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_ENV=development
```

## Step 5: Configure Build Settings

In Vercel dashboard → Project Settings → Build & Development Settings:

- **Framework Preset**: Other
- **Build Command**: `npm run build` (will add web build script in Phase 3)
- **Output Directory**: `web-build`
- **Install Command**: `npm install`

## Step 6: Deploy

### Automatic Deployment

Vercel will automatically deploy:
- **Production**: when you push to `main` branch
- **Preview**: when you push to any other branch or create a PR

### Manual Deployment

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Step 7: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Enable HTTPS (automatic with Vercel)

## CI/CD Integration

The project includes GitHub Actions workflow for Vercel deployment. Ensure you have these secrets in your GitHub repository:

- `VERCEL_TOKEN`: Your Vercel API token
- `VERCEL_ORG_ID`: Your Vercel organization ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

To get these values:

```bash
# Get org and project IDs
cat .vercel/project.json

# Get Vercel token
# Go to Vercel → Account Settings → Tokens → Create
```

## Performance Optimization

The `vercel.json` configuration includes:

- **Security Headers**: CSP, X-Frame-Options, etc.
- **Caching**: Static assets cached for 1 year
- **Compression**: Automatic Brotli/Gzip compression
- **Edge Network**: Global CDN for fast delivery

## Monitoring

Enable Vercel Analytics:

1. Go to Project Settings → Analytics
2. Enable Web Analytics (privacy-friendly)
3. View performance metrics in dashboard

## Cost Optimization

- **Hobby Plan**: Free for personal projects (included features):
  - 100GB bandwidth/month
  - Unlimited deployments
  - HTTPS certificates
  - Preview deployments

- **Pro Plan**: $20/month (recommended for production):
  - 1TB bandwidth/month
  - Advanced analytics
  - Team collaboration
  - Password protection

## Troubleshooting

### Build Failures

1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in `package.json`
3. Verify environment variables are set
4. Test build locally: `npm run build`

### Environment Variables Not Working

1. Ensure variables are prefixed with `EXPO_PUBLIC_` for client-side access
2. Redeploy after adding new environment variables
3. Check variable scopes (Production/Preview/Development)

### Deploy Hooks

Create deploy hooks for automated deployments:

1. Go to Project Settings → Git → Deploy Hooks
2. Create a hook for your branch
3. Use the webhook URL to trigger deployments

Example:
```bash
curl -X POST https://api.vercel.com/v1/integrations/deploy/YOUR_HOOK_ID
```

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Expo Web Documentation](https://docs.expo.dev/workflow/web/)
- [Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)
