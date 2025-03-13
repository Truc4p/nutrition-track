import csv
from django.core.management.base import BaseCommand
from food_dietary_app.models import IngredientFact

class Command(BaseCommand):
    help = 'Import nutrition facts from a CSV file'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='The path to the CSV file')

    def handle(self, *args, **kwargs):
        csv_file = kwargs['csv_file']
        with open(csv_file, mode='r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                ingredient, created = IngredientFact.objects.update_or_create(
                    name=row['Food Name'],
                    defaults={
                        'total_fat': row['Total Fat'],
                        'saturated_fat': row['Saturated Fat'],
                        'carbohydrates': row['Carbohydrates'],
                        'protein': row['Protein'],
                        'fiber': row['Fiber'],
                        'cholesterol': row['Cholesterol'],
                        'serving_size': row.get('Serving Size', None),
                        'measurement_unit': row.get('Measurement Unit', 'g')
                    }
                )
        self.stdout.write(self.style.SUCCESS('Successfully imported nutrition facts'))