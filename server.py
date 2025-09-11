from flask import Flask, jsonify, request, send_from_directory, redirect
from flask_cors import CORS
import json
import os
import re
import sys
import requests
import csv
from typing import List, Dict, Any

app = Flask(__name__, static_folder='.')
CORS(app)  # Enable CORS for all routes

# Load recipe data 
RECIPE_DB_PATH = '../meal/pickup_limes_database/json/pickup_limes_all_recipes_detailed.json'
IMAGE_PATH = '../meal/pickup_limes_database/images'

# Load food nutrition database
FOOD_DB_PATH = '../food_dietary_project/food_nutrition_data.csv'

# YouTube API settings
YOUTUBE_API_PORT = 5002
YOUTUBE_API_HOST = 'localhost'

# Load food database
food_database = []

def load_food_database():
    """Load the food nutrition database from CSV"""
    global food_database
    try:
        with open(FOOD_DB_PATH, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            food_database = list(reader)
        print(f"Loaded {len(food_database)} foods from database")
    except Exception as e:
        print(f"Error loading food database: {e}")
        food_database = []

# Load the database on startup
load_food_database()

# Load recipe database - simplified to single file
with open(RECIPE_DB_PATH, 'r') as f:
    recipes = json.load(f)

@app.route('/')
def index():
    return send_from_directory('.', 'home.html')

# Serve all HTML files
@app.route('/<path:filename>.html')
def serve_html(filename):
    return send_from_directory('.', f'{filename}.html')

# Serve all JS files
@app.route('/<path:filename>.js')
def serve_js(filename):
    return send_from_directory('.', f'{filename}.js')

# Serve CSS files
@app.route('/<path:filename>.css')
def serve_css(filename):
    return send_from_directory('.', f'{filename}.css')

# Serve images from the images directory
@app.route('/images/<path:filename>')
def serve_local_image(filename):
    return send_from_directory('images', filename)

# Search recipes
@app.route('/api/recipes/search')
def search_recipes():
    query = request.args.get('query', '').lower()

    # Filter recipes based on query
    results = []
    
    for recipe in recipes:
        # Skip recipes without IDs
        if not recipe.get('id'):
            continue
            
        name = recipe.get('name', '').lower()
        
        # Get ingredients as a string for searching
        ingredients = recipe.get('ingredients', [])
        ingredients_text = ' '.join(ingredients).lower()
        
        # Check if recipe matches search criteria
        if query:
            import re
            
            # Split query into individual words for better matching
            query_words = query.lower().split()
            
            match_found = False
            
            # For all searches, use word-by-word matching to avoid partial matches
            # This prevents "egg" from matching "eggplant"
            for q_word in query_words:
                # Split each text field into individual words and check for exact matches
                name_words = re.findall(r'\b\w+\b', name.lower())
                ingredients_words = re.findall(r'\b\w+\b', ingredients_text.lower())
                
                # Check if query word exactly matches any complete word
                if (q_word in name_words or 
                    q_word in ingredients_words):
                    match_found = True
                    break

            if not match_found:
                continue

        # Convert time format
        time_display = recipe.get('total_time', 'N/A')
        if time_display.startswith('PT'):
            # Convert PT05M to "5 minutes", PT01H40M to "1 hour 40 minutes"
            time_display = time_display.replace('PT', '').replace('H', ' hour ').replace('M', ' min')

        # Use the image URL directly from the recipe data
        image_url = recipe.get('image', '')
                
        # Format recipe for frontend
        result = {
            'id': recipe['id'],
            'title': recipe.get('name', ''),
            'image': image_url,
            'url': recipe.get('url', ''),
            'timeDisplay': time_display,
        }
        results.append(result)
    
    # Limit results
    limit = int(request.args.get('number', 40))
    results = results[:limit]
    
    return jsonify({'results': results})

@app.route('/api/images/<path:filename>')
def serve_image(filename):
    return send_from_directory(IMAGE_PATH, filename)

# Backward-compat: redirect legacy recipe detail links to external recipe URL
@app.route('/api/recipes/<int:recipe_id>')
def legacy_recipe_redirect(recipe_id: int):
    try:
        for recipe in recipes:
            if recipe.get('id') == recipe_id:
                target_url = recipe.get('url')
                if target_url:
                    return redirect(target_url, code=302)
                break
        return jsonify({'message': 'Recipe not found'}), 404
    except Exception as e:
        return jsonify({'message': 'Error resolving recipe', 'error': str(e)}), 500

# Proxy YouTube API requests
@app.route('/api/youtube/videos', methods=['GET'])
def proxy_youtube_videos():
    try:
        youtube_url = f'http://{YOUTUBE_API_HOST}:{YOUTUBE_API_PORT}/api/youtube/videos'
        response = requests.get(youtube_url, params=request.args)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def find_food_matches(food_names: List[str]) -> List[Dict[str, Any]]:
    """Find matching foods in the database"""
    matches = []
    
    for food_name in food_names:
        food_name_lower = food_name.lower().strip()
        
        # First try exact match
        exact_match = None
        for food in food_database:
            if food['name'].lower() == food_name_lower:
                exact_match = food
                break
        
        if exact_match:
            matches.append(exact_match)
            continue
        
        # Then try partial matches with improved logic
        best_match = None
        best_score = 0
        
        # Split search term into words for better matching
        search_words = set(re.findall(r'\b\w+\b', food_name_lower))
        
        for food in food_database:
            db_name = food['name'].lower()
            db_words = set(re.findall(r'\b\w+\b', db_name))
            
            # Calculate word overlap score
            common_words = search_words.intersection(db_words)
            if common_words:
                # Score based on word overlap ratio
                word_score = len(common_words) / max(len(search_words), len(db_words))
                
                # Also check substring matching as fallback
                substring_match = food_name_lower in db_name or db_name in food_name_lower
                
                # Bonus for exact core food name matches (ignore descriptors like "juice")
                core_food_bonus = 0
                # Extract core food name (first significant word)
                search_core = search_words - {'raw', 'cooked', 'fresh', 'dried', 'juice'}
                db_core = db_words - {'raw', 'cooked', 'fresh', 'dried', 'juice', 'with', 'and'}
                if search_core and db_core and search_core.intersection(db_core):
                    # Only penalize obvious derivatives like "juice", not natural variations like "with rice"
                    has_derivative_terms = any(word in db_words for word in ['juice'] if word not in search_words)
                    if not has_derivative_terms:
                        core_food_bonus = 0.5  # Increased bonus to prefer whole foods over derivatives
                
                # Combine scores (prioritize word matching)
                if word_score > 0.5:  # High word overlap
                    score = word_score * 0.8 + (0.2 if substring_match else 0) + core_food_bonus
                elif substring_match:
                    # Fallback to substring matching with length similarity
                    score = min(len(food_name_lower), len(db_name)) / max(len(food_name_lower), len(db_name)) * 0.6 + core_food_bonus
                else:
                    score = word_score * 0.5 + core_food_bonus
                
                if score > best_score:
                    best_score = score
                    best_match = food
        
        if best_match and best_score > 0.3:  # Threshold for accepting matches
            matches.append(best_match)
    
    return matches

def parse_quantities_and_foods(text: str) -> List[Dict[str, Any]]:
    """Parse the text to extract quantities and food names using regex"""
    print("Using regex-based food parsing")
    return parse_text(text)

def parse_text(text: str) -> List[Dict[str, Any]]:
    results = []
    
    # Use a single, more precise regex pattern to avoid duplicates
    # This pattern matches: "number unit [of] food_name" followed by comma, "and", or end of string
    pattern = r'(\d+(?:\.\d+)?)\s*(grams?|g|cups?|tablespoons?|tbsp|teaspoons?|tsp|pieces?|slices?)\s+(?:of\s+)?([^,]+?)(?:,|\sand\s|$)'
    
    matches = re.finditer(pattern, text, re.IGNORECASE)
    processed_positions = set()  # Track processed text positions to avoid overlaps
    
    for match in matches:
        # Skip if this match overlaps with a previously processed match
        match_start, match_end = match.span()
        if any(start <= match_start < end or start < match_end <= end for start, end in processed_positions):
            continue
        
        try:
            quantity = float(match.group(1))
            unit = match.group(2).lower() if match.group(2) else "grams"
            food_name = match.group(3).strip()
            
            # Clean up food name
            food_name = food_name.strip(',').strip()
            
            # Skip if food name is too short, contains numbers, or starts with "of"
            if (len(food_name) < 3 or 
                any(char.isdigit() for char in food_name) or 
                food_name.lower().startswith('of ')):
                continue
            
            results.append({
                "quantity": quantity,
                "unit": unit,
                "food_name": food_name
            })
            
            # Mark this position as processed
            processed_positions.add((match_start, match_end))
            
        except (ValueError, IndexError):
            continue
    
    # Remove duplicates by food name (case insensitive)
    seen_foods = set()
    unique_results = []
    for result in results:
        food_key = result['food_name'].lower().strip()
        if food_key not in seen_foods:
            seen_foods.add(food_key)
            unique_results.append(result)
    
    # If no results, try to extract food names from our database that appear in the text
    if not unique_results:
        for food in food_database:
            food_name = food['name']
            if food_name.lower() in text.lower():
                # Extract quantity near this food name if possible
                quantity_match = re.search(rf'(\d+(?:\.\d+)?)[^{re.escape(food_name)}]*{re.escape(food_name)}', text, re.IGNORECASE)
                quantity = float(quantity_match.group(1)) if quantity_match else 100.0
                
                unique_results.append({
                    "quantity": quantity,
                    "unit": "grams",
                    "food_name": food_name
                })
    
    return unique_results

def convert_to_grams(quantity: float, unit: str) -> float:
    """Convert different units to grams (simplified conversion)"""
    unit = unit.lower()
    
    conversion_factors = {
        'grams': 1,
        'g': 1,
        'cups': 240,  # Approximate for most foods
        'cup': 240,
        'tablespoons': 15,
        'tablespoon': 15,
        'tbsp': 15,
        'teaspoons': 5,
        'teaspoon': 5,
        'tsp': 5,
        'pieces': 50,  # Rough estimate
        'piece': 50,
        'slices': 30,  # Rough estimate
        'slice': 30
    }
    
    return quantity * conversion_factors.get(unit, 1)

def calculate_nutrition(food_data: dict, quantity_grams: float) -> Dict[str, Any]:
    """Calculate nutrition for a given quantity of food"""
    base_serving = float(food_data.get('serving_size', 100))
    multiplier = quantity_grams / base_serving
    
    nutrition = {}
    
    # Get ALL available nutrition fields from the food data
    # Skip non-numeric fields like 'name', 'serving_size', etc.
    skip_fields = {'name', 'serving_size', 'id', 'description', 'food_group', 'category'}
    
    for field, value in food_data.items():
        if field.lower() in skip_fields:
            continue
            
        # Try to convert to float - if successful, it's a nutrition field
        if value != 'N/A' and value != '' and value is not None:
            try:
                numeric_value = float(value)
                nutrition[field] = numeric_value * multiplier
            except (ValueError, TypeError):
                # Skip non-numeric fields
                continue
        else:
            nutrition[field] = 0
    
    return nutrition

# Food processing endpoint using regex parsing
@app.route('/api/process_food_text', methods=['POST'])
def process_food_text():
    print("\n" + "="*60)
    print("🚀 STARTING process_food_text function")
    print("="*60)
    
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        print(f"📝 Input text received: '{text}'")
        
        if not text:
            print("❌ Error: No text provided")
            return jsonify({'error': 'No text provided'}), 400
        
        # Parse text with regex
        print("\n🧠 STEP 1: Parsing text with regex...")
        parsed_foods = parse_quantities_and_foods(text)
        print(f"✅ Parsed {len(parsed_foods)} food items:")
        for i, food in enumerate(parsed_foods, 1):
            print(f"   {i}. {food['quantity']} {food['unit']} of '{food['food_name']}'")
        
        results = []
        processed_food_names = set()  # Track processed foods to avoid duplicates in results
        
        print("\n🔍 STEP 2: Processing each food...")
        
        for i, parsed_food in enumerate(parsed_foods, 1):
            food_name = parsed_food['food_name']
            quantity = parsed_food['quantity']
            unit = parsed_food['unit']
            
            print(f"\n   📋 Processing food #{i}: '{food_name}'")
            print(f"      Original: {quantity} {unit}")
            
            # Convert to grams
            quantity_grams = convert_to_grams(quantity, unit)
            print(f"      Converted: {quantity_grams}g")
            
            # Find matching food in database
            print(f"      🔎 Searching database for matches...")
            matches = find_food_matches([food_name])
            
            if matches:
                food_data = matches[0]
                matched_food_name = food_data['name']
                print(f"      ✅ Found match: '{matched_food_name}'")
                
                processed_food_names.add(matched_food_name.lower())
                print(f"      ➕ Added to processed list: '{matched_food_name.lower()}'")
                
                print(f"      🧮 Calculating nutrition for {quantity_grams}g...")
                nutrition = calculate_nutrition(food_data, quantity_grams)
                
                calories = nutrition.get('energy (KCAL)', 0) or nutrition.get('Energy', 0)
                protein = nutrition.get('protein (G)', 0) or nutrition.get('Protein', 0)
                fat = nutrition.get('total lipid (fat) (G)', 0) or nutrition.get('Total lipid (fat)', 0)
                carbs = nutrition.get('carbohydrate, by difference (G)', 0) or nutrition.get('Carbohydrate, by difference', 0)
                
                print(f"      📈 Nutrition summary: {calories:.1f} cal, {protein:.1f}g protein, {fat:.1f}g fat, {carbs:.1f}g carbs")
                
                result = {
                    'id': len(results) + 1,
                    'name': food_data['name'],
                    'quantity': quantity_grams,
                    'original_quantity': quantity,
                    'original_unit': unit,
                    'nutrition': nutrition,
                    'total_nutrition_fields': len(nutrition),
                    'calories': calories,
                    'protein': protein,
                    'fat': fat,
                    'carbs': carbs,
                    'fiber': nutrition.get('fiber, total dietary (G)', 0) or nutrition.get('Fiber, total dietary', 0)
                }
                # print(result)
                results.append(result)
                print(f"      ✅ Added to results (Result #{len(results)})")
            else:
                print(f"      ❌ No match found in database for '{food_name}'")
        
        print(f"\n🎯 FINAL RESULTS: {len(results)} foods processed successfully")
        for i, result in enumerate(results, 1):
            print(f"   {i}. {result['name']} ({result['quantity']}g) - {result['calories']:.1f} cal")
        
        print("="*60)
        print("✅ process_food_text completed successfully")
        print("="*60 + "\n")
        
        return jsonify({'result': results})
        
    except Exception as e:
        print(f"\n💥 ERROR in process_food_text: {e}")
        print("="*60 + "\n")
        return jsonify({'error': str(e)}), 500

# Keep the proxy for backwards compatibility, but modify it
@app.route('/api/nlp/<path:endpoint>', methods=['POST', 'GET'])
def proxy_nlp_api(endpoint):
    # For the specific endpoint we're replacing, use our regex parser instead
    if endpoint == 'process_text_and_get_nutrition' or endpoint == 'process_text_and_get_nutrition/':
        return process_food_text()
    
    # For other endpoints, keep the original proxy behavior
    try:
        # Use the Django backend running on port 8000
        nlp_url = f'http://localhost:8000/nlp/{endpoint}'
        
        if request.method == 'POST':
            response = requests.post(nlp_url, json=request.json)
        else:
            response = requests.get(nlp_url, params=request.args)
            
        return jsonify(response.json())
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
