import requests
from bs4 import BeautifulSoup
import json
import time
import re
import os
import argparse
from urllib.parse import urlparse, parse_qs

def get_recipes_from_pickup_limes(search_term="egg", page=1):
    """
    Scrape recipes from Pick Up Limes website based on a search term
    
    Args:
        search_term (str): The ingredient or term to search for
        page (int): Page number to scrape
        
    Returns:
        list: List of recipe dictionaries containing details
    """
    url = f"https://www.pickuplimes.com/recipe/?sb={search_term}&total_time=&sort_by=&public=on"
    
    if page > 1:
        url += f"&page={page}"
    
    # Add headers to mimic a browser request
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raise an exception for HTTP errors
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find all recipe cards/sections
        recipe_sections = soup.find_all('a', href=re.compile(r'/recipe/'))
        
        recipes = []
        processed_links = set()  # To avoid duplicates
        
        for section in recipe_sections:
            # Extract the link
            link = section.get('href')
            
            # Skip if not a recipe link or already processed
            if not link or not link.startswith('/recipe/') or link in processed_links:
                continue
                
            # Get full URL
            full_link = f"https://www.pickuplimes.com{link}"
            processed_links.add(link)
            
            # Try to find the recipe title
            title_elem = section.find('h3') or section.find('h2') or section.find('strong')
            title = title_elem.text.strip() if title_elem else "Unknown Recipe"
            
            # Try to find cooking time and categories
            parent = section.parent
            time_text = ""
            categories = []
            
            # Look for time and categories in the parent elements
            time_elem = parent.find(text=re.compile(r'\d+\s*(hr|min)'))
            if time_elem:
                time_text = time_elem.strip()
            
            # Find category tags
            category_elems = parent.find_all('span', class_=lambda c: c and 'tag' in c)
            if category_elems:
                categories = [cat.text.strip() for cat in category_elems]
            
            recipes.append({
                'title': title,
                'url': full_link,
                'cooking_time': time_text,
                'categories': categories
            })
        
        return recipes
    
    except requests.exceptions.RequestException as e:
        print(f"Error fetching recipes: {e}")
        return []

def get_recipe_details(recipe_url):
    """
    Get detailed information about a specific recipe
    
    Args:
        recipe_url (str): URL of the recipe
        
    Returns:
        dict: Recipe title, ingredients, URL, total time, and tags
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        }
        
        response = requests.get(recipe_url, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract recipe ID from URL if possible
        recipe_id = None
        try:
            # Extract ID from URL like https://www.pickuplimes.com/recipe/vegan-egg-salad-sandwich-706
            recipe_id = recipe_url.split('-')[-1]
            # Make sure it's a number
            recipe_id = int(recipe_id)
        except (ValueError, IndexError):
            recipe_id = None
            
        # Extract recipe title
        title = soup.find('h1').text.strip() if soup.find('h1') else "Unknown Recipe"
        
        # Get total time to make the recipe
        total_time = ""
        
        # Look for time info in various formats
        time_section = soup.find('div', class_=lambda c: c and ('time' in c.lower() or 'meta' in c.lower() or 'info' in c.lower()))
        if time_section:
            # First try to find total time specifically
            total_time_elem = time_section.find(text=re.compile('total|time', re.IGNORECASE))
            if total_time_elem:
                parent = total_time_elem.parent
                if parent:
                    value_text = parent.text.replace(total_time_elem, '').strip()
                    if value_text:
                        total_time = value_text
            
            # If no specific total time, look for any time indicator
            if not total_time:
                time_elem = time_section.find(text=re.compile(r'\d+\s*(hr|min|minute|hour)', re.IGNORECASE))
                if time_elem:
                    total_time = time_elem.strip()
        
        # If still no time found, try to find it elsewhere on the page
        if not total_time:
            time_elem = soup.find(text=re.compile(r'(total time|cook time|prep time)[:\s]*\d+\s*(hr|min|minute|hour)', re.IGNORECASE))
            if time_elem:
                total_time = time_elem.strip()
        
        # Try to find recipe tags/categories
        tags = []
        
        # Look for tags in various formats
        tag_section = soup.find('div', class_=lambda c: c and ('tags' in c.lower() or 'categories' in c.lower()))
        if tag_section:
            tag_items = tag_section.find_all(['span', 'a'], class_=lambda c: c and ('tag' in c.lower() or 'category' in c.lower()))
            tags = [tag.text.strip() for tag in tag_items if tag.text.strip()]
        
        # If no tags found, try to find them in the recipe metadata section
        if not tags:
            # Look for diet tags like vegan, gluten-free, etc.
            diet_tags = soup.find_all(['span', 'div'], class_=lambda c: c and ('diet' in c.lower() or 'tag' in c.lower()))
            tags = [tag.text.strip() for tag in diet_tags if tag.text.strip()]
            
        # Try to find ingredients - Pickup Limes has a specific structure with list items
        ingredients = []
        ingredients_section = soup.find('h2', string=re.compile('Ingredients', re.IGNORECASE))
        
        if ingredients_section:
            # Find the parent section that contains the ingredients
            parent_section = ingredients_section.parent
            
            # Look for list items which are the ingredients
            ingredient_items = parent_section.find_all('li')
            
            if ingredient_items:
                for item in ingredient_items:
                    # Clean up the text - remove excessive whitespace and newlines
                    ingredient_text = re.sub(r'\s+', ' ', item.text.strip())
                    if ingredient_text:
                        ingredients.append(ingredient_text)
        
        # If no ingredients found, try alternative selectors
        if not ingredients:
            # Try to find any section with 'ingredients' in the class or id
            ingredients_section = soup.find('div', id=re.compile('ingredients', re.IGNORECASE)) or \
                                 soup.find('section', id=re.compile('ingredients', re.IGNORECASE)) or \
                                 soup.find('div', class_=lambda c: c and 'ingredients' in c.lower())
            
            if ingredients_section:
                ingredient_items = ingredients_section.find_all('li')
                if ingredient_items:
                    for item in ingredient_items:
                        ingredient_text = re.sub(r'\s+', ' ', item.text.strip())
                        if ingredient_text:
                            ingredients.append(ingredient_text)
        
        return {
            'id': recipe_id,
            'title': title,
            'url': recipe_url,
            'total_time': total_time,
            'tags': tags,
            'ingredients': ingredients
        }
    
    except requests.exceptions.RequestException as e:
        print(f"Error fetching recipe details: {e}")
        return {}
    except Exception as e:
        print(f"Error processing recipe {recipe_url}: {e}")
        return {'url': recipe_url, 'error': str(e)}

def save_recipes_to_json(recipes, filename="pickup_limes_recipes.json"):
    """Save recipes to a JSON file"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(recipes, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(recipes)} recipes to {filename}")

