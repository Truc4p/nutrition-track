# Food Dietary Project Architecture

## System Overview
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           FOOD DIETARY PROJECT                                   │
│                        (Django Main Project)                                     │
└─────────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       │ coordinates
                                       ▼
┌──────────────────────────┬─────────────────────────┬──────────────────────────────┐
│                          │                         │                              │
│    food_dietary_app      │     nlp_app            │    food_dietary_project      │
│   (Nutrition Database)   │   (Text Processing)     │     (Django Settings)        │
│                          │                         │                              │
└──────────────────────────┴─────────────────────────┴──────────────────────────────┘
```

## Detailed Component Interaction

### 1. Main Django Project Structure
```
food_dietary_project/
├── food_dietary_project/     # Django project settings & configuration
│   ├── settings.py          # Database, apps, middleware configuration
│   ├── urls.py             # Main URL routing: /api/ → food_dietary_app
│   │                       #                   /nlp/ → nlp_app
│   └── wsgi.py/asgi.py     # WSGI/ASGI application entry points
│
├── food_dietary_app/        # Nutrition data management
├── nlp_app/                # Natural language processing
└── manage.py               # Django management commands
```

### 2. Data Flow Architecture
```
┌─────────────────┐    HTTP POST     ┌─────────────────┐    HTTP GET      ┌─────────────────┐
│                 │   /nlp/process   │                 │  /api/get_ing... │                 │
│   Web Client    │─────────────────▶│    nlp_app      │─────────────────▶│ food_dietary_app│
│   (Frontend)    │                  │                 │                  │                 │
│                 │◀─────────────────│                 │◀─────────────────│                 │
└─────────────────┘   JSON Response  └─────────────────┘   Nutrition Data └─────────────────┘
        │                                    │                                    │
        │                                    │                                    │
        ▼                                    ▼                                    ▼
┌─────────────────┐                 ┌─────────────────┐                 ┌─────────────────┐
│ User inputs:    │                 │ Text Processing:│                 │ Database Models:│
│ "2 apples and   │                 │ • Tokenization  │                 │ • IngredientFact│
│  1 cup rice"    │                 │ • Food extraction│                 │ • NutrientType  │
│                 │                 │ • Quantity parse│                 │ • NutritionFact │
└─────────────────┘                 └─────────────────┘                 └─────────────────┘
```

### 3. App Responsibilities

#### food_dietary_project (Main Project)
```
┌─────────────────────────────────────────────────────────────────┐
│                    food_dietary_project/                        │
│                                                                 │
│  📁 settings.py                                                │
│     ├── INSTALLED_APPS = ['food_dietary_app', 'nlp_app', ...]  │
│     ├── DATABASE = PostgreSQL 'food_dietary_app'               │
│     └── CORS settings for frontend                             │
│                                                                 │
│  📁 urls.py                                                    │
│     ├── /admin/ → Django admin                                 │
│     ├── /api/   → food_dietary_app.urls                       │
│     └── /nlp/   → nlp_app.urls                                │
└─────────────────────────────────────────────────────────────────┘
```

#### nlp_app (Natural Language Processing)
```
┌─────────────────────────────────────────────────────────────────┐
│                         nlp_app/                                │
│                                                                 │
│  📁 views.py                                                   │
│     ├── process_text()                                         │
│     │   ├── Input: "2 apples, 1 cup rice"                     │
│     │   ├── Output: [{"food_name": "apple", "quantity": 2}]   │
│     │   └── Uses: spaCy, word2number, pint                    │
│     │                                                          │
│     └── process_text_and_get_nutrition()                      │
│         ├── Calls: process_text()                             │
│         ├── HTTP GET: food_dietary_app API                    │
│         └── Returns: Combined nutrition data                   │
│                                                                 │
│  📁 urls.py                                                    │
│     ├── /nlp/process_text/                                     │
│     └── /nlp/process_text_and_get_nutrition/                  │
└─────────────────────────────────────────────────────────────────┘
```

#### food_dietary_app (Nutrition Database)
```
┌─────────────────────────────────────────────────────────────────┐
│                     food_dietary_app/                           │
│                                                                 │
│  📁 models.py                                                  │
│     ├── IngredientFact (food items + basic nutrition)          │
│     ├── NutrientType (vitamin C, protein, etc.)               │
│     └── NutritionFact (ingredient ↔ nutrient relationships)    │
│                                                                 │
│  📁 views.py & serializers.py                                 │
│     ├── get_ingredients_by_names() ← Called by nlp_app        │
│     ├── get_comprehensive_nutrition()                          │
│     ├── search_by_nutrient()                                   │
│     └── IngredientListCreateView()                            │
│                                                                 │
│  📁 urls.py                                                    │
│     ├── /api/ingredients/                                      │
│     ├── /api/get_ingredients_by_names/                        │
│     ├── /api/ingredients/<id>/nutrition/                      │
│     └── /api/search_by_nutrient/                              │
│                                                                 │
│  📁 management/commands/                                       │
│     └── import_nutrition_facts.py (CSV → Database)            │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Request Flow Example
```
1. User Input: "I ate 2 apples and 1 cup of rice"
   │
   ▼
2. Frontend → POST /nlp/process_text_and_get_nutrition/
   │
   ▼
3. nlp_app processes text:
   ├── Tokenizes: ["2", "apples", "1", "cup", "rice"]
   ├── Extracts: [{"food_name": "apple", "quantity": 2}, 
   │              {"food_name": "rice", "quantity": 1, "unit": "cup"}]
   │
   ▼
4. nlp_app → GET /api/get_ingredients_by_names/?names=apple,rice
   │
   ▼
5. food_dietary_app queries database:
   ├── Finds: Apple (protein: 0.3g, carbs: 14g, ...)
   ├── Finds: Rice (protein: 2.7g, carbs: 23g, ...)
   │
   ▼
6. food_dietary_app → Returns nutrition data to nlp_app
   │
   ▼
7. nlp_app calculates totals:
   ├── 2 apples: protein 0.6g, carbs 28g
   ├── 1 cup rice: protein 2.7g, carbs 23g
   ├── TOTAL: protein 3.3g, carbs 51g
   │
   ▼
8. nlp_app → Returns complete nutrition analysis to frontend
```

### 5. Database & Data Sources
```
┌─────────────────────────────────────────────────────────────────┐
│                    Data Flow & Storage                          │
│                                                                 │
│  External APIs          CSV Files           Database            │
│  ┌─────────────┐       ┌─────────────┐     ┌─────────────┐     │
│  │ USDA API    │──────▶│ .csv files  │────▶│ PostgreSQL  │     │
│  │ (usda.py)   │       │ nutrition   │     │ Database    │     │
│  └─────────────┘       │ data        │     │             │     │
│                         └─────────────┘     └─────────────┘     │
│                              │                     ▲            │
│                              ▼                     │            │
│                         ┌─────────────┐           │            │
│                         │ Management  │───────────┘            │
│                         │ Commands    │                        │
│                         │ (import_*)  │                        │
│                         └─────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

## Summary
- **food_dietary_project**: Main Django configuration & URL routing
- **nlp_app**: Processes natural language → extracts food items & quantities
- **food_dietary_app**: Stores & serves nutrition data via REST API
- **Communication**: nlp_app makes HTTP requests to food_dietary_app APIs
- **Data Flow**: User text → NLP processing → nutrition lookup → combined results
