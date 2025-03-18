from django.shortcuts import render
from fuzzywuzzy import process
from typing import Optional
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework import generics
from .models import IngredientFact
from .serializers import IngredientSerializer
from django.db.models import Q

# Create your views here.
class IngredientListCreateView(generics.ListCreateAPIView):
    queryset = IngredientFact.objects.all()
    serializer_class = IngredientSerializer

@api_view(['GET'])
def get_ingredients_by_names(request):
    if request.method == 'GET':
        names = request.GET.get('names', '')
        print("Received names query param:", names)  # Debugging line
        names_list = names.split(',')
        print("Names list:", names_list)  # Debugging line
        
        # Use case-insensitive matching
        query = Q()
        for name in names_list:
            query |= Q(name__iexact=name.strip())
        
        ingredients = IngredientFact.objects.filter(query)
        
        ingredients_data = list(ingredients.values())
        print("Ingredients data:", ingredients_data)  # Debugging line
        return JsonResponse(ingredients_data, safe=False)
    return JsonResponse({'error': 'Invalid request method'}, status=400)