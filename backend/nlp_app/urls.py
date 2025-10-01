from django.urls import path
from .views import process_text, process_text_and_get_nutrition

urlpatterns = [
    path('process_text/', process_text, name='process_text'),
    path('process_text_and_get_nutrition/', process_text_and_get_nutrition, name='process_text_and_get_nutrition'),
]