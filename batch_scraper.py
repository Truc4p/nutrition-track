#!/usr/bin/env python3
"""
Batch scraper for Pick Up Limes recipes
Automatically scrapes multiple search terms to build a comprehensive recipe database
"""

import subprocess
import time
import sys
import os

# Define search terms and their expected page counts
SEARCH_TERMS = {
    # Proteins
    'chickpea': 5,
    'lentil': 4,
    'beans': 5,
    'tofu': 4,
    'tempeh': 3,
    'quinoa': 4,
    
    # Vegetables
    'broccoli': 3,
    'spinach': 4,
    'kale': 3,
    'mushroom': 4,
    'cauliflower': 3,
    'carrot': 3,
    'tomato': 4,
    'bell pepper': 3,
    
    # Grains and starches
    'rice': 5,
    'pasta': 5,
    'potato': 4,
    'noodles': 4,
    'oats': 4,
    
    # Meal types
    'lunch': 5,
    'snack': 4,
    'dessert': 4,
    'soup': 5,
    'salad': 5,
    'smoothie': 4,
    'bowl': 4,
    
    # Cooking methods/styles
    'curry': 4,
    'stir fry': 3,
    'roasted': 4,
    'baked': 4,
    'grilled': 3,
}

def run_scraper(search_term, pages, delay=3):
    """
    Run the scraper for a specific search term
    
    Args:
        search_term (str): The search term to scrape
        pages (int): Number of pages to scrape
        delay (float): Delay between requests
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        print(f"\n{'='*50}")
        print(f"Scraping recipes for: '{search_term}'")
        print(f"Pages to scrape: {pages}")
        print(f"{'='*50}")
        
        # Build the command
        cmd = [
            'python', 'pickup_limes_scraper.py',
            '--search', search_term,
            '--pages', str(pages),
            '--delay', str(delay)
        ]
        
        # Run the scraper
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✅ Successfully scraped '{search_term}'")
            print(result.stdout)
            return True
        else:
            print(f"❌ Error scraping '{search_term}':")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"❌ Exception while scraping '{search_term}': {e}")
        return False

def main():
    """
    Main function to run batch scraping
    """
    print("🚀 Starting batch recipe scraping...")
    print(f"Will scrape {len(SEARCH_TERMS)} different search terms")
    
    # Check if the main scraper exists
    if not os.path.exists('pickup_limes_scraper.py'):
        print("❌ Error: pickup_limes_scraper.py not found!")
        print("Make sure you're running this script from the correct directory.")
        sys.exit(1)
    
    successful = 0
    failed = 0
    
    # Process each search term
    for i, (search_term, pages) in enumerate(SEARCH_TERMS.items(), 1):
        print(f"\nProgress: {i}/{len(SEARCH_TERMS)}")
        
        # Run the scraper
        if run_scraper(search_term, pages, delay=3):
            successful += 1
        else:
            failed += 1
        
        # Add a longer delay between different search terms to be respectful
        if i < len(SEARCH_TERMS):
            print(f"⏳ Waiting 30 seconds before next search term...")
            time.sleep(30)
    
    # Final summary
    print(f"\n{'='*60}")
    print("📊 BATCH SCRAPING COMPLETE!")
    print(f"{'='*60}")
    print(f"✅ Successful: {successful}")
    print(f"❌ Failed: {failed}")
    print(f"📁 Check the 'pickup_limes_database' folder for results")
    
    if failed > 0:
        print(f"\n⚠️  Some searches failed. You can re-run individual searches:")
        print("python pickup_limes_scraper.py --search [TERM] --pages [NUM]")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⏹️  Batch scraping interrupted by user")
        print("Partial results may be available in the database folder")
        sys.exit(0) 