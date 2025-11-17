# Final Year Project Documentation - PART 2
## Implementation Details

---

### 6. Implementation

#### 6.1 Development Environment

**Hardware & OS:**
- Development Machine: macOS
- Testing Devices: iOS/Android smartphones, Desktop browsers
- Minimum Requirements: 8GB RAM, 256GB SSD

**Software & Tools:**
- **IDE**: Visual Studio Code
- **Version Control**: Git with GitHub repository
- **Terminal**: zsh (macOS default)
- **Package Managers**: 
  - npm (Node.js packages)
  - pip (Python packages)
  - Expo CLI (Mobile development)

**Development Servers:**
- Flask server (port 5001): Main API server
- Expo Metro Bundler: React Native development
- Local testing: http://localhost:5001

**Environment Configuration:**
`.env` file structure:
```
GEMINI_KEY=your_gemini_api_key_here
USDA_API_KEY=your_usda_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
```

#### 6.2 Backend & Frontend Implementation

### **6.2.1 Backend Implementation (Flask Server)**

**File: `web-ui/server.py`** (1200+ lines)

**Key Components:**

**1. Flask Application Setup:**
```python
app = Flask(__name__, static_folder='.')
CORS(app)  # Enable cross-origin requests from frontend

# API Configuration
GEMINI_API_URL = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_KEY}'
USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search'
```

**2. Natural Language Processing (Food Input Parsing):**

The system includes a sophisticated NLP module integrated directly into Flask (originally from Django) that tokenizes user input to extract food items with quantities and units.

```python
def tokenize_by_quantity(text):
    """
    Tokenizes text to extract food items with quantities and units
    Handles patterns like:
    - "100g chicken breast"
    - "100 grams of chicken breast" 
    - "chicken breast 100g"
    - "chicken breast 100 grams"
    """
```

**Key Features:**
- **Regex Pattern Matching**: Multiple regex patterns to catch different input formats
- **Plural to Singular Conversion**: Using `inflect` library (e.g., "apples" → "apple")
- **Filler Word Removal**: Strips words like "I", "ate", "today"
- **Segment Processing**: Splits by commas, "and", periods
- **Duplicate Prevention**: Removes duplicate entries

**Example Processing:**
```
Input: "I ate 100g chicken breast, 150g brown rice, and 50 grams of broccoli"
Output: [
  [100, "g", "chicken breast"],
  [150, "g", "brown rice"],
  [50, "grams", "broccoli"]
]
```

**3. Recipe Search Implementation:**

```python
@app.route('/api/recipes/search')
def search_recipes():
    query = request.args.get('query', '').lower()
    
    # Word-by-word matching to prevent partial matches
    # Prevents "egg" from matching "eggplant"
    query_words = query.lower().split()
    
    for recipe in recipes:
        name_words = re.findall(r'\b\w+\b', name.lower())
        ingredients_words = re.findall(r'\b\w+\b', ingredients_text.lower())
        
        if (q_word in name_words or q_word in ingredients_words):
            match_found = True
```

**Features:**
- Word boundary matching (no partial matches)
- Searches in recipe name AND ingredients
- ISO 8601 duration parsing (PT30M → "30 min")
- Pagination support
- Returns: id, title, image, URL, timeDisplay

**4. AI-Powered Chatbot:**

```python
@app.route('/ai/chat', methods=['POST'])
def chat():
    user_message = data.get('userMessage', '')
    
    prompt = f"""You are NutriWise, an expert wellness coach 
    specializing in evidence-based nutrition science...
    
    User's message: {user_message}
    """
    
    response = requests.post(GEMINI_API_URL, json={
        'contents': [{'parts': [{'text': prompt}]}]
    })
```

**Chatbot Personality & Capabilities:**
- **Expert Persona**: "NutriWise" - wellness coach with nutrition science expertise
- **Core Competencies**: 
  - Macro/micronutrient optimization
  - Meal planning for specific diets
  - Nutrition label interpretation
  - Gut-brain connection
  - Myth debunking with research
- **Communication Style**: Warm, encouraging, uses emojis, non-judgmental
- **Error Handling**: Rate limiting (429), authentication errors (403)

**5. Evidence-Based Health Advice Generator:**

