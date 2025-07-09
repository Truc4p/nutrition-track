# Manual USDA API Curl Tests for Nutrient Categories

## Question: Does USDA categorize individual nutrients?
Example: Is calcium categorized as "mineral"? Is vitamin C categorized as "vitamin"?

## Quick Test Commands

### Test 1: Check if nutrients have category fields in food responses

```bash
# Get detailed abalone data (matching your CSV)
curl -X GET "https://api.nal.usda.gov/fdc/v1/foods/search" \
  -G -d "query=abalone" -d "api_key=7bf0q1sg6jba188aZpaYE9oeSvcifU9S1sCJQHgx" -d "pageSize=1" \
  | jq -r '.foods[0].fdcId'

# Use the FDC ID from above (replace XXXX with actual ID)
curl -X GET "https://api.nal.usda.gov/fdc/v1/food/XXXX" \
  -G -d "api_key=7bf0q1sg6jba188aZpaYE9oeSvcifU9S1sCJQHgx" \
  | jq '.foodNutrients[0:5] | .[] | {
      nutrientName: .nutrient.name,
      nutrientNumber: .nutrient.number,
      unitName: .nutrient.unitName,
      category: .nutrient.category // "NOT_FOUND",
      group: .nutrient.group // "NOT_FOUND",
      type: .nutrient.type // "NOT_FOUND"
    }'
```

### Test 2: Check for nutrients endpoint

```bash
# Test if there's a nutrients list endpoint
curl -X GET "https://api.nal.usda.gov/fdc/v1/nutrients" \
  -G -d "api_key=7bf0q1sg6jba188aZpaYE9oeSvcifU9S1sCJQHgx" \
  | jq '.[0:5] | .[] | {
      id: .id,
      name: .name,
      unitName: .unitName,
      category: .category // "NOT_FOUND",
      group: .group // "NOT_FOUND"
    }'
```

### Test 3: Test specific nutrient IDs for categories

```bash
# Test Calcium (nutrient ID 1087)
curl -X GET "https://api.nal.usda.gov/fdc/v1/nutrient/1087" \
  -G -d "api_key=7bf0q1sg6jba188aZpaYE9oeSvcifU9S1sCJQHgx" \
  | jq '{
      id: .id,
      name: .name,
      unitName: .unitName,
      category: .category // "NOT_FOUND",
      group: .group // "NOT_FOUND"
    }'

# Test Vitamin C (nutrient ID 1162)
curl -X GET "https://api.nal.usda.gov/fdc/v1/nutrient/1162" \
  -G -d "api_key=7bf0q1sg6jba188aZpaYE9oeSvcifU9S1sCJQHgx" \
  | jq '{
      id: .id,
      name: .name,
      unitName: .unitName,
      category: .category // "NOT_FOUND",
      group: .group // "NOT_FOUND"
    }'

# Test Iron (nutrient ID 1089)
curl -X GET "https://api.nal.usda.gov/fdc/v1/nutrient/1089" \
  -G -d "api_key=7bf0q1sg6jba188aZpaYE9oeSvcifU9S1sCJQHgx" \
  | jq '{
      id: .id,
      name: .name,
      unitName: .unitName,
      category: .category // "NOT_FOUND",
      group: .group // "NOT_FOUND"
    }'
```

### Test 4: One-liner to check abalone nutrients quickly

```bash
# Quick check of abalone's calcium specifically
curl -X GET "https://api.nal.usda.gov/fdc/v1/foods/search" \
  -G -d "query=abalone" -d "api_key=7bf0q1sg6jba188aZpaYE9oeSvcifU9S1sCJQHgx" -d "pageSize=1" \
  | jq -r '.foods[0].fdcId' | xargs -I {} \
  curl -X GET "https://api.nal.usda.gov/fdc/v1/food/{}" \
    -G -d "api_key=7bf0q1sg6jba188aZpaYE9oeSvcifU9S1sCJQHgx" \
    | jq '.foodNutrients[] | select(.nutrient.name | contains("Calcium")) | {
        nutrientName: .nutrient.name,
        value: .amount,
        unit: .nutrient.unitName,
        category: .nutrient.category // "NOT_FOUND",
        group: .nutrient.group // "NOT_FOUND"
      }'
```

### Test 5: Check different nutrient types in one go

```bash
# Get various nutrient types from abalone
curl -X GET "https://api.nal.usda.gov/fdc/v1/foods/search" \
  -G -d "query=abalone" -d "api_key=7bf0q1sg6jba188aZpaYE9oeSvcifU9S1sCJQHgx" -d "pageSize=1" \
  | jq -r '.foods[0].fdcId' | xargs -I {} \
  curl -X GET "https://api.nal.usda.gov/fdc/v1/food/{}" \
    -G -d "api_key=7bf0q1sg6jba188aZpaYE9oeSvcifU9S1sCJQHgx" \
    | jq '.foodNutrients[] | select(.nutrient.name | test("Calcium|Vitamin|Iron|Protein")) | {
        nutrientName: .nutrient.name,
        value: .amount,
        unit: .nutrient.unitName,
        category: .nutrient.category // "NOT_FOUND",
        group: .nutrient.group // "NOT_FOUND",
        type: .nutrient.type // "NOT_FOUND"
      }'
```

## Expected Categories (if available)

If USDA provides nutrient categories, we might see:

| Nutrient | Expected Category |
|----------|-------------------|
| Calcium, Ca | Mineral |
| Iron, Fe | Mineral |
| Vitamin C | Vitamin |
| Vitamin A | Vitamin |
| Protein | Macronutrient |
| Carbohydrate | Macronutrient |
| Fatty acids, total saturated | Lipid/Fat |

## What to Look For

In the JSON responses, check for fields like:
- `category` 
- `group`
- `type`
- `classification`

If these fields exist and contain values like "mineral", "vitamin", "macronutrient", then USDA DOES provide nutrient categorization.

## Current Django Implementation

Your current Django app already has a basic categorization system in `NutrientType.category`:

```python
def categorize_nutrient(name):
    name_lower = name.lower()
    if any(term in name_lower for term in ['protein', 'carbohydrate', 'fat', 'lipid', 'fiber', 'energy', 'calories']):
        return 'macronutrient'
    elif any(term in name_lower for term in ['vitamin', 'ascorbic', 'folate']):
        return 'vitamin'
    elif any(term in name_lower for term in ['calcium', 'iron', 'potassium', 'sodium', 'mg', 'zinc']):
        return 'mineral'
    elif any(term in name_lower for term in ['fatty acids', 'cholesterol', 'saturated', 'monounsaturated', 'polyunsaturated']):
        return 'lipid'
    else:
        return 'other'
```

If USDA provides explicit categories, you could replace this with official USDA classifications! 