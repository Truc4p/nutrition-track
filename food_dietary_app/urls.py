from django.urls import path
from .views import (
    IngredientListCreateView, 
    get_ingredients_by_names, 
    get_comprehensive_nutrition, 
    search_by_nutrient
)

urlpatterns = [
    path('ingredients/', IngredientListCreateView.as_view(), name='ingredient-list-create'),
    path('get_ingredients_by_names/', get_ingredients_by_names, name='get-ingredients-by-names'),
    path('ingredients/<int:ingredient_id>/nutrition/', get_comprehensive_nutrition, name='comprehensive-nutrition'),
    path('search_by_nutrient/', search_by_nutrient, name='search-by-nutrient'),
]


