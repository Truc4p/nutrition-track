#!/usr/bin/env python3
"""
A simple web interface for browsing and searching the Pickup Limes recipe database.
"""

import json
import os
import argparse
from flask import Flask, render_template, request, redirect, url_for, send_from_directory

app = Flask(__name__)

# Global variables to store the database
RECIPE_DATABASE = {}
RECIPE_INDEX = []


def load_database(database_file):
    """Load the recipe database from a JSON file"""
    global RECIPE_DATABASE
    try:
        with open(database_file, 'r', encoding='utf-8') as f:
            RECIPE_DATABASE = json.load(f)
            return True
    except Exception as e:
        print(f"Error loading database: {e}")
        return False


def load_index(index_file):
    """Load the recipe index from a JSON file"""
    global RECIPE_INDEX
    try:
        with open(index_file, 'r', encoding='utf-8') as f:
            RECIPE_INDEX = json.load(f)
            return True
    except Exception as e:
        print(f"Error loading index: {e}")
        return False


def search_recipes(query=None, ingredient=None, max_results=50):
    """Search for recipes in the database"""
    global RECIPE_DATABASE
    
    results = []
    recipes = RECIPE_DATABASE.get("recipes", [])
    
    for recipe in recipes:
        # Skip recipes with "Unknown Recipe" title or empty recipes
        if recipe.get("title") == "Unknown Recipe" or not recipe.get("ingredients"):
            continue
            
        match = True
        
        # Check general query (title and description)
        if query and match:
            title = recipe.get("title", "").lower()
            description = recipe.get("description", "").lower()
            match = query.lower() in title or query.lower() in description
        
        # Check ingredients
        if ingredient and match:
            ingredients_text = " ".join(recipe.get("ingredients", [])).lower()
            match = ingredient.lower() in ingredients_text
        
        if match:
            results.append(recipe)
            
            # Stop if we've reached the maximum number of results
            if len(results) >= max_results:
                break
    
    return results


def get_recipe_by_id(recipe_id):
    """Get a recipe by its ID"""
    global RECIPE_DATABASE
    
    recipes = RECIPE_DATABASE.get("recipes", [])
    
    for recipe in recipes:
        if recipe.get("id") == recipe_id:
            return recipe
    
    return None


@app.route('/')
def index():
    """Render the home page"""
    global RECIPE_INDEX
    return render_template('index.html', recipes=RECIPE_INDEX[:12], total_recipes=len(RECIPE_INDEX))


@app.route('/search')
def search():
    """Handle search requests"""
    query = request.args.get('query', '')
    ingredient = request.args.get('ingredient', '')
    
    if not query and not ingredient:
        return redirect(url_for('index'))
    
    results = search_recipes(query=query, ingredient=ingredient)
    return render_template('search.html', recipes=results, query=query, ingredient=ingredient)


@app.route('/recipe/<int:recipe_id>')
def recipe_detail(recipe_id):
    """Display a recipe's details"""
    recipe = get_recipe_by_id(recipe_id)
    
    if not recipe:
        return redirect(url_for('index'))
    
    return render_template('recipe.html', recipe=recipe)


@app.route('/images/<path:filename>')
def serve_image(filename):
    """Serve images from the database directory"""
    return send_from_directory(os.path.join(app.config['DATABASE_DIR'], 'images'), filename)

