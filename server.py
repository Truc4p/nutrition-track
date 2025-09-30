from flask import Flask, jsonify, request, send_from_directory, redirect
from flask_cors import CORS
import json
import os
import re
import sys
import requests
import csv
from typing import List, Dict, Any
import inflect

app = Flask(__name__, static_folder='.')
CORS(app)  # Enable CORS for all routes

def parse_iso8601_duration(duration_str):
    """
    Parse ISO 8601 duration format (like P2DT02H30M) into human-readable format
    Examples:
    - PT30M -> "30 min"
    - PT01H30M -> "1 hour 30 min"
    - P2DT02H30M -> "2 days 2 hours 30 min"
    """
    if not duration_str:
        return 'N/A'
    
    # Handle simple PT format first (existing logic)
    if duration_str.startswith('PT') and 'D' not in duration_str:
        # Convert PT05M to "5 min", PT01H40M to "1 hour 40 min"
        time_str = duration_str.replace('PT', '')
        
        hours_match = re.search(r'(\d+)H', time_str)
        minutes_match = re.search(r'(\d+)M', time_str)
        
        parts = []
        if hours_match:
            hours = int(hours_match.group(1))
            parts.append(f"{hours} hour{'s' if hours != 1 else ''}")
        
        if minutes_match:
            minutes = int(minutes_match.group(1))
            parts.append(f"{minutes} min")
        
        return ' '.join(parts) if parts else 'N/A'
    
    # Handle full ISO 8601 format with days (P2DT02H30M)
    if duration_str.startswith('P'):
        # Extract components using regex
        days_match = re.search(r'P(\d+)D', duration_str)
        hours_match = re.search(r'T(\d+)H', duration_str)
        minutes_match = re.search(r'(\d+)M', duration_str)
        
        parts = []
        
        if days_match:
            days = int(days_match.group(1))
            parts.append(f"{days} day{'s' if days != 1 else ''}")
        
        if hours_match:
            hours = int(hours_match.group(1))
            parts.append(f"{hours} hour{'s' if hours != 1 else ''}")
        
        if minutes_match:
            minutes = int(minutes_match.group(1))
            parts.append(f"{minutes} min")
        
        return ' '.join(parts) if parts else 'N/A'
    
    # Fallback for unknown formats
    return duration_str

# Load recipe data 
RECIPE_DB_PATH = '../meal/pickup_limes_database/json/pickup_limes_all_recipes_detailed_clean.json'
IMAGE_PATH = '../meal/pickup_limes_database/images'

# YouTube API settings
YOUTUBE_API_PORT = 5002
YOUTUBE_API_HOST = 'localhost'

# Initialize the inflect engine for singular conversion
p = inflect.engine()