```python
@app.route('/ai/health-advice', methods=['POST'])
def health_advice():
    health_problem = data.get('healthProblem', '')
    user_details = data.get('userDetails', {})
    
    prompt = f"""You are a clinical nutrition researcher...
    
    **Patient Profile:**
    - Health Condition: {health_problem}
    - Age: {age}, Gender: {gender}, Weight: {weight} kg
    
    **Instructions:**
    1. Analyze condition from nutritional science perspective
    2. Provide specific, actionable dietary recommendations
    3. Support EVERY recommendation with academic references
    4. Use Harvard referencing style
    5. Focus on evidence-based interventions
    
    **Required Format:**
    ## Condition Overview
    ## Evidence-Based Dietary Recommendations
    ## Specific Nutrient Targets
    ## Academic References
    """
```

**Features:**
- Patient-specific context (age, gender, weight, height, activity level)
- Requires academic citations (journal papers, clinical trials, meta-analyses)
- Harvard referencing style
- Structured output format
- Recent research emphasis (last 10 years)

**6. Meal Image Analysis (Gemini Vision):**

```python
@app.route('/ai/analyze-meal-image', methods=['POST'])
def analyze_meal_image():
    image_data = data.get('image', '')  # base64 encoded
    mime_type = data.get('mimeType', 'image/jpeg')
    
    prompt = """Analyze this meal image and estimate weights...
    
    USDA Naming Rules:
    - Vegetables: "[Vegetable], [type/color], raw"
      Examples: "Peppers, sweet, red, raw"
    - Proteins: "[Protein], [cut/part]"
      Examples: "Chicken, broilers or fryers, breast, meat only, raw"
    - Grains: Specify type and preparation
      Examples: "Rice, brown, long-grain, cooked"
    
    Format: "[weight]g [USDA food name], [weight]g ..."
    """
    
    response = requests.post(GEMINI_VISION_API_URL, json={
        'contents': [{
            'parts': [
                {'text': prompt},
                {'inline_data': {
                    'mime_type': mime_type,
                    'data': image_data
                }}
            ]
        }]
    })
```

**Features:**
- Base64 image processing
- USDA-compliant food naming
- Weight estimation in grams
- Handles JPEG, PNG, WebP formats
- Parsing and cleanup of AI response

**7. AI-Powered Food Matching:**

This is one of the most sophisticated features - it combines Gemini AI with intelligent USDA database searching.

```python
@app.route('/ai/parse-and-match-foods', methods=['POST'])
def parse_and_match_foods():
    # Step 1: Use Gemini to parse food items
    parse_prompt = f"""Parse this food text and extract items...
    
    Return ONLY a JSON array:
    [
      {{"quantity": 60, "unit": "g", "food_name": "Peppers, sweet, red, raw", 
        "usda_search_term": "peppers red"}}
    ]
    """
    
    # Step 2: Search USDA for each food with intelligent scoring
    for food_item in parsed_foods:
        best_score = -1000
        
        for food in usda_results:
            score = 0
            
            # Prioritize Foundation > SR Legacy > Survey > Branded
            if food['dataType'] == 'Foundation':
                score += 1000
            elif food['dataType'] == 'Branded':
                score -= 500
            
            # Penalize processed foods
            if 'restaurant' in desc or 'fried' in desc:
                score -= 800
            
            # Bonus for state matching (raw, cooked)
            if 'raw' in expected_name and 'raw' in desc:
                score += 200
            
            # Word matching bonus
            matching_words = sum(1 for word in key_words if word in desc)
            score += matching_words * 50
```

**Intelligent Matching Algorithm:**
- **Data Type Priority**: Foundation (1000) > SR Legacy (950) > Survey (900) > Branded (-500)
- **Processed Food Penalty**: -800 for restaurant/fried/breaded foods
- **State Matching Bonus**: +200 for raw/cooked matching
- **Word Matching**: +50 per matching keyword
- **Start Match Bonus**: +100 if description starts with keyword

**8. Local USDA Database Integration:**

```python
# Local database for fast searches (no API calls)
from usda_search import get_usda_search

@app.route('/api/usda/search', methods=['GET'])
def usda_local_search():
    query = request.args.get('query', '').strip()
    limit = int(request.args.get('limit', 20))
    
    usda_search = get_usda_search()
    results = usda_search.search_foods(query, limit=limit)
    
    return jsonify({
        'success': True,
        'totalHits': len(results),
        'foods': results
    })
```

