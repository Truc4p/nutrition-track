from flask import Flask, jsonify, request, send_from_directory, redirect
from flask_cors import CORS
import json
import os
import re
import sys
import requests
import csv
import google.generativeai as genai
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

# Configure Gemini API (you'll need to set your API key)
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')

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
    limit = int(request.args.get('number', 12))
    results = results[:limit]
    
    return jsonify({'results': results})

@app.route('/api/images/<path:filename>')
def serve_image(filename):
    return send_from_directory(IMAGE_PATH, filename)

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
        
        # Then try partial matches
        best_match = None
        best_score = 0
        
        for food in food_database:
            db_name = food['name'].lower()
            
            # Check if the food name contains the search term or vice versa
            if food_name_lower in db_name or db_name in food_name_lower:
                # Calculate a simple score based on length similarity
                score = min(len(food_name_lower), len(db_name)) / max(len(food_name_lower), len(db_name))
                if score > best_score:
                    best_score = score
                    best_match = food
        
        if best_match and best_score > 0.3:  # Threshold for accepting matches
            matches.append(best_match)
    
    return matches

def parse_quantities_and_foods(text: str) -> List[Dict[str, Any]]:
    """Parse the text to extract quantities and food names"""
    if not GEMINI_API_KEY:
        print("Gemini API key not configured, using fallback parser")
        return fallback_parse_text(text)
    
    # Create a list of food names for Gemini to reference
    food_names_sample = [food['name'] for food in food_database[:50]]  # Sample for context
    
    prompt = f"""
    Parse this food consumption text and extract the quantities and food names. Only return foods that match or are very similar to foods in this database sample: {food_names_sample[:20]}

    Text: "{text}"
    
    Return ONLY a JSON array with this exact format:
    [
        {{"quantity": 100, "unit": "grams", "food_name": "chicken breast"}},
        {{"quantity": 200, "unit": "grams", "food_name": "wheat bread"}}
    ]
    
    Rules:
    - Extract numeric quantities (convert words like "one" to 1)
    - Standardize units to: grams, cups, tablespoons, teaspoons, pieces, slices
    - Match food names to the closest foods in the database
    - If no quantity is specified, use 100 grams as default
    - Return valid JSON only, no other text
    """
    
    try:
        response = model.generate_content(prompt)
        
        # Clean up the response to extract just the JSON
        response_text = response.text.strip()
        
        # Remove markdown code blocks if present
        if response_text.startswith('```json'):
            response_text = response_text.replace('```json', '').replace('```', '').strip()
        elif response_text.startswith('```'):
            response_text = response_text.replace('```', '').strip()
        
        # Parse JSON
        parsed_foods = json.loads(response_text)
        return parsed_foods
        
    except Exception as e:
        print(f"Error parsing with Gemini: {e}")
        # Fallback: simple regex parsing
        return fallback_parse_text(text)

def fallback_parse_text(text: str) -> List[Dict[str, Any]]:
    """Fallback parsing when Gemini is not available"""
    results = []
    
    # More comprehensive regex patterns for food parsing
    patterns = [
        # Pattern for "100 grams of chicken breast"
        r'(\d+(?:\.\d+)?)\s*(grams?|g|cups?|tablespoons?|tbsp|teaspoons?|tsp|pieces?|slices?)\s+(?:of\s+)?([^,]+?)(?:,|\sand\s|$)',
        # Pattern for "100 grams chicken breast"
        r'(\d+(?:\.\d+)?)\s*(grams?|g)\s+([^,]+?)(?:,|\sand\s|$)',
        # Pattern for food names from our database mentioned in text
        r'(\d+(?:\.\d+)?)\s*(?:grams?\s+(?:of\s+)?)?([A-Za-z][^,\d]*?)(?:,|\sand\s|$)'
    ]
    
    for pattern in patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            try:
                quantity = float(match.group(1))
                if len(match.groups()) == 3:
                    unit = match.group(2).lower() if match.group(2) else "grams"
                    food_name = match.group(3).strip()
                else:
                    unit = "grams"
                    food_name = match.group(2).strip()
                
                # Clean up food name
                food_name = food_name.strip(',').strip()
                
                # Skip if food name is too short or contains numbers
                if len(food_name) < 3 or any(char.isdigit() for char in food_name):
                    continue
                
                results.append({
                    "quantity": quantity,
                    "unit": unit,
                    "food_name": food_name
                })
            except (ValueError, IndexError):
                continue
    
    # Remove duplicates by food name
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
    
    # List of numeric nutrition fields to calculate
    nutrition_fields = [
        'energy (KCAL)', 'protein (G)', 'total lipid (fat) (G)', 
        'carbohydrate, by difference (G)', 'fiber, total dietary (G)',
        'calcium, ca (MG)', 'iron, fe (MG)', 'sodium, na (MG)',
        'vitamin c, total ascorbic acid (MG)', 'vitamin a, rae (UG)'
    ]
    
    for field in nutrition_fields:
        value = food_data.get(field, 'N/A')
        if value != 'N/A' and value != '':
            try:
                nutrition[field] = float(value) * multiplier
            except ValueError:
                nutrition[field] = 0
        else:
            nutrition[field] = 0
    
    return nutrition

# New Gemini-based food processing endpoint
@app.route('/api/gemini/process_food_text', methods=['POST'])
def process_food_with_gemini():
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Parse text with Gemini
        parsed_foods = parse_quantities_and_foods(text)
        
        results = []
        for parsed_food in parsed_foods:
            food_name = parsed_food['food_name']
            quantity = parsed_food['quantity']
            unit = parsed_food['unit']
            
            # Convert to grams
            quantity_grams = convert_to_grams(quantity, unit)
            
            # Find matching food in database
            matches = find_food_matches([food_name])
            
            if matches:
                food_data = matches[0]
                nutrition = calculate_nutrition(food_data, quantity_grams)
                
                result = {
                    'id': len(results) + 1,
                    'name': food_data['name'],
                    'quantity': quantity_grams,
                    'original_quantity': quantity,
                    'original_unit': unit,
                    'nutrition': nutrition,
                    'calories': nutrition.get('energy (KCAL)', 0),
                    'protein': nutrition.get('protein (G)', 0),
                    'fat': nutrition.get('total lipid (fat) (G)', 0),
                    'carbs': nutrition.get('carbohydrate, by difference (G)', 0),
                    'fiber': nutrition.get('fiber, total dietary (G)', 0)
                }
                results.append(result)
        
        return jsonify({'result': results})
        
    except Exception as e:
        print(f"Error in process_food_with_gemini: {e}")
        return jsonify({'error': str(e)}), 500

# Keep the proxy for backwards compatibility, but modify it
@app.route('/api/nlp/<path:endpoint>', methods=['POST', 'GET'])
def proxy_nlp_api(endpoint):
    # For the specific endpoint we're replacing, use Gemini instead
    if endpoint == 'process_text_and_get_nutrition' or endpoint == 'process_text_and_get_nutrition/':
        return process_food_with_gemini()
    
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
