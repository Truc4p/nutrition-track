#!/usr/bin/env python3
"""
Download and setup USDA FoodData Central database locally.
This script downloads the USDA database and imports it into SQLite.
"""

import requests
import json
import zipfile
import sqlite3
import os
from pathlib import Path
from tqdm import tqdm

# USDA FoodData Central download URL
USDA_DOWNLOAD_URL = "https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_csv_2024-10-31.zip"
DB_PATH = Path(__file__).parent / "usda_foods.db"

def download_file(url, destination):
    """Download file with progress bar."""
    print(f"Downloading from {url}...")
    response = requests.get(url, stream=True)
    total_size = int(response.headers.get('content-length', 0))
    
    with open(destination, 'wb') as file, tqdm(
        desc=destination.name,
        total=total_size,
        unit='iB',
        unit_scale=True,
        unit_divisor=1024,
    ) as progress_bar:
        for data in response.iter_content(chunk_size=1024):
            size = file.write(data)
            progress_bar.update(size)
    
    print(f"Downloaded to {destination}")

def extract_zip(zip_path, extract_to):
    """Extract zip file."""
    print(f"Extracting {zip_path}...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_to)
    print(f"Extracted to {extract_to}")

def create_database():
    """Create SQLite database with optimized schema."""
    print("Creating database...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create foods table (main food items)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS foods (
        fdc_id INTEGER PRIMARY KEY,
        data_type TEXT,
        description TEXT,
        food_category_id INTEGER,
        publication_date TEXT
    )
    ''')
    
    # Create nutrients table (all nutrients)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS nutrients (
        id INTEGER PRIMARY KEY,
        name TEXT,
        unit_name TEXT,
        nutrient_nbr TEXT
    )
    ''')
    
    # Create food_nutrient junction table (food-nutrient relationship)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS food_nutrient (
        id INTEGER PRIMARY KEY,
        fdc_id INTEGER,
        nutrient_id INTEGER,
        amount REAL,
        FOREIGN KEY (fdc_id) REFERENCES foods(fdc_id),
        FOREIGN KEY (nutrient_id) REFERENCES nutrients(id)
    )
    ''')
    
    # Create indexes for fast searching
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_foods_description ON foods(description)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_foods_data_type ON foods(data_type)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_food_nutrient_fdc ON food_nutrient(fdc_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_nutrients_name ON nutrients(name)')
    
    # Create FTS5 virtual table for full-text search
    cursor.execute('''
    CREATE VIRTUAL TABLE IF NOT EXISTS foods_fts USING fts5(
        description,
        content=foods,
        content_rowid=fdc_id
    )
    ''')
    
    conn.commit()
    conn.close()
    print("Database created successfully!")

def import_csv_to_db(csv_dir):
    """Import CSV files into SQLite database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    csv_dir = Path(csv_dir)
    
    # Import foods (limit to relevant data types for speed)
    print("Importing foods...")
    foods_file = csv_dir / "food.csv"
    if foods_file.exists():
        import csv
        with open(foods_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            foods_data = []
            for row in tqdm(reader, desc="Reading foods"):
                # Only import Foundation, SR Legacy, and Survey (FNDDS) foods
                if row['data_type'] in ['foundation_food', 'sr_legacy_food', 'survey_fndds_food']:
                    foods_data.append((
                        int(row['fdc_id']),
                        row['data_type'],
                        row['description'],
                        int(row['food_category_id']) if row['food_category_id'] else None,
                        row['publication_date']
                    ))
            
            cursor.executemany(
                'INSERT OR IGNORE INTO foods VALUES (?, ?, ?, ?, ?)',
                foods_data
            )
            print(f"Imported {len(foods_data)} foods")
    
    # Import nutrients
    print("Importing nutrients...")
    nutrients_file = csv_dir / "nutrient.csv"
    if nutrients_file.exists():
        with open(nutrients_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            nutrients_data = [(
                int(row['id']),
                row['name'],
                row['unit_name'],
                row['nutrient_nbr']
            ) for row in reader]
            
            cursor.executemany(
                'INSERT OR IGNORE INTO nutrients VALUES (?, ?, ?, ?)',
                nutrients_data
            )
            print(f"Imported {len(nutrients_data)} nutrients")
    
    # Import food-nutrient relationships
    print("Importing food-nutrient relationships...")
    food_nutrient_file = csv_dir / "food_nutrient.csv"
    if food_nutrient_file.exists():
        with open(food_nutrient_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            batch_size = 10000
            batch = []
            
            for row in tqdm(reader, desc="Reading food-nutrients"):
                try:
                    batch.append((
                        int(row['id']),
                        int(row['fdc_id']),
                        int(row['nutrient_id']),
                        float(row['amount']) if row['amount'] else 0.0
                    ))
                    
                    if len(batch) >= batch_size:
                        cursor.executemany(
                            'INSERT OR IGNORE INTO food_nutrient VALUES (?, ?, ?, ?)',
                            batch
                        )
                        conn.commit()
                        batch = []
                except (ValueError, KeyError) as e:
                    continue
            
            # Insert remaining batch
            if batch:
                cursor.executemany(
                    'INSERT OR IGNORE INTO food_nutrient VALUES (?, ?, ?, ?)',
                    batch
                )
    
    # Populate FTS table
    print("Building full-text search index...")
    cursor.execute('''
    INSERT INTO foods_fts(rowid, description)
    SELECT fdc_id, description FROM foods
    ''')
    
    conn.commit()
    conn.close()
    print("Database import complete!")

def main():
    """Main function to download and setup USDA database."""
    print("=" * 60)
    print("USDA FoodData Central Database Setup")
    print("=" * 60)
    
    # Create directory if it doesn't exist
    db_dir = Path(__file__).parent
    db_dir.mkdir(parents=True, exist_ok=True)
    
    # Check if database already exists
    if DB_PATH.exists():
        response = input(f"\nDatabase already exists at {DB_PATH}. Overwrite? (y/n): ")
        if response.lower() != 'y':
            print("Aborted.")
            return
        os.remove(DB_PATH)
    
    # Download USDA data
    zip_path = db_dir / "usda_data.zip"
    extract_dir = db_dir / "usda_data"
    
    if not zip_path.exists():
        download_file(USDA_DOWNLOAD_URL, zip_path)
    else:
        print(f"Using existing download: {zip_path}")
    
    # Extract data
    if not extract_dir.exists():
        extract_zip(zip_path, extract_dir)
    else:
        print(f"Using existing extracted data: {extract_dir}")
    
    # Find the CSV directory (it's usually in a subdirectory)
    csv_dirs = list(extract_dir.glob("**/food.csv"))
    if csv_dirs:
        csv_dir = csv_dirs[0].parent
        print(f"Found CSV files in: {csv_dir}")
    else:
        print("Error: Could not find CSV files in extracted data")
        return
    
    # Create and populate database
    create_database()
    import_csv_to_db(csv_dir)
    
    # Get statistics
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM foods")
    food_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM nutrients")
    nutrient_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM food_nutrient")
    relationship_count = cursor.fetchone()[0]
    
    conn.close()
    
    print("\n" + "=" * 60)
    print("Setup Complete!")
    print("=" * 60)
    print(f"Database location: {DB_PATH}")
    print(f"Total foods: {food_count:,}")
    print(f"Total nutrients: {nutrient_count:,}")
    print(f"Total food-nutrient relationships: {relationship_count:,}")
    print(f"\nDatabase size: {DB_PATH.stat().st_size / (1024*1024):.2f} MB")
    print("\nYou can now use the local USDA database for fast food searches!")

if __name__ == "__main__":
    main()


