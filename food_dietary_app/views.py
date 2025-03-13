from django.shortcuts import render
from fuzzywuzzy import process
from typing import Optional
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework import generics
from .models import IngredientFact
from .serializers import IngredientSerializer

# Create your views here.
class IngredientListCreateView(generics.ListCreateAPIView):
    queryset = IngredientFact.objects.all()
    serializer_class = IngredientSerializer

@api_view(['GET'])
def get_ingredients_by_names(request):
    names = request.query_params.getlist('names')
    ingredients = IngredientFact.objects.filter(name__in=names)
    serializer = IngredientSerializer(ingredients, many=True)
    return Response(serializer.data)