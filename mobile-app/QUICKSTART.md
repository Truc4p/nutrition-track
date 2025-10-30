# Quick Start Guide - Track Nutrition Mobile App

## Prerequisites Setup

### 1. Install Expo Go on Your Phone
- **iOS**: Download from App Store
- **Android**: Download from Google Play Store

### 2. Start the Backend Server
```bash
# Open a terminal
cd track-nutrition/web-ui
python server.py
```

The server should start on `http://localhost:5001`

### 3. Configure API Connection

**IMPORTANT**: Before running the app, update the API URL based on your testing environment:

Open `mobile-app/src/constants/api.ts` and change the `API_BASE_URL`:

```typescript
// For iOS Simulator:
export const API_BASE_URL = 'http://localhost:5001';

// For Android Emulator:
export const API_BASE_URL = 'http://10.0.2.2:5001';

// For Physical Device (replace with your computer's IP):
export const API_BASE_URL = 'http://192.168.1.XXX:5001';
```

**To find your computer's IP address:**
- **macOS**: System Settings → Network → Wi-Fi → Details → TCP/IP
- **Windows**: Open Command Prompt → Type `ipconfig` → Look for IPv4 Address
- **Linux**: Open Terminal → Type `hostname -I`

### 4. Start the Mobile App

```bash
# Open a new terminal
cd track-nutrition/mobile-app
npm start
```

This will open the Expo development server in your browser.

### 5. Open on Your Device

1. Make sure your phone and computer are on the **same Wi-Fi network**
2. Open Expo Go app on your phone
3. Scan the QR code from the terminal or browser:
   - **iOS**: Use the Camera app
   - **Android**: Use the Expo Go app scanner

## Testing the Features

### Home Screen - Track Nutrition
1. Type food description (e.g., "100g chicken, 150g rice")
2. Or tap camera/gallery icons to upload a meal photo
3. Tap "Submit" to process
4. Expand food items to see detailed nutrition
5. Scroll down to see total nutrition

### Search Screen - Food Database
1. Search for foods (e.g., "apple", "chicken breast")
2. Tap a food to see details
3. Enter quantity and tap "Add Food"
4. View total nutrition at the bottom
5. Remove individual foods or clear all

### Meals Screen - Recipes & Videos
1. Browse recipes and videos
2. Switch tabs between "Recipes" and "Videos"
3. Search for specific content
4. Tap cards to open in browser

### Chat Screen - AI Assistant
1. Use quick prompt buttons or type your question
2. Get personalized nutrition advice
3. Tap trash icon to clear chat history

### Recommend Screen - Personal Goals
1. Enter your details (weight, height, age, etc.)
2. Select activity level and goals
3. Tap "Get Recommendation"
4. View personalized nutrition targets

## Troubleshooting

### "Network request failed" Error
**Solution**: Update API_BASE_URL in `src/constants/api.ts` to match your setup:
- Use your computer's IP for physical devices
- Make sure backend server is running
- Check firewall settings

### Camera/Photos Not Working
**Solution**: 
- Grant permissions when prompted
- On iOS: Settings → Privacy → Camera/Photos → Enable for Expo Go
- On Android: Settings → Apps → Expo Go → Permissions

### App Won't Load
**Solution**:
- Clear Expo cache: `npm start -- --clear`
- Restart Expo Go app
- Restart your computer and phone

### TypeScript Errors
**Solution**:
```bash
cd mobile-app
rm -rf node_modules
npm install
```

## Development Tips

### Hot Reload
- Shake your device to open the developer menu
- Enable "Fast Refresh" for instant updates
- Press "r" in terminal to reload manually

### Debugging
- Use `console.log()` statements
- Check terminal for error messages
- Use React Native Debugger or Flipper

### Testing on Multiple Devices
- Each device needs to scan the QR code
- All devices must be on the same network
- Changes reflect instantly on all devices

## Next Steps

### Production Build
When ready to publish:

1. Create Expo account at expo.dev
2. Install EAS CLI:
```bash
npm install -g eas-cli
```

3. Build for Android:
```bash
eas build --platform android
```

4. Build for iOS:
```bash
eas build --platform ios
```

### Customization
- Colors: Edit `src/constants/colors.ts`
- API endpoints: Edit `src/constants/api.ts`
- Styles: Modify `styles` in each screen component

## Need Help?

- Check README.md for detailed documentation
- Review error messages in terminal
- Ensure all dependencies are installed
- Verify backend server is running

Happy coding! 🎉
