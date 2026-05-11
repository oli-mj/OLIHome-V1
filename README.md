# OLIHome for OLIOne

An Ionic/Angular project using Capacitor to deploy on Android, this is subject for further changes and enhancement.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher recommended) and **npm**: [Download Node.js](https://nodejs.org/)
- **Android Studio** and **Android SDK** (for building the Android app): [Download Android Studio](https://developer.android.com/studio)
- **Java Development Kit (JDK)**: Required for the Android build (usually bundled with Android Studio).
- **adb** (Android Debug Bridge): Usually included with the Android SDK. Ensure `platform-tools` is added to your system PATH.

## Installation

1. Clone or download the repository.
2. Open your terminal in the project directory.
3. Install the project dependencies by running:
   ```bash
   npm install
   ```

## Running in the Browser (Development)

To view and develop the application in your browser with live-reload:
```bash
npm start
```
*Note: This runs `ng serve` under the hood. The app will typically be available at `http://localhost:8100/`.*

## Building and Running on Android

To compile the APK and install it on a connected Android device or emulator, run the following commands from the project root:

```bash
# 1. Build the web assets
npm run build

# 2. Sync the web assets to the Android platform
npx cap sync android

# 3. Enter the android directory
cd android 

# 4. Build the debug APK
.\gradlew assembleDebug

# 5. Return to the root directory
cd .. 

# 6. Install the APK on an attached device/emulator
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```