**Benefits:**
- **Speed**: 10-100x faster than API calls
- **Offline Capability**: Works without internet (after initial download)
- **No Rate Limits**: Unlimited searches
- **Full-Text Search**: Uses SQLite FTS5 for fast searching

**9. YouTube Video Integration:**

```python
@app.route('/api/youtube/videos', methods=['GET'])
def get_youtube_videos():
    query = request.args.get('query', '').lower()
    limit = int(request.args.get('limit', 40))
    
    db_query = session.query(YouTubeVideo).filter(
        YouTubeVideo.is_active == True
    )
    
    # Search in title, description, keywords
    if query:
        for term in search_terms:
            db_query = db_query.filter(
                (YouTubeVideo.title.ilike(f'%{term}%')) | 
                (YouTubeVideo.description.ilike(f'%{term}%')) |
                (YouTubeVideo.keywords.ilike(f'%{term}%'))
            )
    
    videos = db_query.order_by(
        YouTubeVideo.published_at.desc()
    ).limit(limit).all()
```

**Features:**
- Full-text search across title, description, keywords
- Filters out YouTube Shorts (< 60 seconds)
- Channels: Pick Up Limes, Rainbow Plant Life
- Food-related keyword filtering
- Ordered by newest first

---

### **6.2.2 Frontend Implementation (Web UI)**

**Technology Stack:**
- Pure JavaScript (ES6+)
- No frameworks (Vanilla JS)
- CSS3 with custom properties
- HTML5 semantic elements

**File Structure:**
```
web-ui/
├── home.html              # Main tracking page
├── home.js                # Home page logic
├── search.html            # Food search page
├── search.js              # Search logic
├── meal-search.html       # Recipe discovery
├── meal-search.js         # Recipe search logic
├── chat.html              # AI chatbot
├── chat.js                # Chat interface
├── recommend.html         # Health recommendations
├── recommend.js           # Recommendation logic
├── style.css              # Global styles
├── nav-bar.html           # Shared navigation
├── nav-bar.js             # Navigation logic
└── nutrient-tooltip/      # Tooltip system
    ├── nutrient-database.js
    ├── nutrient-tooltip.js
    └── nutrient-tooltip.css
```

**Key Implementation Patterns:**

**1. State Management (Persistent Across Pages):**

```javascript
// Save state when navigating away
window.addEventListener('savePageState', (event) => {
    if (event.detail.pageKey === 'home') {
        const state = {
            foodInput: foodInput.value,
            foods: foods,
            addedFoods: addedFoods
        };
        event.detail.saveState('home', state);
    }
});

// Load state when returning
window.addEventListener('loadPageState', (event) => {
    if (event.detail.pageKey === 'home') {
        const state = event.detail.loadState('home');
        if (state) {
            foodInput.value = state.foodInput;
            foods = state.foods;
            updateUI();
        }
    }
});
```

**Features:**
- **LocalStorage Persistence**: Survives page reloads
- **Cross-Page State**: Maintains context when switching pages
- **Selective Clearing**: Clear button resets specific page states

**2. Food Input Processing (home.js):**

```javascript
async function processFoodInput() {
    const text = foodInput.value.trim();
    
    if (!text) {
        alert('Please enter food information');
        return;
    }
    
    setLoading(true);
    
    try {
        // Use AI-powered parsing and matching
        const response = await fetch('/ai/parse-and-match-foods', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({text: text})
        });
        
        const data = await response.json();
        
        if (data.success && data.foods) {
            // Fetch detailed nutrition for each food
            for (const foodMatch of data.foods) {
                const fdcId = foodMatch.usda_food.fdcId;
                const nutrition = await fetchNutritionDetails(fdcId);
                
                foods.push({
                    name: foodMatch.usda_food.description,
                    quantity: foodMatch.quantity,
                    unit: foodMatch.unit,
                    nutrition: nutrition
                });
            }
            
            updateUI();
            calculateAndDisplayTotals();
        }
    } catch (error) {
        alert('Error processing food input');
    } finally {
        setLoading(false);
    }
}
```

**3. Image Analysis Integration:**

