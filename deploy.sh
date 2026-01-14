#!/bin/bash

# Build the Next.js application
echo "Building Next.js application..."
npm run build

# Copy public assets to the standalone directory
echo "Copying public assets..."
cp -r public .next/standalone/ || true

# Copy package.json for dependency information
echo "Copying package.json..."
cp package.json .next/standalone/

echo "Build completed successfully"