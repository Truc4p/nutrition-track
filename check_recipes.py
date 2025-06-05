import json

def check_all_recipes():
    # Load the JSON data
    with open('pickup_limes_database/json/pickup_limes_all_recipes_detailed.json', 'r') as f:
        recipes = json.load(f)
    
    print("🔍 DETAILED RECIPE INSPECTION")
    print("=" * 60)
    
    missing_images = []
    valid_recipes = []
    problematic_recipes = []
    
    for i, recipe in enumerate(recipes, 1):
        print(f"\n📋 RECIPE #{i}")
        print(f"   Name: {recipe.get('name', 'N/A')}")
        print(f"   URL: {recipe.get('url', 'N/A')}")
        
        # Check image
        image = recipe.get('image', '')
        if not image:
            print(f"   ❌ Image: MISSING")
            missing_images.append(recipe)
        elif 'logo' in image:
            print(f"   ⚠️  Image: LOGO (not recipe image)")
            print(f"       {image}")
            missing_images.append(recipe)
        else:
            print(f"   ✅ Image: OK")
            print(f"       {image}")
        
        # Check other fields
        ingredients = recipe.get('ingredients', [])
        total_time = recipe.get('total_time', '')
        tags = recipe.get('tags', [])
        
        print(f"   Ingredients: {len(ingredients) if ingredients else 0} items")
        print(f"   Total Time: {total_time if total_time else 'N/A'}")
        print(f"   Tags: {len(tags) if tags else 0} tags")
        
        # Categorize recipe
        if (recipe.get('name') == 'Recipes' or 
            'Unknown' in recipe.get('name', '') or
            not ingredients or
            'logo' in image):
            problematic_recipes.append(recipe)
            print(f"   🚨 Status: PROBLEMATIC (likely not a real recipe)")
        else:
            valid_recipes.append(recipe)
            print(f"   ✅ Status: VALID RECIPE")
    
    print(f"\n" + "=" * 60)
    print(f"📊 SUMMARY:")
    print(f"   Total entries: {len(recipes)}")
    print(f"   Valid recipes: {len(valid_recipes)}")
    print(f"   Problematic entries: {len(problematic_recipes)}")
    print(f"   Missing/bad images: {len(missing_images)}")
    
    if problematic_recipes:
        print(f"\n🚨 PROBLEMATIC ENTRIES:")
        for recipe in problematic_recipes:
            print(f"   • {recipe.get('name', 'N/A')} - {recipe.get('url', 'N/A')}")
    
    if missing_images:
        print(f"\n📷 ENTRIES WITH MISSING/BAD IMAGES:")
        for recipe in missing_images:
            reason = "Logo image" if 'logo' in recipe.get('image', '') else "No image"
            print(f"   • {recipe.get('name', 'N/A')} - {reason}")
    
    print(f"\n✨ ACTUAL RECIPE COUNT: {len(valid_recipes)}")
    
    return valid_recipes, problematic_recipes

if __name__ == "__main__":
    valid, problematic = check_all_recipes() 