```javascript
async function analyzeImage() {
    const file = mealImageInput.files[0];
    if (!file) return;
    
    // Convert to base64
    const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.readAsDataURL(file);
    });
    
    // Call API
    const response = await fetch('/ai/analyze-meal-image', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            image: base64,
            mimeType: file.type
        })
    });
    
    const data = await response.json();
    
    if (data.success) {
        // Populate input field with AI analysis
        foodInput.value = data.analysis;
    }
}
```

**4. Nutrient Visualization (9-Group System):**

```javascript
function calculateAndDisplayTotals() {
    const nutrientTotals = {};
    
    // Sum nutrients across all foods
    foods.forEach(food => {
        food.nutrition.forEach(nutrient => {
            const name = nutrient.nutrient.name;
            const amount = (nutrient.amount * food.quantity) / 100;
            
            nutrientTotals[name] = (nutrientTotals[name] || 0) + amount;
        });
    });
    
    // Group nutrients into 9 categories
    const groupedNutrients = {
        'GROUP 1: ENERGY & FOUNDATION': [],
        'GROUP 2: MACRONUTRIENTS': [],
        'GROUP 3: VITAMINS': [],
        'GROUP 4: MINERALS': [],
        'GROUP 5: CARBOHYDRATES': [],
        'GROUP 6: FATS': [],
        'GROUP 7: AMINO ACIDS': [],
        'GROUP 8: OTHER COMPOUNDS': [],
        'GROUP 9: SPECIALIZED': []
    };
    
    // Categorize each nutrient
    for (const [name, amount] of Object.entries(nutrientTotals)) {
        const group = getNutrientGroup(name);
        if (group && groupedNutrients[group]) {
            groupedNutrients[group].push({name, amount});
        }
    }
    
    // Render each group
    displayGroupedNutrients(groupedNutrients);
}
```

**5. Interactive Nutrient Tooltips:**

The system includes a sophisticated tooltip system that provides detailed information about each nutrient.

**File: `nutrient-tooltip/nutrient-database.js`** (13,000+ lines)

Contains comprehensive data for 150+ nutrients:
```javascript
const NUTRIENT_DATABASE = {
    "Protein": {
        category: "Macronutrients",
        description: "Essential macronutrient for building and repairing tissues...",
        functions: [
            "Building and repairing tissues",
            "Enzyme and hormone production",
            "Immune function support"
        ],
        dri: {
            adult_male: {amount: 56, unit: "g/day"},
            adult_female: {amount: 46, unit: "g/day"},
            pregnant: {amount: 71, unit: "g/day"}
        },
        sources: [
            "Chicken breast (31g per 100g)",
            "Salmon (25g per 100g)",
            "Lentils (9g per 100g)"
        ],
        deficiency: "Muscle loss, weakened immunity...",
        toxicity: "Generally safe, but very high intake may stress kidneys...",
        interactions: ["Works with B vitamins for metabolism"],
        specialPopulations: {
            athletes: "Need 1.2-2.0g per kg body weight",
            elderly: "May need higher amounts to prevent sarcopenia"
        }
    }
};
```

**Tooltip Features:**
- **Hover Activation**: Shows detailed info on nutrient name hover
- **Comprehensive Data**: DRI values, sources, functions, deficiencies
- **Special Populations**: Athletes, elderly, pregnant women
- **Visual Indicators**: Color-coded by adequacy (green/yellow/red)
- **Responsive Positioning**: Adjusts to viewport edges

**6. Recipe Search Implementation (meal-search.js):**

```javascript
async function searchRecipes() {
    const query = searchInput.value.trim();
    const resultsPerPage = 40;
    
    const response = await fetch(
        `/api/recipes/search?query=${encodeURIComponent(query)}&number=${resultsPerPage}`
    );
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
        displayRecipes(data.results);
    } else {
        showNoResults();
    }
}

function displayRecipes(recipes) {
    const html = recipes.map(recipe => `
        <div class="recipe-card">
            <img src="${recipe.image}" alt="${recipe.title}" 
                 onerror="this.src='/images/placeholder.jpg'">
            <div class="recipe-info">
                <h3>${recipe.title}</h3>
                <p class="time">⏱️ ${recipe.timeDisplay}</p>
                <a href="${recipe.url}" target="_blank" class="view-recipe">
                    View Recipe →
                </a>
            </div>
        </div>
    `).join('');
    
    recipesGrid.innerHTML = html;
}
```

