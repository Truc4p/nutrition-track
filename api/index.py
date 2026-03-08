"""
Vercel serverless function entry point
This file imports and exposes the Flask app from web-ui/server.py
"""
import sys
import os
import importlib.util

# Get the project root directory
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Add paths for imports
sys.path.insert(0, project_root)
sys.path.insert(0, os.path.join(project_root, 'web-ui'))
sys.path.insert(0, os.path.join(project_root, 'youtube-scraper'))

# Change working directory to web-ui so relative paths work
os.chdir(os.path.join(project_root, 'web-ui'))

# Import server.py using importlib (because web-ui has a hyphen)
server_path = os.path.join(project_root, 'web-ui', 'server.py')
spec = importlib.util.spec_from_file_location("server", server_path)
server = importlib.util.module_from_spec(spec)
spec.loader.exec_module(server)

# Export the Flask app for Vercel
app = server.app

# Vercel will automatically use this 'app' object


