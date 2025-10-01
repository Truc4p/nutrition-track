#!/usr/bin/env python3
"""
Initialize the YouTube video database by scraping videos from specified channels.
This script should be run once to populate the database initially.
"""

import os
import sys
import time
from dotenv import load_dotenv

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scripts.scraper import scrape_videos

def main():
    """Initialize the database with videos."""
    load_dotenv()
    
    print("Initializing YouTube video database...")
    
    # First, scrape general food-related videos
    print("\n1. Scraping general food-related videos...")
    count1 = scrape_videos("healthy food recipes")
    print(f"Added {count1} videos to the database")
    
    # Wait a bit to avoid API rate limits
    time.sleep(2)
    
    # Next, scrape vegan-specific videos
    print("\n2. Scraping vegan recipe videos...")
    count2 = scrape_videos("vegan recipes")
    print(f"Added {count2} videos to the database")
    
    # Wait a bit to avoid API rate limits
    time.sleep(2)
    
    # Finally, scrape vegetarian-specific videos
    print("\n3. Scraping vegetarian recipe videos...")
    count3 = scrape_videos("vegetarian recipes")
    print(f"Added {count3} videos to the database")
    
    # Total videos added
    total = count1 + count2 + count3
    print(f"\nTotal videos added to the database: {total}")
    print("Database initialization complete!")

if __name__ == "__main__":
    main() 