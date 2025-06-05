import json
import pandas as pd

def analyze_recipes():
    # Load the JSON data
    with open('pickup_limes_database/json/pickup_limes_all_recipes_detailed.json', 'r') as f:
        recipes = json.load(f)
    
    print("🍳 PICK UP LIMES RECIPE ANALYSIS")
    print("=" * 40)
    
    # Basic stats
    total_recipes = len(recipes)
    recipes_with_images = len([r for r in recipes if r.get('image') and 'logo' not in r.get('image', '')])
    recipes_with_ingredients = len([r for r in recipes if r.get('ingredients') and len(r.get('ingredients', [])) > 0])
    recipes_with_time = len([r for r in recipes if r.get('total_time')])
    recipes_with_tags = len([r for r in recipes if r.get('tags') and len(r.get('tags', [])) > 0])
    
    print(f"📊 DATA SUMMARY:")
    print(f"   Total recipes: {total_recipes}")
    print(f"   Recipes with images: {recipes_with_images}")
    print(f"   Recipes with ingredients: {recipes_with_ingredients}")
    print(f"   Recipes with cooking time: {recipes_with_time}")
    print(f"   Recipes with tags: {recipes_with_tags}")
    
    # Show sample recipes
    print(f"\n🥗 SAMPLE RECIPES:")
    count = 0
    for recipe in recipes:
        if recipe.get('name') and 'Unknown' not in recipe.get('name', '') and 'Recipes' != recipe.get('name'):
            print(f"   • {recipe['name']}")
            if recipe.get('total_time'):
                print(f"     Time: {recipe['total_time']}")
            if recipe.get('tags'):
                print(f"     Tags: {', '.join(recipe['tags'][:3])}...")
            print()
            count += 1
            if count >= 5:
                break
    
    # Analyze cooking times
    times = [r.get('total_time') for r in recipes if r.get('total_time')]
    print(f"⏱️  COOKING TIMES FOUND: {len(times)} recipes")
    
    # Analyze most common tags
    all_tags = []
    for recipe in recipes:
        if recipe.get('tags'):
            all_tags.extend(recipe['tags'])
    
    from collections import Counter
    common_tags = Counter(all_tags).most_common(10)
    print(f"\n🏷️  MOST COMMON TAGS:")
    for tag, count in common_tags:
        print(f"   • {tag}: {count} recipes")

if __name__ == "__main__":
    analyze_recipes() 