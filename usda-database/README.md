# Local USDA Database Setup

This module provides a local USDA FoodData Central database for fast food searches without API calls.

## Why Use Local Database?

- **10-100x faster** searches (milliseconds vs seconds)
- **No rate limits** - unlimited searches
- **No network dependency** - works offline
- **Better reliability** - no API downtime

## Setup Instructions

### 1. Install Dependencies

```bash
cd usda-database
pip install -r requirements.txt
```

### 2. Download and Setup Database

Run the setup script (this will take ~10-15 minutes):

```bash
python download_usda.py
```

This will:
1. Download the latest USDA FoodData Central dataset (~500 MB)
2. Extract the CSV files
3. Import data into SQLite database
4. Create search indexes

**Expected Database Size:** ~200-300 MB

### 3. Verify Setup

Check if the database was created successfully:

```bash
ls -lh usda_foods.db
```

You should see a file around 200-300 MB.

### 4. Test the Database

You can test the local search with Python:

```python
from usda_search import get_usda_search

# Initialize search
usda = get_usda_search()

# Search for foods
results = usda.search_foods("salmon", limit=5)
for food in results:
    print(f"{food['fdcId']}: {food['description']}")

# Get food details
details = usda.get_food_details(173688)  # Salmon
print(f"Nutrients: {len(details['foodNutrients'])}")

# Get stats
stats = usda.get_stats()
print(f"Total foods: {stats['total_foods']:,}")
```

## API Endpoints

The Flask server automatically provides these endpoints once the database is set up:

### Search Foods
```
GET /api/usda/search?query=salmon&limit=20
```

Response:
```json
{
  "success": true,
  "totalHits": 20,
  "foods": [
    {
      "fdcId": 173688,
      "description": "Fish, salmon, chinook, raw",
      "dataType": "SR Legacy"
    }
  ]
}
```

### Get Food Details
```
GET /api/usda/food/173688
```

Response:
```json
{
  "success": true,
  "food": {
    "fdcId": 173688,
    "description": "Fish, salmon, chinook, raw",
    "dataType": "SR Legacy",
    "foodNutrients": [...]
  }
}
```

### Get Database Stats
```
GET /api/usda/stats
```

Response:
```json
{
  "success": true,
  "stats": {
    "total_foods": 123456,
    "total_nutrients": 150,
    "data_types": 3
  }
}
```

## Frontend Integration

The frontend (`home.js`) automatically uses the local database when available. It will:

1. **Try local database first** - Fast response (milliseconds)
2. **Fallback to USDA API** - If local DB not available
3. **Show "⚡ Using LOCAL database (fast!)"** in console logs

## Performance Comparison

| Operation | USDA API | Local Database | Improvement |
|-----------|----------|----------------|-------------|
| Search    | 500-1000ms | 5-20ms | **50-100x faster** |
| Details   | 500-1000ms | 2-10ms | **100x faster** |
| Total (3 foods) | 3-6 seconds | 30-100ms | **60x faster** |

## Updating the Database

To update to the latest USDA data:

1. Delete the old database:
   ```bash
   rm usda_foods.db
   rm -rf usda_data/
   ```

2. Run the setup script again:
   ```bash
   python download_usda.py
   ```

USDA typically updates their database monthly.

## Database Schema

### Tables

1. **foods** - Main food items
   - `fdc_id` (PRIMARY KEY)
   - `data_type` (Foundation, SR Legacy, Survey FNDDS, Branded)
   - `description`
   - `food_category_id`
   - `publication_date`

2. **nutrients** - Nutrient definitions
   - `id` (PRIMARY KEY)
   - `name`
   - `unit_name`
   - `nutrient_nbr`

3. **food_nutrient** - Food-nutrient relationships
   - `id` (PRIMARY KEY)
   - `fdc_id` (FOREIGN KEY → foods)
   - `nutrient_id` (FOREIGN KEY → nutrients)
   - `amount`

4. **foods_fts** - Full-text search index (FTS5)
   - Enables fast text search on food descriptions

### Indexes

- `idx_foods_description` - Fast description lookups
- `idx_foods_data_type` - Filter by data type
- `idx_food_nutrient_fdc` - Fast nutrient lookups
- `idx_nutrients_name` - Nutrient name search

## Troubleshooting

### Database not found error
```
FileNotFoundError: USDA database not found
```
**Solution:** Run `python download_usda.py` to create the database.

### Import error in Flask
```
Warning: Local USDA database not available
```
**Solution:** The database works but isn't set up yet. The app will use USDA API as fallback.

### Slow imports
The initial import takes 10-15 minutes due to the large dataset. This is normal and only happens once.

### Database size
If disk space is a concern, you can modify `download_usda.py` to only import specific data types (e.g., only Foundation and SR Legacy foods).

## Data Sources

- **USDA FoodData Central**: https://fdc.nal.usda.gov/
- **Download URL**: https://fdc.nal.usda.gov/fdc-datasets/
- **License**: Public Domain (U.S. Government work)

## License

This module uses public domain data from the USDA. The code is part of the track-nutrition project.


