# Pick Up Limes Recipe Scraper

This Python scraper extracts **ALL recipes** from [Pick Up Limes](https://www.pickuplimes.com/recipe/?sb=&public=on) website, collecting the following data for each recipe:

- **Name**: Recipe title
- **Image**: Recipe image URL
- **Total Time**: Cooking/preparation time
- **Ingredients**: Complete list of ingredients
- **Tags**: Recipe categories and dietary information

## Features

✅ **Scrapes ALL recipes** (no search term filtering required)  
✅ **Extracts recipe images** from Pick Up Limes CDN  
✅ **Gets structured data** from JSON-LD when available  
✅ **Exports to both JSON and CSV** formats  
✅ **Handles pagination** automatically  
✅ **Rate limiting** to be respectful to the server  
✅ **Duplicate removal** based on recipe URLs  

## Usage

### Basic Usage - Scrape All Recipes

```bash
# Scrape all recipes (unlimited pages)
python pickup_limes_scraper.py --pages 0

# Scrape first 50 pages (default)
python pickup_limes_scraper.py

# Scrape first 10 pages with 3-second delay
python pickup_limes_scraper.py --pages 10 --delay 3
```

### Command Line Arguments

| Argument | Short | Default | Description |
|----------|-------|---------|-------------|
| `--pages` | `-p` | `50` | Maximum pages to scrape (0 = all pages) |
| `--delay` | `-d` | `2` | Delay between requests in seconds |
| `--basic` | `-b` | `False` | Only fetch basic info, not detailed pages |
| `--output-dir` | `-o` | `pickup_limes_database` | Output directory |

### Examples

```bash
# Get all recipes with full details (may take several hours)
python pickup_limes_scraper.py --pages 0 --delay 2

# Quick test with first 5 pages
python pickup_limes_scraper.py --pages 5 --delay 1

# Get only basic recipe info (faster)
python pickup_limes_scraper.py --pages 20 --basic

# Custom output directory
python pickup_limes_scraper.py --pages 10 --output-dir my_recipes
```

## Output Files

The scraper creates a structured directory:

```
pickup_limes_database/
├── json/
│   └── pickup_limes_all_recipes_detailed.json
├── csv/
│   └── pickup_limes_all_recipes.csv
└── images/
    └── (downloaded images if implemented)
```

### JSON Output Format

```json
{
  "id": 2919,
  "name": "Green Goddess Salad Dressing",
  "image": "https://cdn.pickuplimes.com/cache/98/ea/98eaca8cbc292ac09c82cee8dfe33d75.jpg",
  "url": "https://www.pickuplimes.com/recipe/green-goddess-salad-dressing-2919",
  "total_time": "PT05M",
  "tags": [
    "One-bowl / one-pot",
    "No cook",
    "peanut free",
    "tree nut free",
    "sesame free",
    "gluten free",
    "vegan",
    "vegetarian",
    "plant-based"
  ],
  "ingredients": [
    "⅔ cup unsweetened soy yogurt",
    "⅓ cup vegan mayonnaise",
    "1 lemon",
    "2 garlic clove",
    "¼ cup fresh chives",
    "¼ cup fresh parsley",
    "2 Tbsp fresh basil",
    "2 Tbsp fresh dill",
    "1 Tbsp maple syrup",
    "½ Tbsp capers",
    "½ Tbsp white miso paste",
    "1 pinch salt"
  ]
}
```

### CSV Output Format

| Field | Description |
|-------|-------------|
| `id` | Recipe ID from Pick Up Limes |
| `name` | Recipe name/title |
| `image` | Direct image URL |
| `url` | Recipe page URL |
| `total_time` | Time in ISO format (PT05M = 5 minutes) |
| `ingredients_text` | Ingredients separated by newlines |
| `tags_text` | Tags separated by commas |

## Key Improvements Made

### 1. **All Recipes Collection**
- Removed search term dependency
- Uses empty search (`sb=`) to get all available recipes
- Automatic pagination through all pages

### 2. **Enhanced Data Extraction**
- **Structured Data Priority**: Uses JSON-LD structured data when available
- **Image Extraction**: Multiple fallback methods for recipe images
- **Time Parsing**: Handles ISO duration format and text descriptions
- **Tag Collection**: Extracts dietary restrictions, cooking methods, etc.
- **Ingredient Lists**: Clean formatting and HTML entity handling

### 3. **Better Error Handling**
- Graceful handling of missing data
- Duplicate removal based on URLs
- Skip invalid/broken recipe pages
- Comprehensive error logging

### 4. **Output Formats**
- **JSON**: Complete structured data
- **CSV**: Flattened format for database import
- **Unicode Support**: Proper handling of special characters

## Technical Details

### Rate Limiting
- Default 2-second delay between requests
- Respectful to Pick Up Limes servers
- Adjustable delay for slower/faster scraping

### Data Quality
- Removes duplicate recipes
- Validates recipe URLs
- Filters out non-recipe pages
- Cleans ingredient text formatting

### Time Format
Pick Up Limes uses ISO 8601 duration format:
- `PT05M` = 5 minutes
- `PT30M` = 30 minutes  
- `PT01H40M` = 1 hour 40 minutes

## Estimated Runtime

| Pages | Recipes | Estimated Time |
|-------|---------|----------------|
| 5 | ~75 | 5-10 minutes |
| 20 | ~300 | 20-30 minutes |
| 50 | ~750 | 1-2 hours |
| All | ~1000+ | 3-5 hours |

*Note: Times vary based on network speed and server response*

## Dependencies

```bash
pip install requests beautifulsoup4
```

## Sample Usage Results

From a test run of 2 pages:
- **Found**: 30 total recipe links
- **After deduplication**: 27 unique recipes  
- **Successfully extracted**: 27 recipes with full details
- **Data fields**: All requested fields (name, image, total_time, ingredients, tags)

## Tips for Large-Scale Scraping

1. **Start Small**: Test with `--pages 5` first
2. **Monitor Progress**: Watch for error messages
3. **Be Patient**: Full scraping can take hours
4. **Check Output**: Verify data quality with small samples
5. **Resume if Needed**: The scraper can be run multiple times safely 