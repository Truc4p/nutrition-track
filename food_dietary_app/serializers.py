from rest_framework import serializers
from .models import IngredientFact, NutrientType, NutritionFact

class NutrientTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = NutrientType
        fields = ['name', 'unit', 'category']

class NutritionFactSerializer(serializers.ModelSerializer):
    nutrient_type = NutrientTypeSerializer(read_only=True)
    
    class Meta:
        model = NutritionFact
        fields = ['nutrient_type', 'value']

class IngredientSerializer(serializers.ModelSerializer):
    # Include all comprehensive nutrition data
    nutrition_facts = NutritionFactSerializer(many=True, read_only=True)
    
    # Create a comprehensive nutrition dictionary
    comprehensive_nutrition = serializers.SerializerMethodField()
    
    class Meta:
        model = IngredientFact
        fields = '__all__'
    
    def get_comprehensive_nutrition(self, obj):
        """
        Return all nutrition data organized by category for easy access
        """
        nutrition_data = {
            'basic_info': {
                'serving_size': str(obj.serving_size),
                'measurement_unit': obj.measurement_unit,
            },
            'legacy_fields': {
                'total_fat': str(obj.total_fat),
                'saturated_fat': str(obj.saturated_fat),
                'carbohydrates': str(obj.carbohydrates),
                'protein': str(obj.protein),
                'fiber': str(obj.fiber),
                'cholesterol': str(obj.cholesterol),
            },
            'comprehensive': {}
        }
        
        # Group nutrition facts by category
        categories = {}
        for nutrition_fact in obj.nutrition_facts.all():
            category = nutrition_fact.nutrient_type.category
            if category not in categories:
                categories[category] = {}
            
            categories[category][nutrition_fact.nutrient_type.name] = {
                'value': str(nutrition_fact.value),
                'unit': nutrition_fact.nutrient_type.unit
            }
        
        nutrition_data['comprehensive'] = categories
        return nutrition_data

class CompactIngredientSerializer(serializers.ModelSerializer):
    """
    A more compact version that includes all nutrition data in a flattened structure
    """
    all_nutrients = serializers.SerializerMethodField()
    
    class Meta:
        model = IngredientFact
        fields = ['id', 'name', 'serving_size', 'measurement_unit', 'created_at', 'updated_at', 
                 'total_fat', 'saturated_fat', 'carbohydrates', 'protein', 'fiber', 'cholesterol',
                 'all_nutrients']
    
    def get_all_nutrients(self, obj):
        """
        Return all nutrition data in a flat dictionary for easy access
        """
        nutrients = {}
        for nutrition_fact in obj.nutrition_facts.all():
            key = f"{nutrition_fact.nutrient_type.name}"
            nutrients[key] = {
                'value': str(nutrition_fact.value),
                'unit': nutrition_fact.nutrient_type.unit,
                'category': nutrition_fact.nutrient_type.category
            }
        return nutrients