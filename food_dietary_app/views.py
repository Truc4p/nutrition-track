from django.shortcuts import render
from fuzzywuzzy import process
from typing import Optional
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework import generics
from .models import IngredientFact
from .serializers import IngredientSerializer, CompactIngredientSerializer
from django.db.models import Q

# Create your views here.
class IngredientListCreateView(generics.ListCreateAPIView):
    queryset = IngredientFact.objects.all()
    serializer_class = IngredientSerializer

@api_view(['GET'])
def get_ingredients_by_names(request):
    if request.method == 'GET':
        names = request.GET.get('names', '')
        format_type = request.GET.get('format', 'compact')  # 'compact' or 'full'
        
        print("Received names query param:", names)  # Debugging line
        print("____________________________________________________")
        names_list = names.split(',')
        print("Names list:", names_list)  # Debugging line
        print("____________________________________________________")

        # Use case-insensitive matching
        query = Q()
        for name in names_list:
            query |= Q(name__iexact=name.strip())
        
        ingredients = IngredientFact.objects.filter(query).prefetch_related(
            'nutrition_facts__nutrient_type'
        )
        
        # Choose serializer based on format preference
        if format_type == 'full':
            serializer = IngredientSerializer(ingredients, many=True)
            print("Using full serializer with comprehensive nutrition data")
        else:
            serializer = CompactIngredientSerializer(ingredients, many=True)
            print("Using compact serializer with all nutrients")
        
        ingredients_data = serializer.data
        print("____________________________________________________")
        print("Ingredients API response:", ingredients_data)  # Debugging line
        print("____________________________________________________")
        
        return JsonResponse(ingredients_data, safe=False)
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@api_view(['GET'])
def get_comprehensive_nutrition(request, ingredient_id):
    """
    Get comprehensive nutrition data for a specific ingredient
    """
    try:
        ingredient = IngredientFact.objects.prefetch_related(
            'nutrition_facts__nutrient_type'
        ).get(id=ingredient_id)
        
        serializer = IngredientSerializer(ingredient)
        return Response(serializer.data)
    except IngredientFact.DoesNotExist:
        return JsonResponse({'error': 'Ingredient not found'}, status=404)

@api_view(['GET'])
def search_by_nutrient(request):
    """
    Search ingredients by nutrient content
    """
    nutrient_name = request.GET.get('nutrient', '')
    min_value = request.GET.get('min_value', 0)
    
    if not nutrient_name:
        return JsonResponse({'error': 'Nutrient name required'}, status=400)
    
    try:
        # Find ingredients that have the specified nutrient above minimum value
        ingredients = IngredientFact.objects.filter(
            nutrition_facts__nutrient_type__name__icontains=nutrient_name,
            nutrition_facts__value__gte=float(min_value)
        ).prefetch_related('nutrition_facts__nutrient_type').distinct()
        
        serializer = CompactIngredientSerializer(ingredients, many=True)
        return Response(serializer.data)
    except ValueError:
        return JsonResponse({'error': 'Invalid min_value'}, status=400)