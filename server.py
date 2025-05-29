from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
import re

app = Flask(__name__, static_folder='.')
CORS(app)  # Enable CORS for all routes

# Load recipe data
RECIPE_DB_PATH = '../meal/pickup_limes_database/recipe_database.json'
RECIPE_INDEX_PATH = '../meal/pickup_limes_database/recipe_index.json'
IMAGE_PATH = '../meal/pickup_limes_database/images'

# Load recipe database
with open(RECIPE_DB_PATH, 'r') as f:
    recipe_db = json.load(f)

# Load recipe index
with open(RECIPE_INDEX_PATH, 'r') as f:
    recipe_index = json.load(f)

@app.route('/')
def index():
    return send_from_directory('.', 'home.html')

@app.route('/api/recipes/search')
def search_recipes():
    query = request.args.get('query', '').lower()
    cuisine = request.args.get('cuisine', '').lower()
    diet = request.args.get('diet', '').lower()
    
    # If query is 'healthy' or similar general terms, show all recipes
    if query in ['healthy', 'health', 'nutritious', 'nutrition', 'recipe', 'recipes', 'food', 'meal', 'meals']:
        query = ''  # Reset query to show all recipes
    
    # Filter recipes based on query
    results = []
    
    for recipe in recipe_index:
        # Skip recipes without IDs
        if recipe['id'] is None:
            continue
            
        title = recipe['title'].lower()
        description = recipe['description'].lower() if 'description' in recipe and recipe['description'] else ''
        
        # Check if recipe matches search criteria
        if query:
            # Find full recipe details to check ingredients
            full_recipe = None
            for db_recipe in recipe_db['recipes']:
                if db_recipe['id'] == recipe['id']:
                    full_recipe = db_recipe
                    break
                    
            if not full_recipe:
                continue
                
            # Get ingredients as a string for searching
            ingredients_text = ' '.join(full_recipe.get('ingredients', [])).lower()
            
            # If no exact match, try to match individual words
            query_words = query.lower().split()
            title_words = title.split()
            desc_words = description.split() if description else []
            
            # Check if any query word is in title, description or ingredients
            match_found = False
            
            # For exact matches (higher priority)
            if query in title or query in description or query in ingredients_text:
                match_found = True
            else:
                # For partial word matches
                for q_word in query_words:
                    if any(q_word in t_word.lower() for t_word in title_words) or \
                       any(q_word in d_word.lower() for d_word in desc_words) or \
                       q_word in ingredients_text:
                        match_found = True
                        break
            
            if not match_found:
                # If still no match, check if recipe has any health-related keywords
                if query.lower() in ['healthy', 'health', 'nutritious']:
                    health_keywords = ['vegetable', 'fruit', 'grain', 'protein', 'vitamin', 
                                      'nutrient', 'nutrition', 'healthy', 'health', 'fresh',
                                      'natural', 'organic', 'whole', 'green', 'salad', 'bowl']
                    if any(keyword in title.lower() or keyword in description.lower() or 
                           keyword in ingredients_text for keyword in health_keywords):
                        match_found = True
            
            if not match_found:
                continue
        
        # Find full recipe details to check tags
        full_recipe = None
        for db_recipe in recipe_db['recipes']:
            if db_recipe['id'] == recipe['id']:
                full_recipe = db_recipe
                break
                
        if not full_recipe:
            continue
            
        # Get tags from full recipe or recipe index
        tags = []
        if 'tags' in full_recipe and full_recipe['tags']:
            tags = full_recipe['tags']
        elif 'tags' in recipe and recipe['tags']:
            tags = recipe['tags']
            
        # Convert tags to lowercase strings for easier matching
        tags_str = ' '.join([str(tag) for tag in tags]).lower() if tags else ''
        
        # Diet filtering - check both title, description and tags
        if diet:
            diet_match = False
            if diet == 'vegetarian':
                diet_match = ('vegetarian' in title or 'vegan' in title or 
                             'vegetarian' in description or 'vegan' in description or
                             'vegetarian' in tags_str or 'vegan' in tags_str)
            elif diet == 'vegan':
                diet_match = ('vegan' in title or 'vegan' in description or 'vegan' in tags_str)
            elif diet == 'gluten-free' or diet == 'gluten free':
                diet_match = ('gluten-free' in title or 'gluten free' in title or
                              'gluten-free' in description or 'gluten free' in description or
                              'gluten-free' in tags_str or 'gluten free' in tags_str)
            elif diet == 'ketogenic' or diet == 'keto':
                diet_match = ('keto' in title or 'ketogenic' in title or
                              'keto' in description or 'ketogenic' in description or
                              'keto' in tags_str or 'ketogenic' in tags_str)
                
            if not diet_match:
                continue
        
        # Cuisine filtering - check title, description and tags
        if cuisine:
            cuisine_match = (cuisine in title or cuisine in description or cuisine in tags_str)
            if not cuisine_match:
                continue
        
        # Ensure image_path exists
        image_path = recipe.get('image_path', '')
        image_url = ''
        if image_path:
            image_url = f'http://127.0.0.1:5001/api/images/{os.path.basename(image_path)}'
        elif 'image_url' in recipe and recipe['image_url']:
            # Use the image_url directly if available
            image_url = recipe['image_url']
                
        # Format recipe for frontend
        result = {
            'id': recipe['id'],
            'title': recipe['title'],
            'image': image_url,
            'readyInMinutes': recipe.get('readyInMinutes', 30),  # Default to 30 if not available
            'vegetarian': 'vegetarian' in title.lower() or 'vegan' in title.lower() or 'vegetarian' in tags_str or 'vegan' in tags_str,
            'vegan': 'vegan' in title.lower() or 'vegan' in tags_str,
            'glutenFree': 'gluten-free' in title.lower() or 'gluten free' in title.lower() or 'gluten-free' in tags_str or 'gluten free' in tags_str
        }
        results.append(result)
    
    # Limit results
    limit = int(request.args.get('number', 12))
    results = results[:limit]
    
    return jsonify({'results': results})

