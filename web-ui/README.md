# Web UI - Track Nutrition Web Application

A comprehensive web-based nutrition tracking application with AI-powered features, built with vanilla JavaScript and Flask backend.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Frontend Components](#frontend-components)
- [Backend Services](#backend-services)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The web UI is a single-page application (SPA) style interface consisting of 5 main pages, each serving a specific nutrition tracking purpose. The application uses Flask as the backend server and vanilla JavaScript for the frontend, with no framework dependencies.

### Technology Stack

**Backend**:
- Flask (Python web framework)
- Google Gemini API (AI features)
- USDA FoodData Central API
- SQLite (for local databases)

**Frontend**:
- HTML5
- CSS3 (custom design system)
- Vanilla JavaScript (ES6+)
- No frameworks/libraries required

## ✨ Features

### 1. Home - Track Nutrition (`home.html`)

**Food Input Methods**:
- **Text Input**: Natural language parsing ("100g chicken, 150g rice")
- **Image Upload**: Upload meal photos from device
- **Camera Capture**: Take photos directly (mobile)
- **AI Analysis**: Automatic ingredient detection with Gemini Vision

**Food Processing**:
- NLP-based tokenization
- Automatic USDA database matching
- AI-powered food parsing and matching
- Intelligent scoring for best matches

**Nutrition Display**:
- Expandable food cards
- Detailed nutrition breakdown
- 9-category nutrient organization
- Total nutrition calculation

### 2. Search - Food Database (`search.html`)

**Search Functionality**:
- Real-time USDA database search
- Local database support (60x faster)
- Filtered results (Foundation, SR Legacy, Survey only)
- Debounced search (500ms delay)

**Food Management**:
- Add foods with custom quantities
- Remove individual foods
- Clear all functionality
- Running total calculation

**Display Features**:
- Dropdown search results
- Detailed nutrition modal
- Quantity input with validation
- Add/remove buttons

### 3. Meal Search - Recipe & Video Discovery (`meal-search.html`)

**Recipe Features**:
- Search 400+ recipes from Pickup Limes
- Recipe cards with images
- Cooking time display
- Direct links to recipe pages

**Video Features**:
- YouTube nutrition videos
- Search functionality
- Video thumbnails
- Duration and view count
- Channel information

**UI Components**:
- Tab navigation (Recipes/Videos)
- Hero header with gradient
- Grid layout
- Responsive design

### 4. Chat - AI Nutrition Assistant (`chat.html`)

**Chat Features**:
- Real-time AI chatbot (Gemini API)
- Streaming responses
- Message history
- Clear conversation

**Quick Prompts**:
- 8 pre-defined nutrition questions
- One-click prompt insertion
- Common use case coverage

**UI Elements**:
- User/bot message differentiation
- Timestamp display
- Auto-scroll to latest message
- Loading indicators

### 5. Recommend - Personal Nutrition Calculator (`recommend.html`)

**Input Fields**:
- Weight (kg)
- Height (cm)
- Age (years)
- Gender (male/female/other)
- Activity level (5 options)
- Weight goal (maintain/gain/lose)

**Calculations**:
- **BMR**: Mifflin-St Jeor Equation
  - Male: `10 × weight + 6.25 × height - 5 × age + 5`
  - Female: `10 × weight + 6.25 × height - 5 × age - 161`
- **TDEE**: BMR × Activity Multiplier
  - Sedentary: 1.2
  - Lightly Active: 1.375
  - Moderately Active: 1.55
  - Very Active: 1.725
  - Athlete: 1.9
- **Macros**: Based on goal
  - Protein: 1.6-2.2g per kg
  - Fats: 20-35% of calories
  - Carbs: Remainder

**Output**:
- Calorie target
- Macro breakdown
- Micronutrient recommendations
- Organized by 9 nutrient categories

## 🏗️ Architecture

### File Structure

```
web-ui/
├── server.py                 # Flask backend server
├── *.html                    # HTML pages (5 main pages)
├── *.js                      # JavaScript modules (page logic)
├── style.css                 # Main stylesheet
├── nav-bar.html/js          # Shared navigation component
├── images/                   # Static images
├── nutrient-tooltip/        # Nutrient information system
│   ├── nutrient-database.js # Nutrient definitions
│   ├── nutrient-tooltip.js  # Tooltip functionality
│   └── nutrient-tooltip.css # Tooltip styling
└── css-tools/               # CSS optimization tools
```

### Request Flow

```
User Input → Frontend (JavaScript)
           ↓
    API Request (Axios/Fetch)
           ↓
    Flask Server (server.py)
           ↓
    ├─→ NLP Processing (tokenize_by_quantity)
    ├─→ AI Services (Gemini API)
    ├─→ USDA Database (Local or API)
    ├─→ Recipe Database (JSON)
    └─→ YouTube Database (SQLite)
           ↓
    JSON Response
           ↓
    Frontend (Update UI)
```

## 🚀 Installation

### Prerequisites

```bash
# Python 3.8 or higher
python --version

# pip package manager
pip --version
```

### Setup Steps

1. **Install Python Dependencies**:
```bash
cd web-ui
pip install flask flask-cors requests python-dotenv inflect
```

2. **Create Environment File**:
```bash
# Create .env file
touch .env

# Add your API keys
echo "GEMINI_KEY=your_gemini_api_key" >> .env
echo "USDA_API_KEY=your_usda_api_key" >> .env
echo "YOUTUBE_API_KEY=your_youtube_api_key" >> .env
```

3. **Set Up Local USDA Database** (Optional but recommended):
```bash
cd ../usda-database
python download_usda.py
cd ../web-ui
```

4. **Start the Server**:
```bash
python server.py
```

5. **Open in Browser**:
```
http://localhost:5001
```

## 📡 API Documentation

### NLP Endpoints

#### POST `/nlp/process_text/`
Parse natural language food input.

**Request**:
```json
{
  "text": "100g chicken, 150g rice, 50g broccoli"
}
```

**Response**:
```json
{
  "ingredients": [
    {
      "food_name": "chicken",
      "quantity": 100,
      "measurement_type": "g"
    },
    {
      "food_name": "rice",
      "quantity": 150,
      "measurement_type": "g"
    },
    {
      "food_name": "broccoli",
      "quantity": 50,
      "measurement_type": "g"
    }
  ]
}
```

### AI Endpoints

#### POST `/ai/chat`
Chat with AI nutrition assistant.

**Request**:
```json
{
  "userMessage": "What are good protein sources?"
}
```

**Response**:
```json
{
  "recommendation": "Here are excellent protein sources:\n\n🥩 **Animal Sources**:\n- Chicken breast (31g per 100g)..."
}
```

#### POST `/ai/analyze-meal-image`
Analyze meal image for ingredients.

**Request**:
```json
{
  "image": "base64_encoded_image_data",
  "mimeType": "image/jpeg"
}
```

**Response**:
```json
{
  "success": true,
  "analysis": "100g Chicken, broilers or fryers, breast, meat only, raw, 150g Rice, brown, long-grain, cooked, 70g Corn, sweet, yellow, raw"
}
```

#### POST `/ai/parse-and-match-foods`
AI-powered food parsing and USDA matching.

**Request**:
```json
{
  "text": "red bell pepper, grilled chicken, brown rice"
}
```

**Response**:
```json
{
  "success": true,
  "foods": [
    {
      "original_input": {
        "quantity": 100,
        "unit": "g",
        "food_name": "Peppers, sweet, red, raw"
      },
      "usda_food": {
        "fdcId": 170108,
        "description": "Peppers, sweet, red, raw",
        "dataType": "SR Legacy"
      }
    }
  ]
}
```

### USDA Endpoints

#### GET `/api/usda/search`
Search USDA food database (local or API fallback).

**Parameters**:
- `query`: Search term (required)
- `limit`: Max results (default: 20)

**Response**:
```json
{
  "success": true,
  "totalHits": 20,
  "foods": [
    {
      "fdcId": 173688,
      "description": "Fish, salmon, chinook, raw",
      "dataType": "SR Legacy"
    }
  ]
}
```

#### GET `/api/usda/food/:id`
Get detailed nutrition data for a food.

**Response**:
```json
{
  "success": true,
  "food": {
    "fdcId": 173688,
    "description": "Fish, salmon, chinook, raw",
    "dataType": "SR Legacy",
    "foodNutrients": [
      {
        "nutrient": {
          "id": 1003,
          "name": "Protein",
          "unitName": "g"
        },
        "amount": 19.84
      }
    ]
  }
}
```

### Recipe Endpoints

#### GET `/api/recipes/search`
Search recipe database.

**Parameters**:
- `query`: Search term (optional)
- `number`: Max results (default: 40)

**Response**:
```json
{
  "results": [
    {
      "id": 706,
      "title": "Vegan Egg Salad Sandwich",
      "image": "https://www.pickuplimes.com/...",
      "url": "https://www.pickuplimes.com/recipe/...",
      "timeDisplay": "20 min"
    }
  ]
}
```

### YouTube Endpoints

#### GET `/api/youtube/videos`
Get nutrition-related YouTube videos.

**Parameters**:
- `query`: Search term (optional)
- `limit`: Max results (default: 40)

**Response**:
```json
{
  "success": true,
  "count": 40,
  "results": [
    {
      "id": 1,
      "video_id": "abc123",
      "title": "10 Healthy Breakfast Ideas",
      "thumbnail_url": "https://...",
      "duration": 845,
      "channel_title": "Pick Up Limes"
    }
  ]
}
```

## 🎨 Frontend Components

### Navigation Bar (`nav-bar.html/js`)

**Features**:
- Responsive navigation menu
- Active page highlighting
- Mobile hamburger menu
- State management buttons
- Clear state functionality

**State Management**:
```javascript
// Save state to localStorage
window.dispatchEvent(new CustomEvent('savePageState', {
  detail: { pageKey: 'home', saveState: (key, data) => {...} }
}));

// Load state from localStorage
window.dispatchEvent(new CustomEvent('loadPageState', {
  detail: { pageKey: 'home', loadState: (key) => {...} }
}));
```

### Nutrient Tooltip System (`nutrient-tooltip/`)

**Components**:
1. **nutrient-database.js**: 150+ nutrient definitions
2. **nutrient-tooltip.js**: Tooltip display logic
3. **nutrient-tooltip.css**: Tooltip styling

**Features**:
- Hover tooltips for nutrients
- Detailed descriptions
- Health benefits
- Food sources
- Recommended daily intake
- Scientific information

**Usage**:
```html
<span class="nutrient-name" data-nutrient="Vitamin C">Vitamin C</span>
```

### Food Card Component

**Structure**:
```html
<div class="food-card">
  <div class="food-header">
    <h3>Food Name</h3>
    <button class="expand-btn">▼</button>
  </div>
  <div class="food-summary">
    <span>Calories: 200</span>
    <span>Protein: 20g</span>
    <span>Carbs: 30g</span>
    <span>Fats: 5g</span>
  </div>
  <div class="food-details" style="display: none;">
    <!-- Detailed nutrients grouped by category -->
  </div>
</div>
```

**Features**:
- Collapsible/expandable
- Summary view (macros + calories)
- Detailed view (all nutrients)
- Remove button
- Edit quantity (future)

## 🔧 Backend Services

### NLP Service

**Function**: `tokenize_by_quantity(text)`

**Algorithm**:
1. Clean and preprocess text
2. Split by delimiters (comma, "and", period)
3. Match patterns:
   - `100g chicken` (quantity+unit+food)
   - `chicken 100g` (food+quantity+unit)
   - `100 grams of chicken` (with "of")
4. Convert plurals to singular
5. Remove duplicates

**Supported Units**:
- Weight: g, kg, mg, oz, lb
- Volume: ml, l, cup, tbsp, tsp
- Count: piece, serving, slice

### AI Service

**Gemini API Integration**:

**Chat Prompts**:
```python
prompt = f"""You are NutriWise, an expert wellness coach...

User's message: {user_message}

Provide a thoughtful, expert response..."""
```

**Image Analysis Prompts**:
```python
prompt = """Analyze this meal image and estimate the weight in grams...

USDA Naming Rules:
- Vegetables: Use format "[Vegetable name], [type/color], raw"
- Proteins: Use format "[Protein], [cut/part]"
..."""
```

### USDA Service

**Local Database Priority**:
1. Try local SQLite database (fast)
2. Fallback to USDA API if unavailable
3. Cache results in memory

**Smart Matching Algorithm**:
```python
def score_food_match(food, expected_name):
    score = 0
    
    # Prioritize data types
    if food['dataType'] == 'Foundation': score += 1000
    elif food['dataType'] == 'SR Legacy': score += 950
    elif food['dataType'] == 'Branded': score -= 500
    
    # Penalize processed foods
    if 'restaurant' in desc or 'fried' in desc: score -= 800
    
    # Match preparation state
    if 'raw' in expected and 'raw' in desc: score += 200
    
    # Word matching
    matching_words = count_matching_words(expected, desc)
    score += matching_words * 50
    
    return score
```

## ⚙️ Configuration

### Environment Variables (`.env`)

```bash
# Required for AI features
GEMINI_KEY=your_gemini_api_key_here

# Optional (fallback if local DB not available)
USDA_API_KEY=your_usda_api_key_here

# Required for YouTube scraper
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### Server Configuration

```python
# server.py
app.run(
    debug=True,          # Enable debug mode
    host='0.0.0.0',      # Listen on all interfaces
    port=5001            # Port number
)
```

### CORS Configuration

```python
CORS(app)  # Enable CORS for all routes
```

## 🐛 Troubleshooting

### Issue: Server won't start

**Error**: `ModuleNotFoundError: No module named 'flask'`

**Solution**:
```bash
pip install flask flask-cors requests python-dotenv inflect
```

### Issue: AI features not working

**Error**: `Gemini API error: 403`

**Solution**:
1. Check `.env` file exists in `web-ui/` directory
2. Verify `GEMINI_KEY` is set correctly
3. Ensure API key is active at https://makersuite.google.com/app/apikey

### Issue: USDA search very slow

**Solution**:
Set up local database for 60x faster searches:
```bash
cd ../usda-database
python download_usda.py
```

### Issue: "Local USDA database not available"

**Solution**:
This is a warning, not an error. The app will use the USDA API as fallback. To enable local database:
```bash
cd ../usda-database
python download_usda.py
```

### Issue: Images not uploading

**Possible causes**:
1. File size too large (> 10MB)
2. Unsupported format (use JPG/PNG)
3. Browser permissions denied

**Solution**:
- Check browser console for errors
- Reduce image size
- Grant camera/file permissions

### Issue: YouTube videos not loading

**Solution**:
1. Check if YouTube scraper database exists
2. Run the scraper to populate data:
```bash
cd ../youtube-scraper
python -m scripts.scraper
```

## 📊 Performance Tips

### 1. Use Local USDA Database
- 60x faster than API calls
- No rate limits
- Works offline

### 2. Enable Browser Caching
```javascript
// State persistence in localStorage
localStorage.setItem('nutrition_state', JSON.stringify(state));
```

### 3. Debounce Search Input
```javascript
let searchTimeout;
input.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => performSearch(), 500);
});
```

### 4. Lazy Load Images
```html
<img src="placeholder.jpg" data-src="actual-image.jpg" loading="lazy">
```

## 🔐 Security Best Practices

1. **API Keys**: Never commit `.env` file to version control
2. **Input Sanitization**: Server validates all user input
3. **SQL Injection**: Use parameterized queries
4. **CORS**: Configure allowed origins in production
5. **Rate Limiting**: Implement rate limiting for AI endpoints

## 📈 Analytics & Monitoring

### Logging

```python
# Enable detailed logging
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Error Tracking

```javascript
// Frontend error tracking
window.addEventListener('error', (event) => {
  console.error('Error:', event.error);
  // Send to error tracking service
});
```

## 🔄 Updates & Maintenance

### Update USDA Database
```bash
cd usda-database
rm usda_foods.db
python download_usda.py
```

### Update Recipe Database
```bash
cd meal-scraper
python pickup_limes_scraper.py
```

### Update YouTube Videos
```bash
cd youtube-scraper
python -m scripts.scraper
```

## 📚 Additional Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [USDA FoodData Central](https://fdc.nal.usda.gov/)
- [Google Gemini API](https://ai.google.dev/)
- [Mifflin-St Jeor Equation](https://en.wikipedia.org/wiki/Basal_metabolic_rate#Mifflin_St_Jeor_Equation)

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Maintained by**: FYP Development Team
