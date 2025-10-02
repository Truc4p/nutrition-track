"""
Local USDA FoodData Central Database Module
Provides fast local searches without API calls.
"""

from .usda_search import USDALocalSearch, get_usda_search

__all__ = ['USDALocalSearch', 'get_usda_search']


