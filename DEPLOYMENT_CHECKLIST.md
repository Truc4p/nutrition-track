# Pre-Deployment Checklist

Use this checklist before deploying to Vercel.

## ✅ Required Files
- [x] `vercel.json` - Vercel configuration
- [x] `requirements.txt` - Python dependencies (root level)
- [x] `.vercelignore` - Files to exclude from deployment
- [x] `.env.example` - Environment variable template

## ✅ API Keys Required
- [ ] **GEMINI_KEY** - Get from https://aistudio.google.com/apikey
- [ ] **USDA_API_KEY** - Get from https://fdc.nal.usda.gov/api-key-signup.html
- [ ] **YOUTUBE_API_KEY** - Get from Google Cloud Console

## ✅ Critical Files to Include
- [ ] `meal-scraper/pickup_limes_database/json/pickup_limes_all_recipes_detailed_clean.json`
- [ ] `web-ui/*.html` files
- [ ] `web-ui/*.js` files
- [ ] `web-ui/*.css` files
- [ ] `web-ui/nutrient-tooltip/` directory

## ⚠️ Known Issues & Workarounds

### 1. YouTube Database (SQLite)
**Issue**: SQLite doesn't work in Vercel serverless environment  
**Impact**: `/api/youtube/*` endpoints may not work  
**Workarounds**:
- Use Vercel Postgres instead
- Or use external database (Supabase, PlanetScale)
- Or disable YouTube features temporarily

### 2. USDA Local Database
**Issue**: Large local CSV files won't deploy  
**Impact**: Local USDA search may not work  
**Workarounds**:
- Use USDA API instead (already implemented)
- Store data in cloud database

### 3. Recipe Images
**Issue**: Images are large and may exceed deployment limits  
**Impact**: `/images/` and `/api/images/` endpoints  
**Workarounds**:
- Use image CDN (Cloudinary, AWS S3)
- Keep only essential images
- Compress images before deployment

## 🚀 Quick Deploy Steps

1. **Set up Git repository** (if not already)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login
   vercel login
   
   # Deploy
   vercel
   ```

3. **Add environment variables**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add: `GEMINI_KEY`, `USDA_API_KEY`, `YOUTUBE_API_KEY`

4. **Redeploy with environment variables**
   ```bash
   vercel --prod
   ```

5. **Test endpoints**
   - Visit `https://your-app.vercel.app/`
   - Test `/api/recipes/search?query=quinoa`
   - Test AI chat feature

## 🔍 Testing Checklist

After deployment, test these features:

- [ ] Home page loads
- [ ] Recipe search works
- [ ] Meal search works
- [ ] AI chatbot responds
- [ ] Image meal analysis works
- [ ] USDA food search works
- [ ] Recipe recommendations work

## 📊 Performance Considerations

- **Function timeout**: Default 10s (free tier), 30s configured (Pro required)
- **Deployment size**: Monitor in Vercel dashboard
- **Cold starts**: First request may be slow

## 🆘 Troubleshooting

### Build Fails
1. Check Vercel build logs
2. Verify all dependencies in `requirements.txt`
3. Check Python version compatibility

### Runtime Errors
1. Check function logs in Vercel dashboard
2. Verify environment variables are set
3. Test API keys are valid

### Static Files Not Found
1. Check `vercel.json` routes
2. Verify file paths
3. Check `.vercelignore` isn't excluding needed files

## 📝 Post-Deployment

- [ ] Set up custom domain (optional)
- [ ] Enable automatic deployments from Git
- [ ] Set up monitoring/error tracking
- [ ] Test on mobile devices
- [ ] Update API URLs in mobile app (if needed)

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Docs - Python](https://vercel.com/docs/functions/runtimes/python)
- [Full Deployment Guide](VERCEL_DEPLOYMENT.md)

---

**Ready to deploy?** Follow the steps above and refer to `VERCEL_DEPLOYMENT.md` for detailed instructions.
