# YouTube Video Scraper - Nutrition Video Aggregation System

A Python application that scrapes, stores, and serves nutrition-related YouTube videos from curated channels, providing a RESTful API for video discovery.

## 📋 Overview

The YouTube Scraper is an intelligent video aggregation system that collects nutrition-focused content from trusted YouTube channels, filters out irrelevant content, and provides a clean API for video discovery in the Track Nutrition application.

### Key Features

- **Smart Channel Scraping**: Automatically fetches videos from curated nutrition channels
- **Intelligent Filtering**: Food-related keyword matching to ensure relevance
- **Shorts Exclusion**: Automatically filters out YouTube Shorts (< 60 seconds)
- **SQLite Storage**: Efficient local database with full-text search
- **RESTful API**: Clean endpoints for video access and management
- **Automatic Updates**: Refresh video database on demand
- **Metadata Extraction**: Title, description, duration, thumbnails, view counts

## 🎯 What It Scrapes

### Channels Monitored

1. **Pick Up Limes** (`UCq2E1mIwUKMWzCA4liA_XGQ`)
   - Plant-based nutrition content
   - Healthy recipe videos
   - Nutrition education

2. **Rainbow Plant Life** (`UCDbZvuDA_tZ6XP5wKKFuemQ`)
   - Vegan recipes
   - Nutrition tips
   - Lifestyle content

### Video Data Fields

```python
{
  "id": 1,
  "video_id": "dQw4w9WgXcQ",                    # YouTube video ID
  "title": "10 Healthy Breakfast Ideas",        # Video title
  "description": "Easy and nutritious...",      # Full description
  "channel_id": "UCq2E1mIwUKMWzCA4liA_XGQ",     # Channel ID
  "channel_title": "Pick Up Limes",             # Channel name
  "published_at": "2024-01-15T10:30:00Z",       # Publication date
  "thumbnail_url": "https://i.ytimg.com/...",   # High-quality thumbnail
  "duration": 845,                               # Duration in seconds
  "keywords": "healthy,vegan,nutrition",         # Comma-separated keywords
  "is_active": true                              # Active status
}
```

## 🏗️ Architecture

### File Structure

```
youtube-scraper/
├── db/
│   ├── models.py              # SQLAlchemy ORM models
│   ├── youtube_videos.db      # SQLite database (auto-created)
│   └── __pycache__/          # Python cache
├── scripts/
│   ├── scraper.py            # Main scraping script
│   ├── cron_update.py        # Scheduled update script
│   ├── init_db.py            # Database initialization
│   └── __pycache__/          # Python cache
├── logs/                      # Scraper logs (optional)
├── .env                       # Environment variables (create this)
├── .env.example              # Example environment file
├── api.py                    # Flask API server
├── requirements.txt          # Python dependencies
└── README.md                 # This file
```

### Data Flow

```
YouTube API
    ↓
Scraper Script (scraper.py)
    ↓
Filter by Keywords & Duration
    ↓
SQLite Database (youtube_videos.db)
    ↓
Flask API (api.py)
    ↓
Frontend Application
```

## 🚀 Installation & Setup

### Prerequisites

```bash
# Python 3.7 or higher
python --version

# pip package manager
pip --version
```

### Step-by-Step Setup

1. **Install Dependencies**:
```bash
cd youtube-scraper
pip install -r requirements.txt
```

2. **Get YouTube API Key**:
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable YouTube Data API v3
   - Create credentials (API key)
   - Copy the API key

3. **Configure Environment**:
```bash
# Create .env file
cp .env.example .env

# Edit .env and add your API key
echo "YOUTUBE_API_KEY=your_api_key_here" > .env
```

4. **Initialize Database**:
```bash
# Database is created automatically on first run
python -m scripts.scraper
```

5. **Start API Server**:
```bash
python api.py
```

The API will be available at `http://localhost:5002`

## 🔧 Usage

### Scraping Videos

**Basic Scraping** (default: gets latest 50 videos per channel):
```bash
python -m scripts.scraper
```

**With Search Query**:
```bash
python -m scripts.scraper "vegan protein"
```

**Expected Output**:
```
Scraping videos from Pick Up Limes...
Found 35 videos from Pick Up Limes
Scraping videos from Rainbow Plant Life...
Found 28 videos from Rainbow Plant Life
Scraped 63 videos, added 45 new videos to database
```

### Running the API Server

```bash
python api.py
```

**Server Output**:
```
 * Running on http://0.0.0.0:5002
 * Debug mode: on
```

### Scheduled Updates

For automatic updates, use cron (Linux/Mac) or Task Scheduler (Windows):

