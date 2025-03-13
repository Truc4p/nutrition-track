from django.db import models

# Create your models here.

class IngredientFact(models.Model):
    name = models.CharField(max_length=255)
    total_fat = models.DecimalField(max_digits=5, decimal_places=2)
    saturated_fat = models.DecimalField(max_digits=5, decimal_places=2)
    carbohydrates = models.DecimalField(max_digits=5, decimal_places=2)
    protein = models.DecimalField(max_digits=5, decimal_places=2)
    fiber = models.DecimalField(max_digits=5, decimal_places=2)
    cholesterol = models.DecimalField(max_digits=5, decimal_places=2)
    serving_size = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    measurement_unit = models.CharField(max_length=10, default='g')

    def __str__(self):
        return self.name
