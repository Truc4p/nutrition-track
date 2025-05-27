# Recipe Web UI

This web application displays recipes from the Pickup Limes database. It replaces the previous implementation that used the Spoonacular API.

## Setup

1. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the Flask server:
   ```
   python server.py
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

## Features

- Search recipes by keyword
- Filter by cuisine and diet
- View detailed recipe information including:
  - Ingredients
  - Instructions
  - Nutritional information
- View Pick Up Limes YouTube videos

## Database Structure

The application uses the local Pickup Limes database located at:
```
../meal/pickup_limes_database/
```

This includes:
- recipe_database.json - Contains full recipe details
- recipe_index.json - Contains recipe metadata for faster searching
- images/ - Contains recipe images