**7. AI Chatbot Interface (chat.js):**

```javascript
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addMessage(message, 'user');
    messageInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        const response = await fetch('/ai/chat', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({userMessage: message})
        });
        
        const data = await response.json();
        
        hideTypingIndicator();
        
        if (data.recommendation) {
            // Render markdown-formatted response
            const formattedResponse = renderMarkdown(data.recommendation);
            addMessage(formattedResponse, 'assistant');
        } else if (data.error) {
            handleChatError(data);
        }
    } catch (error) {
        hideTypingIndicator();
        addMessage('Sorry, I encountered an error. Please try again.', 'error');
    }
}

function renderMarkdown(text) {
    // Simple markdown rendering
    return text
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}
```

**8. Health Recommendation System (recommend.js):**

```javascript
async function generateRecommendations() {
    const healthProblem = healthConditionInput.value.trim();
    
    const userDetails = {
        age: ageInput.value,
        gender: genderSelect.value,
        weight: weightInput.value,
        height: heightInput.value,
        activityLevel: activityLevelSelect.value,
        goal: goalSelect.value
    };
    
    showLoadingState();
    
    try {
        const response = await fetch('/ai/health-advice', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                healthProblem: healthProblem,
                userDetails: userDetails
            })
        });
        
        const data = await response.json();
        
        if (data.success && data.advice) {
            displayAdvice(data.advice);
        }
    } catch (error) {
        showError('Failed to generate recommendations');
    } finally {
        hideLoadingState();
    }
}

function displayAdvice(advice) {
    // Render markdown-formatted advice with academic citations
    const formattedAdvice = renderMarkdown(advice);
    adviceContainer.innerHTML = formattedAdvice;
    
    // Add citation formatting
    formatCitations();
}
```

---

### **6.2.3 Mobile App Implementation (React Native/Expo)**

**Technology Stack:**
- React 19.1.0
- React Native 0.81.5
- Expo ~54.0.20
- TypeScript 5.9.2
- React Navigation 7.x

**File Structure:**
```
mobile-app/
├── App.tsx                     # Root component
├── index.ts                    # Entry point
├── app.json                    # Expo configuration
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
└── src/
    ├── constants/
    │   ├── api.ts              # API endpoints
    │   └── colors.ts           # Color palette
    ├── navigation/
    │   └── AppNavigator.tsx    # Tab navigation
    ├── screens/
    │   ├── HomeScreen.tsx      # Meal tracking
    │   ├── SearchScreen.tsx    # Food search
    │   ├── MealSearchScreen.tsx# Recipe discovery
    │   ├── ChatScreen.tsx      # AI chatbot
    │   └── RecommendScreen.tsx # Health advice
    ├── services/
    │   └── api.ts              # API client
    ├── types/
    │   └── index.ts            # TypeScript types
    └── utils/
        └── nutrientUtils.ts    # Nutrient helpers
```

**Key Implementation:**

**1. Navigation Setup (AppNavigator.tsx):**

```typescript
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any;
            
            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Search') {
              iconName = focused ? 'search' : 'search-outline';
            } else if (route.name === 'Meals') {
              iconName = focused ? 'restaurant' : 'restaurant-outline';
            } else if (route.name === 'Chat') {
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
            } else if (route.name === 'Recommend') {
              iconName = focused ? 'star' : 'star-outline';
            }
            
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textLight,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Meals" component={MealSearchScreen} />
        <Tab.Screen name="Chat" component={ChatScreen} />
        <Tab.Screen name="Recommend" component={RecommendScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
```

**2. Type Definitions (types/index.ts):**

```typescript
export interface Food {
  fdcId: number;
  description: string;
  dataType: string;
  quantity: number;
  unit: string;
  foodNutrients: Nutrient[];
}

export interface Nutrient {
  nutrient: {
    id: number;
    name: string;
    unitName: string;
  };
  amount: number;
}

export interface Recipe {
  id: number;
  title: string;
  image: string;
  url: string;
  timeDisplay: string;
}

export interface Video {
  video_id: string;
  title: string;
  channel_title: string;
  thumbnail_url: string;
  duration: number;
}
```

