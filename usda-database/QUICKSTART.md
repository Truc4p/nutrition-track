# Quick Start Guide - Local USDA Database

Get your food searches running **60x faster** in just 3 steps!

## ⚡ Quick Setup (10-15 minutes)

### Step 1: Install Dependencies
```bash
cd usda-database
pip install -r requirements.txt
```

### Step 2: Download & Setup Database
```bash
python download_usda.py
```

This downloads ~500MB of data and creates a ~250MB SQLite database. **Go grab a coffee! ☕**

### Step 3: Restart Your Server
```bash
cd ../web-ui
python server.py
```

**That's it!** Your app now uses the local database automatically. 🎉

## ✅ How to Verify It's Working

1. Open your browser to `http://localhost:5001`
2. Open the browser console (F12)
3. Enter some food: `I ate 150g salmon, 100g rice, and 50g broccoli`
4. Look for these logs:

```
⚡ Using LOCAL database (fast!)   ← You should see this!
```

If you see "⚡ Using LOCAL database", you're all set!

## 📊 Performance Improvements

**Before (USDA API):**
```
🔍 Searching for: salmon
⏰ Response time: 500-1000ms
```

**After (Local Database):**
```
🔍 Searching for: salmon
⚡ Using LOCAL database (fast!)
⏰ Response time: 5-20ms  ← 50-100x faster!
```

**Total time for 3 foods:**
- Before: 3-6 seconds ⏱️
- After: 30-100ms ⚡ (**60x faster!**)

## 🔍 Testing the Database

Test directly in Python:

```python
from usda_search import get_usda_search

usda = get_usda_search()

# Quick search test
results = usda.search_foods("chicken")
print(f"Found {len(results)} results!")

# Check stats
stats = usda.get_stats()
print(f"Database has {stats['total_foods']:,} foods!")
```

## 🚨 Troubleshooting

### "Database not found" error?
Run the setup script:
```bash
python download_usda.py
```

### Still using API (no ⚡ symbol)?
1. Check that `usda_foods.db` exists in the `usda-database/` folder
2. Restart the Flask server
3. Check server logs for USDA initialization messages

### Out of disk space?
You need ~1GB free space:
- Download: ~500MB
- Extracted: ~300MB  
- Database: ~250MB

After setup, you can delete the download files:
```bash
rm usda_data.zip
rm -rf usda_data/
```

## 📝 What Got Updated?

1. **New folder:** `usda-database/` - Contains all the database code
2. **Updated:** `web-ui/server.py` - Added 3 new API endpoints
3. **Updated:** `web-ui/home.js` - Auto-uses local DB with API fallback

## 🔄 Updating the Database

USDA updates their database monthly. To update:

```bash
cd usda-database
rm usda_foods.db
python download_usda.py
```

## 💡 Tips

- **First search might be slow** - Database needs to load into memory
- **Subsequent searches are lightning fast** - Everything is cached
- **Works offline** - No internet needed after setup!
- **No rate limits** - Search as much as you want!

## 📚 Need More Info?

See the full [README.md](README.md) for:
- Database schema details
- API endpoint documentation
- Advanced configuration
- Performance benchmarks

---

**Enjoy your superfast nutrition tracking! 🚀**


