from django.db import models

# Create your models here.

class IngredientFact(models.Model):
    name = models.CharField(max_length=255, unique=True)
    serving_size = models.DecimalField(max_digits=8, decimal_places=2, default=100)
    measurement_unit = models.CharField(max_length=10, default='g')
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    # Keep the original fields for backward compatibility
    total_fat = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    saturated_fat = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    carbohydrates = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    protein = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    fiber = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    cholesterol = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class NutrientType(models.Model):
    """Defines types of nutrients (e.g., 'protein', 'vitamin c', etc.)"""
    name = models.CharField(max_length=255, unique=True)
    unit = models.CharField(max_length=20, default='g')  # g, mg, ug, kcal, etc.
    category = models.CharField(max_length=100, blank=True)  # macronutrient, vitamin, mineral, etc.
    
    def __str__(self):
        return f"{self.name} ({self.unit})"

    class Meta:
        ordering = ['category', 'name']


class NutritionFact(models.Model):
    """Stores individual nutrition facts for each ingredient"""
    ingredient = models.ForeignKey(IngredientFact, on_delete=models.CASCADE, related_name='nutrition_facts')
    nutrient_type = models.ForeignKey(NutrientType, on_delete=models.CASCADE)
    value = models.DecimalField(max_digits=10, decimal_places=4)
    
    class Meta:
        unique_together = ['ingredient', 'nutrient_type']
    
    def __str__(self):
        return f"{self.ingredient.name} - {self.nutrient_type.name}: {self.value} {self.nutrient_type.unit}"
