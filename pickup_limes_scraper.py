import requests
from bs4 import BeautifulSoup
import json
import time
import re
import os
import argparse
from urllib.parse import urlparse, parse_qs

def get_all_recipes_from_pickup_limes(page=1):
    """
    Scrape ALL recipes from Pick Up Limes website (without search term filter)
    
    Args:
        page (int): Page number to scrape
        
    Returns:
        list: List of recipe dictionaries containing basic details
    """
    # Use empty search to get all recipes
    url = f"https://www.pickuplimes.com/recipe/?sb=&total_time=&sort_by=&public=on"
    
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
        
        # Find all recipe cards/sections - Pick Up Limes uses specific structure
        recipe_sections = soup.find_all('a', href=re.compile(r'/recipe/'))
        
        recipes = []
        processed_links = set()  # To avoid duplicates
        
        for section in recipe_sections:
            # Extract the link
            link = section.get('href')
            
            # Skip if not a recipe link or already processed
            if not link or not link.startswith('/recipe/') or link in processed_links:
                continue
                
            # Skip non-recipe URLs (listing pages, RSS feeds, etc.)
            skip_patterns = [
                '/recipe/?',  # Main listing page
                '/recipe/$',  # Root recipe page
                '/recipe/latest-rss',  # RSS feed
                '/recipe/search',  # Search page
            ]
            
            if any(pattern in link for pattern in skip_patterns):
                continue
                
            # Get full URL
            full_link = f"https://www.pickuplimes.com{link}"
            processed_links.add(link)
            
            # Try to find the recipe title
            title_elem = section.find('h3') or section.find('h2') or section.find('strong')
            title = title_elem.text.strip() if title_elem else "Unknown Recipe"
            
            # Try to find the recipe image
            image_url = ""
            img_elem = section.find('img')
            if img_elem:
                image_url = img_elem.get('src') or img_elem.get('data-src')
                if image_url and not image_url.startswith('http'):
                    if image_url.startswith('//'):
                        image_url = 'https:' + image_url
                    elif image_url.startswith('/'):
                        image_url = 'https://www.pickuplimes.com' + image_url
            
            # Try to find cooking time and categories from the listing page
            parent = section.parent
            time_text = ""
            categories = []
            
            # Look for time in the parent elements
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
                'image_url': image_url,
                'cooking_time': time_text,
                'categories': categories
            })
        
        return recipes
    
    except requests.exceptions.RequestException as e:
        print(f"Error fetching recipes: {e}")
        return []

