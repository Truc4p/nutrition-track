"""
Vercel serverless function entry point
Recreates the Flask app with absolute paths for Vercel's serverless environment
"""
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
import re
import requests
import inflect
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get absolute paths
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RECIPE_DB_PATH = os.path.join(project_root, 'meal-scraper/pickup_limes_database/json/pickup_limes_all_recipes_detailed_clean.json')

# Gemini API Configuration
GEMINI_KEY = os.getenv('GEMINI_KEY')
GEMINI_API_URL = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_KEY}'
GEMINI_VISION_API_URL = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_KEY}'

# USDA API Configuration
USDA_API_KEY = os.getenv('USDA_API_KEY')
USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search'
USDA_DETAIL_URL = 'https://api.nal.usda.gov/fdc/v1/food'

# Create Flask app
app = Flask(__name__, static_folder=os.path.join(project_root, 'web-ui'))
CORS(app)

# Initialize inflect
p = inflect.engine()

# Load recipe data
try:
    with open(RECIPE_DB_PATH, 'r') as f:
        RECIPES_DATA = json.load(f)
except Exception as e:
    print(f"Warning: Could not load recipes: {e}")
    RECIPES_DATA = []

def parse_iso8601_duration(duration_str):
    """Parse ISO 8601 duration format"""
    if not duration_str:
        return 'N/A'
    
    if duration_str.startswith('PT') and 'D' not in duration_str:
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
    
    if duration_str.startswith('P'):
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
    
    return duration_str

# Basic routes
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'home.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)

# Recipe search endpoint
@app.route('/api/recipes/search')
def search_recipes():
    try:
        query = request.args.get('query', '').lower()
        number = int(request.args.get('number', 20))
        
        if not query:
            return jsonify({'results': RECIPES_DATA[:number]})
        
        # Search logic
        filtered_recipes = []
        query_terms = query.split()
        
        for recipe in RECIPES_DATA:
            score = 0
            recipe_text = f"{recipe.get('name', '')} {recipe.get('description', '')} {' '.join(recipe.get('tags', []))}".lower()
            
            for term in query_terms:
                if term in recipe_text:
                    score += 1
            
            if score > 0:
                filtered_recipes.append(recipe)
        
        return jsonify({'results': filtered_recipes[:number]})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# AI Chat endpoint
@app.route('/ai/chat', methods=['POST'])
def ai_chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        
        if not GEMINI_KEY:
            return jsonify({'error': 'Gemini API key not configured'}), 500
        
        payload = {
            'contents': [{
                'parts': [{'text': user_message}]
            }]
        }
        
        response = requests.post(GEMINI_API_URL, json=payload)
        response.raise_for_status()
        
        result = response.json()
        ai_response = result['candidates'][0]['content']['parts'][0]['text']
        
        return jsonify({'response': ai_response})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# USDA Search endpoint
