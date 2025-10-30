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
from datetime import datetime
from dotenv import load_dotenv

# Add YouTube scraper modules path
youtube_scraper_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'youtube-scraper')
sys.path.append(youtube_scraper_path)

try:
    from db.models import Session, YouTubeVideo
    from scripts.scraper import scrape_videos
    YOUTUBE_INTEGRATION_AVAILABLE = True
except ImportError as e:
    print(f"Warning: YouTube integration not available: {e}")
    YOUTUBE_INTEGRATION_AVAILABLE = False

# Load environment variables
load_dotenv()

# Gemini API Configuration
GEMINI_KEY = 'AIzaSyAZbp4SEeaAq8ioyvuWNF7kcwalhNA8h8I'
GEMINI_API_URL = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={GEMINI_KEY}'
GEMINI_VISION_API_URL = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key={GEMINI_KEY}'

# USDA API Configuration
USDA_API_KEY = '7bf0q1sg6jba188aZpaYE9oeSvcifU9S1sCJQHgx'
USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search'
USDA_DETAIL_URL = 'https://api.nal.usda.gov/fdc/v1/food'

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
RECIPE_DB_PATH = '../meal-scraper/pickup_limes_database/json/pickup_limes_all_recipes_detailed_clean.json'
IMAGE_PATH = '../meal-scraper/pickup_limes_database/images'

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


# Chatbot API Route
@app.route('/ai/chat', methods=['POST'])
def chat():
    """Handle chatbot requests using Gemini API."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No input data provided'}), 400
            
        user_message = data.get('userMessage', '')
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
            
        # Create a nutrition-focused prompt
        prompt = f"You are a helpful nutrition assistant. Please provide accurate and helpful nutrition advice.\nUser's message: {user_message}\nPlease respond with relevant nutrition information and advice."
        
        # Send request to Gemini API
        response = requests.post(GEMINI_API_URL, 
            headers={'Content-Type': 'application/json'},
            json={
                'contents': [
                    {
                        'parts': [{'text': prompt}]
                    }
                ]
            }
        )
        
        if not response.ok:
            return jsonify({
                'error': f'Gemini API error: {response.status_code}',
                'details': response.text
            }), 500
        
        data = response.json()
        
        # Extract the recommendation from the response
        recommendation = (
            data.get('candidates', [{}])[0]
            .get('content', {})
            .get('parts', [{}])[0]
            .get('text', 'No recommendation available.')
        )
        
        return jsonify({'recommendation': recommendation})
        
    except Exception as e:
        return jsonify({
            'error': 'An error occurred while processing your request',
            'details': str(e)
        }), 500


# Meal Image Analysis API Route
@app.route('/ai/analyze-meal-image', methods=['POST'])
def analyze_meal_image():
    """Analyze a meal image using Gemini Vision API to estimate ingredient weights."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No input data provided'}), 400
        
        image_data = data.get('image', '')
        mime_type = data.get('mimeType', 'image/jpeg')
        
        if not image_data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Create a detailed prompt for ingredient estimation
        prompt = """Analyze this meal image and estimate the weight in grams of each ingredient/component. 
        
Please provide your response in a format that can be directly used in a food tracking app, like this example:

"100g chicken breast, 150g rice, 70g corn, 80g tomatoes, 70g avocado, 40g jicama"

Important guidelines:
1. Estimate weights in grams (g)
2. Use simple, searchable ingredient names (e.g., "chicken breast" not "seasoned chicken")
3. List each ingredient separately with its estimated weight
4. Be as accurate as possible based on typical portion sizes
5. Format as: "[weight]g [ingredient name], [weight]g [ingredient name], ..."
6. Do NOT include detailed explanations or ranges - just provide the comma-separated list

Example good response: "130g chicken breast, 175g brown rice, 80g corn, 90g tomatoes, 75g avocado, 40g jicama"
"""
        
        print(f"Analyzing image with mime type: {mime_type}")
        print(f"Image data length: {len(image_data)} characters")
        
        # Send request to Gemini Vision API
        response = requests.post(GEMINI_VISION_API_URL,
            headers={'Content-Type': 'application/json'},
            json={
                'contents': [
                    {
                        'parts': [
                            {'text': prompt},
                            {
                                'inline_data': {
                                    'mime_type': mime_type,
                                    'data': image_data
                                }
                            }
                        ]
                    }
                ]
            }
        )
        
        print(f"Gemini API response status: {response.status_code}")
        
        if not response.ok:
            error_details = response.text
            print(f"Gemini API error: {error_details}")
            return jsonify({
                'error': f'Gemini API error: {response.status_code}',
                'details': error_details
            }), 500
        
        result = response.json()
        print(f"Gemini API result: {result}")
        
        # Extract the analysis from the response
        analysis = (
            result.get('candidates', [{}])[0]
            .get('content', {})
            .get('parts', [{}])[0]
            .get('text', 'Unable to analyze the meal image.')
        )
        
        # Clean up the analysis to extract just the ingredient list
        # Remove any explanatory text and get the core ingredient list
        lines = analysis.strip().split('\n')
        ingredient_list = None
        
        for line in lines:
            line = line.strip()
            # Look for lines that contain ingredient patterns like "100g chicken"
            if 'g ' in line.lower() and (',' in line or ' and ' in line.lower()):
                ingredient_list = line
                break
        
        # If we found a clean ingredient list, use it; otherwise use the full analysis
        if ingredient_list:
            analysis = ingredient_list
        
        # Remove quotes if present
        analysis = analysis.strip('"\'')
        
        print(f"Final analysis: {analysis}")
        
        return jsonify({
            'success': True,
            'analysis': analysis
        })
        
    except Exception as e:
        print(f"Error in analyze_meal_image: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': 'An error occurred while analyzing the image',
            'details': str(e)
        }), 500


