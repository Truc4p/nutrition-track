import csv
import re
from django.core.management.base import BaseCommand
from food_dietary_app.models import IngredientFact, NutrientType, NutritionFact

class Command(BaseCommand):
    help = 'Import nutrition facts from a CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='The path to the CSV file')

    def handle(self, *args, **kwargs):
        csv_file = kwargs['csv_file']
        
        # Helper function to safely convert values to float, handling 'N/A'
        def safe_float(value, default=0.0):
            try:
                if value == 'N/A' or value == '':
                    return default
                return float(value)
            except (ValueError, TypeError):
                return default

        # Helper function to parse nutrient name and unit
        def parse_nutrient_name_unit(column_name):
            # Extract nutrient name and unit from column names like "protein (G)"
            match = re.match(r'^(.+?)\s*\(([^)]+)\)$', column_name.strip())
            if match:
                name = match.group(1).strip()
                unit = match.group(2).strip()
                return name, unit
            return column_name.strip(), 'g'  # default unit

        # Helper function to categorize nutrients
        def categorize_nutrient(name):
            name_lower = name.lower()
            if any(term in name_lower for term in ['protein', 'carbohydrate', 'fat', 'lipid', 'fiber', 'energy', 'calories']):
                return 'macronutrient'
            elif any(term in name_lower for term in ['vitamin', 'ascorbic', 'folate']):
                return 'vitamin'
            elif any(term in name_lower for term in ['calcium', 'iron', 'potassium', 'sodium', 'mg', 'zinc']):
                return 'mineral'
            elif any(term in name_lower for term in ['fatty acids', 'cholesterol', 'saturated', 'monounsaturated', 'polyunsaturated']):
                return 'lipid'
            else:
                return 'other'

        with open(csv_file, mode='r') as file:
            reader = csv.DictReader(file)
            
            for row in reader:
                # Create or update the ingredient
                ingredient, created = IngredientFact.objects.update_or_create(
                    name=row['name'],
                    defaults={
                        'total_fat': safe_float(row.get('total lipid (fat) (G)', 0)),
                        'saturated_fat': safe_float(row.get('fatty acids, total saturated (G)', 0)),
                        'carbohydrates': safe_float(row.get('carbohydrate, by difference (G)', 0)),
                        'protein': safe_float(row.get('protein (G)', 0)),
                        'fiber': safe_float(row.get('fiber, total dietary (G)', 0)),
                        'cholesterol': safe_float(row.get('cholesterol (MG)', 0)),
                        'serving_size': safe_float(row.get('serving_size', 100)),
                        'measurement_unit': row.get('measurement_unit', 'g')
                    }
                )
                
                if created:
                    self.stdout.write(f"Created: {ingredient.name}")
                else:
                    self.stdout.write(f"Updated: {ingredient.name}")
                
                # Process all nutrition data (skip basic ingredient info columns)
                skip_columns = {'name', 'serving_size', 'measurement_unit'}
                
                for column_name, value in row.items():
                    if column_name in skip_columns:
                        continue
                        
                    # Skip if no value or N/A
                    if value == 'N/A' or value == '' or value is None:
                        continue
                    
                    try:
                        numeric_value = float(value)
                    except (ValueError, TypeError):
                        continue
                    
                    # Parse nutrient name and unit
                    nutrient_name, unit = parse_nutrient_name_unit(column_name)
                    category = categorize_nutrient(nutrient_name)
                    
                    # Create or get the nutrient type
                    nutrient_type, nt_created = NutrientType.objects.get_or_create(
                        name=nutrient_name,
                        defaults={
                            'unit': unit,
                            'category': category
                        }
                    )
                    
                    # Create or update the nutrition fact
                    nutrition_fact, nf_created = NutritionFact.objects.update_or_create(
                        ingredient=ingredient,
                        nutrient_type=nutrient_type,
                        defaults={'value': numeric_value}
                    )
                    
                    if nt_created:
                        self.stdout.write(f"  Created nutrient type: {nutrient_type}")
                    if nf_created:
                        self.stdout.write(f"  Added nutrition fact: {nutrition_fact}")
                    else:
                        self.stdout.write(f"  Updated nutrition fact: {nutrition_fact}")
                        
        self.stdout.write(self.style.SUCCESS('Successfully imported nutrition facts with detailed nutrient data'))