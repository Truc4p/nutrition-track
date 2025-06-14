  -- Get videos by channel
--   SELECT title, published_at FROM youtube_videos 
--   WHERE channel_title = 'Pick Up Limes' 
--   ORDER BY published_at DESC;
  
  -- Search for specific topics
  SELECT title, channel_title, published_at FROM youtube_videos 
  WHERE title LIKE '%salad%' OR description LIKE '%salad%';
  
  -- Get video statistics
--   SELECT channel_title, COUNT(*) as video_count, 
--          AVG(duration) as avg_duration 
--   FROM youtube_videos 
--   GROUP BY channel_title;