@app.route('/api/usda/search', methods=['GET'])
def usda_search():
    try:
        query = request.args.get('query', '')
        
        if not USDA_API_KEY:
            return jsonify({'error': 'USDA API key not configured'}), 500
        
        params = {
            'api_key': USDA_API_KEY,
            'query': query,
            'pageSize': 25
        }
        
        response = requests.get(USDA_API_URL, params=params)
        response.raise_for_status()
        
        return jsonify(response.json())
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# AI Parse and Match Foods endpoint
@app.route('/ai/parse-and-match-foods', methods=['POST'])
def parse_and_match_foods():
    try:
        data = request.json
        text_input = data.get('text', '')
        
        if not text_input:
            return jsonify({'error': 'No text provided'}), 400
        
        if not GEMINI_KEY:
            return jsonify({'error': 'Gemini API key not configured'}), 500
        
        parse_prompt = f"""You are a nutrition expert. Parse this food text and extract individual food items with their quantities.

Input text: "{text_input}"

For each food item, provide:
1. The exact quantity (number)
2. The unit of measurement (g, cup, oz, etc.)
3. The food name in a format that would match USDA FoodData Central database

Return ONLY a JSON array in this exact format:
[
  {{"quantity": 60, "unit": "g", "food_name": "Peppers, sweet, red, raw", "usda_search_term": "peppers red"}},
  {{"quantity": 100, "unit": "g", "food_name": "Chicken, broilers or fryers, breast, raw", "usda_search_term": "chicken breast"}}
]

Return ONLY the JSON array, no other text."""
        
        response = requests.post(GEMINI_API_URL, json={
            'contents': [{'parts': [{'text': parse_prompt}]}]
        })
        response.raise_for_status()
        
        result = response.json()
        ai_text = result['candidates'][0]['content']['parts'][0]['text']
        
        # Extract JSON from response
        json_match = re.search(r'\[.*\]', ai_text, re.DOTALL)
        if json_match:
            parsed_foods = json.loads(json_match.group())
            
            # Search USDA for each food
            results = []
            for food in parsed_foods:
                if USDA_API_KEY:
                    search_term = food.get('usda_search_term', food.get('food_name', ''))
                    params = {
                        'api_key': USDA_API_KEY,
                        'query': search_term,
                        'pageSize': 5
                    }
                    usda_response = requests.get(USDA_API_URL, params=params)
                    if usda_response.status_code == 200:
                        usda_data = usda_response.json()
                        food['usda_matches'] = usda_data.get('foods', [])[:3]
                
                results.append(food)
            
            return jsonify({
                'success': True,
                'parsed_foods': results
            })
        else:
            return jsonify({'error': 'Could not parse AI response'}), 500
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# AI Image Analysis endpoint
@app.route('/ai/analyze-meal-image', methods=['POST'])
def analyze_meal_image():
    try:
        data = request.json
        image_data = data.get('image', '')
        
        if not image_data:
            return jsonify({'error': 'No image provided'}), 400
        
        if not GEMINI_KEY:
            return jsonify({'error': 'Gemini API key not configured'}), 500
        
        # Remove data:image/jpeg;base64, prefix if present
        if 'base64,' in image_data:
            image_data = image_data.split('base64,')[1]
        
        prompt = """Analyze this food image and identify all food items visible. For each food item:
1. Estimate the quantity in grams
2. Provide the food name in USDA FoodData Central format

Return ONLY a JSON array like:
[
  {"quantity": 150, "unit": "g", "food_name": "Rice, white, cooked"},
  {"quantity": 100, "unit": "g", "food_name": "Chicken, broilers or fryers, breast, cooked"}
]"""
        
        response = requests.post(GEMINI_VISION_API_URL, json={
            'contents': [{
                'parts': [
                    {'text': prompt},
                    {
                        'inline_data': {
                            'mime_type': 'image/jpeg',
                            'data': image_data
                        }
                    }
                ]
            }]
        })
        response.raise_for_status()
        
        result = response.json()
        ai_text = result['candidates'][0]['content']['parts'][0]['text']
        
        # Extract JSON from response
        json_match = re.search(r'\[.*\]', ai_text, re.DOTALL)
        if json_match:
            parsed_foods = json.loads(json_match.group())
            return jsonify({
                'success': True,
                'foods': parsed_foods,
                'raw_response': ai_text
            })
        else:
            return jsonify({
                'success': True,
                'foods': [],
                'raw_response': ai_text
            })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# YouTube endpoint (stub - database not available in serverless)
@app.route('/api/youtube/videos', methods=['GET'])
def youtube_videos():
    return jsonify({
        'success': False,
        'message': 'YouTube integration requires database migration',
        'videos': []
    })

# USDA food details endpoint
@app.route('/api/usda/food/<int:fdc_id>', methods=['GET'])
def usda_food_details(fdc_id):
    try:
        if not USDA_API_KEY:
            return jsonify({'error': 'USDA API key not configured'}), 500
        
        url = f'{USDA_DETAIL_URL}/{fdc_id}'
        params = {'api_key': USDA_API_KEY}
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        return jsonify(response.json())
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Export for Vercel
# Vercel will automatically use this 'app' object


