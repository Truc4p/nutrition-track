# def get_usda_nutrition(api_key, food_name):
#     base_url = "https://api.nal.usda.gov/fdc/v1/foods/search"
#     params = {
#         'query': food_name,
#         'api_key': api_key
#     }
#     try:
#         response = requests.get(base_url, params=params)
#         data = response.json()
#         if 'foods' in data and data['foods']:
#             foods_for_analysis = data['foods'][:5]
#             # print("foods_for_analysis:", foods_for_analysis)
#             # print("foods:", data['foods'])
#             print("food descriptions:", [food.get('description', 'No description') for food in data['foods'][:5]])

#             fats_list = []
#             saturated_fats_list = []
#             carbohydrates_list = []
#             protein_list = []
#             fiber_list = []
#             cholesterol_list = []
#             serving_size_list = []
#             measurement_unit_list = []

#             for food in foods_for_analysis:
#                 nutrients = food['foodNutrients']
                
#                 fats_list.append(next((nutrient['value'] for nutrient in nutrients if nutrient['nutrientName'] == 'Total lipid (fat)'), 0))
#                 saturated_fats_list.append(next((nutrient['value'] for nutrient in nutrients if nutrient['nutrientName'] == 'Fatty acids, total saturated'), 0))
#                 carbohydrates_list.append(next((nutrient['value'] for nutrient in nutrients if nutrient['nutrientName'] == 'Carbohydrate, by difference'), 0))
#                 protein_list.append(next((nutrient['value'] for nutrient in nutrients if nutrient['nutrientName'] == 'Protein'), 0))
#                 fiber_list.append(next((nutrient['value'] for nutrient in nutrients if nutrient['nutrientName'] == 'Fiber, total dietary'), 0))
#                 cholesterol_list.append(next((nutrient['value'] for nutrient in nutrients if nutrient['nutrientName'] == 'Cholesterol'), 0))
                
#                 serving_size_list.append(next((nutrient['value'] for nutrient in nutrients if nutrient['nutrientName'] == 'Serving Size'), 100))
#                 measurement_unit_list.append(next((nutrient['unitName'] for nutrient in nutrients if nutrient['nutrientName'] == 'Serving Size'), 'g'))

#             print("fats_list:", fats_list)
#             print("saturated_fats_list:", saturated_fats_list)
#             print("carbohydrates_list:", carbohydrates_list)
#             print("protein_list:", protein_list)
#             print("fiber_list:", fiber_list)
#             print("cholesterol_list:", cholesterol_list)
#             print("serving_size_list:", serving_size_list)
#             print("measurement_unit_list:", measurement_unit_list)
            
#             median_fats = statistics.median(fats_list)
#             median_saturated_fats = statistics.median(saturated_fats_list)
#             median_carbohydrates = statistics.median(carbohydrates_list)
#             median_protein = statistics.median(protein_list)
#             median_fiber = statistics.median(fiber_list)
#             median_cholesterol = statistics.median(cholesterol_list)
#             median_serving_size = statistics.median(serving_size_list)
#             median_measurement_unit = statistics.median(measurement_unit_list)
            
#             return {
#                 'name': food_name,
#                 'total_fat': median_fats,
#                 'saturated_fat': median_saturated_fats,
#                 'carbohydrates': median_carbohydrates,
#                 'protein': median_protein,
#                 'fiber': median_fiber,
#                 'cholesterol': median_cholesterol,
#                 'serving_size': median_serving_size,
#                 'measurement_unit': median_measurement_unit
#             }
#         else:
#             print(f"No foods found for {food_name}")
    
#     except Exception as e:
#         print(f"An error occurred: {e}")