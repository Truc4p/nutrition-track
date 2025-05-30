import csv
import requests
import statistics

def get_usda_nutrition(api_key, food_name):
    base_url = "https://api.nal.usda.gov/fdc/v1/foods/search"
    params = {
        'query': food_name,
        'api_key': api_key
    }
    try:
        response = requests.get(base_url, params=params)
        data = response.json()
        if 'foods' in data and data['foods']:
            foods_for_analysis = data['foods'][:5]
            # print("foods_for_analysis:", foods_for_analysis)
            # print("foods:", data['foods'])
            print("food descriptions:", [food.get('description', 'No description') for food in data['foods'][:5]])

            fats_list = []
            saturated_fats_list = []
            carbohydrates_list = []
            protein_list = []
            fiber_list = []
            cholesterol_list = []
            serving_size_list = []
            measurement_unit_list = []

            for food in foods_for_analysis:
                nutrients = food['foodNutrients']
                
                fats_list.append(next((nutrient['value'] for nutrient in nutrients if nutrient['nutrientName'] == 'Total lipid (fat)'), 0))
                saturated_fats_list.append(next((nutrient['value'] for nutrient in nutrients if nutrient['nutrientName'] == 'Fatty acids, total saturated'), 0))
                carbohydrates_list.append(next((nutrient['value'] for nutrient in nutrients if nutrient['nutrientName'] == 'Carbohydrate, by difference'), 0))
                protein_list.append(next((nutrient['value'] for nutrient in nutrients if nutrient['nutrientName'] == 'Protein'), 0))
                fiber_list.append(next((nutrient['value'] for nutrient in nutrients if nutrient['nutrientName'] == 'Fiber, total dietary'), 0))
                cholesterol_list.append(next((nutrient['value'] for nutrient in nutrients if nutrient['nutrientName'] == 'Cholesterol'), 0))
                
                serving_size_list.append(next((nutrient['value'] for nutrient in nutrients if nutrient['nutrientName'] == 'Serving Size'), 100))
                measurement_unit_list.append(next((nutrient['unitName'] for nutrient in nutrients if nutrient['nutrientName'] == 'Serving Size'), 'g'))

            print("fats_list:", fats_list)
            print("saturated_fats_list:", saturated_fats_list)
            print("carbohydrates_list:", carbohydrates_list)
            print("protein_list:", protein_list)
            print("fiber_list:", fiber_list)
            print("cholesterol_list:", cholesterol_list)
            print("serving_size_list:", serving_size_list)
            print("measurement_unit_list:", measurement_unit_list)
            
            median_fats = statistics.median(fats_list)
            median_saturated_fats = statistics.median(saturated_fats_list)
            median_carbohydrates = statistics.median(carbohydrates_list)
            median_protein = statistics.median(protein_list)
            median_fiber = statistics.median(fiber_list)
            median_cholesterol = statistics.median(cholesterol_list)
            median_serving_size = statistics.median(serving_size_list)
            median_measurement_unit = statistics.median(measurement_unit_list)
            
            return {
                'name': food_name,
                'total_fat': median_fats,
                'saturated_fat': median_saturated_fats,
                'carbohydrates': median_carbohydrates,
                'protein': median_protein,
                'fiber': median_fiber,
                'cholesterol': median_cholesterol,
                'serving_size': median_serving_size,
                'measurement_unit': median_measurement_unit
            }
        else:
            print(f"No foods found for {food_name}")
    
    except Exception as e:
        print(f"An error occurred: {e}")



def get_usda_nutrition2(api_key, food_name):
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
            print("first food:", first_food) # Debug: Inspect the structure of the first food item
            print("food description:", first_food.get('description', 'No description'))

            nutrients = {n.get('nutrientName', '').lower(): n.get('value', 'N/A') for n in first_food.get('foodNutrients', [])}

            # Hardcode serving size and measurement unit
            serving_size = 100
            measurement_unit = 'g'

            return {
                'name': first_food.get('description', 'No description available'),
                'total_fat': nutrients.get('total lipid (fat)', 'N/A'),
                'saturated_fat': nutrients.get('fatty acids, total saturated', 'N/A'),
                'carbohydrates': nutrients.get('carbohydrate, by difference', 'N/A'),
                'protein': nutrients.get('protein', 'N/A'),
                'fiber': nutrients.get('fiber, total dietary', 'N/A'),
                'cholesterol': nutrients.get('cholesterol', 'N/A'),
                'serving_size': serving_size,
                'measurement_unit': measurement_unit
            }
        else:
            print(f"No foods found for {food_name}")
            return None
    
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
            
def save_to_csv(file_path, data):
    try:
        with open(file_path, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['Food Name', 'Total Fat', 'Saturated Fat', 'Carbohydrates', 'Protein', 'Fiber', 'Cholesterol', 'Serving Size', 'Measurement Unit'])
            for item in data:
                writer.writerow([item['name'], item['total_fat'], item['saturated_fat'], item['carbohydrates'], item['protein'], item['fiber'], item['cholesterol'], item['serving_size'], item['measurement_unit']])
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

def main():
    api_key = "7bf0q1sg6jba188aZpaYE9oeSvcifU9S1sCJQHgx"
    
    food_names = [
        'Chicken Breast',
        'Wheat Bread',
        'Egg',
        'Spinach',
    ]

    nutrition_data_list = fetch_nutrition_data(api_key=api_key, food_list=food_names)

    for data in nutrition_data_list:
        print(f"Nutrition data for {data['name']}:\n"
              f"Fats: {data['total_fat']}g, Saturated Fats: {data['saturated_fat']}g\n"
              f"Carbohydrates: {data['carbohydrates']}g, Protein: {data['protein']}g\n"
              f"Fiber: {data['fiber']}g, Cholesterol: {data['cholesterol']}mg\n"
              f"Serving Size: {data['serving_size']}g, Measurement Unit: {data['measurement_unit']}\n")

    csv_file_path = 'food_nutrition_data.csv'
    save_to_csv(csv_file_path, nutrition_data_list)

if __name__ == "__main__":
    main()