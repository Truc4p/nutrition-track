#!/usr/bin/env python3
"""
Enhanced Pick Up Limes recipe scraper with multi-term support and advanced features
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import re
import os
import argparse
from urllib.parse import urlparse, parse_qs
import csv
from datetime import datetime

def get_recipes_from_pickup_limes(search_term="egg", page=1, max_retries=3):
    """
    Enhanced version with retry logic and better error handling
    """
    url = f"https://www.pickuplimes.com/recipe/?sb={search_term}&total_time=&sort_by=&public=on"
    
    if page > 1:
        url += f"&page={page}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
    
    for attempt in range(max_retries):
        try:
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find all recipe cards/sections
            recipe_sections = soup.find_all('a', href=re.compile(r'/recipe/'))
            
            recipes = []
            processed_links = set()
            
            for section in recipe_sections:
                link = section.get('href')
                
                if not link or not link.startswith('/recipe/') or link in processed_links:
                    continue
                    
                full_link = f"https://www.pickuplimes.com{link}"
                processed_links.add(link)
                
                # Extract recipe title
                title_elem = section.find('h3') or section.find('h2') or section.find('strong')
                title = title_elem.text.strip() if title_elem else "Unknown Recipe"
                
                # Enhanced metadata extraction
                parent = section.parent
                time_text = ""
                categories = []
                difficulty = ""
                
                # Look for time information
                time_elem = parent.find(text=re.compile(r'\d+\s*(hr|min)'))
                if time_elem:
                    time_text = time_elem.strip()
                
                # Find category tags
                category_elems = parent.find_all('span', class_=lambda c: c and 'tag' in c)
                if category_elems:
                    categories = [cat.text.strip() for cat in category_elems]
                
                # Try to find difficulty level
                difficulty_elem = parent.find(text=re.compile(r'(easy|medium|hard|beginner|intermediate|advanced)', re.IGNORECASE))
                if difficulty_elem:
                    difficulty = difficulty_elem.strip()
                
                recipes.append({
                    'title': title,
                    'url': full_link,
                    'cooking_time': time_text,
                    'categories': categories,
                    'difficulty': difficulty,
                    'search_term': search_term,
                    'scraped_at': datetime.now().isoformat()
                })
            
            return recipes
            
        except requests.exceptions.RequestException as e:
            print(f"Attempt {attempt + 1} failed: {e}")
            if attempt < max_retries - 1:
                wait_time = (attempt + 1) * 5
                print(f"Waiting {wait_time} seconds before retry...")
                time.sleep(wait_time)
            else:
                print(f"Failed to fetch recipes after {max_retries} attempts")
                return []
    
    return []

def get_recipe_details_enhanced(recipe_url, max_retries=3):
    """
    Enhanced recipe detail extraction with better parsing and retry logic
    """
    for attempt in range(max_retries):
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            }
            
            response = requests.get(recipe_url, headers=headers, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract recipe ID
            recipe_id = None
            try:
                recipe_id = int(recipe_url.split('-')[-1])
            except (ValueError, IndexError):
                recipe_id = None
            
            # Extract title
            title = soup.find('h1').text.strip() if soup.find('h1') else "Unknown Recipe"
            
            # Enhanced time extraction
            total_time = extract_time_info(soup)
            
            # Enhanced ingredient extraction
            ingredients = extract_ingredients(soup)
            
            # Extract instructions
            instructions = extract_instructions(soup)
            
            # Extract nutritional info if available
            nutrition = extract_nutrition(soup)
            
            # Extract tags and categories
            tags = extract_tags(soup)
            
            # Extract description
            description = extract_description(soup)
            
            # Extract image URL
            image_url = extract_image_url(soup)
            
            return {
                'id': recipe_id,
                'title': title,
                'url': recipe_url,
                'total_time': total_time,
                'ingredients': ingredients,
                'instructions': instructions,
                'tags': tags,
                'description': description,
                'image_url': image_url,
                'nutrition': nutrition,
                'scraped_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Attempt {attempt + 1} failed for {recipe_url}: {e}")
            if attempt < max_retries - 1:
                time.sleep(5)
            else:
                print(f"Failed to get details for {recipe_url}")
                return None
    
    return None

def extract_time_info(soup):
    """Extract cooking time information"""
    time_patterns = [
        r'total[:\s]*(\d+)\s*(hr|hour|min|minute)',
        r'(\d+)\s*(hr|hour|min|minute)[s]?\s*total',
        r'prep[:\s]*(\d+)\s*(min|minute)[s]?.*cook[:\s]*(\d+)\s*(min|minute)',
    ]
    
    page_text = soup.get_text().lower()
    
    for pattern in time_patterns:
        match = re.search(pattern, page_text, re.IGNORECASE)
        if match:
            return match.group(0)
    
    return ""

def extract_ingredients(soup):
    """Enhanced ingredient extraction"""
    ingredients = []
    
    # Multiple strategies to find ingredients
    strategies = [
        lambda: soup.find('h2', string=re.compile('Ingredients', re.IGNORECASE)),
        lambda: soup.find('div', class_=lambda c: c and 'ingredients' in c.lower()),
        lambda: soup.find('section', id=re.compile('ingredients', re.IGNORECASE)),
    ]
    
    for strategy in strategies:
        try:
            ingredients_section = strategy()
            if ingredients_section:
                # Find the parent section
                parent = ingredients_section.parent if ingredients_section.name != 'div' else ingredients_section
                
                # Look for list items
                ingredient_items = parent.find_all('li')
                
                if ingredient_items:
                    for item in ingredient_items:
                        ingredient_text = re.sub(r'\s+', ' ', item.text.strip())
                        if ingredient_text and len(ingredient_text) > 3:
                            ingredients.append(ingredient_text)
                    break
        except:
            continue
    
    return ingredients

def extract_instructions(soup):
    """Extract cooking instructions"""
    instructions = []
    
    # Look for instructions section
    instructions_section = soup.find('h2', string=re.compile('Instructions|Method|Directions', re.IGNORECASE))
    
    if instructions_section:
        parent = instructions_section.parent
        instruction_items = parent.find_all(['li', 'p', 'div'], class_=lambda c: not c or 'instruction' in c.lower())
        
        for item in instruction_items:
            instruction_text = re.sub(r'\s+', ' ', item.text.strip())
            if instruction_text and len(instruction_text) > 10:
                instructions.append(instruction_text)
    
    return instructions

def extract_nutrition(soup):
    """Extract nutritional information if available"""
    nutrition = {}
    
    # Look for nutrition section
    nutrition_section = soup.find('h2', string=re.compile('Nutrition|Nutritional', re.IGNORECASE))
    
    if nutrition_section:
        parent = nutrition_section.parent
        # Look for common nutritional values
        nutrition_text = parent.get_text()
        
        patterns = {
            'calories': r'(\d+)\s*cal',
            'protein': r'(\d+)\s*g\s*protein',
            'carbs': r'(\d+)\s*g\s*carb',
            'fat': r'(\d+)\s*g\s*fat',
            'fiber': r'(\d+)\s*g\s*fiber',
        }
        
        for key, pattern in patterns.items():
            match = re.search(pattern, nutrition_text, re.IGNORECASE)
            if match:
                nutrition[key] = match.group(1)
    
    return nutrition

def extract_tags(soup):
    """Extract recipe tags and categories"""
    tags = []
    
    # Look for various tag formats
    tag_selectors = [
        'span[class*="tag"]',
        'div[class*="tag"]',
        'a[class*="category"]',
        'span[class*="diet"]',
    ]
    
    for selector in tag_selectors:
        tag_elements = soup.select(selector)
        for elem in tag_elements:
            tag_text = elem.text.strip()
            if tag_text and tag_text not in tags:
                tags.append(tag_text)
    
    return tags

def extract_description(soup):
    """Extract recipe description"""
    # Look for meta description or recipe summary
    meta_desc = soup.find('meta', attrs={'name': 'description'})
    if meta_desc:
        return meta_desc.get('content', '').strip()
    
    # Look for recipe intro paragraph
    intro_selectors = [
        'div[class*="intro"]',
        'div[class*="description"]',
        'p[class*="summary"]',
    ]
    
    for selector in intro_selectors:
        intro_elem = soup.select_one(selector)
        if intro_elem:
            return intro_elem.text.strip()
    
    return ""

def extract_image_url(soup):
    """Extract recipe image URL"""
    # Look for main recipe image
    img_selectors = [
        'img[class*="recipe"]',
        'img[class*="hero"]',
        'img[class*="main"]',
        'meta[property="og:image"]',
    ]
    
    for selector in img_selectors:
        img_elem = soup.select_one(selector)
        if img_elem:
            return img_elem.get('src') or img_elem.get('content', '')
    
    return ""

def scrape_multiple_terms(search_terms, pages_per_term=3, delay=2, get_details=True):
    """
    Scrape multiple search terms efficiently
    
    Args:
        search_terms (list): List of search terms to scrape
        pages_per_term (int): Number of pages to scrape per term
        delay (float): Delay between requests
        get_details (bool): Whether to fetch detailed recipe information
    
    Returns:
        dict: Results organized by search term
    """
    all_results = {}
    
    for i, search_term in enumerate(search_terms):
        print(f"\n{'='*60}")
        print(f"Scraping search term {i+1}/{len(search_terms)}: '{search_term}'")
        print(f"{'='*60}")
        
        term_recipes = []
        
        # Get recipes from search results
        for page in range(1, pages_per_term + 1):
            print(f"Fetching page {page}/{pages_per_term}...")
            page_recipes = get_recipes_from_pickup_limes(search_term, page)
            
            if not page_recipes:
                print(f"No more recipes found on page {page}")
                break
            
            term_recipes.extend(page_recipes)
            print(f"Found {len(page_recipes)} recipes on page {page}")
            time.sleep(delay)
        
        # Remove duplicates
        unique_recipes = []
        seen_urls = set()
        for recipe in term_recipes:
            if recipe['url'] not in seen_urls:
                seen_urls.add(recipe['url'])
                unique_recipes.append(recipe)
        
        print(f"Total unique recipes for '{search_term}': {len(unique_recipes)}")
        
        # Get detailed information if requested
        if get_details:
            print("Fetching detailed recipe information...")
            detailed_recipes = []
            
            for j, recipe in enumerate(unique_recipes):
                print(f"Details {j+1}/{len(unique_recipes)}: {recipe['title']}")
                details = get_recipe_details_enhanced(recipe['url'])
                if details:
                    # Merge with basic info
                    details.update({
                        'search_term': search_term,
                        'categories': recipe.get('categories', []),
                        'difficulty': recipe.get('difficulty', ''),
                    })
                    detailed_recipes.append(details)
                
                time.sleep(delay)
            
            all_results[search_term] = detailed_recipes
        else:
            all_results[search_term] = unique_recipes
    
    return all_results

def main():
    parser = argparse.ArgumentParser(description='Enhanced Pick Up Limes recipe scraper')
    parser.add_argument('--search', '-s', nargs='+', default=['egg'], help='Search terms (can specify multiple)')
    parser.add_argument('--pages', '-p', type=int, default=3, help='Pages per search term')
    parser.add_argument('--delay', '-d', type=float, default=2, help='Delay between requests')
    parser.add_argument('--basic', '-b', action='store_true', help='Only basic info, no detailed pages')
    parser.add_argument('--output-dir', '-o', default='pickup_limes_database', help='Output directory')
    
    args = parser.parse_args()
    
    # Create output directory
    os.makedirs(args.output_dir, exist_ok=True)
    for subdir in ['json', 'csv', 'images']:
        os.makedirs(os.path.join(args.output_dir, subdir), exist_ok=True)
    
    # Run the scraper
    results = scrape_multiple_terms(
        search_terms=args.search,
        pages_per_term=args.pages,
        delay=args.delay,
        get_details=not args.basic
    )
    
    # Save results
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    
    for search_term, recipes in results.items():
        # Save JSON
        json_file = os.path.join(args.output_dir, 'json', f'enhanced_{search_term}_{timestamp}.json')
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(recipes, f, indent=2, ensure_ascii=False)
        
        # Save CSV
        if recipes:
            csv_file = os.path.join(args.output_dir, 'csv', f'enhanced_{search_term}_{timestamp}.csv')
            with open(csv_file, 'w', newline='', encoding='utf-8') as f:
                if recipes:
                    fieldnames = list(recipes[0].keys())
                    writer = csv.DictWriter(f, fieldnames=fieldnames)
                    writer.writeheader()
                    
                    for recipe in recipes:
                        # Handle list fields
                        row = recipe.copy()
                        for key, value in row.items():
                            if isinstance(value, list):
                                row[key] = ' | '.join(str(v) for v in value)
                            elif isinstance(value, dict):
                                row[key] = json.dumps(value)
                        writer.writerow(row)
        
        print(f"✅ Saved {len(recipes)} recipes for '{search_term}'")
    
    print(f"\n🎉 All done! Check {args.output_dir} for results")

if __name__ == "__main__":
    main() 