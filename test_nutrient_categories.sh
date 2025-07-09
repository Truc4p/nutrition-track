#!/bin/bash

# USDA FoodData Central API Test for Nutrient Categories
# This script tests whether the USDA API returns category information for individual nutrients

API_KEY="7bf0q1sg6jba188aZpaYE9oeSvcifU9S1sCJQHgx"
BASE_URL="https://api.nal.usda.gov/fdc/v1"

echo "=== USDA API Nutrient Category Test ==="
echo "Testing if USDA API returns category information for individual nutrients"
echo "Example: Is calcium categorized as 'mineral'? Is vitamin C categorized as 'vitamin'?"
echo ""

# Test 1: Get detailed food information to examine nutrient structure
echo "TEST 1: Examining nutrient structure from detailed food response"
echo "============================================================="

# Get detailed info for abalone (matching your CSV data)
curl -s -X GET "${BASE_URL}/foods/search" \
  -G \
  -d "query=abalone" \
  -d "api_key=${API_KEY}" \
  -d "pageSize=1" \
  | jq -r '.foods[0].fdcId' > temp_fdc_id.txt

FDC_ID=$(cat temp_fdc_id.txt)
echo "Found Abalone with FDC ID: $FDC_ID"

curl -s -X GET "${BASE_URL}/food/${FDC_ID}" \
  -G \
  -d "api_key=${API_KEY}" \
  | jq '.' > abalone_detailed.json

echo "Detailed abalone data saved to abalone_detailed.json"
echo ""

# Extract nutrient information to check for categories
echo "Examining nutrient structure for category information:"
echo "Checking first 10 nutrients..."

cat abalone_detailed.json | jq '.foodNutrients[0:10] | .[] | {
  nutrientId: .nutrient.id,
  nutrientName: .nutrient.name,
  nutrientNumber: .nutrient.number,
  unitName: .nutrient.unitName,
  value: .amount,
  rank: .nutrient.rank,
  category: .nutrient.category // "NOT_FOUND",
  group: .nutrient.group // "NOT_FOUND",
  type: .nutrient.type // "NOT_FOUND"
}'
echo ""

# Test 2: Check if there's a nutrients endpoint that provides category info
echo "TEST 2: Checking for nutrients endpoint with category information"
echo "================================================================"

curl -s -X GET "${BASE_URL}/nutrients" \
  -G \
  -d "api_key=${API_KEY}" \
  | jq '.' > nutrients_list.json

if [ -s nutrients_list.json ] && [ "$(cat nutrients_list.json | jq 'type')" != "null" ]; then
    echo "Nutrients endpoint exists! Response saved to nutrients_list.json"
    echo "Sample nutrients with potential categories:"
    cat nutrients_list.json | jq '.[0:5] | .[] | {
      id: .id,
      name: .name,
      unitName: .unitName,
      category: .category // "NOT_FOUND",
      group: .group // "NOT_FOUND",
      type: .type // "NOT_FOUND"
    }' 2>/dev/null || echo "No category fields found in nutrients endpoint"
else
    echo "No nutrients endpoint found or empty response"
    echo "Response content:"
    cat nutrients_list.json
fi
echo ""

# Test 3: Test specific nutrients by ID to see if individual nutrient calls return categories
echo "TEST 3: Testing individual nutrient endpoints for category information"
echo "===================================================================="

# Common nutrient IDs from USDA (these are standard across the database)
declare -A nutrients=(
    ["1087"]="Calcium, Ca"
    ["1162"]="Vitamin C, total ascorbic acid" 
    ["1089"]="Iron, Fe"
    ["1003"]="Protein"
    ["1258"]="Fatty acids, total saturated"
    ["1104"]="Vitamin A, IU"
)

