import json
import webbrowser
import os

def display_recipes_text():
    """Display all recipes in text format"""
    with open('pickup_limes_database/json/pickup_limes_all_recipes_detailed.json', 'r') as f:
        recipes = json.load(f)
    
    print("🍳 PICK UP LIMES RECIPE COLLECTION")
    print("=" * 80)
    print(f"Total recipes: {len(recipes)}")
    print("=" * 80)
    
    for i, recipe in enumerate(recipes, 1):
        print(f"\n📋 RECIPE #{i}")
        print(f"{'─' * 50}")
        print(f"🏷️  Name: {recipe.get('name', 'N/A')}")
        print(f"🔗 URL: {recipe.get('url', 'N/A')}")
        print(f"🖼️  Image: {recipe.get('image', 'N/A')}")
        print(f"⏱️  Time: {recipe.get('total_time', 'N/A')}")
        
        # Display tags
        tags = recipe.get('tags', [])
        if tags:
            print(f"🏷️  Tags: {', '.join(tags[:5])}{'...' if len(tags) > 5 else ''}")
        
        # Display ingredients
        ingredients = recipe.get('ingredients', [])
        print(f"🥗 Ingredients ({len(ingredients)} items):")
        for j, ingredient in enumerate(ingredients[:8], 1):  # Show first 8
            print(f"   {j}. {ingredient}")
        if len(ingredients) > 8:
            print(f"   ... and {len(ingredients) - 8} more ingredients")
        
        print(f"{'─' * 50}")

def create_html_viewer():
    """Create an HTML file to view all recipes in a browser"""
    with open('pickup_limes_database/json/pickup_limes_all_recipes_detailed.json', 'r') as f:
        recipes = json.load(f)
    
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pick Up Limes Recipe Collection</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
            }}
            .header {{
                text-align: center;
                background: linear-gradient(135deg, #6b8e23, #8fbc8f);
                color: white;
                padding: 20px;
                border-radius: 10px;
                margin-bottom: 30px;
            }}
            .recipe-grid {{
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                gap: 20px;
            }}
            .recipe-card {{
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                transition: transform 0.2s;
            }}
            .recipe-card:hover {{
                transform: translateY(-5px);
            }}
            .recipe-image {{
                width: 100%;
                height: 200px;
                object-fit: cover;
            }}
            .recipe-content {{
                padding: 15px;
            }}
            .recipe-title {{
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 10px;
                color: #333;
            }}
            .recipe-time {{
                color: #666;
                margin-bottom: 10px;
                font-weight: bold;
            }}
            .recipe-tags {{
                margin-bottom: 10px;
            }}
            .tag {{
                display: inline-block;
                background: #e8f5e8;
                color: #2d5a2d;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 12px;
                margin: 2px;
            }}
            .ingredients {{
                margin-top: 10px;
                font-size: 14px;
                color: #555;
            }}
            .ingredients-title {{
                font-weight: bold;
                margin-bottom: 5px;
            }}
            .ingredient {{
                margin: 2px 0;
                padding-left: 10px;
            }}
            .view-recipe {{
                display: inline-block;
                background: #6b8e23;
                color: white;
                padding: 8px 15px;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 10px;
                font-size: 14px;
            }}
            .view-recipe:hover {{
                background: #5a7a1f;
            }}
            .stats {{
                text-align: center;
                margin-bottom: 20px;
                padding: 15px;
                background: white;
                border-radius: 10px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🍳 Pick Up Limes Recipe Collection</h1>
            <p>Scraped from pickuplimes.com</p>
        </div>
        
        <div class="stats">
            <h3>📊 Collection Stats</h3>
            <p><strong>{len(recipes)} recipes</strong> • All vegan & plant-based • Complete with images, ingredients & cooking times</p>
        </div>
        
        <div class="recipe-grid">
    """
    
    for i, recipe in enumerate(recipes, 1):
        # Convert time format
        time_display = recipe.get('total_time', 'N/A')
        if time_display.startswith('PT'):
            # Convert PT05M to "5 minutes", PT01H40M to "1 hour 40 minutes"
            time_display = time_display.replace('PT', '').replace('H', ' hour ').replace('M', ' min')
        
        # Get tags
        tags = recipe.get('tags', [])
        tags_html = ''.join([f'<span class="tag">{tag}</span>' for tag in tags[:8]])
        
        # Get ingredients
        ingredients = recipe.get('ingredients', [])
        ingredients_html = ''.join([f'<div class="ingredient">• {ing}</div>' for ing in ingredients[:6]])
        if len(ingredients) > 6:
            ingredients_html += f'<div class="ingredient">... and {len(ingredients) - 6} more</div>'
        
        html_content += f"""
            <div class="recipe-card">
                <img src="{recipe.get('image', '')}" alt="{recipe.get('name', '')}" class="recipe-image" 
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
                <div class="recipe-content">
                    <div class="recipe-title">{recipe.get('name', 'Unknown Recipe')}</div>
                    <div class="recipe-time">⏱️ {time_display}</div>
                    <div class="recipe-tags">{tags_html}</div>
                    <div class="ingredients">
                        <div class="ingredients-title">🥗 Ingredients ({len(ingredients)} items):</div>
                        {ingredients_html}
                    </div>
                    <a href="{recipe.get('url', '#')}" target="_blank" class="view-recipe">View Full Recipe</a>
                </div>
            </div>
        """
    
    html_content += """
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding: 20px; background: white; border-radius: 10px;">
            <p><em>Generated by Pick Up Limes Recipe Scraper</em></p>
        </div>
    </body>
    </html>
    """
    
    # Save HTML file
    html_file = 'recipe_collection.html'
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✅ HTML viewer created: {html_file}")
    return html_file

def export_csv_summary():
    """Create a simple CSV summary for quick viewing"""
    with open('pickup_limes_database/json/pickup_limes_all_recipes_detailed.json', 'r') as f:
        recipes = json.load(f)
    
    import csv
    
    with open('recipe_summary.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['#', 'Recipe Name', 'Cooking Time', 'Ingredients Count', 'Tags Count', 'URL'])
        
        for i, recipe in enumerate(recipes, 1):
            writer.writerow([
                i,
                recipe.get('name', 'N/A'),
                recipe.get('total_time', 'N/A'),
                len(recipe.get('ingredients', [])),
                len(recipe.get('tags', [])),
                recipe.get('url', 'N/A')
            ])
    
    print("✅ CSV summary created: recipe_summary.csv")

def main():
    print("🍳 RECIPE VIEWER OPTIONS")
    print("=" * 40)
    print("1. Display all recipes in terminal")
    print("2. Create HTML viewer (opens in browser)")
    print("3. Create CSV summary")
    print("4. Do all of the above")
    
    choice = input("\nEnter your choice (1-4): ").strip()
    
    if choice == '1':
        display_recipes_text()
    elif choice == '2':
        html_file = create_html_viewer()
        try:
            webbrowser.open(f'file://{os.path.abspath(html_file)}')
            print("🌐 Opening in your default browser...")
        except:
            print(f"📁 Please open {html_file} manually in your browser")
    elif choice == '3':
        export_csv_summary()
    elif choice == '4':
        print("📋 Creating all views...")
        display_recipes_text()
        html_file = create_html_viewer()
        export_csv_summary()
        try:
            webbrowser.open(f'file://{os.path.abspath(html_file)}')
            print("🌐 Opening HTML viewer in browser...")
        except:
            print(f"📁 Please open {html_file} manually in your browser")
    else:
        print("❌ Invalid choice")

if __name__ == "__main__":
    main() 