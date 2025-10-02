"""
Local USDA database search module.
Provides fast local searches without API calls.
"""

import sqlite3
from pathlib import Path
from typing import List, Dict, Optional

DB_PATH = Path(__file__).parent / "usda_foods.db"

class USDALocalSearch:
    """Local USDA database search handler."""
    
    def __init__(self, db_path=None):
        """Initialize with database path."""
        self.db_path = db_path or DB_PATH
        if not Path(self.db_path).exists():
            raise FileNotFoundError(
                f"USDA database not found at {self.db_path}. "
                "Please run download_usda.py first to set up the database."
            )
    
    def search_foods(self, query: str, limit: int = 20) -> List[Dict]:
        """
        Search for foods using full-text search.
        
        Args:
            query: Search term
            limit: Maximum number of results
            
        Returns:
            List of food dictionaries compatible with USDA API format
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Use FTS5 for fast full-text search
        cursor.execute('''
        SELECT f.fdc_id, f.data_type, f.description
        FROM foods_fts fts
        JOIN foods f ON fts.rowid = f.fdc_id
        WHERE foods_fts MATCH ?
        LIMIT ?
        ''', (query, limit))
        
        results = []
        for row in cursor.fetchall():
            # Map data_type to match USDA API format
            data_type_map = {
                'foundation_food': 'Foundation',
                'sr_legacy_food': 'SR Legacy',
                'survey_fndds_food': 'Survey (FNDDS)',
                'branded_food': 'Branded'
            }
            
            results.append({
                'fdcId': row['fdc_id'],
                'description': row['description'],
                'dataType': data_type_map.get(row['data_type'], row['data_type'])
            })
        
        conn.close()
        return results
    
    def get_food_details(self, fdc_id: int) -> Optional[Dict]:
        """
        Get detailed nutrition data for a specific food.
        
        Args:
            fdc_id: USDA FoodData Central ID
            
        Returns:
            Food details dictionary compatible with USDA API format
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Get food info
        cursor.execute('''
        SELECT fdc_id, data_type, description, publication_date
        FROM foods
        WHERE fdc_id = ?
        ''', (fdc_id,))
        
        food_row = cursor.fetchone()
        if not food_row:
            conn.close()
            return None
        
        # Get nutrients for this food
        cursor.execute('''
        SELECT n.id, n.name, n.unit_name, fn.amount
        FROM food_nutrient fn
        JOIN nutrients n ON fn.nutrient_id = n.id
        WHERE fn.fdc_id = ?
        AND fn.amount > 0
        ''', (fdc_id,))
        
        nutrients = []
        for row in cursor.fetchall():
            nutrients.append({
                'nutrient': {
                    'id': row['id'],
                    'name': row['name'],
                    'unitName': row['unit_name']
                },
                'amount': row['amount']
            })
        
        conn.close()
        
        # Map data_type to match USDA API format
        data_type_map = {
            'foundation_food': 'Foundation',
            'sr_legacy_food': 'SR Legacy',
            'survey_fndds_food': 'Survey (FNDDS)',
            'branded_food': 'Branded'
        }
        
        return {
            'fdcId': food_row['fdc_id'],
            'description': food_row['description'],
            'dataType': data_type_map.get(food_row['data_type'], food_row['data_type']),
            'publicationDate': food_row['publication_date'],
            'foodNutrients': nutrients
        }
    
    def get_stats(self) -> Dict:
        """Get database statistics."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM foods")
        food_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM nutrients")
        nutrient_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(DISTINCT data_type) FROM foods")
        data_type_count = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'total_foods': food_count,
            'total_nutrients': nutrient_count,
            'data_types': data_type_count
        }


# Singleton instance for easy import
_usda_search_instance = None

def get_usda_search() -> USDALocalSearch:
    """Get singleton USDA search instance."""
    global _usda_search_instance
    if _usda_search_instance is None:
        _usda_search_instance = USDALocalSearch()
    return _usda_search_instance


