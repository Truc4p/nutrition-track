#!/usr/bin/env python3
"""
Simple script to browse the YouTube videos database
"""
import sqlite3
import sys
from datetime import datetime

def connect_db():
    """Connect to the database"""
    return sqlite3.connect('db/youtube_videos.db')

def show_stats():
    """Show database statistics"""
    conn = connect_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM youtube_videos")
    total = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM youtube_videos WHERE is_active = 1")
    active = cursor.fetchone()[0]
    
    cursor.execute("SELECT channel_title, COUNT(*) FROM youtube_videos GROUP BY channel_title")
    channels = cursor.fetchall()
    
    cursor.execute("SELECT MIN(published_at), MAX(published_at) FROM youtube_videos")
    date_range = cursor.fetchone()
    
    print("📊 DATABASE STATISTICS")
    print("=" * 50)
    print(f"Total videos: {total}")
    print(f"Active videos: {active}")
    print(f"Date range: {date_range[0]} to {date_range[1]}")
    print("\nVideos by channel:")
    for channel, count in channels:
        print(f"  • {channel}: {count} videos")
    print()
    
    conn.close()

def show_recent_videos(limit=10):
    """Show recent videos"""
    conn = connect_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT title, channel_title, published_at, duration, video_id 
        FROM youtube_videos 
        ORDER BY published_at DESC 
        LIMIT ?
    """, (limit,))
    
    videos = cursor.fetchall()
    
    print(f"🎥 {limit} MOST RECENT VIDEOS")
    print("=" * 50)
    
    for i, (title, channel, published, duration, video_id) in enumerate(videos, 1):
        duration_min = duration // 60 if duration else 0
        duration_sec = duration % 60 if duration else 0
        published_date = published.split()[0] if published else "Unknown"
        
        print(f"{i:2d}. {title[:60]}{'...' if len(title) > 60 else ''}")
        print(f"    📺 {channel} | 📅 {published_date} | ⏱️  {duration_min}:{duration_sec:02d}")
        print(f"    🔗 https://youtube.com/watch?v={video_id}")
        print()
    
    conn.close()

def search_videos(query):
    """Search videos by title or description"""
    conn = connect_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT title, channel_title, published_at, video_id 
        FROM youtube_videos 
        WHERE title LIKE ? OR description LIKE ?
        ORDER BY published_at DESC
    """, (f'%{query}%', f'%{query}%'))
    
    videos = cursor.fetchall()
    
    print(f"🔍 SEARCH RESULTS FOR '{query}' ({len(videos)} found)")
    print("=" * 50)
    
    for i, (title, channel, published, video_id) in enumerate(videos, 1):
        published_date = published.split()[0] if published else "Unknown"
        print(f"{i:2d}. {title}")
        print(f"    📺 {channel} | 📅 {published_date}")
        print(f"    🔗 https://youtube.com/watch?v={video_id}")
        print()
    
    conn.close()

def interactive_menu():
    """Interactive menu for browsing the database"""
    while True:
        print("\n" + "=" * 60)
        print("🎥 YOUTUBE VIDEOS DATABASE BROWSER")
        print("=" * 60)
        print("1. Show database statistics")
        print("2. Show recent videos (default: 10)")
        print("3. Search videos")
        print("4. Show all videos from a channel")
        print("5. Exit")
        print("-" * 60)
        
        choice = input("Enter your choice (1-5): ").strip()
        
        if choice == '1':
            show_stats()
        elif choice == '2':
            try:
                limit = input("How many videos to show? (default: 10): ").strip()
                limit = int(limit) if limit else 10
                show_recent_videos(limit)
            except ValueError:
                show_recent_videos(10)
        elif choice == '3':
            query = input("Enter search term: ").strip()
            if query:
                search_videos(query)
        elif choice == '4':
            show_channels()
        elif choice == '5':
            print("👋 Goodbye!")
            break
        else:
            print("❌ Invalid choice. Please try again.")

def show_channels():
    """Show videos by channel"""
    conn = connect_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT DISTINCT channel_title FROM youtube_videos ORDER BY channel_title")
    channels = [row[0] for row in cursor.fetchall()]
    
    print("\n📺 AVAILABLE CHANNELS:")
    for i, channel in enumerate(channels, 1):
        print(f"{i}. {channel}")
    
    try:
        choice = int(input(f"\nSelect channel (1-{len(channels)}): ")) - 1
        if 0 <= choice < len(channels):
            selected_channel = channels[choice]
            
            cursor.execute("""
                SELECT title, published_at, video_id 
                FROM youtube_videos 
                WHERE channel_title = ?
                ORDER BY published_at DESC
            """, (selected_channel,))
            
            videos = cursor.fetchall()
            
            print(f"\n🎥 VIDEOS FROM {selected_channel} ({len(videos)} videos)")
            print("=" * 50)
            
            for i, (title, published, video_id) in enumerate(videos, 1):
                published_date = published.split()[0] if published else "Unknown"
                print(f"{i:2d}. {title}")
                print(f"    📅 {published_date} | 🔗 https://youtube.com/watch?v={video_id}")
                print()
        else:
            print("❌ Invalid selection.")
    except ValueError:
        print("❌ Invalid input.")
    
    conn.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "stats":
            show_stats()
        elif sys.argv[1] == "recent":
            limit = int(sys.argv[2]) if len(sys.argv) > 2 else 10
            show_recent_videos(limit)
        elif sys.argv[1] == "search":
            query = " ".join(sys.argv[2:])
            search_videos(query)
        else:
            print("Usage: python browse_db.py [stats|recent [limit]|search query]")
    else:
        interactive_menu() 