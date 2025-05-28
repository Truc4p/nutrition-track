#!/usr/bin/env python3
"""
Search the Pickup Limes recipe database for recipes matching specific criteria.
"""

import json
import argparse
import re
from typing import List, Dict, Any


def load_database(database_file: str) -> Dict[str, Any]:
    """Load the recipe database from a JSON file"""
    try:
        with open(database_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading database: {e}")
        return {"metadata": {}, "recipes": []}


def search_recipes(database: Dict[str, Any], query: str = None, ingredient: str = None, 
                  tag: str = None, max_results: int = 10) -> List[Dict[str, Any]]:
    """
    Search for recipes matching the given criteria
    
    Args:
        database: The recipe database
        query: General search query (searches title and description)
        ingredient: Ingredient to search for
        tag: Tag to filter by
        max_results: Maximum number of results to return
        
    Returns:
        List of matching recipes
    """
    recipes = database.get("recipes", [])
    results = []
    
    for recipe in recipes:
        # Skip recipes with "Unknown Recipe" title or empty recipes
        if recipe.get("title") == "Unknown Recipe" or not recipe.get("ingredients"):
            continue
            
        match = True
        
        # Check general query (title and description)
        if query and match:
            title = recipe.get("title", "").lower()
            description = recipe.get("description", "").lower()
            match = query.lower() in title or query.lower() in description
        
        # Check ingredients
        if ingredient and match:
            ingredients_text = " ".join(recipe.get("ingredients", [])).lower()
            match = ingredient.lower() in ingredients_text
        
        # Check tags
        if tag and match:
            tags = recipe.get("tags", [])
            # Clean up tags (they often have newlines and extra spaces)
            clean_tags = []
            for t in tags:
                clean_tags.extend([tag.strip().lower() for tag in re.split(r'\s*\n+\s*', t) if tag.strip()])
            
            match = tag.lower() in clean_tags
        
        if match:
            results.append(recipe)
            
            # Stop if we've reached the maximum number of results
            if len(results) >= max_results:
                break
    
    return results


def format_recipe(recipe: Dict[str, Any], show_details: bool = False) -> str:
    """Format a recipe for display"""
    title = recipe.get("title", "Untitled Recipe")
    description = recipe.get("description", "No description available")
    ingredients = recipe.get("ingredients", [])
    instructions = recipe.get("instructions", [])
    
    output = [
        f"{'=' * 80}",
        f"TITLE: {title}",
        f"{'=' * 80}",
        f"URL: {recipe.get('url', 'N/A')}",
        f"Description: {description}",
        f"Ingredients: {len(ingredients)} items",
        f"Instructions: {len(instructions)} steps",
    ]
    
    if recipe.get("local_image_path"):
        output.append(f"Image: {recipe.get('local_image_path')}")
    
    if show_details:
        output.append("\nINGREDIENTS:")
        for i, ingredient in enumerate(ingredients, 1):
            output.append(f"  {i}. {ingredient}")
        
        output.append("\nINSTRUCTIONS:")
        for i, instruction in enumerate(instructions, 1):
            output.append(f"  {i}. {instruction}")
    
    return "\n".join(output)


def main():
    parser = argparse.ArgumentParser(description='Search the Pickup Limes recipe database')
    parser.add_argument('--database', '-d', default='pickup_limes_database/recipe_database.json',
                        help='Path to the recipe database JSON file')
    parser.add_argument('--query', '-q', help='General search query (searches title and description)')
    parser.add_argument('--ingredient', '-i', help='Ingredient to search for')
    parser.add_argument('--tag', '-t', help='Tag to filter by')
    parser.add_argument('--max', '-m', type=int, default=10, help='Maximum number of results to return')
    parser.add_argument('--details', '-D', action='store_true', help='Show detailed recipe information')
    
    args = parser.parse_args()
    
    # Ensure at least one search criteria is provided
    if not any([args.query, args.ingredient, args.tag]):
        parser.error("At least one search criteria (--query, --ingredient, or --tag) must be provided")
    
    # Load the database
    database = load_database(args.database)
    
    # Print database metadata
    metadata = database.get("metadata", {})
    print(f"Database: {metadata.get('source', 'Unknown')}")
    print(f"Total recipes: {metadata.get('total_recipes', 0)}")
    print(f"Created: {metadata.get('created_at', 'Unknown')}")
    print()
    
    # Search for recipes
    results = search_recipes(
        database, 
        query=args.query, 
        ingredient=args.ingredient, 
        tag=args.tag, 
        max_results=args.max
    )
    
    # Display results
    if results:
        print(f"Found {len(results)} matching recipes:")
        for i, recipe in enumerate(results, 1):
            print(f"\nResult {i}:")
            print(format_recipe(recipe, show_details=args.details))
    else:
        print("No matching recipes found.")


if __name__ == "__main__":
    main()