# AI-Powered Food Parsing and USDA Matching
@app.route('/ai/parse-and-match-foods', methods=['POST'])
def parse_and_match_foods():
    """Use Gemini AI to parse food input and intelligently match with USDA database."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No input data provided'}), 400
        
        text_input = data.get('text', '')
        if not text_input:
            return jsonify({'error': 'No text provided'}), 400
        
        print(f"🤖 AI Food Parser - Input: {text_input}")
        
        # Step 1: Use Gemini to parse and understand the food items
        parse_prompt = f"""You are a nutrition expert. Parse this food text and extract individual food items with their quantities.

Input text: "{text_input}"

For each food item, provide:
1. The exact quantity (number)
2. The unit of measurement (g, cup, oz, etc.)
3. The food name in a format that would match USDA FoodData Central database

IMPORTANT USDA naming conventions:
- Use simple, standard names like: "Peppers, sweet, red, raw" NOT "red bell pepper"
- Use: "Onions, red, raw" NOT "red onion"
- Use: "Chicken, broilers or fryers, breast" NOT just "chicken"
- Include preparation state: raw, cooked, baked, etc.
- Format: "[Food category], [variety/type], [preparation]"

Return ONLY a JSON array in this exact format:
[
  {{"quantity": 60, "unit": "g", "food_name": "Peppers, sweet, red, raw", "usda_search_term": "peppers red"}},
  {{"quantity": 40, "unit": "g", "food_name": "Onions, red, raw", "usda_search_term": "onions red"}}
]