def create_database_directory(base_dir="pickup_limes_database"):
    """
    Create a directory structure for storing the recipe database
    
    Args:
        base_dir (str): Base directory name
        
    Returns:
        str: Path to the created directory
    """
    # Create base directory if it doesn't exist
    if not os.path.exists(base_dir):
        os.makedirs(base_dir)
        print(f"Created database directory: {base_dir}")
    
    # Create subdirectories for different data types
    subdirs = ["images", "json", "csv"]
    for subdir in subdirs:
        subdir_path = os.path.join(base_dir, subdir)
        if not os.path.exists(subdir_path):
            os.makedirs(subdir_path)
            print(f"Created subdirectory: {subdir_path}")
    
    return base_dir

def download_recipe_image(image_url, recipe_id, base_dir="pickup_limes_database"):
    """
    Download recipe image and save it to the database
    
    Args:
        image_url (str): URL of the image to download
        recipe_id (int): Recipe ID to use in the filename
        base_dir (str): Base directory of the database
        
    Returns:
        str: Path to the downloaded image or None if download failed
    """
    if not image_url:
        return None
    
    try:
        # Create a filename based on recipe ID
        image_dir = os.path.join(base_dir, "images")
        file_extension = os.path.splitext(urlparse(image_url).path)[1] or ".jpg"
        image_filename = f"recipe_{recipe_id}{file_extension}"
        image_path = os.path.join(image_dir, image_filename)
        
        # Download the image
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }
        
        response = requests.get(image_url, headers=headers, stream=True)
        response.raise_for_status()
        
        with open(image_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"Downloaded image: {image_filename}")
        return image_path
    
    except Exception as e:
        print(f"Error downloading image: {e}")
        return None

