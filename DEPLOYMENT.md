# SafariWrap - Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Import Project to Vercel
1. Nenda [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import repository: `SOFTMAN20/SAFARIWRAP`
4. Framework Preset: **Next.js** (auto-detected)
5. Root Directory: `./` (default)

### 2. Configure Environment Variables
Kabla ya ku-deploy, ongeza environment variables hizi kwenye Vercel:

#### Required Variables (Lazima)
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### Optional Variables (Kwa features za ziada)
```bash
# Mapbox (for tree location maps)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# Snippe.sh Payment Integration (Phase 8)
SNIPPESH_API_KEY=your_snippesh_api_key
SNIPPESH_WEBHOOK_SECRET=your_snippesh_webhook_secret
NEXT_PUBLIC_SNIPPESH_PUBLISHABLE_KEY=your_snippesh_publishable_key
```

### 3. Jinsi ya Kuongeza Environment Variables kwenye Vercel

**Option 1: Kupitia Vercel Dashboard**
1. Kwenye project settings, nenda **"Environment Variables"**
2. Ongeza kila variable moja kwa moja:
   - **Key**: Jina la variable (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value**: Thamani yake
   - **Environment**: Select **Production**, **Preview**, na **Development**
3. Click **"Save"**

**Option 2: Kupitia Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_APP_URL
vercel env add NEXT_PUBLIC_MAPBOX_TOKEN
```

### 4. Deploy
Baada ya kuongeza environment variables:
1. Click **"Deploy"** kwenye Vercel dashboard
2. Au tumia CLI: `vercel --prod`

### 5. Update NEXT_PUBLIC_APP_URL
Baada ya deployment ya kwanza:
1. Copy production URL (e.g., `https://safariwrap.vercel.app`)
2. Update `NEXT_PUBLIC_APP_URL` environment variable na URL hiyo
3. Redeploy: `vercel --prod` au trigger deployment kwenye dashboard

## 🔧 Build Settings (Auto-configured)

Vercel itakuwa na settings hizi automatically:
- **Framework**: Next.js
- **Build Command**: `pnpm build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`
- **Node Version**: 20.x (recommended)

## 📋 Pre-Deployment Checklist

- [ ] Supabase project iko live na configured
- [ ] Database schema imetengenezwa (10 tables)
- [ ] Storage bucket `safariwrap-assets` imetengenezwa
- [ ] RLS policies zimeactivated
- [ ] Environment variables zimeongezwa kwenye Vercel
- [ ] `.env.local` haiko kwenye Git (✅ already done)
- [ ] `pnpm-lock.yaml` iko updated (✅ already done)

## 🌍 Post-Deployment Steps

### 1. Configure Supabase Auth Redirect URLs
Kwenye Supabase Dashboard → Authentication → URL Configuration:

**Site URL:**
```
https://your-app.vercel.app
```

**Redirect URLs (whitelist):**
```
https://your-app.vercel.app/auth/callback
https://your-app.vercel.app/login
https://your-app.vercel.app/signup
http://localhost:3000/auth/callback (for local development)
```

### 2. Test Critical Features
- [ ] Login/Signup functionality
- [ ] Create trip
- [ ] Submit review (guest flow)
- [ ] Generate wrap
- [ ] View wrap
- [ ] Share wrap

### 3. Setup Custom Domain (Optional)
1. Kwenye Vercel project settings → **Domains**
2. Add custom domain (e.g., `safariwrap.com`)
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` to custom domain
5. Update Supabase redirect URLs

## 🐛 Common Deployment Issues

### Issue 1: Build Fails - "Cannot find module"
**Solution:** Ensure all dependencies are in `package.json` and `pnpm-lock.yaml` is updated
```bash
pnpm install
git add pnpm-lock.yaml
git commit -m "Update lockfile"
git push
```

### Issue 2: Environment Variables Not Working
**Solution:** 
- Ensure variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding/updating variables
- Check variable names match exactly (case-sensitive)

### Issue 3: Supabase Connection Fails
**Solution:**
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check Supabase project is not paused
- Verify RLS policies allow access

### Issue 4: 404 on Dynamic Routes
**Solution:** This shouldn't happen with Next.js App Router, but if it does:
- Ensure `next.config.ts` has correct configuration
- Check file structure matches route patterns

## 📊 Monitoring & Analytics

### Vercel Analytics (Built-in)
- Automatically enabled for all deployments
- View performance metrics in Vercel dashboard

### Supabase Logs
- Monitor database queries and errors
- Check authentication logs
- Review storage access logs

## 🔄 Continuous Deployment

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every pull request

To disable auto-deployment:
1. Project Settings → Git
2. Uncheck "Production Branch" or "Preview Deployments"

## 🎯 Next Steps After Deployment

1. **Create Admin User**: Run admin setup via `/api/admin/setup`
2. **Seed Destinations**: Already seeded (10 destinations)
3. **Test Guest Flow**: Create a trip and test QR code review submission
4. **Configure Payments**: Setup Snippe.sh integration (Phase 8)
5. **Monitor Performance**: Check Vercel Analytics and Supabase logs

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs

---

**Last Updated**: 2026-04-23
**Project**: SafariWrap Experience Intelligence Platform
**Repository**: https://github.com/SOFTMAN20/SAFARIWRAP
