# Gemini API Setup Guide

This application now uses Google's Gemini AI to intelligently parse food descriptions and match them against the local food nutrition database.

## Setup Instructions

### 1. Get a Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key

### 2. Set Environment Variable
Set the `GEMINI_API_KEY` environment variable:

**On macOS/Linux:**
```bash
export GEMINI_API_KEY="your_api_key_here"
```

**On Windows:**
```cmd
set GEMINI_API_KEY=your_api_key_here
```

**Or create a .env file:**
```
GEMINI_API_KEY=your_api_key_here
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Server
```bash
python server.py
```

## How It Works

1. **User Input**: User enters food description like "I ate 100 grams of Abalone, 200 grams of chicken breast"
2. **Gemini Processing**: The text is sent to Gemini AI which extracts:
   - Food quantities (100, 200)
   - Units (grams, cups, etc.)
   - Food names (Abalone, chicken breast)
3. **Database Matching**: Food names are matched against the local CSV database
4. **Nutrition Calculation**: Nutritional values are calculated based on quantities and database values
5. **Results Display**: Processed nutrition information is displayed to the user

## Features

- **Intelligent Parsing**: Understands natural language food descriptions
- **Flexible Units**: Supports grams, cups, tablespoons, pieces, etc.
- **Fuzzy Matching**: Finds close matches even if food names aren't exact
- **Fallback Processing**: Uses regex-based parsing if Gemini API is unavailable
- **Local Database**: Uses your local food_nutrition_data.csv file

## Example Input
```
"I ate 100 grams of Abalone, 200 grams of Abiyuch, raw, 200 grams of Acerola juice, raw, and 50 grams of stewed Acorn, 100 grams of Adobo"
```

This will be parsed into individual food items with quantities and matched against your database. 