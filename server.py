from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
import re

app = Flask(__name__, static_folder='.')
CORS(app)  # Enable CORS for all routes

# Load recipe data 
RECIPE_DB_PATH = '../meal/pickup_limes_database/json/pickup_limes_all_recipes_detailed.json'
IMAGE_PATH = '../meal/pickup_limes_database/images'

# Load recipe database - simplified to single file
with open(RECIPE_DB_PATH, 'r') as f:
    recipes = json.load(f)

@app.route('/')
def index():
    return send_from_directory('.', 'home.html')

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

        # Convert time format from PT05M to minutes
        total_time = recipe.get('total_time', 'PT30M')
        ready_in_minutes = 30  # default
        if total_time and total_time.startswith('PT'):
            time_str = total_time.replace('PT', '')
            minutes = 0
            if 'H' in time_str and 'M' in time_str:
                # e.g., PT01H40M
                parts = time_str.split('H')
                hours = int(parts[0]) if parts[0] else 0
                minutes_part = parts[1].replace('M', '') if len(parts) > 1 else '0'
                minutes = hours * 60 + (int(minutes_part) if minutes_part else 0)
            elif 'H' in time_str:
                # e.g., PT01H
                hours = int(time_str.replace('H', ''))
                minutes = hours * 60
            elif 'M' in time_str:
                # e.g., PT05M
                minutes = int(time_str.replace('M', ''))
            ready_in_minutes = minutes if minutes > 0 else 30

        # Use the image URL directly from the recipe data
        image_url = recipe.get('image', '')
                
        # Format recipe for frontend
        result = {
            'id': recipe['id'],
            'title': recipe.get('name', ''),
            'image': image_url,
            'url': recipe.get('url', ''),
            'readyInMinutes': ready_in_minutes,
        }
        results.append(result)
    
    # Limit results
    limit = int(request.args.get('number', 12))
    results = results[:limit]
    
    return jsonify({'results': results})

@app.route('/api/images/<path:filename>')
def serve_image(filename):
    return send_from_directory(IMAGE_PATH, filename)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
