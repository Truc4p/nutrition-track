# Track Nutrition - AI-Powered Nutrition Tracking Platform

## Overview

**Track Nutrition** is a comprehensive multi-platform nutrition tracking and analysis system that combines AI-powered food recognition, USDA nutritional database, recipe discovery, YouTube content integration, and personalized nutrition recommendations. The platform features a web interface, mobile app (React Native), and multiple backend services for data scraping and management.

## Platform Compatibility

### Web Application Browser Support
- **Chrome**: Version 90+ (recommended)
- **Firefox**: Version 88+
- **Safari**: Version 14+
- **Edge**: Version 90+
- **Opera**: Version 76+

**Minimum Requirements:**
- JavaScript enabled
- Cookies and local storage enabled
- Modern CSS support (Flexbox, Grid)
- Canvas API for image processing
- File API for image uploads
- ES6+ JavaScript support

### Mobile Application Support
- **iOS**: Version 13.0 and above
  - iPhone 6s and newer
  - iPad 5th generation and newer
  - iPad Air 2 and newer
  - iPad Pro (all models)
  - iPad mini 4 and newer
- **Android**: Version 5.0 (Lollipop, API Level 21) and above
  - Minimum 2GB RAM recommended
  - OpenGL ES 2.0 support
  - 64-bit and 32-bit architectures supported

**Mobile Features:**
- Native camera and gallery access
- Photo capture and upload
- AsyncStorage for offline data
- Expo Camera integration
- Expo Image Picker support
- Native charts rendering

## Project Architecture

```
track-nutrition/
├── web-ui/                    # Main Flask web application
├── mobile-app/                # React Native Expo mobile app
├── usda-database/            # Local USDA FoodData Central database
├── meal-scraper/             # Recipe scraper (Pickup Limes)
└── youtube-scraper/          # YouTube video scraper & API
```

## Technology Stack

### Web-UI (Flask Backend + Vanilla JS Frontend)
- **Backend**: Python Flask with Flask-CORS
- **AI Integration**: 
  - Google Gemini 2.0 Flash (Text & Vision APIs)
  - Natural Language Processing for food parsing
- **Database**: 
  - USDA FoodData Central API + Local SQLite
  - Pickup Limes recipe database (JSON)
  - YouTube videos SQLite database
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **HTTP Client**: Axios

### Mobile App (Cross-Platform)
- **Framework**: React Native 0.81.5 with Expo ~54.0.20
- **Language**: TypeScript 5.9.2
- **Navigation**: React Navigation 7.x (Bottom Tabs + Stack)
- **Camera**: Expo Camera 17.0.8
- **Image Handling**: Expo Image Picker 17.0.8
- **Charts**: react-native-chart-kit 6.12.0
- **HTTP Client**: Axios 1.13.1

### Data Scrapers & Services

#### USDA Database Service
- **Language**: Python 3.x
- **Database**: SQLite with FTS5 full-text search
- **Libraries**: requests, tqdm, sqlite3
- **Data Source**: USDA FoodData Central CSV dataset

#### Meal Scraper (Pickup Limes)
- **Language**: Python 3.x
- **Libraries**: BeautifulSoup4, requests
- **Output Format**: JSON + CSV
- **Storage**: Local file system with images

#### YouTube Scraper
- **Language**: Python 3.x
- **Database**: SQLite (SQLAlchemy ORM)
- **API**: Flask RESTful API
- **Libraries**: google-api-python-client, python-dotenv

## Project Structure

