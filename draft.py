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
        food = food.rstrip('s')  # Convert plurals to singular
        tokenized_result.append([int(quantity) if quantity.isdigit() else float(quantity), unit, food])
    
    return tokenized_result

# Test the function
test_text = "Today I ate 3 ounces of Chicken breast, 4 slices of wheat bread, 3 eggs, and 50 grams of spinach."
result = tokenize_by_quantity(test_text)
print("Tokenized text:", result)