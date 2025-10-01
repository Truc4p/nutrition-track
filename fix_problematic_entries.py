import json

def fix_problematic_entries():
    """Remove recipes with problematic data"""
    
    # Load the data
    with open('pickup_limes_database/json/pickup_limes_all_recipes_detailed.json', 'r') as f:
        recipes = json.load(f)
    
    print(f"Original recipe count: {len(recipes)}")
    
    # Filter out problematic entries
    clean_recipes = [r for r in recipes if not (
        r.get('name') == 'Recipes' or 
        'Unknown' in r.get('name', '') or
        not r.get('ingredients') or
        'logo' in r.get('image', '')
    )]
    
    print(f"Clean recipe count: {len(clean_recipes)}")
    print(f"Removed {len(recipes) - len(clean_recipes)} problematic recipes")
    
    # Save the cleaned data
    with open('pickup_limes_database/json/pickup_limes_all_recipes_detailed_clean.json', 'w') as f:
        json.dump(clean_recipes, f, indent=2)
    
    print("✅ Saved clean data to pickup_limes_all_recipes_detailed_clean.json")
    
    # Show what was removed
    removed_recipes = [r for r in recipes if (
        r.get('name') == 'Recipes' or 
        'Unknown' in r.get('name', '') or
        not r.get('ingredients') or
        'logo' in r.get('image', '')
    )]
    
    if removed_recipes:
        print(f"\n🗑️  REMOVED RECIPES:")
        for recipe in removed_recipes:
            print(f"- {recipe.get('name', 'N/A')} (ID: {recipe.get('id', 'N/A')})")

if __name__ == "__main__":
    fix_problematic_entries()