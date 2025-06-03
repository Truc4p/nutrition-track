#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'food_dietary_project.settings')
django.setup()

from food_dietary_app.models import IngredientFact, NutrientType, NutritionFact

def show_all_nutrition_data():
    """Display all nutrition data for all ingredients"""
    print("=== COMPREHENSIVE NUTRITION DATA ===\n")
    
    for ingredient in IngredientFact.objects.all():
        print(f"🍽️  {ingredient.name.upper()}")
        print(f"   Serving Size: {ingredient.serving_size}{ingredient.measurement_unit}")
        print(f"   Last Updated: {ingredient.updated_at}")
        
        print("\n   📊 NUTRITION FACTS:")
        
        # Group nutrition facts by category
        categories = {}
        for nutrition_fact in ingredient.nutrition_facts.all():
            category = nutrition_fact.nutrient_type.category
            if category not in categories:
                categories[category] = []
            categories[category].append(nutrition_fact)
        
        # Display by category
        for category, facts in categories.items():
            print(f"\n   📈 {category.upper()}:")
            for fact in facts:
                print(f"      • {fact.nutrient_type.name}: {fact.value} {fact.nutrient_type.unit}")
        
        print("\n" + "="*60 + "\n")

def search_by_nutrient(nutrient_name):
    """Find all foods containing a specific nutrient"""
    print(f"=== FOODS CONTAINING '{nutrient_name.upper()}' ===\n")
    
    try:
        nutrient_type = NutrientType.objects.get(name__icontains=nutrient_name)
        facts = NutritionFact.objects.filter(nutrient_type=nutrient_type)
        
        for fact in facts:
            print(f"🍽️  {fact.ingredient.name}: {fact.value} {fact.nutrient_type.unit}")
    except NutrientType.DoesNotExist:
        print(f"❌ No nutrient found matching '{nutrient_name}'")

def show_nutrient_types():
    """Show all available nutrient types by category"""
    print("=== AVAILABLE NUTRIENTS BY CATEGORY ===\n")
    
    categories = {}
    for nutrient_type in NutrientType.objects.all():
        category = nutrient_type.category
        if category not in categories:
            categories[category] = []
        categories[category].append(nutrient_type)
    
    for category, nutrients in categories.items():
        print(f"📈 {category.upper()}:")
        for nutrient in nutrients:
            print(f"   • {nutrient.name} ({nutrient.unit})")
        print()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        if command == "nutrients":
            show_nutrient_types()
        elif command == "search" and len(sys.argv) > 2:
            search_by_nutrient(sys.argv[2])
        else:
            print("Usage:")
            print("  python query_nutrition.py                  # Show all nutrition data")
            print("  python query_nutrition.py nutrients        # Show available nutrients")
            print("  python query_nutrition.py search <name>    # Search by nutrient name")
    else:
        show_all_nutrition_data() 