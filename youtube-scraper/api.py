from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import sys
from datetime import datetime
from dotenv import load_dotenv

# Add the current directory to the path so we can import from db
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from db.models import Session, YouTubeVideo
from scripts.scraper import scrape_videos

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/', methods=['GET'])
def index():
    """Root endpoint to show API information."""
    return jsonify({
        'message': 'YouTube Video Scraper API',
        'version': '1.0',
        'endpoints': {
            'GET /api/youtube/videos': 'Get videos with optional query and limit parameters',
            'POST /api/youtube/refresh': 'Refresh video database by scraping new videos',
            'GET /api/youtube/stats': 'Get database statistics'
        },
        'status': 'running'
    })

@app.route('/api/youtube/videos', methods=['GET'])
def get_videos():
    """Get videos from the database with optional filtering."""
    try:
        session = Session()
        
        # Get query parameters
        query = request.args.get('query', '').lower()
        limit = int(request.args.get('limit', 40))
        
        # Base query
        db_query = session.query(YouTubeVideo).filter(YouTubeVideo.is_active == True)
        
        # Apply search filter if provided
        if query:
            search_terms = query.split()
            for term in search_terms:
                db_query = db_query.filter(
                    (YouTubeVideo.title.ilike(f'%{term}%')) | 
                    (YouTubeVideo.description.ilike(f'%{term}%')) |
                    (YouTubeVideo.keywords.ilike(f'%{term}%'))
                )
        
        # Order by publish date (newest first) and limit results
        videos = db_query.order_by(YouTubeVideo.published_at.desc()).limit(limit).all()
        
        # Convert to dictionary format
        results = [video.to_dict() for video in videos]
        
        return jsonify({
            'success': True,
            'count': len(results),
            'results': results
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    
    finally:
        session.close()

@app.route('/api/youtube/refresh', methods=['POST'])
def refresh_videos():
    """Refresh the video database by scraping new videos."""
    try:
        # Get optional search query
        query = request.json.get('query', '') if request.is_json else ''
        
        # Run the scraper
        count = scrape_videos(query)
        
        return jsonify({
            'success': True,
            'message': f'Successfully scraped {count} videos',
            'count': count
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/youtube/stats', methods=['GET'])
def get_stats():
    """Get statistics about the video database."""
    try:
        session = Session()
        
        total_videos = session.query(YouTubeVideo).count()
        active_videos = session.query(YouTubeVideo).filter(YouTubeVideo.is_active == True).count()
        
        # Get the date of the most recent video
        most_recent = session.query(YouTubeVideo).order_by(YouTubeVideo.published_at.desc()).first()
        most_recent_date = most_recent.published_at if most_recent else None
        
        # Get the date of the oldest video
        oldest = session.query(YouTubeVideo).order_by(YouTubeVideo.published_at).first()
        oldest_date = oldest.published_at if oldest else None
        
        return jsonify({
            'success': True,
            'stats': {
                'total_videos': total_videos,
                'active_videos': active_videos,
                'most_recent_video': most_recent_date.isoformat() if most_recent_date else None,
                'oldest_video': oldest_date.isoformat() if oldest_date else None,
                'database_last_updated': datetime.utcnow().isoformat()
            }
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    
    finally:
        session.close()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002) 