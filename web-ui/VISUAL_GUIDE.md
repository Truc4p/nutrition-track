# Visual Guide: Health Problem Field & AI Advice Feature

## Before & After

### BEFORE:
```
┌─────────────────────────────────────┐
│  Enter Your Details                 │
├─────────────────────────────────────┤
│  Weight: [____]                     │
│  Height: [____]                     │
│  Age: [____]                        │
│  Gender: [▼]                        │
│  Activity Level: [▼]                │
│  Weight Goal: [▼]                   │
│                                     │
│  [Get Recommendation]               │
└─────────────────────────────────────┘
```

### AFTER:
```
┌─────────────────────────────────────┐
│  Enter Your Details                 │
├─────────────────────────────────────┤
│  Weight: [____]                     │
│  Height: [____]                     │
│  Age: [____]                        │
│  Gender: [▼]                        │
│  Activity Level: [▼]                │
│  Weight Goal: [▼]                   │
│                                     │
│  Health Problem (Optional)          │ ← NEW!
│  ┌───────────────────────────────┐  │
│  │ e.g., diabetes, high blood... │  │
│  │                               │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│  💡 Enter health conditions to get  │
│     personalized academic advice    │
│                                     │
│  [Get Recommendation]               │
└─────────────────────────────────────┘

When health problem is entered:
                     ↓

┌─────────────────────────────────────┐
│  🎓 Evidence-Based Health Advice   │ ← NEW SECTION!
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐ │
│  │   🔄 Analyzing your health... │ │ ← Loading state
│  │                               │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘

                     ↓

┌─────────────────────────────────────┐
│  🎓 Evidence-Based Health Advice   │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐ │
│  │ ## 🏥 Condition Overview     │ │
│  │                               │ │
│  │ [Clinical explanation...]     │ │
│  │                               │ │
│  │ ## 🔬 Evidence-Based         │ │
│  │    Recommendations            │ │
│  │                               │ │
│  │ ### 1. Carbohydrate Mgmt     │ │
│  │ **Recommendation:** 45-60g... │ │
│  │ **Reference:** Smith et al... │ │
│  │                               │ │ ← Scrollable
│  │ ### 2. Fiber Intake          │ │    content
│  │ [More recommendations...]     │ │
│  │                               │ │
│  │ ## 📚 Key Academic Refs      │ │
│  │ [Harvard-style citations...] │ │
│  │                               │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## Page Layout

```
┌──────────────────────────────────────────────────────────────┐
│                        NAVIGATION BAR                         │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────┬─────────────────────────────────┐
│                             │                                 │
│      LEFT SECTION           │       RIGHT SECTION             │
│                             │                                 │
│  ┌─────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Enter Your Details │   │  │ Nutrition Recommendations│   │
│  │                     │   │  │                         │   │
│  │  [Form fields...]   │   │  │  GROUP 1: ENERGY &      │   │
│  │                     │   │  │          FOUNDATION     │   │
│  │  Health Problem     │◄──┼──┼─ Same as before        │   │
│  │  [textarea]  ◄ NEW! │   │  │                         │   │
│  │                     │   │  │  GROUP 2: MACRONUTRIENTS│   │
│  │  [Get Recommend]    │   │  │  [Calories, Protein...] │   │
│  └─────────────────────┘   │  │                         │   │
│                             │  │  GROUP 3: VITAMINS      │   │
│  ┌─────────────────────┐   │  │  [Vitamin A, B, C...]   │   │
│  │ 🎓 Evidence-Based  │   │  │                         │   │
│  │    Health Advice   │◄──┼──┼─ Shows if health       │   │
│  │                    │   │  │   problem entered       │   │
│  │  [AI-generated     │   │  │                         │   │
│  │   academic advice  │   │  │  [More groups...]       │   │
│  │   with references] │   │  │                         │   │
│  │                    │   │  │                         │   │
│  │  NEW! ──────────►  │   │  └─────────────────────────┘   │
│  └─────────────────────┘   │                                 │
│                             │                                 │
└─────────────────────────────┴─────────────────────────────────┘
```

---

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
    │   │   ├── health-problem (textarea) ◄── NEW!
    │   │   │   └── form-hint (helper text)
    │   │   └── recommend-button
    │   │
    │   └── health-advice-section ◄── NEW SECTION!
    │       ├── h3 (🎓 Evidence-Based...)
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

## Styling Hierarchy

```
CSS Classes & Styling:

.health-advice-section
  │
  ├─► Background: Blue gradient
  ├─► Border: 2px solid blue
  ├─► Shadow: Soft blue glow
  ├─► Padding: 25px
  │
  ├── h3
  │   ├─► Color: Dark blue
  │   └─► Display: flex with gap
  │
  ├── .loading-indicator
  │   ├─► Text align: center
  │   │
  │   └── .spinner
  │       ├─► Border animation
  │       └─► Rotation: 1s infinite
  │
  └── .health-advice-content
      ├─► Background: White
      ├─► Max height: 600px
      ├─► Overflow: Scrollable
      │
      ├── h2, h3, h4
      │   └─► Colors: Blue shades
      │
      ├── p
      │   └─► Color: Gray
      │
      ├── strong
      │   └─► Color: Dark blue
      │
      ├── ul, li
      │   └─► Markers: Blue
      │
      └── ::-webkit-scrollbar
          └─► Custom blue theme
```

---

## Color Scheme

```
Health Advice Section Colors:

Background Gradient:
  └─► #f0f9ff → #e0f2fe (Light to medium blue)

Border:
  └─► #bfdbfe (Medium blue)

Headers:
  ├─► h2: #1e40af (Dark blue)
  ├─► h3: #2563eb (Medium blue)
  └─► h4: #3b82f6 (Bright blue)

Text:
  ├─► Body: #374151 (Gray)
  └─► Strong: #1e40af (Dark blue)

Accents:
  ├─► Spinner: #3b82f6 (Bright blue)
  └─► Scrollbar: #3b82f6 (Bright blue)

Error States:
  ├─► Background: #fee2e2 (Light red)
  ├─► Border: #fca5a5 (Medium red)
  └─► Text: #991b1b (Dark red)
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

---

## Responsive Behavior

### Desktop (>1024px):
```
┌─────────────────┬─────────────────┐
│  Left Section   │  Right Section  │
│  (50% width)    │  (50% width)    │
└─────────────────┴─────────────────┘
```

### Tablet (768px - 1024px):
```
┌─────────────────┬─────────────────┐
│  Left Section   │  Right Section  │
│  (45% width)    │  (55% width)    │
└─────────────────┴─────────────────┘
```

### Mobile (<768px):
```
┌───────────────────┐
│  Left Section     │
│  (Full width)     │
├───────────────────┤
│  Right Section    │
│  (Full width)     │
└───────────────────┘
```

---

**Status**: All visual components implemented and styled! ✅