**3. API Service (services/api.ts):**

```typescript
import axios from 'axios';
import { API_BASE_URL } from '../constants/api';

export const aiService = {
  async analyzeMealImage(base64Image: string, mimeType: string) {
    const response = await axios.post(
      `${API_BASE_URL}/ai/analyze-meal-image`,
      {
        image: base64Image,
        mimeType: mimeType
      }
    );
    return response.data;
  },

  async parseAndMatchFoods(text: string) {
    const response = await axios.post(
      `${API_BASE_URL}/ai/parse-and-match-foods`,
      { text }
    );
    return response.data;
  },

  async chat(message: string) {
    const response = await axios.post(
      `${API_BASE_URL}/ai/chat`,
      { userMessage: message }
    );
    return response.data;
  },

  async getHealthAdvice(problem: string, details: any) {
    const response = await axios.post(
      `${API_BASE_URL}/ai/health-advice`,
      {
        healthProblem: problem,
        userDetails: details
      }
    );
    return response.data;
  }
};

export const searchService = {
  async searchFoods(query: string, limit: number = 20) {
    const response = await axios.get(
      `${API_BASE_URL}/api/usda/search`,
      {
        params: { query, limit }
      }
    );
    return response.data;
  },

  async getFoodDetails(fdcId: number) {
    const response = await axios.get(
      `${API_BASE_URL}/api/usda/food/${fdcId}`
    );
    return response.data;
  }
};
```

**4. Home Screen - Image Analysis (HomeScreen.tsx):**

```typescript
const handleImagePick = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.7,
    base64: true,
  });

  if (!result.canceled && result.assets[0].base64) {
    setSelectedImage(result.assets[0].uri);
    
    // Detect mime type
    const uri = result.assets[0].uri.toLowerCase();
    let mimeType = 'image/jpeg';
    if (uri.endsWith('.png')) mimeType = 'image/png';
    
    try {
      setIsLoading(true);
      const response = await aiService.analyzeMealImage(
        result.assets[0].base64,
        mimeType
      );
      
      if (response.success && response.analysis) {
        setFoodInput(response.analysis);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze image');
    } finally {
      setIsLoading(false);
    }
  }
};
```

**5. Nutrient Utilities (utils/nutrientUtils.ts):**

```typescript
export const groupNutrientsByCategory = (nutrients: Nutrient[]) => {
  const groups: Record<string, Nutrient[]> = {
    'Energy & Foundation': [],
    'Macronutrients': [],
    'Vitamins': [],
    'Minerals': [],
    'Carbohydrates': [],
    'Fats': [],
    'Amino Acids': [],
    'Other Compounds': [],
  };

  nutrients.forEach(nutrient => {
    const category = getNutrientCategory(nutrient.nutrient.name);
    if (groups[category]) {
      groups[category].push(nutrient);
    }
  });

  return groups;
};

export const formatNutrientValue = (
  amount: number,
  unit: string
): string => {
  if (amount >= 1000 && unit === 'mg') {
    return `${(amount / 1000).toFixed(2)} g`;
  }
  if (amount >= 1000 && unit === 'mcg') {
    return `${(amount / 1000).toFixed(2)} mg`;
  }
  return `${amount.toFixed(2)} ${unit}`;
};

export const calculateDRIPercentage = (
  nutrientName: string,
  amount: number,
  userProfile: UserProfile
): number => {
  const dri = getDRI(nutrientName, userProfile);
  if (!dri) return 0;
  return (amount / dri) * 100;
};
```

**6. Styling System (constants/colors.ts):**

```typescript
export const Colors = {
  // Primary colors
  primary: '#4CAF50',
  primaryDark: '#388E3C',
  primaryLight: '#C8E6C9',
  
  // Secondary colors
  secondary: '#FF9800',
  secondaryDark: '#F57C00',
  secondaryLight: '#FFE0B2',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  textDark: '#212121',
  textLight: '#757575',
  background: '#FAFAFA',
  borderLight: '#E0E0E0',
  borderDark: '#BDBDBD',
  
  // Nutrient adequacy colors
  adequate: '#4CAF50',
  moderate: '#FFC107',
  low: '#FF5722',
};
```

---