The usda_search_term should be simple keywords to search USDA database.
Return ONLY the JSON array, no other text."""

        # Call Gemini API
        response = requests.post(GEMINI_API_URL,
            headers={'Content-Type': 'application/json'},
            json={
                'contents': [{'parts': [{'text': parse_prompt}]}]
            }
        )
        
        if not response.ok:
            return jsonify({
                'error': f'Gemini API error: {response.status_code}',
                'details': response.text
            }), 500
        
        result = response.json()
        gemini_response = (
            result.get('candidates', [{}])[0]
            .get('content', {})
            .get('parts', [{}])[0]
            .get('text', '[]')
        )
        
        print(f"🤖 Gemini parsed response: {gemini_response}")
        
        # Extract JSON from response (handle markdown code blocks)
        gemini_response = gemini_response.strip()
        if gemini_response.startswith('```'):
            # Remove markdown code blocks
            lines = gemini_response.split('\n')
            gemini_response = '\n'.join(lines[1:-1] if len(lines) > 2 else lines)
        
        # Parse the JSON
        try:
            parsed_foods = json.loads(gemini_response)
        except json.JSONDecodeError as e:
            print(f"❌ JSON parse error: {e}")
            print(f"Response was: {gemini_response}")
            return jsonify({'error': 'Failed to parse AI response', 'details': str(e)}), 500
        
        print(f"✅ Parsed {len(parsed_foods)} food items")
        
        # Step 2: Search USDA for each food
        results = []
        for food_item in parsed_foods:
            search_term = food_item.get('usda_search_term', food_item.get('food_name', ''))
            print(f"🔍 Searching USDA for: {search_term}")
            
            # Try local database first
            try:
                local_response = requests.get(
                    f'http://localhost:5001/api/usda/search?query={search_term}&limit=5'
                )
                if local_response.ok:
                    local_data = local_response.json()
                    if local_data.get('success') and local_data.get('foods'):
                        foods = local_data['foods']
                        # Take the first result (Gemini should give us good search terms)
                        if foods:
                            best_match = foods[0]
                            print(f"✅ Found: {best_match['description']}")
                            results.append({
                                'original_input': food_item,
                                'usda_food': best_match,
                                'quantity': food_item['quantity'],
                                'unit': food_item['unit']
                            })
                            continue
            except Exception as e:
                print(f"⚠️ Local search failed: {e}")
            
            # Fallback to USDA API
            try:
                api_response = requests.get(
                    f'{USDA_API_URL}?api_key={USDA_API_KEY}&query={search_term}&pageSize=5'
                )
                if api_response.ok:
                    api_data = api_response.json()
                    foods = api_data.get('foods', [])
                    if foods:
                        best_match = foods[0]
                        print(f"✅ Found (API): {best_match['description']}")
                        results.append({
                            'original_input': food_item,
                            'usda_food': best_match,
                            'quantity': food_item['quantity'],
                            'unit': food_item['unit']
                        })
            except Exception as e:
                print(f"❌ USDA API failed for {search_term}: {e}")
        
        return jsonify({
            'success': True,
            'foods': results
        })
        
    except Exception as e:
        print(f"❌ Error in parse_and_match_foods: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': 'An error occurred while processing the request',
            'details': str(e)
        }), 500


# YouTube API Routes
@app.route('/api/youtube/videos', methods=['GET'])
def get_youtube_videos():
    """Get videos from the database with optional filtering."""
    if not YOUTUBE_INTEGRATION_AVAILABLE:
        return jsonify({
            'success': False,
            'error': 'YouTube integration not available. Please check dependencies.'
        }), 500
    
    try:
        session = Session()
        
        # Get query parameters
        query = request.args.get('query', '').lower()
        limit = int(request.args.get('limit', 40))
        
        # Base query
        db_query = session.query(YouTubeVideo).filter(YouTubeVideo.is_active == True)
        
        # Apply search filter if provided
        if query:
            search_terms = query.split()
            for term in search_terms:
                db_query = db_query.filter(
                    (YouTubeVideo.title.ilike(f'%{term}%')) | 
                    (YouTubeVideo.description.ilike(f'%{term}%')) |
                    (YouTubeVideo.keywords.ilike(f'%{term}%'))
                )
        
        # Order by publish date (newest first) and limit results
        videos = db_query.order_by(YouTubeVideo.published_at.desc()).limit(limit).all()
        
        # Convert to dictionary format
        results = [video.to_dict() for video in videos]
        
        return jsonify({
            'success': True,
            'count': len(results),
            'results': results
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    
    finally:
        session.close()


@app.route('/api/youtube/refresh', methods=['POST'])
def refresh_youtube_videos():
    """Refresh the video database by scraping new videos."""
    if not YOUTUBE_INTEGRATION_AVAILABLE:
        return jsonify({
            'success': False,
            'error': 'YouTube integration not available. Please check dependencies.'
        }), 500
    
    try:
        # Get optional search query
        query = request.json.get('query', '') if request.is_json else ''
        
        # Run the scraper
        count = scrape_videos(query)
        
        return jsonify({
            'success': True,
            'message': f'Successfully scraped {count} videos',
            'count': count
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/youtube/stats', methods=['GET'])
def get_youtube_stats():
    """Get statistics about the video database."""
    if not YOUTUBE_INTEGRATION_AVAILABLE:
        return jsonify({
            'success': False,
            'error': 'YouTube integration not available. Please check dependencies.'
        }), 500
    
    try:
        session = Session()
        
        total_videos = session.query(YouTubeVideo).count()
        active_videos = session.query(YouTubeVideo).filter(YouTubeVideo.is_active == True).count()
        
        # Get the date of the most recent video
        most_recent = session.query(YouTubeVideo).order_by(YouTubeVideo.published_at.desc()).first()
        most_recent_date = most_recent.published_at if most_recent else None
        
        # Get the date of the oldest video
        oldest = session.query(YouTubeVideo).order_by(YouTubeVideo.published_at).first()
        oldest_date = oldest.published_at if oldest else None
        
        return jsonify({
            'success': True,
            'stats': {
                'total_videos': total_videos,
                'active_videos': active_videos,
                'most_recent_video': most_recent_date.isoformat() if most_recent_date else None,
                'oldest_video': oldest_date.isoformat() if oldest_date else None,
                'database_last_updated': datetime.utcnow().isoformat()
            }
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    
    finally:
        session.close()


# ===== LOCAL USDA DATABASE API ENDPOINTS =====
# Add local USDA database path
usda_db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'usda-database')
sys.path.append(usda_db_path)

try:
    from usda_search import get_usda_search
    USDA_LOCAL_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Local USDA database not available: {e}")
    print(f"Please run 'python usda-database/download_usda.py' to set up the local database.")
    USDA_LOCAL_AVAILABLE = False

@app.route('/api/usda/search', methods=['GET'])
def usda_local_search():
    """
    Search local USDA database for foods.
    Much faster than API calls.
    
    Query parameters:
    - query: search term (required)
    - limit: max results (default: 20)
    """
    if not USDA_LOCAL_AVAILABLE:
        return jsonify({
            'success': False,
            'error': 'Local USDA database not available. Please run download_usda.py to set it up.',
            'fallback_to_api': True
        }), 503
    
    try:
        query = request.args.get('query', '').strip()
        if not query:
            return jsonify({
                'success': False,
                'error': 'Query parameter is required'
            }), 400
        
        limit = int(request.args.get('limit', 20))
        
        usda_search = get_usda_search()
        results = usda_search.search_foods(query, limit=limit)
        
        return jsonify({
            'success': True,
            'totalHits': len(results),
            'foods': results
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'fallback_to_api': True
        }), 500

@app.route('/api/usda/food/<int:fdc_id>', methods=['GET'])
def usda_local_food_details(fdc_id):
    """
    Get detailed nutrition data for a specific food from local database.
    Much faster than API calls.
    """
    if not USDA_LOCAL_AVAILABLE:
        return jsonify({
            'success': False,
            'error': 'Local USDA database not available. Please run download_usda.py to set it up.',
            'fallback_to_api': True
        }), 503
    
    try:
        usda_search = get_usda_search()
        food_details = usda_search.get_food_details(fdc_id)
        
        if not food_details:
            return jsonify({
                'success': False,
                'error': f'Food with ID {fdc_id} not found'
            }), 404
        
        return jsonify({
            'success': True,
            'food': food_details
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'fallback_to_api': True
        }), 500

@app.route('/api/usda/stats', methods=['GET'])
def usda_local_stats():
    """Get statistics about the local USDA database."""
    if not USDA_LOCAL_AVAILABLE:
        return jsonify({
            'success': False,
            'error': 'Local USDA database not available'
        }), 503
    
    try:
        usda_search = get_usda_search()
        stats = usda_search.get_stats()
        
        return jsonify({
            'success': True,
            'stats': stats
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