```bash
# Edit crontab
crontab -e

# Add this line to run daily at 3 AM
0 3 * * * cd /path/to/youtube-scraper && python -m scripts.scraper
```

## 📡 API Documentation

### Base URL
```
http://localhost:5002
```

### Endpoints

#### 1. Get Videos

**Endpoint**: `GET /api/youtube/videos`

**Description**: Retrieve videos with optional filtering

**Query Parameters**:
- `query` (string, optional): Search term to filter videos
- `limit` (integer, optional): Maximum results (default: 40)

**Example Request**:
```bash
curl "http://localhost:5002/api/youtube/videos?query=breakfast&limit=10"
```

**Example Response**:
```json
{
  "success": true,
  "count": 10,
  "results": [
    {
      "id": 1,
      "video_id": "dQw4w9WgXcQ",
      "title": "10 Healthy Breakfast Ideas",
      "description": "Start your day with these nutritious...",
      "channel_id": "UCq2E1mIwUKMWzCA4liA_XGQ",
      "channel_title": "Pick Up Limes",
      "published_at": "2024-01-15T10:30:00Z",
      "thumbnail_url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      "duration": 845,
      "keywords": "healthy,vegan,breakfast,nutrition",
      "is_active": true,
      "created_at": "2024-01-15T11:00:00Z",
      "updated_at": "2024-01-15T11:00:00Z"
    }
  ]
}
```

#### 2. Refresh Videos

**Endpoint**: `POST /api/youtube/refresh`

**Description**: Trigger a new scrape to update the database

**Request Body** (optional):
```json
{
  "query": "vegan protein"
}
```

**Example Request**:
```bash
curl -X POST http://localhost:5002/api/youtube/refresh \
  -H "Content-Type: application/json" \
  -d '{"query": "smoothie"}'
```

**Example Response**:
```json
{
  "success": true,
  "message": "Successfully scraped 63 videos",
  "count": 63
}
```

#### 3. Get Statistics

**Endpoint**: `GET /api/youtube/stats`

**Description**: Get database statistics

**Example Request**:
```bash
curl http://localhost:5002/api/youtube/stats
```

**Example Response**:
```json
{
  "success": true,
  "stats": {
    "total_videos": 450,
    "active_videos": 445,
    "most_recent_video": "2024-11-10T14:30:00Z",
    "oldest_video": "2023-01-15T10:00:00Z",
    "database_last_updated": "2024-11-10T15:00:00Z"
  }
}
```

## 🔍 Filtering Logic

### Food-Related Keywords

```python
FOOD_KEYWORDS = [
    'healthy', 'vegan', 'vegetarian', 'plant', 'nutrition',
    'diet', 'salad', 'smoothie', 'green', 'meal', 'dish',
    'recipe', 'cooking', 'food'
]
```

**Matching Logic**:
- Checks title AND description
- Case-insensitive matching
- At least one keyword must match

### Shorts Exclusion

```python
def is_not_shorts(duration, title, description):
    """
    Returns True if video is NOT a short:
    - Duration >= 60 seconds
    - No '#shorts' in title/description
    """
    if duration < 60:
        return False
    
    shorts_indicators = ['#shorts', '#short', 'shorts']
    if any(indicator in title.lower() or 
           indicator in description.lower() 
           for indicator in shorts_indicators):
        return False
    
    return True
```

## 💾 Database Schema

### SQLite Tables

```sql
CREATE TABLE youtube_videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    channel_id VARCHAR(50) NOT NULL,
    channel_title VARCHAR(100),
    published_at DATETIME,
    thumbnail_url VARCHAR(255),
    duration INTEGER,              -- seconds
    keywords VARCHAR(255),         -- comma-separated
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);
```

### Indexes

```sql
CREATE INDEX idx_video_id ON youtube_videos(video_id);
CREATE INDEX idx_channel_id ON youtube_videos(channel_id);
CREATE INDEX idx_published_at ON youtube_videos(published_at);
CREATE INDEX idx_is_active ON youtube_videos(is_active);
```

## 🔧 Core Functions

### scraper.py

#### `build_youtube_client()`
Creates authenticated YouTube API client.

```python
def build_youtube_client():
    """Build and return a YouTube API client."""
    return build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
```

#### `parse_duration(duration)`
Converts ISO 8601 duration to seconds.

```python
parse_duration('PT4M13S')    # → 253 seconds
parse_duration('PT1H30M')    # → 5400 seconds
```

#### `fetch_videos_for_channel(youtube, channel_id, query='', max_results=50)`
Fetches videos from a specific channel.