### Web-UI Module
```
web-ui/
├── server.py                  # Main Flask server (Port 5001)
├── requirements.txt           # Python dependencies
├── package.json              # Node.js scripts (CSS tools)
│
├── HTML Pages/
│   ├── home.html             # Track nutrition (main page)
│   ├── search.html           # USDA food database search
│   ├── meal-search.html      # Recipe & video discovery
│   ├── chat.html             # AI nutrition assistant
│   ├── recommend.html        # Personal nutrition calculator with health advice
│   ├── float-chat.html       # Floating chat widget
│   └── nav-bar.html          # Navigation component
│
├── JavaScript/
│   ├── home.js               # Food tracking logic
│   ├── search.js             # USDA search functionality
│   ├── meal-search.js        # Recipe/video browsing
│   ├── chat.js               # Chatbot interface
│   ├── recommend.js          # Nutrition calculator
│   ├── float-chat.js         # Floating chat logic
│   ├── nav-bar.js            # Navigation logic
│   └── chatbot-service.js    # Chatbot service layer
│
├── CSS/
│   ├── style.css             # Main stylesheet
│   └── nutrient-tooltip/     # Nutrient tooltip styles
│       └── nutrient-tooltip.css
│
├── css-tools/                # CSS optimization tools
│   ├── purge-css.js          # PurgeCSS for unused CSS
│   ├── css-cleanup-analyzer.js
│   └── css-compare.js
│
├── Documentation/
│   ├── NUTRITION_REFERENCES.md        # Technical academic references
│   ├── NUTRITION_REFERENCES_USER.md   # User-friendly academic references
│   ├── VERIFICATION_REPORT.md         # Code verification against sources
│   ├── HEALTH_ADVICE_FEATURE.md       # Health advice feature docs
│   └── VISUAL_GUIDE.md                # Visual diagrams and layouts
│
├── images/                   # Static assets
└── __pycache__/             # Python cache
```

### Mobile App Module
```
mobile-app/
├── App.tsx                   # Root component
├── index.ts                  # Entry point
├── app.json                  # Expo configuration
├── tsconfig.json             # TypeScript config
├── package.json              # Dependencies
│
├── src/
│   ├── constants/
│   │   ├── colors.ts         # Color theme system
│   │   └── api.ts            # API endpoints configuration
│   │
│   ├── navigation/
│   │   └── AppNavigator.tsx  # Tab navigation setup
│   │
│   ├── screens/              # Main app screens
│   │   ├── HomeScreen.tsx    # Track nutrition
│   │   ├── SearchScreen.tsx  # Food database search
│   │   ├── MealSearchScreen.tsx # Recipes & videos
│   │   ├── ChatScreen.tsx    # AI assistant
│   │   └── RecommendScreen.tsx # Personal calculator
│   │
│   ├── services/
│   │   └── api.ts            # API service functions
│   │
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   │
│   └── utils/
│       └── nutrientUtils.ts  # Nutrient grouping utilities
│
├── assets/                   # App icons and images
├── .expo/                    # Expo build cache
├── README.md                 # Full documentation
├── QUICKSTART.md            # Quick start guide
└── PROJECT_SUMMARY.md       # Feature summary
```

### USDA Database Module
```
usda-database/
├── download_usda.py          # Database setup script
├── usda_search.py            # Search interface module
├── requirements.txt          # Python dependencies
├── usda_foods.db            # SQLite database (~300MB)
├── usda_data/               # Downloaded CSV files
│   ├── food.csv
│   ├── nutrient.csv
│   └── food_nutrient.csv
├── README.md                # Setup documentation
└── QUICKSTART.md           # Quick reference
```

### Meal Scraper Module
```
meal-scraper/
├── pickup_limes_scraper.py   # Main scraper script
├── recipe_viewer.py          # Recipe browser tool
├── fix_problematic_entries.py # Data cleaning
├── verify_clean.py           # Data validation
├── recipe_collection.html    # Recipe display
│
└── pickup_limes_database/    # Scraped data
    ├── json/                 # JSON format
    │   ├── pickup_limes_all_recipes_detailed.json
    │   └── pickup_limes_all_recipes_detailed_clean.json
    ├── csv/                  # CSV format
    └── images/               # Downloaded recipe images
```

### YouTube Scraper Module
```
youtube-scraper/
├── api.py                    # Flask API server (Port 5002)
├── requirements.txt          # Python dependencies
├── .env.example             # Environment template
├── setup.py                 # Initial setup script
├── browse_db.py             # Database browser
├── queries.sql              # SQL queries
│
├── db/
│   ├── models.py            # SQLAlchemy models
│   └── youtube_videos.db    # SQLite database
│
├── scripts/
│   └── scraper.py           # YouTube API scraper
│
├── logs/                    # Scraping logs
└── README.md               # Documentation
```

## Core Features

### 1. **Track Nutrition (Home Screen)**

