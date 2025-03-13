from rest_framework import serializers
from .models import IngredientFact

class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = IngredientFact
        fields = '__all__'