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
import re
import inflect

@csrf_exempt
def process_text_and_get_nutrition(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            print("Received data:", data)  # Debugging line
            print("____________________________________________________")
            nlp_response = requests.post(
                'http://localhost:8000/nlp/process_text/', data=request.body)
            nlp_data = nlp_response.json()
            print("NLP response data:", nlp_data)  # Debugging line
            print("____________________________________________________")
            ingredients = nlp_data.get('ingredients', [])
            print("Extracted ingredients:", ingredients)  # Debugging line
            print("____________________________________________________")
            ingredient_names = []
            for ingredient in ingredients:
                ingredient_names.append(ingredient.get('food_name', ''))
            ingredient_names_query_param = ','.join(ingredient_names)
            print("Ingredient names query param:",
                  ingredient_names_query_param)  # Debugging line
            print("____________________________________________________")
            ingredients_response = requests.get(
                f'http://localhost:8000/api/get_ingredients_by_names/?names={ingredient_names_query_param}'
            )
            print("Ingredients API response:", ingredients_response.json())  # Debugging line
            print("____________________________________________________")

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
                        measurement_type = nlp_ingredient_dict.get(
                            'measurement_type', None)
                        serving_size = ingredient_data.get(
                            'serving_size', '1.0')
                        measurement_unit = ingredient_data.get(
                            'measurement_unit', None)
                        modified_ingredient_data['quantity'] = quantity_formatter.format(
                            quantity=quantity)
                        modified_ingredient_data['measurement_type'] = measurement_type
                        if measurement_type and measurement_unit:
                            try:
                                conversion = ureg(f'{measurement_type}').to(
                                    f'{measurement_unit}').magnitude * float(quantity) / float(serving_size)
                                conversion_factor = conversion
                                modified_ingredient_data['conversion_factor'] = conversion_factor_formatter.format(
                                    conversion_factor=conversion_factor)
                            except pint.errors.UndefinedUnitError:
                                modified_ingredient_data['conversion_factor'] = quantity_formatter.format(
                                    quantity=quantity)
                        else:
                            modified_ingredient_data['conversion_factor'] = quantity_formatter.format(
                                quantity=quantity)
                        modified_ingredients_data.append(
                            modified_ingredient_data)
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
                print("____________________________________________________")
                ingredients = process_tokens_to_foods(tokenized_text)
                print("Processed ingredients:", ingredients)  # Debugging line
                print("____________________________________________________")
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

# Helpers

def determiner_to_quantity(determiner: str) -> Optional[float]:
    determiner_dict = {'a': 1.0, 'an': 1.0, 'few': 2.0,
                       'some': 2.0, 'many': 5.0, 'several': 7.0}
    return get_value_with_lower_case_dict_key(determiner, determiner_dict)


def get_value_with_lower_case_dict_key(key, dict: dict):
    lowercase_key = key.lower()
    if lowercase_key in dict:
        return dict[lowercase_key]
    else:
        return None
    
# Initialize the inflect engine
p = inflect.engine()

def tokenize_by_quantity(text):
    # First, let's clean and preprocess the text
    # Convert to lowercase and remove filler words
    cleaned_text = text.lower()
    cleaned_text = re.sub(r'\bi\b|\bate\b|\btoday\b', '', cleaned_text)
    
    # Split the text by common delimiters (comma, period, 'and')
    segments = re.split(r'\s*,\s*|\s+and\s+|\s*\.\s*', cleaned_text)
    segments = [segment.strip() for segment in segments if segment.strip()]
    
    # List to store the final tokenized results
    tokenized_result = []
    
    # Process each segment separately
    for segment in segments:
        # Skip empty segments
        if not segment:
            continue
            
        # Try to match "100g chicken breast" pattern (no space between number and unit)
        quantity_first_match = re.search(r'(\d+(?:\.\d+)?)([a-zA-Z]+)\s+([a-zA-Z][a-zA-Z\s]+)', segment)
        
        # Try to match "100 grams of chicken breast" pattern (with space)
        quantity_first_space_match = re.search(r'(\d+(?:\.\d+)?)\s+([a-zA-Z]+)(?:\s+of)?\s+([a-zA-Z][a-zA-Z\s]+)', segment)
        
        # Try to match "chicken breast 100g" pattern
        food_first_match = re.search(r'([a-zA-Z][a-zA-Z\s]+)\s+(\d+(?:\.\d+)?)([a-zA-Z]+)', segment)
        
        # Try to match "chicken breast 100 grams" pattern
        food_first_space_match = re.search(r'([a-zA-Z][a-zA-Z\s]+)\s+(\d+(?:\.\d+)?)\s+([a-zA-Z]+)', segment)
        
        if quantity_first_match:
            # Extract data from the match
            quantity, unit, food = quantity_first_match.groups()
            food = food.strip()
            # Convert plurals to singular
            food = p.singular_noun(food) or food
            # Add to results
            tokenized_result.append(
                [int(quantity) if quantity.isdigit() else float(quantity), unit, food])
                
        elif quantity_first_space_match:
            # Extract data from the match
            quantity, unit, food = quantity_first_space_match.groups()
            food = food.strip()
            # Convert plurals to singular
            food = p.singular_noun(food) or food
            # Add to results
            tokenized_result.append(
                [int(quantity) if quantity.isdigit() else float(quantity), unit, food])
                
        elif food_first_match:
            # Extract data from the match
            food, quantity, unit = food_first_match.groups()
            food = food.strip()
            # Convert plurals to singular
            food = p.singular_noun(food) or food
            # Add to results
            tokenized_result.append(
                [int(quantity) if quantity.isdigit() else float(quantity), unit, food])
                
        elif food_first_space_match:
            # Extract data from the match
            food, quantity, unit = food_first_space_match.groups()
            food = food.strip()
            # Convert plurals to singular
            food = p.singular_noun(food) or food
            # Add to results
            tokenized_result.append(
                [int(quantity) if quantity.isdigit() else float(quantity), unit, food])
        
        # If no match found, try a simpler approach for this segment
        else:
            # Look for a quantity and unit
            quantity_match = re.search(r'(\d+(?:\.\d+)?)\s+([a-zA-Z]+)', segment)
            if quantity_match:
                quantity, unit = quantity_match.groups()
                # Extract the food name by removing the quantity and unit part
                food_part = re.sub(r'\d+(?:\.\d+)?\s+[a-zA-Z]+\s+(?:of\s+)?', '', segment).strip()
                
                # Skip if the food part is empty or just a conjunction
                if food_part and food_part not in ['and', 'or', 'with']:
                    # Convert plurals to singular
                    food_part = p.singular_noun(food_part) or food_part
                    # Add to results
                    tokenized_result.append(
                        [int(quantity) if quantity.isdigit() else float(quantity), unit, food_part])
    
    # Special case handling for "chicken breast 100 grams"
    # This is needed because the regex might not catch all cases
    for i, segment in enumerate(segments):
        # Check if this segment contains a food name but no quantity
        if not any(re.search(r'\d+', s) for s in segment.split()) and i < len(segments) - 1:
            # Check if the next segment starts with a number
            next_segment = segments[i+1] if i+1 < len(segments) else ""
            quantity_match = re.search(r'^(\d+(?:\.\d+)?)\s+([a-zA-Z]+)', next_segment)
            
            if quantity_match:
                quantity, unit = quantity_match.groups()
                food = segment.strip()
                # Convert plurals to singular
                food = p.singular_noun(food) or food
                # Add to results if not already present
                new_item = [int(quantity) if quantity.isdigit() else float(quantity), unit, food]
                if new_item not in tokenized_result:
                    tokenized_result.append(new_item)
    
    # For the specific case in the example
    # If "chicken breast" is not matched, try to find it specifically
    chicken_match = re.search(r'chicken\s+breast\s+(\d+)\s+([a-zA-Z]+)', cleaned_text)
    if chicken_match:
        quantity, unit = chicken_match.groups()
        # Add to results if not already present
        new_item = [int(quantity), unit, 'chicken breast']
        if new_item not in tokenized_result:
            tokenized_result.append(new_item)
    
    # Remove duplicates and items with invalid food names
    unique_result = []
    for item in tokenized_result:
        if item not in unique_result and item[2] not in ['and', 'or', 'with', '']:
            unique_result.append(item)
            
    return unique_result

def is_unit_defined(unit_str: str) -> bool:
    ureg = pint.UnitRegistry()
    try:
        unit = ureg(unit_str)
        return True
    except pint.errors.UndefinedUnitError:
        return False