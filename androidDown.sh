#!/bin/bash

echo "🔥 Cleaning React Native Android build and dependencies..."

# Gradle clean
cd android && ./gradlew clean
cd ..

# Remove Android build artifacts
rm -rf android/.gradle
rm -rf android/build
rm -rf android/app/build

# Remove node modules & lock file
rm -rf node_modules
rm -rf package-lock.json


echo "✅ Cleanup complete! Run 'npm install' next."