# How to Scrape More Recipes from Pick Up Limes

## Current Status
You currently have recipes for:
- **egg** (156 recipes in `pickup_limes_egg_detailed.json`)
- **avocado** (scraped data)
- **dinner** (scraped data)
- **breakfast** (scraped data)

## Methods to Scrape More Recipes

### 1. Quick Individual Searches

Use your existing `pickup_limes_scraper.py` with different search terms:

```bash
# Popular ingredients
python pickup_limes_scraper.py --search chickpea --pages 5
python pickup_limes_scraper.py --search lentil --pages 4
python pickup_limes_scraper.py --search quinoa --pages 4
python pickup_limes_scraper.py --search tofu --pages 4

# Vegetables
python pickup_limes_scraper.py --search broccoli --pages 3
python pickup_limes_scraper.py --search spinach --pages 4
python pickup_limes_scraper.py --search mushroom --pages 4

# Meal types
python pickup_limes_scraper.py --search lunch --pages 5
python pickup_limes_scraper.py --search soup --pages 5
python pickup_limes_scraper.py --search salad --pages 5
python pickup_limes_scraper.py --search dessert --pages 4

# Grains and starches
python pickup_limes_scraper.py --search rice --pages 5
python pickup_limes_scraper.py --search pasta --pages 5
python pickup_limes_scraper.py --search potato --pages 4
```

### 2. Batch Scraping (Automated)

I've created `batch_scraper.py` that will automatically scrape 25+ different search terms:

```bash
# Run the batch scraper (will take 2-3 hours)
python batch_scraper.py
```

This will scrape:
- **Proteins**: chickpea, lentil, beans, tofu, tempeh, quinoa
- **Vegetables**: broccoli, spinach, kale, mushroom, cauliflower, carrot, tomato, bell pepper
- **Grains**: rice, pasta, potato, noodles, oats
- **Meal types**: lunch, snack, dessert, soup, salad, smoothie, bowl
- **Cooking styles**: curry, stir fry, roasted, baked, grilled

### 3. Enhanced Multi-Term Scraping

Use the new `enhanced_scraper.py` for better data extraction:

```bash
# Scrape multiple terms at once
python enhanced_scraper.py --search chickpea lentil quinoa --pages 4

# Scrape vegetables with more details
python enhanced_scraper.py --search broccoli spinach kale mushroom --pages 3

# Quick basic info only (faster)
python enhanced_scraper.py --search rice pasta potato --pages 5 --basic
```

## Recommended Search Terms for Maximum Coverage

### High-Value Ingredients (Expected 100+ recipes each)
```bash
python pickup_limes_scraper.py --search chickpea --pages 6
python pickup_limes_scraper.py --search lentil --pages 5
python pickup_limes_scraper.py --search quinoa --pages 5
python pickup_limes_scraper.py --search rice --pages 6
python pickup_limes_scraper.py --search pasta --pages 6
```

### Popular Vegetables (Expected 50+ recipes each)
```bash
python pickup_limes_scraper.py --search broccoli --pages 4
python pickup_limes_scraper.py --search spinach --pages 4
python pickup_limes_scraper.py --search mushroom --pages 4
python pickup_limes_scraper.py --search cauliflower --pages 3
python pickup_limes_scraper.py --search tomato --pages 4
```

### Meal Categories (Expected 100+ recipes each)
```bash
python pickup_limes_scraper.py --search lunch --pages 6
python pickup_limes_scraper.py --search soup --pages 5
python pickup_limes_scraper.py --search salad --pages 5
python pickup_limes_scraper.py --search smoothie --pages 4
```

### Dietary/Style Categories
```bash
python pickup_limes_scraper.py --search vegan --pages 8
python pickup_limes_scraper.py --search gluten-free --pages 5
python pickup_limes_scraper.py --search healthy --pages 6
python pickup_limes_scraper.py --search easy --pages 6
```

## Tips for Effective Scraping

### 1. **Be Respectful to the Server**
- Use delays between requests: `--delay 3` (3 seconds)
- Don't run multiple scrapers simultaneously
- Consider scraping during off-peak hours

### 2. **Optimize Your Searches**
- Start with broad terms that will yield more recipes
- Check the results to see if you need more pages
- Use `--basic` flag for quick overview before detailed scraping

### 3. **Monitor Your Progress**
```bash
# Check how many recipes you have
ls -la pickup_limes_database/json/
wc -l pickup_limes_database/json/*.json

# Check file sizes to estimate recipe counts
du -h pickup_limes_database/
```

## Expected Results

Based on Pick Up Limes content, you can expect to scrape approximately:

- **Total unique recipes**: 2,000-3,000+
- **Per search term**: 20-200 recipes depending on popularity
- **High-yield terms**: chickpea, rice, pasta, lunch, soup
- **Medium-yield terms**: specific vegetables, cooking methods
- **Low-yield terms**: very specific ingredients or techniques

## File Organization

Your scraped data will be organized as:
```
pickup_limes_database/
├── json/
│   ├── pickup_limes_chickpea_detailed.json
│   ├── pickup_limes_lentil_detailed.json
│   └── ...
├── csv/
│   ├── pickup_limes_chickpea_recipes.csv
│   └── ...
└── images/
    ├── recipe_123.jpg
    └── ...
```

## Troubleshooting

### If a search fails:
1. Check your internet connection
2. Try increasing the delay: `--delay 5`
3. Try fewer pages first: `--pages 2`
4. Use the enhanced scraper with retry logic

### If you get blocked:
1. Wait 30 minutes before trying again
2. Use a VPN if necessary
3. Reduce the scraping frequency

### If you want to resume:
1. Check which terms you've already scraped: `ls pickup_limes_database/json/`
2. Skip those terms in your next batch
3. Or use the enhanced scraper which handles duplicates better

## Next Steps After Scraping

1. **Combine all data**: Use your existing `combine_recipes.py`
2. **Search and filter**: Use your `search_recipes.py`
3. **Build a web interface**: Use your `recipe_browser.py`
4. **Data analysis**: Analyze ingredients, cooking times, etc.

---

**Happy scraping! 🍳📊** 