#### Text-Based Food Input
- Natural language food description parsing
- Multi-food entry support (e.g., "100g chicken, 200g rice, 1 apple")
- AI-powered quantity and unit extraction
- Automatic USDA database matching
- Fallback to manual search if no match

#### Image-Based Food Recognition
- Camera integration for meal photos
- Gallery photo selection
- Google Gemini Vision API for food identification
- Automatic portion estimation
- AI-powered nutritional analysis
- Parse and match to USDA database

#### Nutrition Display
- **9-Category Organization**:
  1. Macronutrients (protein, carbs, fats, fiber)
  2. Energy (calories, kJ)
  3. Lipids (saturated, unsaturated, trans fats, cholesterol)
  4. Vitamins (A, B complex, C, D, E, K)
  5. Minerals (calcium, iron, magnesium, etc.)
  6. Electrolytes (sodium, potassium)
  7. Amino Acids
  8. Other compounds (caffeine, alcohol, etc.)
  9. Special nutrients (omega-3, beta-carotene, etc.)
- Expandable food cards
- Total nutrition aggregation
- Unit conversions
- Color-coded nutrient levels

### 2. **USDA Food Database Search**

#### Search Functionality
- Real-time search with autocomplete
- Filtered results (Foundation, SR Legacy, Survey FNDDS only)
- Excludes branded foods for accuracy
- Fuzzy matching for typos
- Search suggestions

#### Food Details
- Comprehensive nutrient profiles
- Serving size information
- Alternative food suggestions
- Add to tracking with custom quantities
- Remove individual or all foods
- Total nutrition calculation

#### Database Sources
- **Foundation Foods**: Core reference foods
- **SR Legacy**: Standard Reference database
- **Survey (FNDDS)**: Food and Nutrient Database for Dietary Studies

### 3. **Recipe & Video Discovery**

#### Recipe Database (Pickup Limes)
- 300+ plant-based recipes
- High-quality images
- Preparation time
- Cooking time
- Total time
- Direct links to full recipes
- Search by ingredients or dish name
- Category filtering

#### YouTube Integration
- Curated nutrition-related videos
- Channels: Pick Up Limes, Rainbow Plant Life
- Filter by food-related keywords
- View count and duration display
- Video thumbnails
- Search functionality
- Direct video links

### 4. **AI Nutrition Assistant (Chat)**

#### Chatbot Features
- Powered by Google Gemini 2.0 Flash
- Natural language conversation
- Context-aware responses
- Nutrition expertise
- Quick prompt buttons:
  - "How much protein do I need daily?"
  - "What are good sources of vitamin D?"
  - "Explain the keto diet"
  - "How can I gain muscle mass?"
  - "What foods help with energy?"
  - "Explain food labels"
  - "Best foods for skin health"
  - "How to meal prep effectively"

#### Chat Interface
- User/bot message differentiation
- Real-time message streaming
- Chat history
- Clear conversation option
- Markdown support (planned)
- Copy responses (planned)

### 5. **Personal Nutrition Calculator (Recommend)**

#### Input Parameters
- **Personal Details**:
  - Weight (kg)
  - Height (cm)
  - Age (years)
  - Gender (male/female/other)
- **Activity Level**:
  - Sedentary (little to no exercise)
  - Lightly active (1-3 days/week)
  - Moderately active (3-5 days/week)
  - Very active (6-7 days/week)
  - Extra active (twice per day, heavy workouts)
- **Goal**:
  - Maintain weight
  - Gain weight (+500 cal/day)
  - Lose weight (-500 cal/day)
- **Health Problem (Optional)**:
  - User can enter specific health conditions
  - Triggers AI-powered personalized health advice
  - Generates evidence-based recommendations with academic citations

#### Calculations
- **BMR (Basal Metabolic Rate)**: Mifflin-St Jeor Equation
  - Male: (10 × weight) + (6.25 × height) - (5 × age) + 5
  - Female: (10 × weight) + (6.25 × height) - (5 × age) - 161
- **TDEE (Total Daily Energy Expenditure)**: BMR × Activity Multiplier
- **Calorie Target**: TDEE ± goal adjustment

#### Recommendations
- **Macronutrients**:
  - Protein (25-30% of calories)
  - Carbohydrates (45-55% of calories)
  - Fats (20-30% of calories)