for nutrient_id in "${!nutrients[@]}"; do
    nutrient_name="${nutrients[$nutrient_id]}"
    echo "Testing Nutrient ID $nutrient_id: $nutrient_name"
    echo "------------------------------------------------"
    
    curl -s -X GET "${BASE_URL}/nutrient/${nutrient_id}" \
      -G \
      -d "api_key=${API_KEY}" \
      | jq '{
          id: .id,
          name: .name,
          unitName: .unitName,
          number: .number,
          category: .category // "NOT_FOUND",
          group: .group // "NOT_FOUND",
          type: .type // "NOT_FOUND",
          rank: .rank
        }' 2>/dev/null || echo "No individual nutrient endpoint or no category info"
    
    echo ""
done

# Test 4: Check for food nutrients with categories in different data types
echo "TEST 4: Checking nutrient categories across different food data types"
echo "==================================================================="

declare -a data_types=("Foundation" "Survey (FNDDS)" "SR Legacy")

for data_type in "${data_types[@]}"; do
    echo "Testing nutrients in $data_type foods:"
    echo "-------------------------------------"
    
    if [ "$data_type" = "Survey (FNDDS)" ]; then
        encoded_type="Survey%20(FNDDS)"
    else
        encoded_type="$data_type"
    fi
    
    curl -s -X GET "${BASE_URL}/foods/search" \
      -G \
      -d "query=apple" \
      -d "dataType=${encoded_type}" \
      -d "api_key=${API_KEY}" \
      -d "pageSize=1" \
      | jq -r '.foods[0].fdcId' | head -1 > temp_fdc.txt
    
    temp_fdc=$(cat temp_fdc.txt)
    if [ "$temp_fdc" != "null" ] && [ "$temp_fdc" != "" ]; then
        echo "Testing FDC ID: $temp_fdc"
        curl -s -X GET "${BASE_URL}/food/${temp_fdc}" \
          -G \
          -d "api_key=${API_KEY}" \
          | jq '.foodNutrients[0:3] | .[] | {
              nutrientName: .nutrient.name,
              nutrientNumber: .nutrient.number,
              category: .nutrient.category // "NOT_FOUND",
              group: .nutrient.group // "NOT_FOUND",
              type: .nutrient.type // "NOT_FOUND"
            }' 2>/dev/null || echo "No category information found"
    else
        echo "No food found for $data_type"
    fi
    echo ""
done

# Test 5: Manual check for common nutrient category patterns
echo "TEST 5: Analyzing nutrient names for implicit categorization patterns"
echo "=================================================================="

echo "Extracting all unique nutrient names from abalone to analyze patterns:"
cat abalone_detailed.json | jq -r '.foodNutrients[].nutrient.name' | sort | head -20

echo ""
echo "Looking for vitamin patterns:"
cat abalone_detailed.json | jq -r '.foodNutrients[].nutrient.name' | grep -i vitamin | head -10

echo ""
echo "Looking for mineral patterns:"
cat abalone_detailed.json | jq -r '.foodNutrients[].nutrient.name' | grep -E -i "(calcium|iron|zinc|magnesium|potassium|sodium)" | head -10

echo ""
echo "Looking for fatty acid patterns:"
cat abalone_detailed.json | jq -r '.foodNutrients[].nutrient.name' | grep -i "fatty" | head -10

# Cleanup
rm -f temp_fdc_id.txt temp_fdc.txt

# Summary
echo ""
echo "=== SUMMARY ==="
echo "Files created during testing:"
echo "- abalone_detailed.json: Detailed nutrition data for abalone"
echo "- nutrients_list.json: List of all nutrients (if endpoint exists)"
echo ""
echo "This test checks if USDA provides explicit categories for nutrients like:"
echo "- Vitamins (A, C, D, etc.)"
echo "- Minerals (Calcium, Iron, Zinc, etc.)"
echo "- Macronutrients (Protein, Carbohydrates, Fats)"
echo "- Fatty Acids (Saturated, Unsaturated, etc.)"
echo ""
echo "Check the output above to see if 'category', 'group', or 'type' fields exist for nutrients." 