# Nutrition Tracker - Integrated Application

A comprehensive nutrition tracking application with multiple components for food data management, recipe scraping, nutritional analysis, and video content aggregation.

## 🏗️ Project Structure

This repository contains a fully integrated nutrition tracking system with the following components:

### 📱 Web UI (`web-ui/`)
- **Frontend Application**: Complete web interface for nutrition tracking
- **Features**: 
  - Home dashboard with nutrition recommendations
  - Meal search and planning interface
  - Interactive chat functionality
  - Nutrient information tooltips
  - Responsive design with modern CSS
- **Technologies**: HTML5, CSS3, JavaScript, Node.js, Python Flask
- **Key Files**:
  - `server.py` - Main Flask backend server
  - `home.html` - Main dashboard interface
  - `meal-search.html` - Food search interface
  - `chat.html` - Chat interface for nutrition assistance

### 🔧 Backend (`backend/`)
- **Django Application**: Robust backend API for nutrition data management
- **Features**:
  - Food nutrition database integration
  - USDA food data processing
  - NLP-powered food recognition
  - RESTful API endpoints
- **Technologies**: Django, Python, SQLite/PostgreSQL
- **Key Components**:
  - `food_dietary_app/` - Main Django app for food data
  - `food_dietary_project/` - Django project configuration
  - `nlp_app/` - Natural language processing for food recognition
  - Data files: `food_nutrition_data.csv`, `filtered_food_names.csv`

### 🤖 Chatbot (`chatbot/`)
- **AI-Powered Assistant**: Intelligent nutrition chatbot
- **Features**:
  - Natural language food queries
  - Nutrition advice and recommendations
  - Interactive meal planning assistance
- **Technologies**: Node.js, Python, Machine Learning models
- **Key Files**:
  - `chatbot.js` - Node.js chatbot server
  - `lms.py` - Language model service

### 🥗 Meal Scraper (`meal-scraper/`)
- **Recipe Data Aggregation**: Web scraping for recipe and meal data
- **Features**:
  - Pickup Limes recipe scraping
  - Recipe data cleaning and validation
  - Structured recipe database generation
- **Technologies**: Python, BeautifulSoup, Requests
- **Key Files**:
  - `pickup_limes_scraper.py` - Main recipe scraper
  - `recipe_viewer.py` - Recipe data visualization
  - `pickup_limes_database/` - Scraped recipe data storage

### 📺 YouTube Scraper (`youtube-scraper/`)
- **Video Content Aggregation**: YouTube nutrition content scraping
- **Features**:
  - Nutrition-related video discovery
  - Video metadata extraction
  - Content categorization and storage
- **Technologies**: Python, YouTube API, SQLite
- **Key Files**:
  - `api.py` - YouTube API integration
  - `scraper.py` - Video content scraper
  - `db/youtube_videos.db` - Video metadata database

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Truc4p/FYP.git
   cd FYP
   ```

2. **Set up the backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

3. **Set up the web UI**:
   ```bash
   cd ../web-ui
   pip install -r requirements.txt
   npm install
   python server.py
   ```

4. **Set up the chatbot**:
   ```bash
   cd ../chatbot
   npm install
   pip install -r requirements.txt
   node chatbot.js
   ```

5. **Set up the YouTube scraper**:
   ```bash
   cd ../youtube-scraper
   pip install -r requirements.txt
   python scripts/init_db.py
   python api.py
   ```

## 📋 Usage

### Web Interface
1. Open your browser and navigate to `http://localhost:5000`
2. Use the home dashboard to view nutrition recommendations
3. Search for foods and meals using the meal search interface
4. Interact with the AI chatbot for nutrition advice

### API Endpoints
- **Backend API**: `http://localhost:8000/api/`
- **YouTube API**: `http://localhost:3000/api/`
- **Chatbot API**: `http://localhost:3001/`

### Data Management
- Run meal scraper to update recipe database
- Use YouTube scraper to gather nutrition video content
- Backend processes and stores all nutritional data

## 🎯 Features

- **Comprehensive Nutrition Database**: USDA-sourced food nutrition data
- **Intelligent Food Recognition**: NLP-powered food identification
- **Recipe Integration**: Scraped and curated recipe database
- **Video Content**: Nutrition education videos from YouTube
- **Interactive Chat**: AI-powered nutrition assistant
- **Responsive Design**: Works on desktop and mobile devices
- **Modular Architecture**: Easily extensible component system

## 🛠️ Development

### Branch History
This repository was created by merging the following feature branches:
- `frontend` - Web UI components and styling
- `backend` - Django API and database management
- `chatbot` - AI chatbot functionality
- `scrawl-recipe` - Recipe scraping system
- `youtube-scraper` - Video content aggregation

All commit history from individual branches has been preserved in the merge.

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Acknowledgments

- USDA for nutrition data
- Pickup Limes for recipe inspiration
- YouTube API for video content
- Django and Flask communities
- Open source nutrition research community

## 📞 Contact

For questions or support, please open an issue in the GitHub repository.