@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files"""
    return send_from_directory(os.path.join(os.path.dirname(__file__), 'templates'), filename)


def create_templates():
    """Create the HTML templates for the web interface"""
    templates_dir = os.path.join(os.path.dirname(__file__), 'templates')
    os.makedirs(templates_dir, exist_ok=True)
    
    # Create base template
    with open(os.path.join(templates_dir, 'base.html'), 'w', encoding='utf-8') as f:
        f.write('''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}Pickup Limes Recipe Browser{% endblock %}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        header {
            background-color: #4CAF50;
            color: white;
            padding: 1rem;
            text-align: center;
            margin-bottom: 2rem;
            border-radius: 5px;
        }
        h1, h2, h3 {
            color: #2E7D32;
        }
        .search-form {
            background-color: #fff;
            padding: 1rem;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        .search-form input[type="text"] {
            padding: 8px;
            width: 70%;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .search-form button {
            padding: 8px 16px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .recipe-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .recipe-card {
            background: white;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            overflow: hidden;
            transition: transform 0.3s ease;
        }
        .recipe-card:hover {
            transform: translateY(-5px);
        }
        .recipe-card img {
            width: 100%;
            height: 180px;
            object-fit: cover;
        }
        .recipe-card .content {
            padding: 15px;
        }
        .recipe-card h3 {
            margin-top: 0;
            font-size: 18px;
        }
        .recipe-card p {
            font-size: 14px;
            color: #666;
        }
        .recipe-detail {
            background: white;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            padding: 20px;
        }
        .recipe-detail img {
            max-width: 100%;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .recipe-detail h1 {
            margin-top: 0;
        }
        .recipe-detail .description {
            font-style: italic;
            color: #666;
            margin-bottom: 20px;
        }
        .recipe-detail .ingredients, .recipe-detail .instructions {
            margin-bottom: 20px;
        }
        .recipe-detail ul, .recipe-detail ol {
            padding-left: 20px;
        }
        .recipe-detail li {
            margin-bottom: 8px;
        }
        .back-link {
            display: inline-block;
            margin-top: 20px;
            color: #4CAF50;
            text-decoration: none;
        }
        .back-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <header>
        <h1>Pickup Limes Recipe Browser</h1>
        <p>Browse and search recipes from Pickup Limes</p>
    </header>
    
    <div class="search-form">
        <form action="{{ url_for('search') }}" method="get">
            <input type="text" name="query" placeholder="Search by recipe name or description" value="{{ request.args.get('query', '') }}">
            <input type="text" name="ingredient" placeholder="Search by ingredient" value="{{ request.args.get('ingredient', '') }}">
            <button type="submit">Search</button>
        </form>
    </div>
    
    <main>
        {% block content %}{% endblock %}
    </main>
    
    <footer style="margin-top: 2rem; text-align: center; color: #666;">
        <p>Recipe data sourced from <a href="https://www.pickuplimes.com/" target="_blank">Pickup Limes</a></p>
    </footer>
</body>
</html>''')
    
    # Create index template
    with open(os.path.join(templates_dir, 'index.html'), 'w', encoding='utf-8') as f:
        f.write('''{% extends 'base.html' %}

{% block content %}
    <h2>Featured Recipes</h2>
    <p>Showing {{ recipes|length }} of {{ total_recipes }} recipes</p>
    
    <div class="recipe-grid">
        {% for recipe in recipes %}
            <div class="recipe-card">
                {% if recipe.image_path %}
                    {% set filename = recipe.image_path.split('/')[-1] %}
                    {% set base_filename = filename.split('.')[0] %}
                    {% if '.jpg' in filename %}
                        <img src="{{ url_for('serve_image', filename=filename) }}" alt="{{ recipe.title }}">
                    {% elif '.webp' in filename %}
                        <img src="{{ url_for('serve_image', filename=base_filename + '.jpg') }}" alt="{{ recipe.title }}">
                    {% else %}
                        <img src="{{ url_for('serve_static', filename='placeholder.svg') }}" alt="No Image">
                    {% endif %}
                {% else %}
                    <img src="{{ url_for('serve_static', filename='placeholder.svg') }}" alt="No Image">
                {% endif %}
                <div class="content">
                    <h3>{{ recipe.title }}</h3>
                    <p>{{ recipe.description }}</p>
                    <p><strong>Ingredients:</strong> {{ recipe.ingredients_count }}</p>
                    <p><strong>Steps:</strong> {{ recipe.instructions_count }}</p>
                    <a href="{{ url_for('recipe_detail', recipe_id=recipe.id) }}">View Recipe</a>
                </div>
            </div>
        {% endfor %}
    </div>
{% endblock %}''')
    
    # Create search template
    with open(os.path.join(templates_dir, 'search.html'), 'w', encoding='utf-8') as f:
        f.write('''{% extends 'base.html' %}

{% block title %}Search Results - Pickup Limes Recipe Browser{% endblock %}

{% block content %}
    <h2>Search Results</h2>
    {% if query %}
        <p>Searching for: "{{ query }}"</p>
    {% endif %}
    {% if ingredient %}
        <p>Ingredient: "{{ ingredient }}"</p>
    {% endif %}
    
    {% if recipes %}
        <p>Found {{ recipes|length }} recipes</p>
        <div class="recipe-grid">
            {% for recipe in recipes %}
                <div class="recipe-card">
                    {% if recipe.local_image_path %}
                        {% set filename = recipe.local_image_path.split('/')[-1] %}
                        {% set base_filename = filename.split('.')[0] %}
                        {% if '.jpg' in filename %}
                            <img src="{{ url_for('serve_image', filename=filename) }}" alt="{{ recipe.title }}">
                        {% elif '.webp' in filename %}
                            <img src="{{ url_for('serve_image', filename=base_filename + '.jpg') }}" alt="{{ recipe.title }}">
                        {% else %}
                            <img src="{{ url_for('serve_static', filename='placeholder.svg') }}" alt="No Image">
                        {% endif %}
                    {% else %}
                        <img src="{{ url_for('serve_static', filename='placeholder.svg') }}" alt="No Image">
                    {% endif %}
                    <div class="content">
                        <h3>{{ recipe.title }}</h3>
                        <p>{{ recipe.description[:100] }}{% if recipe.description|length > 100 %}...{% endif %}</p>
                        <p><strong>Ingredients:</strong> {{ recipe.ingredients|length }}</p>
                        <p><strong>Steps:</strong> {{ recipe.instructions|length }}</p>
                        <a href="{{ url_for('recipe_detail', recipe_id=recipe.id) }}">View Recipe</a>
                    </div>
                </div>
            {% endfor %}
        </div>
    {% else %}
        <p>No recipes found matching your search criteria.</p>
    {% endif %}
    
    <a href="{{ url_for('index') }}" class="back-link">Back to Home</a>
{% endblock %}''')
    
    # Create recipe detail template
    with open(os.path.join(templates_dir, 'recipe.html'), 'w', encoding='utf-8') as f:
        f.write('''{% extends 'base.html' %}

{% block title %}{{ recipe.title }} - Pickup Limes Recipe Browser{% endblock %}

{% block content %}
    <div class="recipe-detail">
        <h1>{{ recipe.title }}</h1>
        
        {% if recipe.local_image_path %}
            {% set filename = recipe.local_image_path.split('/')[-1] %}
            {% set base_filename = filename.split('.')[0] %}
            {% if '.jpg' in filename %}
                <img src="{{ url_for('serve_image', filename=filename) }}" alt="{{ recipe.title }}">
            {% elif '.webp' in filename %}
                <img src="{{ url_for('serve_image', filename=base_filename + '.jpg') }}" alt="{{ recipe.title }}">
            {% else %}
                <img src="{{ url_for('serve_static', filename='placeholder.svg') }}" alt="No Image" style="max-width: 300px;">
            {% endif %}
        {% else %}
            <img src="{{ url_for('serve_static', filename='placeholder.svg') }}" alt="No Image" style="max-width: 300px;">
        {% endif %}
        
        <div class="description">
            {{ recipe.description }}
        </div>
        
        {% if recipe.metadata %}
            <div class="metadata">
                <h3>Recipe Information</h3>
                <ul>
                    {% for key, value in recipe.metadata.items() %}
                        <li><strong>{{ key|replace('_', ' ')|title }}:</strong> {{ value }}</li>
                    {% endfor %}
                </ul>
            </div>
        {% endif %}
        
        <div class="ingredients">
            <h3>Ingredients</h3>
            <ul>
                {% for ingredient in recipe.ingredients %}
                    <li>{{ ingredient }}</li>
                {% endfor %}
            </ul>
        </div>
        
        <div class="instructions">
            <h3>Instructions</h3>
            <ol>
                {% for instruction in recipe.instructions %}
                    <li>{{ instruction }}</li>
                {% endfor %}
            </ol>
        </div>
        
        {% if recipe.nutrition %}
            <div class="nutrition">
                <h3>Nutrition Information</h3>
                <ul>
                    {% for key, value in recipe.nutrition.items() %}
                        <li><strong>{{ key|replace('_', ' ')|title }}:</strong> {{ value }}</li>
                    {% endfor %}
                </ul>
            </div>
        {% endif %}
        
        {% if recipe.tags %}
            <div class="tags">
                <h3>Tags</h3>
                <ul>
                    {% for tag in recipe.tags %}
                        <li>{{ tag }}</li>
                    {% endfor %}
                </ul>
            </div>
        {% endif %}
        
        <a href="{{ recipe.url }}" target="_blank">View Original Recipe on Pickup Limes</a>
    </div>
    
    <a href="{{ url_for('index') }}" class="back-link">Back to Home</a>
{% endblock %}''')


def main():
    parser = argparse.ArgumentParser(description='Web interface for browsing the Pickup Limes recipe database')
    parser.add_argument('--database', '-d', default='pickup_limes_database',
                        help='Path to the recipe database directory')
    parser.add_argument('--port', '-p', type=int, default=5000,
                        help='Port to run the web server on')
    parser.add_argument('--host', default='127.0.0.1',
                        help='Host to run the web server on')
    
    args = parser.parse_args()
    
    # Set the database directory in the Flask app config
    app.config['DATABASE_DIR'] = args.database
    
    # Load the database and index
    database_file = os.path.join(args.database, 'recipe_database.json')
    index_file = os.path.join(args.database, 'recipe_index.json')
    
    if not load_database(database_file):
        print(f"Error: Could not load database from {database_file}")
        return 1
    
    if not load_index(index_file):
        print(f"Error: Could not load index from {index_file}")
        return 1
    
    # Create the HTML templates
    create_templates()
    
    # Run the Flask app
    print(f"Starting web server at http://{args.host}:{args.port}")
    app.run(host=args.host, port=args.port, debug=True)


if __name__ == "__main__":
    main()