@app.route('/api/recipes/<int:recipe_id>/information')
def recipe_information(recipe_id):
    # Find recipe in database
    recipe = None
    for r in recipe_db['recipes']:
        if r['id'] == recipe_id:
            recipe = r
            break
            
    if not recipe:
        return jsonify({'error': 'Recipe not found'}), 404
    
    # Get tags as a string for easier checking
    tags = recipe.get('tags', [])
    tags_str = ' '.join(tags).lower() if tags else ''
    
    # Extract servings from ingredients if possible
    servings = 4  # Default value
    for ingredient in recipe.get('ingredients', []):
        if 'servings' in ingredient.lower():
            # Try to extract number from the ingredient text
            match = re.search(r'\d+', ingredient)
            if match:
                try:
                    servings = int(match.group())
                    break
                except ValueError:
                    pass
    
    # Calculate approximate ready time based on instructions count
    instructions_count = len(recipe.get('instructions', []))
    ready_time = max(15, min(60, instructions_count * 5))  # Between 15-60 minutes
    
    # Determine dietary properties from title and tags
    is_vegetarian = ('vegetarian' in recipe['title'].lower() or 
                    'vegan' in recipe['title'].lower() or 
                    'vegetarian' in tags_str or 
                    'vegan' in tags_str)
    
    is_vegan = ('vegan' in recipe['title'].lower() or 'vegan' in tags_str)
    
    is_gluten_free = ('gluten-free' in recipe['title'].lower() or 
                     'gluten free' in recipe['title'].lower() or 
                     'gluten-free' in tags_str or 
                     'gluten free' in tags_str)
    
    # Format ingredients with more detailed information
    extended_ingredients = []
    for ing in recipe.get('ingredients', []):
        # Try to extract amount and unit from ingredient text
        amount_match = re.search(r'(\d+(?:\.\d+)?)', ing)
        amount = 1
        if amount_match:
            try:
                amount = float(amount_match.group(1))
            except ValueError:
                pass
        
        # Try to extract unit
        unit_match = re.search(r'(\d+(?:\.\d+)?)\s+([a-zA-Z]+)', ing)
        unit = ''
        if unit_match and len(unit_match.groups()) > 1:
            unit = unit_match.group(2)
        
        extended_ingredients.append({
            'original': ing,
            'amount': amount,
            'unit': unit
        })
    
    # Format recipe for frontend
    result = {
        'id': recipe['id'],
        'title': recipe['title'],
        'image': f'http://127.0.0.1:5001/api/images/{os.path.basename(recipe.get("local_image_path", ""))}',
        'description': recipe.get('description', ''),
        'url': recipe.get('url', ''),
        'readyInMinutes': ready_time,
        'servings': servings,
        'vegetarian': is_vegetarian,
        'vegan': is_vegan,
        'glutenFree': is_gluten_free,
        'extendedIngredients': extended_ingredients,
        'analyzedInstructions': [{'steps': [{'step': step} for step in recipe.get('instructions', [])]}]
    }
    
    return jsonify(result)

@app.route('/api/recipes/<int:recipe_id>/nutritionWidget.json')
def recipe_nutrition(recipe_id):
    # Since we don't have detailed nutrition data, return placeholder data
    nutrition = {
        'calories': '350 kcal',
        'fat': '12g',
        'saturatedFat': '2g',
        'carbs': '45g',
        'sugar': '5g',
        'cholesterol': '0mg',
        'sodium': '400mg',
        'protein': '15g',
        'fiber': '8g',
        'alcohol': '0g',
        'nutrients': [
            {'name': 'Protein', 'amount': 15, 'unit': 'g', 'percentOfDailyNeeds': 30},
            {'name': 'Fat', 'amount': 12, 'unit': 'g', 'percentOfDailyNeeds': 18},
            {'name': 'Carbohydrates', 'amount': 45, 'unit': 'g', 'percentOfDailyNeeds': 15},
            {'name': 'Fiber', 'amount': 8, 'unit': 'g', 'percentOfDailyNeeds': 32},
            {'name': 'Sugar', 'amount': 5, 'unit': 'g', 'percentOfDailyNeeds': 5},
            {'name': 'Sodium', 'amount': 400, 'unit': 'mg', 'percentOfDailyNeeds': 17},
            {'name': 'Cholesterol', 'amount': 0, 'unit': 'mg', 'percentOfDailyNeeds': 0},
            {'name': 'Vitamin C', 'amount': 15, 'unit': 'mg', 'percentOfDailyNeeds': 18},
            {'name': 'Vitamin A', 'amount': 300, 'unit': 'IU', 'percentOfDailyNeeds': 6},
            {'name': 'Iron', 'amount': 2.5, 'unit': 'mg', 'percentOfDailyNeeds': 14},
            {'name': 'Calcium', 'amount': 120, 'unit': 'mg', 'percentOfDailyNeeds': 12}
        ]
    }
    
    return jsonify(nutrition)

@app.route('/api/images/<path:filename>')
def serve_image(filename):
    return send_from_directory(IMAGE_PATH, filename)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
