#!/usr/bin/env python3
"""
Cron job script to update the YouTube video database with new videos.
This script should be scheduled to run periodically (e.g., daily or weekly).
"""

import os
import sys
import datetime
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs', 'cron_update.log'), 'a'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('youtube_scraper')

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scripts.scraper import scrape_videos

def update_database():
    """Update the database with new videos."""
    load_dotenv()
    
    logger.info("Starting scheduled update of YouTube video database...")
    
    try:
        # Update with general food-related videos
        logger.info("Updating with general food-related videos...")
        count1 = scrape_videos("healthy food recipes")
        logger.info(f"Added {count1} new videos")
        
        # Update with vegan-specific videos
        logger.info("Updating with vegan recipe videos...")
        count2 = scrape_videos("vegan recipes")
        logger.info(f"Added {count2} new videos")
        
        # Update with vegetarian-specific videos
        logger.info("Updating with vegetarian recipe videos...")
        count3 = scrape_videos("vegetarian recipes")
        logger.info(f"Added {count3} new videos")
        
        # Total videos added
        total = count1 + count2 + count3
        logger.info(f"Total new videos added: {total}")
        logger.info("Database update complete!")
        
        return total
    
    except Exception as e:
        logger.error(f"Error updating database: {e}")
        return 0

if __name__ == "__main__":
    # Create logs directory if it doesn't exist
    logs_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')
    os.makedirs(logs_dir, exist_ok=True)
    
    # Update the database
    update_database() 