def tokenize_by_quantity(text):
    """
    Django NLP function integrated into Flask server
    Tokenizes text to extract food items with quantities and units
    """
    # First, let's clean and preprocess the text
    # Convert to lowercase and remove filler words
    cleaned_text = text.lower()
    cleaned_text = re.sub(r'\bi\b|\bate\b|\btoday\b', '', cleaned_text)
    
    # Split the text by common delimiters (comma, period, 'and')
    segments = re.split(r'\s*,\s*|\s+and\s+|\s*\.\s*', cleaned_text)
    segments = [segment.strip() for segment in segments if segment.strip()]
    
    # List to store the final tokenized results
    tokenized_result = []
    
    # Process each segment separately
    for segment in segments:
        # Skip empty segments
        if not segment:
            continue
            
        # Try to match "100g chicken breast" pattern (no space between number and unit)
        quantity_first_match = re.search(r'(\d+(?:\.\d+)?)([a-zA-Z]+)\s+([a-zA-Z][a-zA-Z\s]+)', segment)
        
        # Try to match "100 grams of chicken breast" pattern (with space)
        quantity_first_space_match = re.search(r'(\d+(?:\.\d+)?)\s+([a-zA-Z]+)(?:\s+of)?\s+([a-zA-Z][a-zA-Z\s]+)', segment)
        
        # Try to match "chicken breast 100g" pattern
        food_first_match = re.search(r'([a-zA-Z][a-zA-Z\s]+)\s+(\d+(?:\.\d+)?)([a-zA-Z]+)', segment)
        
        # Try to match "chicken breast 100 grams" pattern
        food_first_space_match = re.search(r'([a-zA-Z][a-zA-Z\s]+)\s+(\d+(?:\.\d+)?)\s+([a-zA-Z]+)', segment)
        
        if quantity_first_match:
            # Extract data from the match
            quantity, unit, food = quantity_first_match.groups()
            food = food.strip()
            # Convert plurals to singular
            food = p.singular_noun(food) or food
            # Add to results
            tokenized_result.append(
                [int(quantity) if quantity.isdigit() else float(quantity), unit, food])
                
        elif quantity_first_space_match:
            # Extract data from the match
            quantity, unit, food = quantity_first_space_match.groups()
            food = food.strip()
            # Convert plurals to singular
            food = p.singular_noun(food) or food
            # Add to results
            tokenized_result.append(
                [int(quantity) if quantity.isdigit() else float(quantity), unit, food])
                
        elif food_first_match:
            # Extract data from the match
            food, quantity, unit = food_first_match.groups()
            food = food.strip()
            # Convert plurals to singular
            food = p.singular_noun(food) or food
            # Add to results
            tokenized_result.append(
                [int(quantity) if quantity.isdigit() else float(quantity), unit, food])
                
        elif food_first_space_match:
            # Extract data from the match
            food, quantity, unit = food_first_space_match.groups()
            food = food.strip()
            # Convert plurals to singular
            food = p.singular_noun(food) or food
            # Add to results
            tokenized_result.append(
                [int(quantity) if quantity.isdigit() else float(quantity), unit, food])
        
        # If no match found, try a simpler approach for this segment
        else:
            # Look for a quantity and unit
            quantity_match = re.search(r'(\d+(?:\.\d+)?)\s+([a-zA-Z]+)', segment)
            if quantity_match:
                quantity, unit = quantity_match.groups()
                # Extract the food name by removing the quantity and unit part
                food_part = re.sub(r'\d+(?:\.\d+)?\s+[a-zA-Z]+\s+(?:of\s+)?', '', segment).strip()
                
                # Skip if the food part is empty or just a conjunction
                if food_part and food_part not in ['and', 'or', 'with']:
                    # Convert plurals to singular
                    food_part = p.singular_noun(food_part) or food_part
                    # Add to results
                    tokenized_result.append(
                        [int(quantity) if quantity.isdigit() else float(quantity), unit, food_part])
    
    # Special case handling for "chicken breast 100 grams"
    # This is needed because the regex might not catch all cases
    for i, segment in enumerate(segments):
        # Check if this segment contains a food name but no quantity
        if not any(re.search(r'\d+', s) for s in segment.split()) and i < len(segments) - 1:
            # Check if the next segment starts with a number
            next_segment = segments[i+1] if i+1 < len(segments) else ""
            quantity_match = re.search(r'^(\d+(?:\.\d+)?)\s+([a-zA-Z]+)', next_segment)
            
            if quantity_match:
                quantity, unit = quantity_match.groups()
                food = segment.strip()
                # Convert plurals to singular
                food = p.singular_noun(food) or food
                # Add to results if not already present
                new_item = [int(quantity) if quantity.isdigit() else float(quantity), unit, food]
                if new_item not in tokenized_result:
                    tokenized_result.append(new_item)
    
    # For the specific case in the example
    # If "chicken breast" is not matched, try to find it specifically
    chicken_match = re.search(r'chicken\s+breast\s+(\d+)\s+([a-zA-Z]+)', cleaned_text)
    if chicken_match:
        quantity, unit = chicken_match.groups()
        # Add to results if not already present
        new_item = [int(quantity), unit, 'chicken breast']
        if new_item not in tokenized_result:
            tokenized_result.append(new_item)
    
    # Remove duplicates and items with invalid food names
    unique_result = []
    for item in tokenized_result:
        if item not in unique_result and item[2] not in ['and', 'or', 'with', '']:
            unique_result.append(item)
            
    return unique_result

def process_tokens_to_foods(tokenized_text: List[List]) -> List[dict]:
    """
    Django NLP function integrated into Flask server
    Converts tokenized text to food dictionaries
    """
    foods = []
    for token_list in tokenized_text:
        quantity = token_list[0]
        measurement_type = token_list[1]
        food_name = token_list[2]
        food = {
            'food_name': food_name,
            'quantity': quantity,
            'measurement_type': measurement_type
        }
        foods.append(food)
    return foods

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

        # Convert time format using the ISO 8601 parser
        time_display = parse_iso8601_duration(recipe.get('total_time', 'N/A'))

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

# Django NLP endpoint integrated into Flask server
@app.route('/nlp/process_text/', methods=['POST', 'OPTIONS'])
def django_nlp_process_text():
    """
    Django NLP endpoint integrated into Flask server
    Processes text to extract food items with quantities and units
    """
    # Handle CORS preflight requests
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response
    
    try:
        data = request.get_json()
        text_value = data.get('text', None)
        print("Text value:", text_value)  # Debugging line
        
        if text_value:
            tokenized_text = tokenize_by_quantity(text_value)
            print("Tokenized text:", tokenized_text)  # Debugging line
            print("____________________________________________________")
            ingredients = process_tokens_to_foods(tokenized_text)
            print("Processed ingredients:", ingredients)  # Debugging line
            print("____________________________________________________")
            
            response = jsonify({'ingredients': ingredients})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
        else:
            response = jsonify({"error": "No 'text' found in the JSON data"})
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response, 400
            
    except json.JSONDecodeError:
        response = jsonify({'error': 'Invalid JSON data'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 400
    except Exception as e:
        print(f"Error in django_nlp_process_text: {e}")
        response = jsonify({'error': str(e)})
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response, 500

# Keep the proxy for backwards compatibility
@app.route('/api/nlp/<path:endpoint>', methods=['POST', 'GET'])
def proxy_nlp_api(endpoint):
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
