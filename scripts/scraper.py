import os
import sys
import json
import datetime
import time
from dotenv import load_dotenv
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db.models import Session, YouTubeVideo

# Load environment variables
load_dotenv()
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')

# Channel IDs
PICKUP_LIMES_CHANNEL_ID = 'UCq2E1mIwUKMWzCA4liA_XGQ'
RAINBOW_PLANT_LIFE_CHANNEL_ID = 'UCDbZvuDA_tZ6XP5wKKFuemQ'

# Food-related keywords for filtering
FOOD_KEYWORDS = [
    'healthy', 'vegan', 'vegetarian', 'plant', 'nutrition', 'diet', 'salad', 
    'smoothie', 'green', 'meal', 'dish', 'recipe', 'cooking', 'food'
]

def build_youtube_client():
    """Build and return a YouTube API client."""
    if not YOUTUBE_API_KEY:
        raise ValueError("YouTube API key not found. Please set YOUTUBE_API_KEY in .env file.")
    
    return build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)

def parse_duration(duration):
    """Parse YouTube duration format (PT4M13S) to seconds."""
    if not duration:
        return 0
    
    import re
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration)
    if not match:
        return 0
    
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)
    
    return hours * 3600 + minutes * 60 + seconds

def is_food_related(title, description):
    """Check if video is food-related based on title and description."""
    title_lower = title.lower()
    description_lower = description.lower()
    
    for keyword in FOOD_KEYWORDS:
        if keyword in title_lower or keyword in description_lower:
            return True
    
    return False

def is_not_shorts(duration, title, description):
    """Check if video is not a YouTube Short."""
    # Filter out videos shorter than 60 seconds
    if duration < 60:
        return False
    
    # Check for shorts indicators in title/description
    title_lower = title.lower()
    description_lower = description.lower()
    
    shorts_indicators = ['#shorts', '#short', 'shorts', 'short']
    for indicator in shorts_indicators:
        if indicator in title_lower or indicator in description_lower:
            return False
    
    return True

def fetch_videos_for_channel(youtube, channel_id, query='', max_results=50):
    """Fetch videos from a specific channel with optional search query."""
    try:
        # Search for videos in the channel
        search_params = {
            'channelId': channel_id,
            'part': 'snippet,id',
            'order': 'date',  # Get most recent videos first
            'maxResults': max_results,
            'type': 'video'
        }
        
        if query:
            search_params['q'] = query
        
        search_response = youtube.search().list(**search_params).execute()
        
        if not search_response.get('items'):
            print(f"No videos found for channel {channel_id}")
            return []
        
        # Get video IDs
        video_ids = [item['id']['videoId'] for item in search_response['items']]
        
        # Get detailed video information
        videos_response = youtube.videos().list(
            part='snippet,contentDetails',
            id=','.join(video_ids)
        ).execute()
        
        videos = []
        for video in videos_response.get('items', []):
            # Parse duration
            duration = parse_duration(video['contentDetails']['duration'])
            
            # Check if video is food-related and not a short
            if (is_food_related(video['snippet']['title'], video['snippet']['description']) and
                is_not_shorts(duration, video['snippet']['title'], video['snippet']['description'])):
                
                videos.append({
                    'video_id': video['id'],
                    'title': video['snippet']['title'],
                    'description': video['snippet']['description'],
                    'channel_id': video['snippet']['channelId'],
                    'channel_title': video['snippet']['channelTitle'],
                    'published_at': video['snippet']['publishedAt'],
                    'thumbnail_url': video['snippet']['thumbnails']['high']['url'],
                    'duration': duration,
                    'keywords': ','.join(FOOD_KEYWORDS)
                })
        
        return videos
    
    except HttpError as e:
        print(f"An HTTP error {e.resp.status} occurred: {e.content}")
        return []

def save_videos_to_db(videos):
    """Save videos to the database."""
    session = Session()
    
    try:
        added = 0
        for video_data in videos:
            # Check if video already exists
            existing = session.query(YouTubeVideo).filter_by(video_id=video_data['video_id']).first()
            if existing:
                # Update existing video
                for key, value in video_data.items():
                    if key != 'video_id':  # Don't update the primary key
                        setattr(existing, key, value)
                existing.updated_at = datetime.datetime.utcnow()
            else:
                # Create new video entry
                if 'published_at' in video_data and video_data['published_at']:
                    # Convert ISO format to datetime object
                    video_data['published_at'] = datetime.datetime.fromisoformat(
                        video_data['published_at'].replace('Z', '+00:00')
                    )
                
                video = YouTubeVideo(**video_data)
                session.add(video)
                added += 1
        
        session.commit()
        return added
    
    except Exception as e:
        session.rollback()
        print(f"Error saving videos to database: {e}")
        return 0
    
    finally:
        session.close()

def scrape_videos(query=''):
    """Main function to scrape videos from both channels."""
    try:
        youtube = build_youtube_client()
        
        # Fetch videos from both channels
        pickup_limes_videos = fetch_videos_for_channel(youtube, PICKUP_LIMES_CHANNEL_ID, query)
        rainbow_plant_life_videos = fetch_videos_for_channel(youtube, RAINBOW_PLANT_LIFE_CHANNEL_ID, query)
        
        # Combine results
        all_videos = pickup_limes_videos + rainbow_plant_life_videos
        
        # Save to database
        added_count = save_videos_to_db(all_videos)
        
        print(f"Scraped {len(all_videos)} videos, added {added_count} new videos to database")
        return len(all_videos)
    
    except Exception as e:
        print(f"Error scraping videos: {e}")
        return 0

if __name__ == "__main__":
    # Get optional search query from command line
    query = sys.argv[1] if len(sys.argv) > 1 else ''
    scrape_videos(query) 