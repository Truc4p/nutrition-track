#!/usr/bin/env python3
"""
Setup script for the YouTube scraper project.
This script creates necessary directories and initializes the environment.
"""

import os
import sys
import shutil
from pathlib import Path

def setup_project():
    """Set up the YouTube scraper project."""
    print("Setting up YouTube scraper project...")
    
    # Get the project root directory
    project_root = Path(__file__).parent.absolute()
    
    # Create necessary directories
    dirs = ['logs', 'db']
    for dir_name in dirs:
        dir_path = project_root / dir_name
        if not dir_path.exists():
            print(f"Creating directory: {dir_path}")
            dir_path.mkdir(parents=True, exist_ok=True)
    
    # Create .env file from .env.example if it doesn't exist
    env_file = project_root / '.env'
    env_example = project_root / '.env.example'
    if not env_file.exists() and env_example.exists():
        print("Creating .env file from .env.example...")
        shutil.copy(env_example, env_file)
        print("Please edit the .env file to add your YouTube API key.")
    
    print("\nSetup complete!")
    print("\nNext steps:")
    print("1. Edit the .env file to add your YouTube API key")
    print("2. Install dependencies: pip install -r requirements.txt")
    print("3. Initialize the database: python -m scripts.init_db")
    print("4. Start the API server: python api.py")

if __name__ == "__main__":
    setup_project() 