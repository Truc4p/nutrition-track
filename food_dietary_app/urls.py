from django.urls import path
from .views import IngredientListCreateView, get_ingredients_by_names

urlpatterns = [
    path('ingredients/', IngredientListCreateView.as_view(), name='ingredient-list-create'),
    path('ingredients/search/', get_ingredients_by_names, name='get-ingredients-by-names'),
]