def export_to_csv(recipes, filename="pickup_limes_recipes.csv"):
    """
    Export recipes to a CSV file for easier database import
    
    Args:
        recipes (list): List of recipe dictionaries
        filename (str): Output CSV filename
    """
    import csv
    
    # Define the fields to export - title, ingredients, URL, and total time
    fields = [
        'id', 'title', 'url', 'total_time', 'ingredients_text'
    ]
    
    try:
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fields)
            writer.writeheader()
            
            for recipe in recipes:
                # Prepare a row for CSV export
                row = {
                    'id': recipe.get('id', ''),
                    'title': recipe.get('title', ''),
                    'url': recipe.get('url', ''),
                    'total_time': recipe.get('total_time', '')
                }
                
                # Convert ingredients to text
                ingredients = recipe.get('ingredients', [])
                if isinstance(ingredients, list):
                    if all(isinstance(item, dict) for item in ingredients):
                        # Handle grouped ingredients
                        ingredients_text = []
                        for group in ingredients:
                            if 'group' in group and 'items' in group:
                                ingredients_text.append(f"## {group['group']}")
                                ingredients_text.extend(group['items'])
                        row['ingredients_text'] = '\n'.join(ingredients_text)
                    else:
                        # Handle flat list of ingredients
                        row['ingredients_text'] = '\n'.join(ingredients)
                
                writer.writerow(row)
        
        print(f"Exported {len(recipes)} recipes to {filename}")
    
    except Exception as e:
        print(f"Error exporting to CSV: {e}")

def parse_arguments():
    """
    Parse command line arguments for the scraper
    
    Returns:
        argparse.Namespace: Parsed arguments
    """
    parser = argparse.ArgumentParser(description='Scrape recipes from Pickup Limes website')
    parser.add_argument('--search', '-s', default='egg', help='Search term or ingredient (default: egg)')
    parser.add_argument('--pages', '-p', type=int, default=3, help='Maximum number of pages to scrape (default: 3)')
    parser.add_argument('--delay', '-d', type=float, default=2, help='Delay between requests in seconds (default: 2)')
    parser.add_argument('--basic', '-b', action='store_true', help='Only fetch basic recipe information, not detailed pages')
    parser.add_argument('--output-dir', '-o', default='pickup_limes_database', help='Output directory for the database (default: pickup_limes_database)')
    
    return parser.parse_args()

def main():
    # Parse command line arguments
    args = parse_arguments()
    
    # Create database directory structure
    db_dir = create_database_directory(args.output_dir)
    
    # Extract parameters from arguments
    search_term = args.search
    max_pages = args.pages
    delay = args.delay
    get_details = not args.basic
    
    print(f"Starting scraper with search term: '{search_term}', max pages: {max_pages}")
    
    all_recipes = []
    
    # Get recipe listings from search results
    for page in range(1, max_pages + 1):
        print(f"Scraping page {page}...")
        page_recipes = get_recipes_from_pickup_limes(search_term, page)
        
        if not page_recipes:
            print(f"No more recipes found on page {page}. Stopping.")
            break
            
        all_recipes.extend(page_recipes)
        print(f"Found {len(page_recipes)} recipes on page {page}")
        
        # Be nice to the server
        time.sleep(delay)
    
    print(f"Found a total of {len(all_recipes)} recipes")
    
    # Remove duplicates based on URL
    unique_urls = set()
    unique_recipes = []
    for recipe in all_recipes:
        if recipe['url'] not in unique_urls and '/recipe/' in recipe['url']:
            unique_urls.add(recipe['url'])
            unique_recipes.append(recipe)
    
    print(f"After removing duplicates: {len(unique_recipes)} unique recipes")
    
    if get_details:
        print("Fetching detailed recipe information...")
        detailed_recipes = []
        
        for i, recipe in enumerate(unique_recipes):
            print(f"Fetching details for recipe {i+1}/{len(unique_recipes)}: {recipe['title']}")
            details = get_recipe_details(recipe['url'])
            detailed_recipes.append(details)
            
            # Be nice to the server
            time.sleep(delay)
        
        # Save to JSON
        json_path = os.path.join(db_dir, "json", f"pickup_limes_{search_term}_detailed.json")
        save_recipes_to_json(detailed_recipes, json_path)
        
        # Export to CSV
        csv_path = os.path.join(db_dir, "csv", f"pickup_limes_{search_term}_recipes.csv")
        export_to_csv(detailed_recipes, csv_path)
        
        print(f"Saved recipe information to:")
        print(f"  - JSON: {json_path}")
        print(f"  - CSV: {csv_path}")
    else:
        # Save basic recipe info
        json_path = os.path.join(db_dir, "json", f"pickup_limes_{search_term}.json")
        save_recipes_to_json(unique_recipes, json_path)
        print(f"Saved basic recipe information to: {json_path}")
    
    print("Done!")

if __name__ == "__main__":
    main()
