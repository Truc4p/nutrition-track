# Track Nutrition Mobile App

A React Native Expo app for tracking nutrition, built to match the functionality and design of the web-ui version.

## Features

### 🏠 Home Screen (Track Nutrition)
- Text input for food descriptions
- Image upload from gallery or camera
- AI-powered meal image analysis using Gemini Vision API
- Automatic food parsing and USDA database matching
- Expandable nutrition details for each food item
- Total nutrition calculation across all foods
- Organized nutrient display by 9 major groups

### 🔍 Search Screen (Food Search)
- Real-time USDA food database search
- Detailed nutrition information for selected foods
- Add foods to your tracking list with custom quantities
- Calculate total nutrition from added foods
- Clear individual foods or all at once

### 🍽️ Meals Screen (Discover Meals)
- Browse recipe database from Pickup Limes
- Watch nutrition-related YouTube videos
- Tab navigation between recipes and videos
- Search functionality for both content types
- Direct links to recipes and videos

### 💬 Chat Screen (Nutrition Assistant)
- AI-powered nutrition chatbot using Gemini API
- Quick prompt buttons for common questions
- Real-time conversational responses
- Chat history with clear option
- Natural nutrition advice and recommendations

### ⭐ Recommend Screen (Nutrition Recommendations)
- Personal nutrition calculator
- Input: weight, height, age, gender, activity level, goal
- Calculates BMR and TDEE
- Personalized macro and micronutrient recommendations
- Organized display by nutrient categories
- Based on scientific formulas (Mifflin-St Jeor Equation)

## Tech Stack

- **React Native** with **Expo**
- **TypeScript** for type safety
- **React Navigation** (Bottom Tabs + Stack)
- **Axios** for API calls
- **Expo Image Picker** for photo selection
- **Expo Camera** for taking photos
- **@react-native-picker/picker** for dropdowns

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo Go app on your mobile device (for testing)
- Backend server running on `http://localhost:5001` (see web-ui/server.py)

## Installation

1. Navigate to the mobile-app directory:
```bash
cd mobile-app
```

2. Install dependencies:
```bash
npm install
```

3. **Important**: Update the API base URL in `src/constants/api.ts`:
   - For iOS Simulator: `http://localhost:5001`
   - For Android Emulator: `http://10.0.2.2:5001`
   - For Physical Device: `http://YOUR_COMPUTER_IP:5001`

## Running the App

1. Make sure the backend server is running:
```bash
cd ../web-ui
python server.py
```

2. Start the Expo development server:
```bash
npm start
```

3. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

## Project Structure

```
mobile-app/
├── src/
│   ├── constants/
│   │   ├── colors.ts          # Color theme matching web-ui
│   │   └── api.ts              # API endpoints configuration
│   ├── navigation/
│   │   └── AppNavigator.tsx    # Tab navigation setup
│   ├── screens/
│   │   ├── HomeScreen.tsx      # Track nutrition with food input
│   │   ├── SearchScreen.tsx    # USDA food database search
│   │   ├── MealSearchScreen.tsx # Recipes and videos
│   │   ├── ChatScreen.tsx      # AI nutrition assistant
│   │   └── RecommendScreen.tsx # Personal recommendations
│   ├── services/
│   │   └── api.ts              # API service functions
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   └── utils/
│       └── nutrientUtils.ts    # Nutrient grouping utilities
├── App.tsx                     # Main app entry point
├── app.json                    # Expo configuration
└── package.json                # Dependencies
```

## API Endpoints Used

All endpoints connect to the Flask backend server (web-ui/server.py):

- `POST /nlp/process_text/` - Parse food descriptions
- `POST /ai/chat` - Chatbot conversations
- `POST /ai/analyze-meal-image` - Analyze meal images
- `POST /ai/parse-and-match-foods` - AI food matching
- `GET /api/recipes/search` - Search recipes
- `GET /api/usda/search` - Search USDA database
- `GET /api/usda/food/:id` - Get food details
- `GET /api/youtube/videos` - Get YouTube videos

## Styling

The app replicates the web-ui design system:

- **Primary Color**: #3498db (Blue)
- **Secondary Color**: #2ecc71 (Green)
- **Text Colors**: #2c3e50 (Dark), #666 (Light)
- **Background**: #ffffff (White), #f9f9f9 (Light Gray)
- **Gradient Buttons**: Linear gradient from primary to secondary
- **Border Radius**: 12-25px for rounded corners
- **Shadows**: Consistent elevation for cards and buttons

## Features Matching Web-UI

### Exact Feature Parity
- ✅ Food input with text or image
- ✅ AI-powered food parsing
- ✅ USDA database integration
- ✅ Nutrition tracking and totals
- ✅ Food database search
- ✅ Recipe discovery
- ✅ YouTube video recommendations
- ✅ AI nutrition chatbot
- ✅ Personal nutrition calculator
- ✅ Nutrient grouping (9 major categories)

### Mobile-Specific Enhancements
- ✅ Native camera integration
- ✅ Touch-optimized UI
- ✅ Bottom tab navigation
- ✅ Smooth animations
- ✅ Pull-to-refresh support
- ✅ Native date/picker components
- ✅ Keyboard-aware scrolling
- ✅ Haptic feedback

## Troubleshooting

### Cannot connect to server
- Check if the backend server is running
- Update the API base URL in `src/constants/api.ts`
- For physical devices, use your computer's IP address
- Make sure your device and computer are on the same network

### Images not working
- Grant camera and photo permissions in device settings
- Check expo-camera and expo-image-picker installation

### TypeScript errors
- Run `npm install` to ensure all dependencies are installed
- Check that all required types are defined in `src/types/index.ts`

## Building for Production

### Android
```bash
eas build --platform android
```

### iOS
```bash
eas build --platform ios
```

Note: You'll need an Expo account and may need to configure signing credentials.

## License

This project is part of the Track Nutrition app and follows the same license as the parent project.

## Support

For issues or questions, please refer to the main project documentation or create an issue in the repository.
