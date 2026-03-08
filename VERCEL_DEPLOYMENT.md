# Vercel Deployment Guide

This guide will help you deploy the Track Nutrition web application to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Git repository (push your code to GitHub, GitLab, or Bitbucket)
3. API Keys:
   - **Gemini API Key**: Get from [Google AI Studio](https://aistudio.google.com/apikey)
   - **USDA API Key**: Get from [USDA Food Data Central](https://fdc.nal.usda.gov/api-key-signup.html)
   - **YouTube API Key**: Get from [Google Cloud Console](https://console.cloud.google.com/)

## Project Structure

The project includes:
- `web-ui/` - Main web application with Flask backend
- `meal-scraper/` - Recipe database
- `youtube-scraper/` - YouTube video integration
- `usda-database/` - USDA food database utilities

## Deployment Steps

### Step 1: Prepare Your Repository

1. Ensure all code is committed to Git:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

### Step 2: Install Vercel CLI (Optional)

You can deploy via CLI or the Vercel dashboard. For CLI:

```bash
npm install -g vercel
```

### Step 3: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Vercel will auto-detect the configuration from `vercel.json`
4. Click "Deploy"

#### Option B: Deploy via CLI

1. Navigate to your project directory:
   ```bash
   cd /path/to/track-nutrition
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Link to existing project or create new one
   - Confirm project settings
   - Deploy!

5. For production deployment:
   ```bash
   vercel --prod
   ```

### Step 4: Configure Environment Variables

After deploying, you need to add environment variables:

#### Via Vercel Dashboard:

1. Go to your project on Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `GEMINI_KEY` | Your Gemini API key | Production, Preview, Development |
   | `USDA_API_KEY` | Your USDA API key | Production, Preview, Development |
   | `YOUTUBE_API_KEY` | Your YouTube API key | Production, Preview, Development |

#### Via CLI:

```bash
vercel env add GEMINI_KEY
vercel env add USDA_API_KEY
vercel env add YOUTUBE_API_KEY
```

After adding environment variables, redeploy:
```bash
vercel --prod
```

## Important Considerations

### 1. Database Limitations

⚠️ **SQLite Database Issue**: The YouTube scraper uses SQLite which doesn't work well with Vercel's serverless environment because:
- Serverless functions are stateless
- File system is read-only except for `/tmp`
- Data won't persist across function invocations

**Solutions**:
- Use **Vercel Postgres** or **Supabase** for the YouTube video database
- Use **Vercel KV** for simple key-value storage
- Or disable YouTube integration temporarily

### 2. File Size Limits

Vercel has deployment size limits:
- Function size: 50MB (uncompressed)
- Total deployment: 100MB

Large files to watch:
- Recipe images in `meal-scraper/pickup_limes_database/images/`
- USDA database files in `usda-database/usda_data/`

**Solutions**:
- Store images on a CDN (Cloudinary, AWS S3, etc.)
- Use cloud storage for large databases
- The `.vercelignore` file already excludes large files

### 3. Serverless Function Timeout

Default timeout is 10 seconds (Pro: 60s, Enterprise: 900s)
- The `vercel.json` sets `maxDuration: 30` (requires paid plan)
- For free tier, keep it at 10 seconds or optimize heavy operations

### 4. Static Assets

Recipe JSON files and images:
- Keep `pickup_limes_all_recipes_detailed_clean.json` in the deployment
- Move large image files to external storage

## Verifying Deployment

After deployment, test these endpoints:

1. **Home Page**: `https://your-app.vercel.app/`
2. **Recipe Search**: `https://your-app.vercel.app/api/recipes/search?query=quinoa`
3. **AI Chat**: POST to `https://your-app.vercel.app/ai/chat`
4. **USDA Search**: `https://your-app.vercel.app/api/usda/search?query=apple`

## Troubleshooting

### Build Fails

Check the build logs in Vercel dashboard. Common issues:
- Missing dependencies in `requirements.txt`
- Python version mismatch (Vercel uses Python 3.9 by default)
- Path issues (ensure all paths are relative)

### Function Errors

View function logs in Vercel dashboard:
- Check environment variables are set correctly
- Verify API keys are valid
- Check for timeout issues

### Static Files Not Loading

- Verify `vercel.json` routes configuration
- Check file paths in HTML/JS files
- Ensure files aren't in `.vercelignore`

## Alternative: Deploy Only Frontend

If you encounter issues with the Flask backend, you can:

1. Deploy only the static frontend to Vercel
2. Deploy the Flask API to another service (Render, Railway, Heroku)
3. Update API URLs in frontend code

## Post-Deployment Tasks

1. ✅ Test all features thoroughly
2. ✅ Set up custom domain (optional)
3. ✅ Configure analytics
4. ✅ Enable automatic Git deployments
5. ✅ Set up monitoring/alerts

## Updating Your Deployment

Every time you push to your Git repository:
```bash
git add .
git commit -m "Update feature X"
git push origin main
```

Vercel will automatically redeploy (if auto-deploy is enabled).

Or manually redeploy:
```bash
vercel --prod
```

## Cost Considerations

**Free Tier** includes:
- Unlimited deployments
- 100GB bandwidth/month
- Serverless function execution
- 10-second timeout

**Pro Plan** ($20/month) adds:
- Commercial use
- 60-second timeout
- More bandwidth
- Advanced features

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Python on Vercel Guide](https://vercel.com/docs/functions/runtimes/python)

## Next Steps

1. Deploy your application following the steps above
2. Test all endpoints and features
3. Configure a custom domain if desired
4. Consider migrating SQLite database to a cloud solution
5. Optimize images and large assets

---

**Good luck with your deployment! 🚀**