def get_recipe_details(recipe_url):
    """
    Get detailed information about a specific recipe including name, image, total-time, ingredients, tags
    
    Args:
        recipe_url (str): URL of the recipe
        
    Returns:
        dict: Recipe with all requested details: name, image, total_time, ingredients, tags
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
            
        # Extract recipe name/title
        title = ""
        title_elem = soup.find('h1')
        if title_elem:
            title = title_elem.text.strip()
        else:
            # Fallback: try to find title in meta tags
            meta_title = soup.find('meta', property='og:title')
            if meta_title:
                title = meta_title.get('content', '').strip()
        
        if not title:
            title = "Unknown Recipe"
        
        # Extract recipe image
        image_url = ""
        
        # Try multiple ways to find the main recipe image
        # 1. Look for Open Graph image
        og_image = soup.find('meta', property='og:image')
        if og_image:
            image_url = og_image.get('content', '')
        
        # 2. Look for the main recipe image in the content
        if not image_url:
            # Find main content area and look for the first large image
            main_img = soup.find('img', class_=lambda c: c and ('recipe' in c.lower() or 'main' in c.lower() or 'hero' in c.lower()))
            if main_img:
                image_url = main_img.get('src') or main_img.get('data-src')
        
        # 3. Fallback: find any prominent image
        if not image_url:
            images = soup.find_all('img')
            for img in images:
                src = img.get('src') or img.get('data-src')
                if src and any(keyword in src.lower() for keyword in ['recipe', 'food', '.jpg', '.jpeg', '.png']):
                    image_url = src
                    break
        
        # Ensure image URL is absolute
        if image_url and not image_url.startswith('http'):
            if image_url.startswith('//'):
                image_url = 'https:' + image_url
            elif image_url.startswith('/'):
                image_url = 'https://www.pickuplimes.com' + image_url
        
        # Get total time to make the recipe
        total_time = ""
        
        # Look for time in structured data (JSON-LD)
        json_scripts = soup.find_all('script', type='application/ld+json')
        for script in json_scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, dict) and '@type' in data and 'Recipe' in data['@type']:
                    if 'totalTime' in data:
                        total_time = data['totalTime']
                        break
                    elif 'cookTime' in data:
                        total_time = data['cookTime']
                        break
                    elif 'prepTime' in data:
                        total_time = data['prepTime']
                        break
            except:
                continue
        
        # If no structured data, try to find time in the page content
        if not total_time:
            # Look for time info in various formats
            time_patterns = [
                r'total time[:\s]*(\d+\s*(?:hr|hours?|min|minutes?))',
                r'cook time[:\s]*(\d+\s*(?:hr|hours?|min|minutes?))',
                r'prep time[:\s]*(\d+\s*(?:hr|hours?|min|minutes?))',
                r'(\d+\s*(?:hr|hours?|min|minutes?))\s*total',
                r'ready in[:\s]*(\d+\s*(?:hr|hours?|min|minutes?))'
            ]
            
            page_text = soup.get_text()
            for pattern in time_patterns:
                match = re.search(pattern, page_text, re.IGNORECASE)
                if match:
                    total_time = match.group(1).strip()
                    break
        
        # Try to find recipe tags/categories
        tags = []
        
        # Look for tags in structured data first
        for script in json_scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, dict) and '@type' in data and 'Recipe' in data['@type']:
                    if 'keywords' in data:
                        keywords = data['keywords']
                        if isinstance(keywords, str):
                            tags = [tag.strip() for tag in keywords.split(',')]
                        elif isinstance(keywords, list):
                            tags = keywords
                        break
                    elif 'recipeCategory' in data:
                        tags.extend(data['recipeCategory'] if isinstance(data['recipeCategory'], list) else [data['recipeCategory']])
                    elif 'recipeCuisine' in data:
                        tags.extend(data['recipeCuisine'] if isinstance(data['recipeCuisine'], list) else [data['recipeCuisine']])
            except:
                continue
        
        # If no structured data tags, look for tags in the page content
        if not tags:
            # Look for tag elements in various formats
            tag_elements = soup.find_all(['span', 'div', 'a'], class_=lambda c: c and any(keyword in c.lower() for keyword in ['tag', 'category', 'label', 'badge']))
            tags = [elem.text.strip() for elem in tag_elements if elem.text.strip() and len(elem.text.strip()) < 30]
            
            # Remove duplicates and filter out common non-tag text
            exclude_words = {'recipe', 'recipes', 'cooking', 'food', 'ingredients', 'instructions', 'method', 'preparation'}
            tags = list(set([tag for tag in tags if tag.lower() not in exclude_words]))
            
        # Try to find ingredients
        ingredients = []
        
        # Look for ingredients in structured data first
        for script in json_scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, dict) and '@type' in data and 'Recipe' in data['@type']:
                    if 'recipeIngredient' in data:
                        ingredients = data['recipeIngredient']
                        break
            except:
                continue
        
        # If no structured data ingredients, scrape from the page
        if not ingredients:
            # Find ingredients section
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
            
            # If still no ingredients found, try alternative selectors
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
            'name': title,
            'image': image_url,
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
    
    # Define the fields to export - name, image, total_time, ingredients, tags
    fields = [
        'id', 'name', 'image', 'url', 'total_time', 'ingredients_text', 'tags_text'
    ]
    
    try:
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fields)
            writer.writeheader()
            
            for recipe in recipes:
                # Prepare a row for CSV export
                row = {
                    'id': recipe.get('id', ''),
                    'name': recipe.get('name', ''),
                    'image': recipe.get('image', ''),
                    'url': recipe.get('url', ''),
                    'total_time': recipe.get('total_time', '')
                }
                
                # Convert ingredients to text
                ingredients = recipe.get('ingredients', [])
                if isinstance(ingredients, list):
                    row['ingredients_text'] = '\n'.join(ingredients)
                else:
                    row['ingredients_text'] = str(ingredients)
                
                # Convert tags to text
                tags = recipe.get('tags', [])
                if isinstance(tags, list):
                    row['tags_text'] = ', '.join(tags)
                else:
                    row['tags_text'] = str(tags)
                
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
    parser = argparse.ArgumentParser(description='Scrape ALL recipes from Pickup Limes website')
    parser.add_argument('--pages', '-p', type=int, default=50, help='Maximum number of pages to scrape (default: 50, use 0 for all pages)')
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
    max_pages = args.pages
    delay = args.delay
    get_details = not args.basic
    
    print(f"Starting scraper to get ALL recipes from Pick Up Limes")
    print(f"Max pages: {'All pages' if max_pages == 0 else max_pages}")
    
    all_recipes = []
    page = 1
    
    # Get recipe listings from all pages
    while True:
        if max_pages > 0 and page > max_pages:
            break
            
        print(f"Scraping page {page}...")
        page_recipes = get_all_recipes_from_pickup_limes(page)
        
        if not page_recipes:
            print(f"No more recipes found on page {page}. Stopping.")
            break
            
        all_recipes.extend(page_recipes)
        print(f"Found {len(page_recipes)} recipes on page {page}")
        
        page += 1
        
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
        print("Fetching detailed recipe information (name, image, total_time, ingredients, tags)...")
        detailed_recipes = []
        
        for i, recipe in enumerate(unique_recipes):
            print(f"Fetching details for recipe {i+1}/{len(unique_recipes)}: {recipe['title']}")
            details = get_recipe_details(recipe['url'])
            
            # Only add if we got valid details and it's a real recipe
            if (details and 
                details.get('name') != 'Recipes' and 
                'Unknown' not in details.get('name', '') and
                details.get('ingredients') and
                len(details.get('ingredients', [])) > 0):
                detailed_recipes.append(details)
            
            # Be nice to the server
            time.sleep(delay)
        
        # Save to JSON
        json_path = os.path.join(db_dir, "json", "pickup_limes_all_recipes_detailed.json")
        save_recipes_to_json(detailed_recipes, json_path)
        
        # Export to CSV
        csv_path = os.path.join(db_dir, "csv", "pickup_limes_all_recipes.csv")
        export_to_csv(detailed_recipes, csv_path)
        
        print(f"Saved recipe information to:")
        print(f"  - JSON: {json_path}")
        print(f"  - CSV: {csv_path}")
        print(f"Total recipes with full details: {len(detailed_recipes)}")
    else:
        # Save basic recipe info
        json_path = os.path.join(db_dir, "json", "pickup_limes_all_recipes_basic.json")
        save_recipes_to_json(unique_recipes, json_path)
        print(f"Saved basic recipe information to: {json_path}")
    
    print("Done!")

if __name__ == "__main__":
    main()
