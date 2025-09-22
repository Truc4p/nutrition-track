from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import datetime

# Create the database engine
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'db', 'youtube_videos.db')
engine = create_engine(f'sqlite:///{DB_PATH}')
Base = declarative_base()

# Define the YouTubeVideo model
class YouTubeVideo(Base):
    __tablename__ = 'youtube_videos'
    
    id = Column(Integer, primary_key=True)
    video_id = Column(String(20), unique=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    channel_id = Column(String(50), nullable=False)
    channel_title = Column(String(100))
    published_at = Column(DateTime)
    thumbnail_url = Column(String(255))
    duration = Column(Integer)  # Duration in seconds
    keywords = Column(String(255))  # Comma-separated keywords
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    def __repr__(self):
        return f"<YouTubeVideo(id={self.id}, video_id='{self.video_id}', title='{self.title}')>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'video_id': self.video_id,
            'title': self.title,
            'description': self.description,
            'channel_id': self.channel_id,
            'channel_title': self.channel_title,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'thumbnail_url': self.thumbnail_url,
            'duration': self.duration,
            'keywords': self.keywords,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_active': self.is_active
        }

# Create all tables
Base.metadata.create_all(engine)

# Create a session factory
Session = sessionmaker(bind=engine) 