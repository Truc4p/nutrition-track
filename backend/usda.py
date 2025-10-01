import csv
import requests
import statistics

def get_total_food_count(api_key):
    """Get the total number of foods available in the USDA database"""
    base_url = "https://api.nal.usda.gov/fdc/v1/foods/search"
    params = {
        'query': '',  # Empty query to get all foods
        'api_key': api_key,
        'pageSize': 1,  # We only need 1 result to get the total count
        'pageNumber': 1
    }
    try:
        response = requests.get(base_url, params=params)
        data = response.json()
        
        total_hits = data.get('totalHits', 0)
        total_pages = data.get('totalPages', 0)
        current_page = data.get('currentPage', 0)
        page_size = data.get('pageSize', 0)
        
        print(f"Total foods in USDA database: {total_hits:,}")
        print(f"Total pages: {total_pages:,}")
        print(f"Current page: {current_page}")
        print(f"Page size: {page_size}")
        
        return total_hits
        
    except Exception as e:
        print(f"An error occurred while getting total count: {e}")
        return None

def get_usda_nutrition(api_key, food_name):
    base_url = "https://api.nal.usda.gov/fdc/v1/foods/search"
    params = {
        'query': food_name,
        'api_key': api_key
    }
    try:
        response = requests.get(base_url, params=params)
        data = response.json()
        
        # Extract nutrition data for the first food item
        if 'foods' in data and data['foods']:
            first_food = data['foods'][0]  # Get the first food item
            # print("first food:", first_food) # Debug: Inspect the structure of the first food item
            print("food description:", first_food.get('description', 'No description'))

            # Get all nutrients dynamically
            nutrition_data = {
                'name': first_food.get('description', 'No description available'),
                'serving_size': 100,  # Hardcoded serving size
                'measurement_unit': 'g'  # Hardcoded measurement unit
            }
            
            # Extract all available nutrients
            for nutrient in first_food.get('foodNutrients', []):
                nutrient_name = nutrient.get('nutrientName', '')
                nutrient_value = nutrient.get('value', 'N/A')
                nutrient_unit = nutrient.get('unitName', '')
                
                # Create a clean key for the nutrient
                if nutrient_name:
                    # Add unit to the key if available
                    key = nutrient_name.lower()
                    if nutrient_unit:
                        key = f"{key} ({nutrient_unit})"
                    nutrition_data[key] = nutrient_value

            return nutrition_data
        else:
            print(f"No foods found for {food_name}")
            return None
    
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
            
def save_to_csv(file_path, data):
    try:
        if not data:
            print("No data to save")
            return
            
        # Get all unique column headers from all food items
        all_headers = set()
        for item in data:
            all_headers.update(item.keys())
        
        # Sort headers to have a consistent order (name first, then others alphabetically)
        headers = ['name', 'serving_size', 'measurement_unit']
        nutrient_headers = sorted([h for h in all_headers if h not in headers])
        headers.extend(nutrient_headers)
        
        with open(file_path, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(headers)
            for item in data:
                row = [item.get(header, 'N/A') for header in headers]
                writer.writerow(row)
        print(f"Data saved to {file_path}")
    except Exception as e:
        print(f"An error occurred while saving to CSV: {e}")

def fetch_nutrition_data(api_key, food_list):
    nutrition_data_list = []
    for food_name in food_list:
        print(f"Fetching data for {food_name}")
        nutrition_data = get_usda_nutrition(api_key=api_key, food_name=food_name)
        if nutrition_data:
            nutrition_data_list.append(nutrition_data)
        else:
            print(f"No nutrition data found for {food_name}")
    return nutrition_data_list

def read_food_names_from_csv(csv_file_path, limit=None):
    """Read food names from the filtered_food_names.csv file"""
    food_names = []
    try:
        with open(csv_file_path, mode='r', newline='', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for i, row in enumerate(reader):
                if limit and i >= limit:
                    break
                food_name = row.get('food_name', '').strip()
                if food_name:
                    food_names.append(food_name)
        
        print(f"Successfully read {len(food_names)} food names from {csv_file_path}")
        if limit:
            print(f"Limited to first {limit} items")
        return food_names
    
    except FileNotFoundError:
        print(f"Error: Could not find the file {csv_file_path}")
        return []
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        return []

def main():
    api_key = "7bf0q1sg6jba188aZpaYE9oeSvcifU9S1sCJQHgx"
    
    # Get total count of foods in USDA database
    print("=== USDA Database Statistics ===")
    total_count = get_total_food_count(api_key)
    print()
    
    # Read food names from CSV file instead of hardcoding
    csv_file_path = 'filtered_food_names.csv'
    # Limit to first 10 foods for testing (remove limit=10 to process all foods)
    food_names = read_food_names_from_csv(csv_file_path, limit=10)
    
    if not food_names:
        print("No food names found. Exiting.")
        return
    
    print(f"\nProcessing {len(food_names)} foods:")
    for i, name in enumerate(food_names, 1):
        print(f"{i}. {name}")
    print()

    nutrition_data_list = fetch_nutrition_data(api_key=api_key, food_list=food_names)

    for data in nutrition_data_list:
        print(f"\nNutrition data for {data['name']}:")
        print(f"Serving Size: {data['serving_size']}{data['measurement_unit']}")
        print("All nutrients:")
        for key, value in data.items():
            if key not in ['name', 'serving_size', 'measurement_unit']:
                print(f"  {key}: {value}")

    csv_file_path = 'food_nutrition_data.csv'
    save_to_csv(csv_file_path, nutrition_data_list)

if __name__ == "__main__":
    main()