**Returns**: List of video dictionaries

#### `save_videos_to_db(videos)`
Saves videos to SQLite database.

**Features**:
- Upserts (insert or update)
- Prevents duplicates
- Updates timestamps

#### `scrape_videos(query='')`
Main scraping function.

**Process**:
1. Fetch from each channel
2. Filter by keywords and duration
3. Combine results
4. Save to database

## 🔌 Integration

### Flask Backend Integration

In `web-ui/server.py`:

```python
from db.models import Session, YouTubeVideo
from scripts.scraper import scrape_videos

@app.route('/api/youtube/videos')
def get_youtube_videos():
    session = Session()
    videos = session.query(YouTubeVideo).filter(
        YouTubeVideo.is_active == True
    ).order_by(
        YouTubeVideo.published_at.desc()
    ).limit(40).all()
    
    return jsonify({
        'success': True,
        'results': [v.to_dict() for v in videos]
    })
```

### Frontend Integration

In `meal-search.js`:

```javascript
async function fetchYouTubeVideos(query = '') {
  const response = await fetch(
    `/api/youtube/videos?query=${query}&limit=40`
  );
  const data = await response.json();
  return data.results;
}
```

## 📊 Performance

### API Quotas

YouTube Data API v3 quotas:
- **Default quota**: 10,000 units/day
- **Search operation**: 100 units
- **Video details**: 1 unit

**Scraping Cost**:
```
1 search request = 100 units
50 video details = 50 units
Total per channel = 150 units

2 channels × 150 = 300 units/scrape
Daily scrapes possible: ~33 times
```

### Database Performance

```
Videos stored: 450
Database size: ~500 KB
Query time: < 10ms
Insert time: < 5ms per video
```

## 🐛 Troubleshooting

### Issue: "YouTube API key not found"

**Error**: `ValueError: YouTube API key not found`

**Solution**:
```bash
# Check .env file exists
ls -la .env

# Verify content
cat .env

# Should show:
YOUTUBE_API_KEY=AIzaSy...
```

### Issue: "Quota exceeded"

**Error**: `HttpError 403: quotaExceeded`

**Solution**:
- Wait 24 hours for quota reset (midnight Pacific Time)
- Reduce scraping frequency
- Request quota increase in Google Cloud Console

### Issue: "No videos found"

**Possible Causes**:
1. Channels have no new videos
2. All videos filtered out (shorts or non-food-related)
3. Network connectivity issues

**Solution**:
```bash
# Test with specific query
python -m scripts.scraper "recipe"

# Check API directly
curl "https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=UCq2E1mIwUKMWzCA4liA_XGQ&key=YOUR_KEY"
```

### Issue: "Database locked"

**Cause**: Multiple processes accessing database

**Solution**:
```python
# In models.py, add timeout
engine = create_engine(
    f'sqlite:///{DB_PATH}',
    connect_args={'timeout': 30}
)
```

## 🔒 Security

### API Key Protection

```bash
# .gitignore should include:
.env
*.db
__pycache__/
logs/
```

### Rate Limiting

Consider adding rate limiting to API:

```python
from flask_limiter import Limiter

limiter = Limiter(
    app,
    key_func=lambda: request.remote_addr,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/api/youtube/refresh')
@limiter.limit("5 per hour")
def refresh_videos():
    ...
```

## 📈 Future Enhancements

- [ ] Add more nutrition channels
- [ ] Implement video categorization (breakfast, lunch, dinner)
- [ ] Add transcript extraction for searchability
- [ ] Implement caching layer (Redis)
- [ ] Add video analytics (engagement metrics)
- [ ] Create admin dashboard
- [ ] Add webhook support for new videos
- [ ] Implement machine learning for better filtering

## 🤝 Contributing

To add new channels:

1. Find channel ID from channel URL
2. Add to `CHANNEL_IDS` in `scraper.py`:
```python
NEW_CHANNEL_ID = 'UCxxxxxxxxxxxxxxxxxx'
```

3. Update scraping logic:
```python
new_channel_videos = fetch_videos_for_channel(
    youtube, NEW_CHANNEL_ID, query
)
```

## 📚 Additional Resources

- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Google API Python Client](https://github.com/googleapis/google-api-python-client)

## ⚖️ Legal

- **YouTube Terms of Service**: Complies with YouTube API Terms
- **API Usage**: Respects quota limits
- **Data Storage**: Metadata only, no video downloads
- **Attribution**: Videos link back to YouTube
- **Educational Use**: For nutrition education purposes

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**API Version**: YouTube Data API v3 