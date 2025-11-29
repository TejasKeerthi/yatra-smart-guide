# Yatra - AI Smart India Travel Guide

Yatra is an AI-powered travel planning application built with React, TypeScript, and Google Gemini. It creates personalized itineraries for Indian destinations complete with real-time data, maps, and PDF export.

## Features
- **AI Search**: Finds top attractions using Google Search Grounding.
- **Smart Itineraries**: Generates day-by-day plans with local food spots, transport costs, and safety tips.
- **Interactive Maps**: Visualizes routes using Leaflet.js.
- **Authentication**: Secure login via Google, Microsoft, or Email (Firebase).
- **Cloud Saving**: Share trips with unique links (Firestore).
- **PDF Export**: Download itineraries for offline use.

## How to Deploy to Vercel

1.  **Push to GitHub**:
    *   Create a new repository on GitHub.
    *   Upload all project files to the repository.

2.  **Import to Vercel**:
    *   Go to [Vercel Dashboard](https://vercel.com/dashboard).
    *   Click **"Add New..."** -> **"Project"**.
    *   Select your GitHub repository.

3.  **Configure Project**:
    *   Framework Preset: **Vite** or **Create React App** (Vercel usually auto-detects, but since this uses no bundler, just leave as default or select "Other").
    *   **Root Directory**: `./`

4.  **Add Environment Variables**:
    *   Expand the **"Environment Variables"** section.
    *   Key: `API_KEY`
    *   Value: `Your_Google_Gemini_API_Key` (starts with `AIza...`).

5.  **Deploy**:
    *   Click **Deploy**.
    *   Wait ~1 minute. Your app is now live!

## Development
To run locally, you can use any static server:
```bash
npx serve .
```
Ensure you create a `.env` file or export `API_KEY` in your terminal session if running locally with Node, but since this is a browser-module app, you might need to insert the key manually in `services/geminiService.ts` for local testing if not using a build pipeline that injects `process.env`.
