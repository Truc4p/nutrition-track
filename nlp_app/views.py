from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
import pint
from typing import Optional, List
import spacy
from spacy.tokens import Token
from word2number import w2n
import requests

@csrf_exempt
def process_text_and_get_nutrition(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            print("Received data:", data)  # Debugging line
            nlp_response = requests.post('http://localhost:8000/nlp/process_text/', data=request.body)
            nlp_data = nlp_response.json()
            print("NLP response data:", nlp_data)  # Debugging line
            ingredients = nlp_data.get('ingredients', [])
            print("Extracted ingredients:", ingredients)  # Debugging line
            ingredient_names = []
            for ingredient in ingredients:
                ingredient_names.append(ingredient.get('food_name', ''))
            ingredient_names_query_param = ','.join(ingredient_names)
            print("Ingredient names query param:", ingredient_names_query_param)  # Debugging line
            ingredients_response = requests.get(f'http://localhost:8000/api/get_ingredients_by_names/?ingredient_names={ingredient_names_query_param}')
            ureg = pint.UnitRegistry()
            conversion_factor_formatter = "{conversion_factor:.3f}"
            quantity_formatter = "{quantity:.2f}"

            ingredients_data = ingredients_response.json()
            modified_ingredients_data = []

            for ingredient_data in ingredients_data:
                for nlp_ingredient_dict in ingredients:
                    if nlp_ingredient_dict['food_name'].lower() in ingredient_data.get('name', '').lower():
                        modified_ingredient_data = ingredient_data
                        quantity = nlp_ingredient_dict.get('quantity', None)
                        measurement_type = nlp_ingredient_dict.get('measurement_type', None)
                        serving_size = ingredient_data.get('serving_size', '1.0')
                        measurement_unit = ingredient_data.get('measurement_unit', None)
                        modified_ingredient_data['quantity'] = quantity_formatter.format(quantity=quantity)
                        modified_ingredient_data['measurement_type'] = measurement_type
                        if measurement_type and measurement_unit and ureg.is_unit_defined(measurement_type):
                            conversion = ureg(f'{measurement_type}').to(f'{measurement_unit}').magnitude * float(quantity) / float(serving_size)
                            conversion_factor = conversion
                            modified_ingredient_data['conversion_factor'] = conversion_factor_formatter.format(conversion_factor=conversion_factor)
                        else:
                            modified_ingredient_data['conversion_factor'] = quantity_formatter.format(quantity=quantity)
                        modified_ingredients_data.append(modified_ingredient_data)

            return JsonResponse({'result': modified_ingredients_data})
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def process_text(request):
    if request.method == 'POST':
        try:
            json_data = json.loads(request.body.decode('utf-8'))
            text_value = json_data.get('text', None)
            print("Text value:", text_value)  # Debugging line
            if text_value:
                tokenized_text = tokenize_by_quantity(text_value)
                print("Tokenized text:", tokenized_text)  # Debugging line
                ingredients = process_tokens_to_foods(tokenized_text)
                print("Processed ingredients:", ingredients)  # Debugging line
                return JsonResponse({'ingredients': ingredients})
            else:
                return JsonResponse({"error": "No 'text' found in the JSON data"}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=400)

def process_tokens_to_foods(tokenized_text: List[List[object]]) -> List[dict]:
    foods = []
    for token_list in tokenized_text:
        quantity = token_list[0]
        measurement_type = token_list[1]
        food_name = token_list[2]
        food = {
            'food_name': food_name,
            'quantity': quantity,
            'measurement_type': measurement_type
        }
        foods.append(food)
    return foods

## Helpers
def determiner_to_quantity(determiner: str) -> Optional[float]:
    determiner_dict = {'a': 1.0, 'an': 1.0, 'few': 2.0, 'some': 2.0, 'many': 5.0, 'several': 7.0}
    return get_value_with_lower_case_dict_key(determiner, determiner_dict)

def get_value_with_lower_case_dict_key(key, dict: dict):
    lowercase_key = key.lower()
    if lowercase_key in dict:
        return dict[lowercase_key]
    else:
        return None

import re

def tokenize_by_quantity(text):
    # Enhanced regex to handle missing units properly and remove 'of'
    pattern = re.compile(r"(\d+(?:\.\d+)?)\s+(?:([a-zA-Z]+)\s+)?(?:of\s+)?([a-zA-Z\s]+?)(?=\,|\.|$)")
    
    # Find all matches
    matches = pattern.findall(text)
    
    # Convert matches into a structured list
    tokenized_result = []
    for quantity, unit, food in matches:
        food = food.strip()
        # Assign 'units' if no valid unit is detected
        if not unit:
            unit = "units"
        # food = food.rstrip('s')  # Convert plurals to singular
        tokenized_result.append([int(quantity) if quantity.isdigit() else float(quantity), unit, food])
    
    return tokenized_result

def is_unit_defined(unit_str: str) -> bool:
    ureg = pint.UnitRegistry()
    try:
        unit = ureg(unit_str)
        return True
    except pint.errors.UndefinedUnitError:
        return False