#!/usr/bin/env python3
import requests
import json

def test_comprehensive_api():
    """Test the comprehensive nutrition API"""
    
    # Test the compact format (default)
    print("=== TESTING COMPACT FORMAT ===")
    response = requests.get("http://localhost:8000/api/get_ingredients_by_names/?names=CHICKEN%20BREAST")
    data = response.json()
    
    for item in data:
        print(f"🍽️  {item['name']}")
        print(f"   Serving: {item['serving_size']}{item['measurement_unit']}")
        print(f"\n   📊 LEGACY FIELDS:")
        print(f"   • Total Fat: {item['total_fat']}g")
        print(f"   • Protein: {item['protein']}g") 
        print(f"   • Carbs: {item['carbohydrates']}g")
        print(f"   • Fiber: {item['fiber']}g")
        print(f"   • Cholesterol: {item['cholesterol']}mg")
        
        print(f"\n   🧬 ALL COMPREHENSIVE NUTRIENTS:")
        
        # Group by category
        categories = {}
        for nutrient, details in item['all_nutrients'].items():
            category = details['category']
            if category not in categories:
                categories[category] = []
            categories[category].append((nutrient, details))
        
        for category, nutrients in categories.items():
            print(f"\n   📈 {category.upper()}:")
            for nutrient, details in nutrients:
                print(f"      • {nutrient}: {details['value']} {details['unit']}")
    
    print("\n" + "="*80)
    
    # Test search by nutrient
    print("\n=== TESTING NUTRIENT SEARCH ===")
    response = requests.get("http://localhost:8000/api/search_by_nutrient/?nutrient=vitamin%20c&min_value=1")
    data = response.json()
    
    print("Foods with Vitamin C > 1mg:")
    for item in data:
        vitamin_c = item['all_nutrients'].get('vitamin c, total ascorbic acid', {})
        print(f"🍽️  {item['name']}: {vitamin_c.get('value', 'N/A')} {vitamin_c.get('unit', '')}")

if __name__ == "__main__":
    test_comprehensive_api() 