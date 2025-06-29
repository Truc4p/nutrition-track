import csv
import requests
import time

def get_total_food_count_filtered(api_key, data_types):
    """Get the total number of foods available in the USDA database for specified data types"""
    base_url = "https://api.nal.usda.gov/fdc/v1/foods/search"
    params = {
        'query': '',  # Empty query to get all foods
        'api_key': api_key,
        'pageSize': 1,  # We only need 1 result to get the total count
        'pageNumber': 1,
        'dataType': data_types
    }
    try:
        response = requests.get(base_url, params=params)
        data = response.json()
        
        total_hits = data.get('totalHits', 0)
        print(f"Total foods in USDA database for {', '.join(data_types)}: {total_hits:,}")
        return total_hits
        
    except Exception as e:
        print(f"An error occurred while getting total count: {e}")
        return None

def get_filtered_food_names(api_key, data_types, max_per_page=200):
    """Get food names from specific USDA data types"""
    base_url = "https://api.nal.usda.gov/fdc/v1/foods/search"
    all_food_names = []
    page_number = 1
    
    # First, get the total count
    print("Getting total count for filtered data types...")
    total_count = get_total_food_count_filtered(api_key, data_types)
    if not total_count:
        return []
    
    print(f"Starting to fetch all {total_count:,} food names from {', '.join(data_types)}...")
    print("This may take a while due to API rate limits...")
    
    while True:
        params = {
            'query': '',  # Empty query to get all foods
            'api_key': api_key,
            'pageSize': max_per_page,
            'pageNumber': page_number,
            'dataType': data_types
        }
        
        try:
            print(f"Fetching page {page_number}... ({len(all_food_names):,} names collected so far)")
            response = requests.get(base_url, params=params)
            
            if response.status_code != 200:
                print(f"Error: API returned status code {response.status_code}")
                if response.status_code == 429:
                    print("Rate limit hit. Waiting 5 seconds...")
                    time.sleep(5)
                    continue
                break
                
            data = response.json()
            foods = data.get('foods', [])
            
            if not foods:
                print("No more foods found. Finished!")
                break
            
            # Extract food names and data types
            for food in foods:
                food_name = food.get('description', 'Unknown')
                data_type = food.get('dataType', 'Unknown')
                all_food_names.append({
                    'food_name': food_name,
                    'data_type': data_type
                })
            
            # Check if we've got all foods
            if len(all_food_names) >= total_count:
                print(f"Collected all {len(all_food_names):,} food names!")
                break
                
            page_number += 1
            
            # Add a small delay to be respectful to the API
            time.sleep(0.1)  # 100ms delay between requests
            
        except Exception as e:
            print(f"An error occurred on page {page_number}: {e}")
            print("Waiting 2 seconds before retrying...")
            time.sleep(2)
            continue
    
    return all_food_names

def save_filtered_food_names_to_csv(file_path, food_data):
    """Save list of food names with data types to CSV file"""
    try:
        with open(file_path, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(['food_name', 'data_type'])  # Header
            for item in food_data:
                writer.writerow([item['food_name'], item['data_type']])
        print(f"Successfully saved {len(food_data):,} food names to {file_path}")
    except Exception as e:
        print(f"An error occurred while saving food names to CSV: {e}")

def main():
    api_key = "7bf0q1sg6jba188aZpaYE9oeSvcifU9S1sCJQHgx"
    
    # Specify only the data types we want (excluding 'Branded')
    data_types = ['Foundation', 'SR Legacy', 'Survey (FNDDS)']
    
    print("=== USDA Food Names Fetcher (Filtered) ===")
    print(f"Fetching food names from: {', '.join(data_types)}")
    print("Excluding: Branded foods")
    print()
    
    all_food_names = get_filtered_food_names(api_key, data_types)
    
    if all_food_names:
        save_filtered_food_names_to_csv('filtered_food_names.csv', all_food_names)
        print(f"\nCompleted! Found {len(all_food_names):,} food names from filtered sources.")
        print("Food names saved to 'filtered_food_names.csv'")
        
        # Show counts by data type
        data_type_counts = {}
        for item in all_food_names:
            data_type = item['data_type']
            data_type_counts[data_type] = data_type_counts.get(data_type, 0) + 1
        
        print("\nBreakdown by data type:")
        for data_type, count in data_type_counts.items():
            print(f"  {data_type}: {count:,} foods")
        
        # Show first 10 food names as sample
        print("\nFirst 10 food names:")
        for i, item in enumerate(all_food_names[:10], 1):
            print(f"{i:2d}. {item['food_name']} ({item['data_type']})")
            
        if len(all_food_names) > 10:
            print("...")
            print(f"    (and {len(all_food_names) - 10:,} more)")
    else:
        print("Failed to fetch food names.")

if __name__ == "__main__":
    main() 