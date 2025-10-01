# YouTube Video Scraper

A Python application that scrapes and stores YouTube videos from specific channels, providing an API to access the data.

## Features

- Scrapes videos from specified YouTube channels (currently Pick Up Limes and Rainbow Plant Life)
- Filters videos based on food-related keywords
- Excludes YouTube Shorts
- Stores video data in SQLite database
- Provides RESTful API to access the video data

## Project Structure

```
youtube-scraper/
├── db/
│   ├── models.py           # SQLAlchemy models
│   └── youtube_videos.db   # SQLite database (created automatically)
├── scripts/
│   └── scraper.py          # YouTube scraping script
├── .env                    # Environment variables (create from .env.example)
├── .env.example            # Example environment file
├── api.py                  # Flask API server
└── requirements.txt        # Python dependencies
```

## Setup

1. Clone the repository
2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Create `.env` file from `.env.example` and add your YouTube API key:
   ```
   cp .env.example .env
   # Edit .env and add your YouTube API key
   ```

## Usage

### Initial Data Collection

Run the scraper to collect initial data:

```
python -m scripts.scraper
```

You can also specify a search query:

```
python -m scripts.scraper "vegan recipe"
```

### Running the API Server

Start the Flask API server:

```
python api.py
```

The server will run on http://localhost:5002 by default.

## API Endpoints

- `GET /api/youtube/videos` - Get videos with optional filtering
  - Query parameters:
    - `query`: Search term (optional)
    - `limit`: Maximum number of videos to return (default: 40)
  
- `POST /api/youtube/refresh` - Refresh the video database by scraping new videos
  - Request body (optional):
    ```json
    {
      "query": "search term"
    }
    ```

- `GET /api/youtube/stats` - Get statistics about the video database

## Integration with Main Application

To integrate with the main application, update the `meal-search.js` file to fetch videos from this API instead of directly from YouTube.

## License

This project is licensed under the MIT License. 