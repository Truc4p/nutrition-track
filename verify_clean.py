import json

with open('pickup_limes_database/json/pickup_limes_all_recipes_detailed.json', 'r') as f:
    recipes = json.load(f)

print(f'🎉 CLEAN RESULTS:')
print(f'Total recipes: {len(recipes)}')
print(f'Recipes with images: {len([r for r in recipes if r.get("image") and "logo" not in r.get("image", "")])}')
print(f'Recipes with ingredients: {len([r for r in recipes if r.get("ingredients") and len(r.get("ingredients", [])) > 0])}')
print(f'Recipes with cooking time: {len([r for r in recipes if r.get("total_time")])}')

print(f'\n📋 All recipe names:')
for i, recipe in enumerate(recipes, 1):
    print(f'{i:2d}. {recipe.get("name", "N/A")}')

# Check for any problematic entries
problematic = [r for r in recipes if (
    r.get('name') == 'Recipes' or 
    'Unknown' in r.get('name', '') or
    not r.get('ingredients') or
    'logo' in r.get('image', '')
)]

if problematic:
    print(f'\n⚠️  Found {len(problematic)} problematic entries')
else:
    print(f'\n✅ NO problematic entries found - all data is clean!') 