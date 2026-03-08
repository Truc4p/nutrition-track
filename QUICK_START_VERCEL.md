# Quick Start: Deploy to Vercel

## 🚀 5-Minute Deployment

### Step 1: Get Your API Keys (5 minutes)

You need three API keys:

1. **Gemini API Key** → https://aistudio.google.com/apikey
2. **USDA API Key** → https://fdc.nal.usda.gov/api-key-signup.html  
3. **YouTube API Key** → https://console.cloud.google.com/

Save these keys - you'll need them in Step 4.

### Step 2: Push to Git (2 minutes)

```bash
# If you haven't pushed to Git yet:
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 3: Deploy to Vercel (2 minutes)

**Option A: Using Vercel Dashboard (Recommended)**

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Vercel will auto-detect settings
4. Click **Deploy**

**Option B: Using CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel
```

### Step 4: Add Environment Variables (3 minutes)

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Settings** → **Environment Variables**
3. Add these three variables:

   | Variable Name | Value | 
   |--------------|-------|
   | `GEMINI_KEY` | [your key from step 1] |
   | `USDA_API_KEY` | [your key from step 1] |
   | `YOUTUBE_API_KEY` | [your key from step 1] |

4. Select **Production** + **Preview** + **Development** for each

### Step 5: Redeploy (1 minute)

The app needs to redeploy to use the environment variables:

**Via Dashboard**: Go to Deployments → Click ⋯ → Redeploy

**Via CLI**:
```bash
vercel --prod
```

### Step 6: Test! 🎉

Your app is live at: `https://your-project.vercel.app`

Test these pages:
- Home: `/`
- Search: `/search.html`
- Chat: `/chat.html`
- Meal Search: `/meal-search.html`

## ⚠️ Important Notes

### What Works
✅ Recipe search  
✅ AI chatbot  
✅ Meal image analysis  
✅ USDA food search (via API)  
✅ Recipe recommendations  

### What Might Not Work (Without Additional Setup)
⚠️ YouTube video integration (needs database migration)  
⚠️ Local USDA database (use API instead)  

### Free Tier Limits
- 100GB bandwidth/month
- 10-second function timeout (we configured 30s, requires Pro)
- 100 deployments/day

## 🆘 Troubleshooting

**Problem**: Build fails  
**Solution**: Check build logs in Vercel dashboard

**Problem**: API errors  
**Solution**: Verify environment variables are set correctly

**Problem**: Static files not loading  
**Solution**: Check browser console for 404 errors

## 📚 More Help

- [Full Deployment Guide](VERCEL_DEPLOYMENT.md) - Detailed instructions
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Pre-deployment checks
- [Vercel Docs](https://vercel.com/docs) - Official documentation

## 🎯 Next Steps

After successful deployment:

1. ✅ Test all features
2. 🌐 Set up custom domain (optional)
3. 📱 Update API URLs in mobile app
4. 🔍 Set up error monitoring
5. 📊 Enable analytics

---

**Questions?** Check the detailed guides or Vercel documentation.