- **Micronutrients**:
  - Vitamins (A, B complex, C, D, E, K)
  - Minerals (calcium, iron, magnesium, zinc)
  - Electrolytes (sodium, potassium)
- **Hydration**: Water intake recommendations
- **Fiber**: Daily fiber goals

#### Academic References Feature
- **Reference Icon**: Clickable book icon next to "Nutrition Recommendations" heading
- **Reference Modal**: Professional modal displaying comprehensive academic sources
- **Content Includes**:
  - 35+ nutritional components with academic citations
  - Harvard-style referencing format
  - Sources from Institute of Medicine (IOM), FAO/WHO/UNU, USDA
  - Peer-reviewed journal articles and official guidelines
  - Detailed methodology explanations
- **User-Friendly Documentation**: 
  - `NUTRITION_REFERENCES_USER.md` - Easy-to-read format for general users
  - `NUTRITION_REFERENCES.md` - Technical documentation with code mappings
- **Modal Features**:
  - Responsive design (desktop & mobile)
  - Smooth animations (fade-in, slide-in)
  - Professional table styling with hover effects
  - Custom scrollbar
  - Multiple close options (button, outside click, Escape key)
  - Blue gradient medical theme

#### AI-Powered Health Advice
- **Powered by**: Google Gemini 2.0 Flash API
- **Trigger**: When user enters health problem and clicks "Get Recommendation"
- **Features**:
  - Personalized nutrition recommendations for specific health conditions
  - Evidence-based advice with academic references
  - Clinical overview format
  - Specific nutrient amounts and explanations
  - Harvard-style citations from peer-reviewed sources only
  - Loading indicators with smooth animations
  - Markdown to HTML conversion for formatted display
  - Error handling with user-friendly messages
