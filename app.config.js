module.exports = {
  expo: {
    name: 'Firebase Auth App',
    slug: 'firebase-auth-app',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'firebaseauthapp', // ✅ Required for linking and Google sign-in
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription: "This app needs access to camera to take photos.",
        NSPhotoLibraryUsageDescription: "This app needs access to photos to select images.",
        NSMicrophoneUsageDescription: "This app needs access to microphone to record audio."
      }
    },
    android: {
      package: 'com.arunhostel.podcast',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      permissions: [
        "android.permission.CAMERA",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.RECORD_AUDIO"
      ]
    },
    web: {
      favicon: './assets/favicon.png'
    },
    extra: {
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      eas: {
        projectId: "99fcbd5c-ef75-4f65-8416-18217505e1e8"
      }
    },
    plugins: [
      'expo-router',
      [
        'expo-image-picker',
        {
          photosPermission: "The app accesses your photos to let you share them with your friends.",
          cameraPermission: "The app accesses your camera to let you take photos."
        }
      ]
    ],
    newArchEnabled: true,
  }
};
