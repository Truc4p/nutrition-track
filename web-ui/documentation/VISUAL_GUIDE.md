# Visual Guide: Health Problem Field & AI Advice Feature

## User Interaction Flow

```
1. User lands on page
        │
        ▼
2. Fills required fields
   (weight, height, age, etc.)
        │
        ▼
3. Optionally enters health problem ◄── NEW STEP!
   Example: "type 2 diabetes"
        │
        ▼
4. Clicks "Get Recommendation"
        │
        ├─────────────────────────┐
        ▼                         ▼
5a. Standard nutrition      5b. AI Health Advice
    recommendations shown       Section appears
    (Right Section)             (Left Section)
        │                         │
        │                         ├─► Loading spinner
        │                         │
        │                         ├─► Fetch from Gemini AI
        │                         │
        │                         ├─► Convert markdown to HTML
        │                         │
        │                         └─► Display advice with refs
        │
        └─────────────────────────┘
                │
                ▼
6. User reviews both:
   - Nutrition targets (right)
   - Health-specific advice (left) ◄── NEW!
```

---

## API Call Flow

```
Frontend (recommend.js)
        │
        │ 1. User clicks button
        │    with health problem entered
        ▼
    fetchHealthAdvice()
        │
        │ 2. POST /ai/health-advice
        │    {
        │      healthProblem: "diabetes",
        │      userDetails: {...}
        │    }
        ▼
Backend (server.py)
        │
        │ 3. health_advice() function
        │
        ├─► 4. Build specialized prompt
        │      - Include patient profile
        │      - Enforce academic citations
        │      - Request Harvard format
        │
        ├─► 5. Call Gemini AI API
        │      GEMINI_KEY: AIzaSy...
        │
        ├─► 6. Receive markdown response
        │      with academic references
        │
        └─► 7. Return JSON
               {
                 success: true,
                 advice: "## Overview..."
               }
        │
        ▼
Frontend receives response
        │
        ├─► 8. Convert markdown to HTML
        │      - Headers
        │      - Bold text
        │      - Lists
        │      - Paragraphs
        │
        └─► 9. Display in health-advice-content
               with styling
```

---

## Component Structure

```
recommend.html
├── nav-placeholder (Navigation)
│
└── two-sections (Container)
    ├── left-section
    │   ├── user-details-form
    │   │   ├── Form fields (existing)
    │   │   ├── health-problem (textarea) 
    │   │   │   └── form-hint (helper text)
    │   │   └── recommend-button
    │   │
    │   └── health-advice-section 
    │       ├── h3 (Evidence-Based...)
    │       ├── health-advice-loading
    │       │   ├── spinner (animation)
    │       │   └── p (loading text)
    │       └── health-advice-content
    │           └── [AI-generated HTML]
    │
    └── right-section
        ├── h3 (Nutrition Recommendations)
        └── recommendation-text
            └── [Nutrition groups...]
```

---

## Example Usage Scenarios

### Scenario 1: Diabetes
```
Input: "type 2 diabetes"

Output:
  - Carbohydrate management strategies
  - Glycemic index recommendations
  - Fiber intake targets
  - Citations from diabetic nutrition journals
```

### Scenario 2: Hypertension
```
Input: "high blood pressure"

Output:
  - DASH diet principles
  - Sodium restriction guidelines
  - Potassium-rich foods
  - References to hypertension studies
```

### Scenario 3: Anemia
```
Input: "iron deficiency anemia"

Output:
  - Iron-rich food sources
  - Vitamin C for absorption
  - Avoid inhibitors (tea, coffee)
  - Hematology research citations
```