- **Display Section**:
  - Located in left section below user details form
  - Blue gradient medical theme (#f0f9ff to #e0f2fe)
  - Professional card layout with custom scrollbar
  - Formatted headers, bold text, and bulleted lists
  - Maximum height with scrollable content
- **Example Health Conditions**:
  - Type 2 diabetes
  - High blood pressure (hypertension)
  - Anemia
  - High cholesterol
  - PCOS (Polycystic Ovary Syndrome)
  - And more...

### 6. **USDA Database Service**

#### Local Database Benefits
- **10-100x faster** than USDA API (milliseconds vs seconds)
- **No rate limits** - unlimited searches
- **Offline capability** - works without internet
- **Better reliability** - no API downtime
- **Cost-effective** - no API usage costs

#### Database Setup
```bash
cd usda-database
pip install -r requirements.txt
python download_usda.py  # 10-15 minutes initial setup
```

#### Database Contents
- **~400,000 foods** from USDA FoodData Central
- **~150 nutrients** per food
- **Full-text search** with FTS5 indexing
- **Optimized queries** with proper indexes
- **Size**: ~200-300 MB SQLite database

#### API Endpoints
```
GET /api/usda/search?query=salmon&limit=20
GET /api/usda/food/173688
GET /api/usda/stats
```

### 7. **Recipe Scraper**

#### Pickup Limes Scraper
- Scrapes all recipes from pickuplimes.com
- Extracts:
  - Recipe title and URL
  - Description and tags
  - Preparation/cooking/total time
  - Ingredients list
  - Instructions
  - Nutrition facts
  - Recipe images
- Output formats: JSON + CSV
- Automatic image downloading
- Data validation and cleaning

#### Features
- Handles pagination automatically
- Respects rate limiting
- Error handling and retry logic
- Progress tracking with tqdm
- Duplicate detection

#### Usage
```bash
cd meal-scraper
python pickup_limes_scraper.py
python recipe_viewer.py  # Browse scraped recipes
```

### 8. **YouTube Video Scraper**

#### Video Collection
- Scrapes nutrition-related videos
- Channels: Pick Up Limes, Rainbow Plant Life
- Filters:
  - Food-related keywords
  - Excludes YouTube Shorts
  - Minimum view threshold
- Stores in SQLite database

#### API Server
```bash
cd youtube-scraper
python api.py  # Runs on port 5002
```

#### Endpoints
```
GET /api/youtube/videos?query=vegan&limit=40
POST /api/youtube/refresh
GET /api/youtube/stats
```

## API Documentation

### Flask Server (Port 5001)

#### Food Processing Endpoints

**POST `/nlp/process_text/`**
Parse natural language food descriptions.

Request:
```json
{
  "text": "100g chicken, 200g rice, 1 apple"
}
```

Response:
```json
{
  "success": true,
  "foods": [
    {
      "food_name": "chicken",
      "quantity": 100,
      "unit": "g",
      "fdcId": 171477,
      "nutrients": {...}
    }
  ]
}
```

**POST `/ai/analyze-meal-image`**
Analyze meal images with Gemini Vision.

Request:
```json
{
  "image": "base64_encoded_image_data"
}
```

Response:
```json
{
  "success": true,
  "description": "Grilled chicken breast with brown rice and steamed broccoli",
  "confidence": 0.95
}
```

**POST `/ai/parse-and-match-foods`**
AI-powered food parsing and USDA matching.

Request:
```json
{
  "description": "grilled chicken with vegetables"
}
```

Response:
```json
{
  "success": true,
  "foods": [
    {
      "name": "chicken breast, grilled",
      "fdcId": 171477,
      "quantity": 100,
      "unit": "g"
    }
  ]
}
```

#### Chat Endpoint

**POST `/ai/chat`**
AI nutrition assistant conversation.

Request:
```json
{
  "message": "How much protein do I need daily?",
  "conversation_history": []
}
```

Response:
```json
{
  "success": true,
  "response": "The recommended daily protein intake...",
  "conversation_id": "uuid"
}
```

#### Health Advice Endpoint

**POST `/ai/health-advice`**
Generate personalized health advice with academic references.

Request:
```json
{
  "weight": 48,
  "height": 158,
  "age": 27,
  "gender": "female",
  "activityLevel": "sedentary",
  "goal": "maintain",
  "healthProblem": "type 2 diabetes"
}
```

Response:
```json
{
  "success": true,
  "advice": "## Clinical Overview\n\nFor a 27-year-old female...\n\n## Key Nutritional Recommendations\n\n**1. Carbohydrate Management**\n- Focus on low glycemic index (GI) foods...\n\n### References\n\nAmerican Diabetes Association (2023)..."
}
```

**Features:**
- Specialized Gemini AI prompt for evidence-based advice
- Requires peer-reviewed sources only
- Harvard citation format enforced
- Clinical overview format
- Specific nutrient amounts
- Tailored to user's personal details and health condition

#### USDA Endpoints

**GET `/api/usda/search`**
Search USDA database.

Query Parameters:
- `query`: Search term
- `limit`: Results limit (default: 20)

**GET `/api/usda/food/:fdcId`**
Get detailed food information.

**GET `/api/usda/stats`**
Get database statistics.

#### Recipe Endpoints

**GET `/api/recipes/search`**
Search recipe database.

Query Parameters:
- `query`: Search term (optional)
- `limit`: Results limit (default: 40)

Response:
```json
{
  "success": true,
  "recipes": [
    {
      "title": "Creamy Vegan Pasta",
      "url": "https://...",
      "image": "path/to/image.jpg",
      "time": "30 min"
    }
  ]
}
```

#### YouTube Endpoints

**GET `/api/youtube/videos`**
Get YouTube videos.

Query Parameters:
- `query`: Search term (optional)
- `limit`: Results limit (default: 40)

## Mobile App Features

### Platform Support
- **iOS**: 13.0+
- **Android**: 5.0+ (API 21+)
- **Web**: Expo web support (optional)

### Feature Parity with Web
| Feature | Web | Mobile | Notes |
|---------|-----|--------|-------|
| Text food input | ✅ | ✅ | Full parity |
| Image upload | ✅ | ✅ + Camera | Enhanced |
| AI parsing | ✅ | ✅ | Full parity |
| USDA search | ✅ | ✅ | Full parity |
| Recipe browser | ✅ | ✅ | Full parity |
| YouTube videos | ✅ | ✅ | Full parity |
| AI chatbot | ✅ | ✅ | Full parity |
| Calculator | ✅ | ✅ | Full parity |
| Nutrient grouping | ✅ | ✅ | 9 categories |

### Mobile-Specific Features
- Native camera integration
- Touch gestures and haptics
- Bottom tab navigation
- Native pickers (dropdowns)
- Keyboard-aware scrolling
- Platform-specific styling
- Pull-to-refresh (planned)
- Offline storage (planned)

### Screen Navigation

**Bottom Tabs:**
1. 🏠 Home - Track nutrition
2. 🔍 Search - Food database
3. 🍽️ Meals - Recipes & videos
4. 💬 Chat - AI assistant
5. ⭐ Recommend - Calculator

## Development Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- Expo CLI (for mobile)
- pip and npm/yarn

### Web-UI Setup

```bash
cd web-ui

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables (optional)
# Add your API keys if needed

# Start Flask server
python server.py  # Runs on http://localhost:5001
```

### Mobile App Setup

```bash
cd mobile-app

# Install dependencies
npm install

# Configure API URL in src/constants/api.ts
# - For iOS Simulator: http://localhost:5001
# - For Android Emulator: http://10.0.2.2:5001
# - For Physical Device: http://YOUR_IP:5001

# Start Expo
npm start

# Run on platforms
npm run ios      # iOS Simulator
npm run android  # Android Emulator
# OR scan QR code with Expo Go app
```

### USDA Database Setup

```bash
cd usda-database

# Install dependencies
pip install -r requirements.txt

# Download and setup (10-15 minutes)
python download_usda.py

# Verify setup
ls -lh usda_foods.db  # Should be ~200-300 MB

# Test search
python usda_search.py
```

### Meal Scraper Setup

```bash
cd meal-scraper

# Install dependencies
pip install -r requirements.txt

# Run scraper (takes ~1-2 hours for all recipes)
python pickup_limes_scraper.py

# Browse scraped recipes
python recipe_viewer.py
```

### YouTube Scraper Setup

```bash
cd youtube-scraper

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Add your YouTube API key

# Run initial scrape
python -m scripts.scraper

# Start API server
python api.py  # Runs on http://localhost:5002
```

## Configuration

### Environment Variables

**YouTube Scraper `.env`:**
```env
YOUTUBE_API_KEY=your_youtube_api_key_here
DATABASE_URL=sqlite:///db/youtube_videos.db
```

**Flask Server:**
- GEMINI_KEY: Hardcoded in server.py (consider moving to .env)
- USDA_API_KEY: Hardcoded in server.py

### API Keys Required

1. **Google Gemini API**: For AI chat and image analysis
   - Get from: https://ai.google.dev/
2. **USDA API Key**: For food database (fallback)
   - Get from: https://fdc.nal.usda.gov/api-guide.html
3. **YouTube API Key**: For video scraping
   - Get from: https://console.cloud.google.com/

## Design System

### Color Palette

**Web & Mobile:**
- Primary: `#3498db` (Blue)
- Secondary: `#2ecc71` (Green)
- Text Dark: `#2c3e50`
- Text Light: `#666`
- Background: `#ffffff`
- Background Alt: `#f9f9f9`
- Border: `#e0e0e0`
- Error: `#e74c3c`
- Success: `#2ecc71`

### Typography
- **Web**: System fonts (Arial, Helvetica, sans-serif)
- **Mobile**: Native fonts (San Francisco iOS / Roboto Android)
- Font sizes: 12px-32px
- Font weights: 400 (regular), 600 (medium), 700 (bold)

### Component Styling
- Rounded corners: 12-25px
- Card shadows: Subtle elevation (2-4dp)
- Gradient buttons: Primary to Secondary
- Touch targets: Minimum 44x44px (mobile)
- Spacing: 8px base unit

## Performance Optimizations

### Backend
- Local USDA database: 50-100x faster than API
- Response caching (planned)
- Batch processing for multiple foods
- Efficient SQL queries with indexes

### Frontend (Web)
- CSS optimization with PurgeCSS
- Image lazy loading
- Debounced search inputs
- Pagination for large result sets

### Mobile
- Native components for smooth scrolling
- Image optimization
- Lazy loading components
- Efficient state management
- Memoization for expensive calculations

## Testing

### Web Testing
```bash
cd web-ui
# Manual testing in browser
open http://localhost:5001/home.html
```

### Mobile Testing
```bash
cd mobile-app

# iOS Simulator (macOS only)
npm run ios

# Android Emulator
npm run android

# Physical Device
# Scan QR code with Expo Go app
```

### Database Testing
```bash
cd usda-database
python -c "from usda_search import get_usda_search; \
  db = get_usda_search(); \
  print(db.search_foods('chicken', limit=5))"
```

## Deployment

### Web-UI Deployment

**Options:**
- Heroku (Python Flask apps)
- PythonAnywhere
- AWS EC2 / Elastic Beanstalk
- Google Cloud Run
- DigitalOcean App Platform

**Considerations:**
- Set proper CORS origins
- Use production WSGI server (Gunicorn)
- Set up HTTPS
- Configure environment variables

### Mobile App Deployment

**iOS (App Store):**
```bash
cd mobile-app
eas build --platform ios
# Submit via App Store Connect
```

**Android (Google Play):**
```bash
cd mobile-app
eas build --platform android
# Submit via Google Play Console
```

**Requirements:**
- Expo account
- Apple Developer account ($99/year)
- Google Play Developer account ($25 one-time)

## Troubleshooting

### Common Issues

**"Cannot connect to backend" (Mobile)**
- Check API_BASE_URL in `mobile-app/src/constants/api.ts`
- Verify backend is running: `curl http://localhost:5001`
- For physical devices: Use computer's local IP
- Check firewall settings

**"USDA database not found"**
```bash
cd usda-database
python download_usda.py
```

**"YouTube integration not available"**
```bash
cd youtube-scraper
pip install -r requirements.txt
python -m scripts.scraper
```

**"Recipe images not loading"**
- Check `meal-scraper/pickup_limes_database/images/` exists
- Re-run scraper with image download enabled

**Mobile app won't start**
```bash
cd mobile-app
rm -rf node_modules .expo
npm install
npm start -- --clear
```

## Database Schemas

### USDA SQLite Database

**foods table:**
```sql
CREATE TABLE foods (
    fdc_id INTEGER PRIMARY KEY,
    data_type TEXT,
    description TEXT,
    food_category_id INTEGER,
    publication_date TEXT
);
```

**food_nutrient table:**
```sql
CREATE TABLE food_nutrient (
    id INTEGER PRIMARY KEY,
    fdc_id INTEGER,
    nutrient_id INTEGER,
    amount REAL,
    FOREIGN KEY (fdc_id) REFERENCES foods(fdc_id)
);
```

### YouTube SQLite Database

**youtube_videos table:**
```sql
CREATE TABLE youtube_videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id VARCHAR(20) UNIQUE,
    title TEXT,
    description TEXT,
    channel_id VARCHAR(50),
    channel_title VARCHAR(100),
    published_at DATETIME,
    thumbnail_url TEXT,
    view_count INTEGER,
    duration VARCHAR(20),
    tags TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Future Enhancements

### Recently Implemented Features ✅
- [x] **Academic References System**: Comprehensive academic documentation with modal display
- [x] **AI Health Advice**: Personalized evidence-based recommendations for health conditions
- [x] **Reference Citations**: Harvard-style citations from peer-reviewed sources
- [x] **Interactive Modal**: Professional reference viewer with responsive design
- [x] **Health Problem Input**: Optional field for targeted nutrition advice
- [x] **Evidence-Based AI**: Gemini AI constrained to academic sources only
- [x] **User Documentation**: Both technical and user-friendly reference guides
- [x] **Verification System**: Code validation against academic standards (97% accuracy)

### Planned Features
- [ ] User authentication and profiles
- [ ] Save meal history
- [ ] Weekly meal planning
- [ ] Barcode scanning
- [ ] Nutrition tracking graphs
- [ ] Export nutrition reports (PDF)
- [ ] Meal photo gallery
- [ ] Social sharing
- [ ] Calorie budget tracking
- [ ] Water intake tracking
- [ ] Exercise integration
- [ ] Custom food database
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Offline mode
- [ ] Push notifications (mobile)
- [ ] Apple Health integration
- [ ] Google Fit integration

### Technical Improvements
- [ ] PostgreSQL for production
- [ ] Redis caching layer
- [ ] GraphQL API
- [ ] WebSocket for real-time updates
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Comprehensive test suite
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Rate limiting
- [ ] User analytics

## Contributing

### Development Workflow
1. Fork repository
2. Create feature branch
3. Implement changes
4. Test thoroughly
5. Update documentation
6. Submit pull request

### Code Standards
- **Python**: PEP 8 style guide
- **JavaScript**: ESLint + Prettier
- **TypeScript**: Strict mode enabled
- **Commits**: Conventional commits format

## License

This project is developed for educational purposes as part of a university final year project.

## Documentation Files

### Main Documentation
- `track-nutrition/PROJECT_DOCUMENTATION.md` - Complete project documentation (this file)

### Web-UI Documentation
- `track-nutrition/web-ui/NUTRITION_REFERENCES.md` - Technical academic references with code mappings
- `track-nutrition/web-ui/NUTRITION_REFERENCES_USER.md` - User-friendly academic references
- `track-nutrition/web-ui/VERIFICATION_REPORT.md` - Code verification report (97% accuracy)
- `track-nutrition/web-ui/HEALTH_ADVICE_FEATURE.md` - Health advice feature technical docs
- `track-nutrition/web-ui/VISUAL_GUIDE.md` - Visual diagrams and UI layouts

### Module Documentation
- `track-nutrition/mobile-app/README.md` - Mobile app full docs
- `track-nutrition/mobile-app/QUICKSTART.md` - Quick start guide
- `track-nutrition/mobile-app/PROJECT_SUMMARY.md` - Feature summary
- `track-nutrition/usda-database/README.md` - USDA database setup
- `track-nutrition/usda-database/QUICKSTART.md` - USDA quick reference
- `track-nutrition/youtube-scraper/README.md` - YouTube scraper docs

## Support & Resources

### External Resources
- [USDA FoodData Central](https://fdc.nal.usda.gov/)
- [Google Gemini AI](https://ai.google.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Flask Documentation](https://flask.palletsprojects.com/)

### API Documentation
- [USDA FDC API Guide](https://fdc.nal.usda.gov/api-guide.html)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [Google Gemini API](https://ai.google.dev/docs)

## Recent Updates & Improvements

### November 9, 2025 - Academic References & Health Advice Features

#### 1. Academic References System
- **Feature**: Interactive reference viewer with clickable book icon
- **Documentation**: 
  - Technical references with code mappings (`NUTRITION_REFERENCES.md`)
  - User-friendly version for general public (`NUTRITION_REFERENCES_USER.md`)
- **Content**: 35+ nutritional components with Harvard-style citations
- **Sources**: Institute of Medicine (IOM), FAO/WHO/UNU, USDA, peer-reviewed journals
- **Verification**: 97% accuracy rate (66/68 exact matches, 2 acceptable variations)
- **UI/UX**: Professional modal with blue medical theme, responsive design, smooth animations

#### 2. AI-Powered Health Advice
- **Feature**: Personalized nutrition advice for health conditions
- **AI Model**: Google Gemini 2.0 Flash with specialized prompt engineering
- **Input**: Optional health problem field in personal calculator
- **Output**: Evidence-based recommendations with academic citations
- **Format**: Clinical overview with specific nutrient amounts and explanations
- **Constraints**: Peer-reviewed sources only, Harvard citation format enforced
- **Display**: Professional card layout in left section with loading indicators

#### 3. Technical Implementation
- **Backend**: New `/ai/health-advice` POST endpoint in Flask
- **Frontend**: Modal system with markdown-to-HTML conversion
- **Styling**: ~350 lines of new CSS for modal, references, and health advice sections
- **State Management**: Enhanced to include health problem and advice text
- **Error Handling**: User-friendly error messages and loading states
- **Performance**: Fast markdown parsing and responsive modal interactions

#### 4. Quality Assurance
- **Documentation**: 5 new comprehensive documentation files
- **Verification**: Systematic verification of all nutrition values against academic sources
- **Code Quality**: No syntax errors, follows existing code patterns
- **User Experience**: Intuitive interface with multiple interaction methods
- **Accessibility**: Keyboard support (Escape key), clear visual hierarchy

---

**Project**: Track Nutrition - AI-Powered Nutrition Platform  
**Version**: 1.1.0  
**Last Updated**: November 9, 2025  
**Repository**: Truc4p/FYP  
**Type**: Final Year Project (FYP)
