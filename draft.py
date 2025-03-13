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
        print(f"API response status code for {food_name}: {response.status_code}")
        data = response.json()
        print(f"API response data for {food_name}: {data}")
        if 'foods' in data and data['foods']:
            foods_for_analysis = data['foods'][:5]
            fats_list = []
            saturated_fats_list = []
            carbohydrates_list = []
            protein_list = []
            fiber_list = []
            cholesterol_list = []
            for food in foods_for_analysis:
                nutrients = food['foodNutrients']
                
                fats_list.append(next((nutrient['value'] for nutrient in nutrients if nutrient['nutrientName'] == 'Total lipid (fat)'), 0))
                saturated_fats_list.append(next((nutrient['value'] for nutrient in nutrients if nutrient['nutrientName'] == 'Fatty acids, total saturated'), 0))
                carbohydrates_list.append(next((nutrient['value'] for nutrient in nutrients if nutrient['nutrientName'] == 'Carbohydrate, by difference'), 0))
                protein_list.append(next((nutrient['value'] for nutrient in nutrients if nutrient['nutrientName'] == 'Protein'), 0))
                fiber_list.append(next((nutrient['value'] for nutrient in nutrients if nutrient['nutrientName'] == 'Fiber, total dietary'), 0))
                cholesterol_list.append(next((nutrient['value'] for nutrient in nutrients if nutrient['nutrientName'] == 'Cholesterol'), 0))
            
            median_fats = statistics.median(fats_list)
            median_saturated_fats = statistics.median(saturated_fats_list)
            median_carbohydrates = statistics.median(carbohydrates_list)
            median_protein = statistics.median(protein_list)
            median_fiber = statistics.median(fiber_list)
            median_cholesterol = statistics.median(cholesterol_list)
            
            return {
                'name': food_name,
                'total_fat': median_fats,
                'saturated_fat': median_saturated_fats,
                'carbohydrates': median_carbohydrates,
                'protein': median_protein,
                'fiber': median_fiber,
                'cholesterol': median_cholesterol
            }
        else:
            print(f"No foods found for {food_name}")
    
    except Exception as e:
        print(f"An error occurred: {e}")

def save_to_csv(file_path, data):
    try:
        with open(file_path, mode='w', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(['Food Name', 'Total Fat', 'Saturated Fat', 'Carbohydrates', 'Protein', 'Fiber', 'Cholesterol'])
            writer.writerows(data)
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
        'Tomatoes',
    ]

    nutrition_data_list = fetch_nutrition_data(api_key=api_key, food_list=food_names)

    for data in nutrition_data_list:
        print(f"Nutrition data for {data['name']}:\n"
              f"Fats: {data['total_fat']}g, Saturated Fats: {data['saturated_fat']}g\n"
              f"Carbohydrates: {data['carbohydrates']}g, Protein: {data['protein']}g\n"
              f"Fiber: {data['fiber']}g, Cholesterol: {data['cholesterol']}mg\n")

    csv_file_path = 'food_nutrition_data.csv'
    save_to_csv(csv_file_path, nutrition_data_list)

if __name__ == "__main__":
    main()

        # "apple",
        # "banana",
        # "orange",
        # "mango",
        # "strawberry",
        # "blueberry",
        # "blackberry",
        # "raspberry",
        # "kiwi",
        # "grape",
        # "watermelon",
        # "pineapple",
        # "peach",
        # "pear",
        # "plum",
        # "apricot",
        # "cherry",
        # "lemon",


        # 'Chicken Breast',
        # 'Broccoli',
        # 'Banana',
        # 'Extra Lean Ground Beef',
        # 'Lean Ground Beef',
        # 'Carrots',
        # 'Apple',
        # 'Pineapple'
    