#!/usr/bin/env python3
"""
Combine multiple recipe JSON files into a single database file
and generate a searchable index.
"""

import json
import os
import glob
import argparse
from datetime import datetime


def combine_recipes(input_dir, output_file):
    """
    Combine all JSON recipe files in the input directory into a single JSON file.
    
    Args:
        input_dir (str): Directory containing JSON recipe files
        output_file (str): Path to output combined JSON file
    
    Returns:
        int: Number of recipes combined
    """
    all_recipes = []
    recipe_urls = set()  # To track duplicates
    
    # Find all JSON files in the input directory
    json_files = glob.glob(os.path.join(input_dir, "*.json"))
    
    print(f"Found {len(json_files)} JSON files to process")
    
    for json_file in json_files:
        print(f"Processing {os.path.basename(json_file)}...")
        
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                recipes = json.load(f)
            
            # Add only unique recipes based on URL
            for recipe in recipes:
                url = recipe.get('url', '')
                
                # Skip empty or duplicate recipes
                if not url or url in recipe_urls or 'Unknown Recipe' in recipe.get('title', ''):
                    continue
                
                recipe_urls.add(url)
                all_recipes.append(recipe)
                
            print(f"  Added {len(recipes)} recipes from {os.path.basename(json_file)}")
        
        except Exception as e:
            print(f"Error processing {json_file}: {e}")
    
    # Add metadata to the database
    metadata = {
        "source": "Pickup Limes",
        "website": "https://www.pickuplimes.com/",
        "created_at": datetime.now().isoformat(),
        "total_recipes": len(all_recipes)
    }
    
    # Create the final database structure
    recipe_database = {
        "metadata": metadata,
        "recipes": all_recipes
    }
    
    # Write the combined recipes to the output file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(recipe_database, f, indent=2, ensure_ascii=False)
    
    print(f"\nSuccessfully combined {len(all_recipes)} unique recipes into {output_file}")
    return len(all_recipes)


def generate_recipe_index(database_file, output_file):
    """
    Generate a searchable index from the recipe database
    
    Args:
        database_file (str): Path to the recipe database JSON file
        output_file (str): Path to output index JSON file
    """
    try:
        with open(database_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        recipes = data.get('recipes', [])
        
        # Create a simplified index with key recipe information
        recipe_index = []
        
        for recipe in recipes:
            # Extract key information for the index
            index_entry = {
                'id': recipe.get('id'),
                'title': recipe.get('title'),
                'url': recipe.get('url'),
                'image_path': recipe.get('local_image_path', ''),
                'description': recipe.get('description', '')[:100] + '...' if recipe.get('description', '') else '',
                'tags': recipe.get('tags', []),
                'ingredients_count': len(recipe.get('ingredients', [])),
                'instructions_count': len(recipe.get('instructions', []))
            }
            
            recipe_index.append(index_entry)
        
        # Sort by title
        recipe_index.sort(key=lambda x: x.get('title', ''))
        
        # Write the index to the output file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(recipe_index, f, indent=2, ensure_ascii=False)
        
        print(f"Successfully generated index with {len(recipe_index)} entries in {output_file}")
    
    except Exception as e:
        print(f"Error generating index: {e}")


def main():
    parser = argparse.ArgumentParser(description='Combine recipe JSON files into a single database')
    parser.add_argument('--input-dir', '-i', default='pickup_limes_database/json',
                        help='Directory containing JSON recipe files')
    parser.add_argument('--output-file', '-o', default='pickup_limes_database/recipe_database.json',
                        help='Output file for combined recipes')
    parser.add_argument('--index-file', default='pickup_limes_database/recipe_index.json',
                        help='Output file for recipe index')
    
    args = parser.parse_args()
    
    # Combine recipes
    recipe_count = combine_recipes(args.input_dir, args.output_file)
    
    if recipe_count > 0:
        # Generate index
        generate_recipe_index(args.output_file, args.index_file)


if __name__ == "__main__":
    main()
